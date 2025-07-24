import { collection, addDoc, query, where, orderBy, getDocs, doc, updateDoc, getDoc, runTransaction } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Transaction } from '@/types';

export class PaymentService {
  static async processPayment(
    payerId: string,
    receiverId: string,
    amount: number,
    type: 'payment' | 'invoice' | 'product',
    description: string,
    metadata?: any
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      const result = await runTransaction(db, async (transaction) => {
        const payerRef = doc(db, 'users', payerId);
        const receiverRef = doc(db, 'users', receiverId);

        const payerDoc = await transaction.get(payerRef);
        const receiverDoc = await transaction.get(receiverRef);

        if (!payerDoc.exists() || !receiverDoc.exists()) {
          throw new Error('User not found');
        }

        const payerData = payerDoc.data();
        const receiverData = receiverDoc.data();

        if (payerData.walletBalance < amount) {
          throw new Error('Insufficient funds');
        }

        // Update balances
        transaction.update(payerRef, {
          walletBalance: payerData.walletBalance - amount,
          updatedAt: new Date(),
        });

        transaction.update(receiverRef, {
          walletBalance: receiverData.walletBalance + amount,
          updatedAt: new Date(),
        });

        // Create transaction record
        const transactionData: Omit<Transaction, 'id'> = {
          payerId,
          receiverId,
          amount,
          type,
          description,
          status: 'completed',
          createdAt: new Date(),
          metadata,
        };

        const transactionRef = doc(collection(db, 'transactions'));
        transaction.set(transactionRef, transactionData);

        return transactionRef.id;
      });

      return { success: true, transactionId: result };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Transaction failed' };
    }
  }

  static async topUpWallet(userId: string, amount: number): Promise<{ success: boolean; error?: string }> {
    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', userId);
        const userDoc = await transaction.get(userRef);

        if (!userDoc.exists()) {
          throw new Error('User not found');
        }

        const userData = userDoc.data();
        transaction.update(userRef, {
          walletBalance: userData.walletBalance + amount,
          updatedAt: new Date(),
        });

        // Create transaction record
        const transactionData: Omit<Transaction, 'id'> = {
          payerId: userId,
          receiverId: userId,
          amount,
          type: 'topup',
          description: 'Wallet Top-up',
          status: 'completed',
          createdAt: new Date(),
        };

        const transactionRef = doc(collection(db, 'transactions'));
        transaction.set(transactionRef, transactionData);
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Top-up failed' };
    }
  }

  static async getUserTransactions(userId: string): Promise<Transaction[]> {
    try {
      const q = query(
        collection(db, 'transactions'),
        where('payerId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const transactions: Transaction[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        transactions.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
        } as Transaction);
      });

      return transactions;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  }
}