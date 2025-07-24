import { onSnapshot, collection, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Transaction } from '@/types';

export class RealTimeService {
  static subscribeToUserTransactions(
    userId: string,
    callback: (transactions: Transaction[]) => void
  ): () => void {
    const q = query(
      collection(db, 'transactions'),
      where('payerId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const transactions: Transaction[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        transactions.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
        } as Transaction);
      });
      callback(transactions);
    });
  }

  static subscribeToWalletBalance(
    userId: string,
    callback: (balance: number) => void
  ): () => void {
    return onSnapshot(doc(db, 'users', userId), (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        callback(userData.walletBalance || 0);
      }
    });
  }

  static subscribeToMerchantPayments(
    merchantId: string,
    callback: (transactions: Transaction[]) => void
  ): () => void {
    const q = query(
      collection(db, 'transactions'),
      where('receiverId', '==', merchantId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const transactions: Transaction[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        transactions.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
        } as Transaction);
      });
      callback(transactions);
    });
  }
}