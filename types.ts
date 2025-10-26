
export interface Client {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
}

export const projectStatuses = [
  'Propuesta',
  'Levantamiento',
  'Anteproyecto',
  'Proyecto',
  'Licitación',
  'Construcción',
  'Terminado',
  'Perdido'
] as const;

export type ProjectStatus = typeof projectStatuses[number];

export interface Project {
  id: string;
  displayId: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  mainClientId?: string;
  secondaryClientIds?: string[];
  location?: string;
  status?: ProjectStatus;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  balance: number;
}

export interface BankStatement {
  id: string;
  fileName: string;
  companyName: string;
  accountNumber: string;
  currency: string;
  period: { from: string; to: string };
  transactions: Transaction[];
}

export interface ProratedSplit {
  id: string;
  description: string;
  projectId: string | null;
  amount: number;
}

export type Allocation = {
  type: 'single';
  projectId: string | null;
} | {
  type: 'prorated';
  splits: ProratedSplit[];
};

export interface Allocations {
  [transactionId: string]: Allocation;
}

interface FirestoreTimestamp {
    seconds: number;
    nanoseconds: number;
}

export interface UploadedFile {
    id: string;
    name: string;
    content?: string; // Content will now be handled server-side
    uploadedAt: FirestoreTimestamp;
    uploadedBy: string; // user email
}
