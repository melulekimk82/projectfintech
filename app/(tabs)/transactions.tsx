import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { PaymentService } from '@/services/paymentService';
import { Transaction } from '@/types';
import { 
  History, 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp, 
  FileText, 
  Package, 
  Filter,
  Search
} from 'lucide-react-native';

export default function TransactionsScreen() {
  const { userProfile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'sent' | 'received'>('all');

  const loadTransactions = async () => {
    if (!userProfile) return;
    
    const userTransactions = await PaymentService.getUserTransactions(userProfile.id);
    setTransactions(userTransactions);
  };

  useEffect(() => {
    loadTransactions();
  }, [userProfile]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => `SZL ${amount.toFixed(2)}`;

  const getTransactionIcon = (transaction: Transaction) => {
    switch (transaction.type) {
      case 'topup':
        return <TrendingUp size={20} color="#10B981" />;
      case 'invoice':
        return <FileText size={20} color="#8B5CF6" />;
      case 'product':
        return <Package size={20} color="#F59E0B" />;
      default:
        return transaction.payerId === userProfile?.id ? 
          <ArrowUpRight size={20} color="#EF4444" /> : 
          <ArrowDownLeft size={20} color="#10B981" />;
    }
  };

  const getTransactionColor = (transaction: Transaction) => {
    if (transaction.type === 'topup') return '#10B981';
    return transaction.payerId === userProfile?.id ? '#EF4444' : '#10B981';
  };

  const getTransactionAmount = (transaction: Transaction) => {
    if (transaction.type === 'topup') return `+${formatCurrency(transaction.amount)}`;
    const isOutgoing = transaction.payerId === userProfile?.id;
    return `${isOutgoing ? '-' : '+'}${formatCurrency(transaction.amount)}`;
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    if (filter === 'sent') return transaction.payerId === userProfile?.id;
    if (filter === 'received') return transaction.receiverId === userProfile?.id;
    return true;
  });

  if (!userProfile) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transactions</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton}>
            <Search size={20} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Filter size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filterTabs}>
        {[
          { key: 'all', label: 'All' },
          { key: 'sent', label: 'Sent' },
          { key: 'received', label: 'Received' }
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.filterTab, filter === tab.key && styles.filterTabActive]}
            onPress={() => setFilter(tab.key as any)}
          >
            <Text style={[styles.filterTabText, filter === tab.key && styles.filterTabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView 
        style={styles.transactionsList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <History size={48} color="#4B5563" />
            <Text style={styles.emptyTitle}>No transactions yet</Text>
            <Text style={styles.emptySubtitle}>Your transaction history will appear here</Text>
          </View>
        ) : (
          filteredTransactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionCard}>
              <View style={styles.transactionIcon}>
                {getTransactionIcon(transaction)}
              </View>
              
              <View style={styles.transactionContent}>
                <Text style={styles.transactionTitle}>{transaction.description}</Text>
                <Text style={styles.transactionDate}>
                  {transaction.createdAt.toLocaleDateString()} • {transaction.createdAt.toLocaleTimeString()}
                </Text>
                <View style={styles.transactionMeta}>
                  <Text style={styles.transactionType}>{transaction.type.toUpperCase()}</Text>
                  <View style={[styles.statusBadge, 
                    transaction.status === 'completed' ? styles.statusCompleted : 
                    transaction.status === 'pending' ? styles.statusPending : styles.statusFailed
                  ]}>
                    <Text style={[styles.statusText,
                      transaction.status === 'completed' ? styles.statusCompletedText : 
                      transaction.status === 'pending' ? styles.statusPendingText : styles.statusFailedText
                    ]}>
                      {transaction.status}
                    </Text>
                  </View>
                </View>
              </View>
              
              <Text style={[styles.transactionAmount, { color: getTransactionColor(transaction) }]}>
                {getTransactionAmount(transaction)}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 8,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 20,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#3B82F6',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  transactionsList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  transactionCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  transactionIcon: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionContent: {
    flex: 1,
    gap: 4,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  transactionDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  transactionType: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusCompleted: {
    backgroundColor: '#065F46',
  },
  statusPending: {
    backgroundColor: '#92400E',
  },
  statusFailed: {
    backgroundColor: '#7F1D1D',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statusCompletedText: {
    color: '#10B981',
  },
  statusPendingText: {
    color: '#F59E0B',
  },
  statusFailedText: {
    color: '#EF4444',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});