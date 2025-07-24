export interface User {
  id: string;
  email: string;
  role: 'client' | 'merchant';
  firstName: string;
  lastName: string;
  walletBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  payerId: string;
  receiverId: string;
  amount: number;
  type: 'topup' | 'payment' | 'invoice' | 'product';
  reference?: string;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  metadata?: {
    invoiceId?: string;
    productId?: string;
    merchantName?: string;
  };
}

export interface Merchant {
  id: string;
  businessName: string;
  totalRevenue: number;
  totalInvoices: number;
  pendingAmount: number;
  totalClients: number;
  linkedSystems: {
    stockFlow?: boolean;
    invoiceFlow?: boolean;
  };
}