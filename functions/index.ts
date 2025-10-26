
/**
 * INSTRUCTIONS:
 * 1. Create a 'functions' directory in your project root.
 * 2. Place this file inside as 'index.ts'.
 * 3. In the 'functions' directory, run:
 *    npm init -y
 *    npm install firebase-functions firebase-admin xml2js
 *    npm install -D typescript @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint
 * 4. Create a tsconfig.json file in 'functions' directory with appropriate settings.
 * 5. To set the first admin, deploy the functions, then call the setUserRole function
 *    (e.g., from a temporary script or frontend component) for 'isi@isidorairarrazaval.cl'.
 */
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { parseStringPromise } from "xml2js";

admin.initializeApp();
const db = admin.firestore();

// Set region for all functions
const regionalFunctions = functions.region("us-west1");

// Helper to get text from parsed XML node
const getText = (node: any, key: string): string => {
  return node[key] && node[key][0] ? node[key][0].trim() : "";
};

// 1. Cloud Function to parse XML Bank Statements
export const parseBankStatement = regionalFunctions.https.onCall(
  async (data, context) => {
    // Check authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated.",
      );
    }
    const { xmlContent, fileName } = data;
    if (!xmlContent || !fileName) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "XML content and filename must be provided.",
      );
    }

    try {
      const parsedXml = await parseStringPromise(xmlContent);
      const cartolaNode = parsedXml.cartola;
      if (!cartolaNode) {
        throw new Error("Invalid XML structure: <cartola> tag not found.");
      }

      const transactions: any[] = [];
      const movimientoNodes = cartolaNode.movimientos[0].movimiento;

      movimientoNodes.forEach((mov: any, index: number) => {
        const abonoText = getText(mov, "abono");
        const giroText = getText(mov, "giro");
        const abono = abonoText ? parseFloat(abonoText) : 0;
        const giro = giroText ? parseFloat(giroText) : 0;

        transactions.push({
          id: `${fileName}-${index}`,
          date: getText(mov, "fecha_movimiento"),
          description: getText(mov, "descripcion"),
          amount: abono + giro,
          balance: parseFloat(getText(mov, "saldo_diario")) || 0,
        });
      });

      const fromDate = getText(cartolaNode, "fecha_desde");
      const statementData = {
        id: fromDate, // Using date as ID for simplicity, might need better unique ID
        fileName,
        companyName: getText(cartolaNode, "empresa_nombre"),
        accountNumber: getText(cartolaNode, "cuenta_numero"),
        currency: getText(cartolaNode, "moneda"),
        period: {
          from: fromDate,
          to: getText(cartolaNode, "fecha_hasta"),
        },
        transactions,
      };

      // Use a transaction to ensure both writes succeed or fail together
      const batch = db.batch();
      
      const statementRef = db.collection("bankStatements").doc(fromDate);
      batch.set(statementRef, statementData);
      
      const uploadRef = db.collection("uploads").doc();
      batch.set(uploadRef, {
          name: fileName,
          uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
          uploadedBy: context.auth.token.email,
      });

      await batch.commit();

      return { success: true, message: "Bank statement processed." };
    } catch (error: any) {
      console.error("Error parsing XML:", error);
      throw new functions.https.HttpsError("internal", error.message);
    }
  },
);


// 2. Cloud Function to set user roles (admin only)
export const setUserRole = regionalFunctions.https.onCall(
  async (data, context) => {
    // Check if user is an admin
    if (context.auth?.token.admin !== true) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Only admins can set user roles.",
      );
    }

    const { email, role } = data;
    if (!email || !role || !["admin", "member"].includes(role)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Email and a valid role ('admin' or 'member') must be provided.",
      );
    }
    try {
      const user = await admin.auth().getUserByEmail(email);
      const claims = role === 'admin' ? { admin: true } : { member: true };
      await admin.auth().setCustomUserClaims(user.uid, claims);
      return { message: `Success! ${email} has been made a ${role}.` };
    } catch (error: any) {
      console.error("Error setting user role:", error);
      throw new functions.https.HttpsError("internal", error.message);
    }
  },
);

// 3. Cloud Function to list all users (admin only)
export const listUsers = regionalFunctions.https.onCall(async (data, context) => {
    if (context.auth?.token.admin !== true) {
        throw new functions.https.HttpsError(
            "permission-denied",
            "Only admins can list users.",
        );
    }
    try {
        const listUsersResult = await admin.auth().listUsers(1000);
        return listUsersResult.users.map((userRecord) => ({
            uid: userRecord.uid,
            email: userRecord.email,
            customClaims: userRecord.customClaims,
        }));
    } catch (error: any) {
        console.error("Error listing users:", error);
        throw new functions.https.HttpsError("internal", error.message);
    }
});
