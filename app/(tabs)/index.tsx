import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { PaymentService } from '@/services/paymentService';
import { Transaction } from '@/types';
import { 
  FileText, 
  DollarSign, 
  Clock, 
  Users, 
  Bell, 
  Sun, 
  User as UserIcon,
  TrendingUp 
} from 'lucide-react-native';

export default function DashboardScreen() {
  const { userProfile, logout } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalRevenue: 0,
    pendingAmount: 0,
    totalClients: 0,
  });

  const loadData = async () => {
    if (!userProfile) return;

    const userTransactions = await PaymentService.getUserTransactions(userProfile.id);
    setTransactions(userTransactions);

    if (userProfile.role === 'merchant') {
      // Calculate merchant stats
      const completedTransactions = userTransactions.filter(t => t.status === 'completed' && t.receiverId === userProfile.id);
      const totalRevenue = completedTransactions.reduce((sum, t) => sum + t.amount, 0);
      const invoiceTransactions = completedTransactions.filter(t => t.type === 'invoice');
      const pendingTransactions = userTransactions.filter(t => t.status === 'pending' && t.receiverId === userProfile.id);
      const pendingAmount = pendingTransactions.reduce((sum, t) => sum + t.amount, 0);
      
      setStats({
        totalInvoices: invoiceTransactions.length,
        totalRevenue,
        pendingAmount,
        totalClients: new Set(completedTransactions.map(t => t.payerId)).size,
      });
    }
  };

  useEffect(() => {
    loadData();
  }, [userProfile]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (!userProfile) return null;

  const formatCurrency = (amount: number) => `SZL ${amount.toFixed(2)}`;

  const renderMerchantDashboard = () => (
    <ScrollView 
      style={styles.container} 
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.menuButton}>
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
          </View>
          <Text style={styles.headerTitle}>Dashboard</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Bell size={20} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Sun size={20} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileButton} onPress={logout}>
            <UserIcon size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={styles.statContent}>
            <View style={styles.statText}>
              <Text style={styles.statLabel}>Total Invoices</Text>
              <Text style={styles.statValue}>{stats.totalInvoices}</Text>
              <Text style={styles.statChange}>+0% from last month</Text>
            </View>
            <View style={[styles.statIcon, { backgroundColor: '#1E40AF' }]}>
              <FileText size={24} color="#FFFFFF" />
            </View>
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statContent}>
            <View style={styles.statText}>
              <Text style={styles.statLabel}>Total Revenue</Text>
              <Text style={styles.statValue}>{formatCurrency(stats.totalRevenue)}</Text>
              <Text style={styles.statChange}>+0% from last month</Text>
            </View>
            <View style={[styles.statIcon, { backgroundColor: '#059669' }]}>
              <DollarSign size={24} color="#FFFFFF" />
            </View>
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statContent}>
            <View style={styles.statText}>
              <Text style={styles.statLabel}>Pending Amount</Text>
              <Text style={styles.statValue}>{formatCurrency(stats.pendingAmount)}</Text>
              <Text style={styles.statChange}>+0% from last month</Text>
            </View>
            <View style={[styles.statIcon, { backgroundColor: '#DC2626' }]}>
              <Clock size={24} color="#FFFFFF" />
            </View>
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statContent}>
            <View style={styles.statText}>
              <Text style={styles.statLabel}>Total Clients</Text>
              <Text style={styles.statValue}>{stats.totalClients}</Text>
              <Text style={styles.statChange}>+0% from last month</Text>
            </View>
            <View style={[styles.statIcon, { backgroundColor: '#7C3AED' }]}>
              <Users size={24} color="#FFFFFF" />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.chartSection}>
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Revenue Overview</Text>
          <View style={styles.chartPlaceholder}>
            <TrendingUp size={48} color="#3B82F6" />
            <Text style={styles.chartText}>Chart visualization coming soon</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderClientDashboard = () => (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.menuButton}>
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
          </View>
          <Text style={styles.headerTitle}>Dashboard</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Bell size={20} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Sun size={20} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileButton} onPress={logout}>
            <UserIcon size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>Welcome back, {userProfile.firstName}!</Text>
        <Text style={styles.welcomeSubtext}>Here's your account overview</Text>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Wallet Balance</Text>
        <Text style={styles.balanceValue}>{formatCurrency(userProfile.walletBalance)}</Text>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton}>
          <DollarSign size={24} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Top Up</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <FileText size={24} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Pay Invoice</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {transactions.slice(0, 5).map((transaction) => (
          <View key={transaction.id} style={styles.transactionItem}>
            <View style={styles.transactionIcon}>
              {transaction.type === 'topup' ? (
                <TrendingUp size={20} color="#10B981" />
              ) : (
                <DollarSign size={20} color="#EF4444" />
              )}
            </View>
            <View style={styles.transactionContent}>
              <Text style={styles.transactionTitle}>{transaction.description}</Text>
              <Text style={styles.transactionDate}>
                {transaction.createdAt.toLocaleDateString()}
              </Text>
            </View>
            <Text style={[
              styles.transactionAmount,
              { color: transaction.type === 'topup' ? '#10B981' : '#EF4444' }
            ]}>
              {transaction.type === 'topup' ? '+' : '-'}{formatCurrency(transaction.amount)}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  return userProfile.role === 'merchant' ? renderMerchantDashboard() : renderClientDashboard();
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuButton: {
    gap: 3,
  },
  menuLine: {
    width: 20,
    height: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 8,
  },
  profileButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  balanceCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 24,
    marginBottom: 24,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
  },
  statContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statText: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statChange: {
    fontSize: 12,
    color: '#10B981',
  },
  statIcon: {
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartSection: {
    paddingHorizontal: 24,
  },
  chartCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  chartPlaceholder: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  chartText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  recentSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    gap: 12,
  },
  transactionIcon: {
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 8,
  },
  transactionContent: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});