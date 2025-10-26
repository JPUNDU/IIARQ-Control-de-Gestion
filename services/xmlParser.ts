
import { BankStatement, Transaction } from '../types';

const getText = (node: Element, selector: string): string => {
  const element = node.querySelector(selector);
  return element ? element.textContent?.trim() ?? '' : '';
};

export const parseBankStatementXML = (xmlString: string, fileName: string): BankStatement | null => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'application/xml');
    
    const errorNode = xmlDoc.querySelector('parsererror');
    if (errorNode) {
      console.error('Error parsing XML:', errorNode.textContent);
      return null;
    }

    const cartolaNode = xmlDoc.querySelector('cartola');
    if (!cartolaNode) return null;

    const transactions: Transaction[] = [];
    const movimientoNodes = cartolaNode.querySelectorAll('movimientos > movimiento');
    
    movimientoNodes.forEach((mov, index) => {
      const abonoText = getText(mov, 'abono');
      const giroText = getText(mov, 'giro');
      
      const abono = abonoText ? parseFloat(abonoText) : 0;
      const giro = giroText ? parseFloat(giroText) : 0;
      
      transactions.push({
        id: `${fileName}-${index}`,
        date: getText(mov, 'fecha_movimiento'),
        description: getText(mov, 'descripcion'),
        amount: abono + giro, // giro is already negative
        balance: parseFloat(getText(mov, 'saldo_diario')) || 0,
      });
    });

    const fromDate = getText(cartolaNode, 'fecha_desde');

    return {
      id: fromDate,
      fileName,
      companyName: getText(cartolaNode, 'empresa_nombre'),
      accountNumber: getText(cartolaNode, 'cuenta_numero'),
      currency: getText(cartolaNode, 'moneda'),
      period: {
        from: fromDate,
        to: getText(cartolaNode, 'fecha_hasta'),
      },
      transactions,
    };
  } catch (error) {
    console.error('Failed to parse XML string:', error);
    return null;
  }
};
