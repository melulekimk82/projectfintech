import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, Modal } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { PaymentService } from '@/services/paymentService';
import { Wallet as WalletIcon, Plus, Send, FileText, Package, X, CreditCard } from 'lucide-react-native';

export default function WalletScreen() {
  const { userProfile, updateWalletBalance } = useAuth();
  const [topUpAmount, setTopUpAmount] = useState('');
  const [invoiceId, setInvoiceId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [receiverEmail, setReceiverEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const formatCurrency = (amount: number) => `SZL ${amount.toFixed(2)}`;

  const handleTopUp = async () => {
    const amount = parseFloat(topUpAmount);
    if (!amount || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const result = await PaymentService.topUpWallet(userProfile!.id, amount);
      if (result.success) {
        await updateWalletBalance(userProfile!.walletBalance + amount);
        setTopUpAmount('');
        setShowTopUpModal(false);
        Alert.alert('Success', `Wallet topped up with ${formatCurrency(amount)}`);
      } else {
        Alert.alert('Error', result.error || 'Top-up failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Top-up failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0 || !receiverEmail) {
      Alert.alert('Error', 'Please enter valid payment details');
      return;
    }

    setLoading(true);
    try {
      // For demo purposes, we'll simulate finding a receiver
      // In a real app, you'd search for users by email
      const result = await PaymentService.processPayment(
        userProfile!.id,
        'demo-receiver-id', // This would be the actual receiver ID
        amount,
        'payment',
        `Payment to ${receiverEmail}`,
        { receiverEmail }
      );

      if (result.success) {
        await updateWalletBalance(userProfile!.walletBalance - amount);
        setPaymentAmount('');
        setReceiverEmail('');
        setShowPaymentModal(false);
        Alert.alert('Success', `Payment of ${formatCurrency(amount)} sent successfully`);
      } else {
        Alert.alert('Error', result.error || 'Payment failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const handleInvoicePayment = async () => {
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0 || !invoiceId) {
      Alert.alert('Error', 'Please enter valid invoice details');
      return;
    }

    setLoading(true);
    try {
      const result = await PaymentService.processPayment(
        userProfile!.id,
        'demo-merchant-id', // This would be the actual merchant ID
        amount,
        'invoice',
        `Invoice Payment - ${invoiceId}`,
        { invoiceId }
      );

      if (result.success) {
        await updateWalletBalance(userProfile!.walletBalance - amount);
        setPaymentAmount('');
        setInvoiceId('');
        setShowInvoiceModal(false);
        Alert.alert('Success', `Invoice ${invoiceId} paid successfully`);
      } else {
        Alert.alert('Error', result.error || 'Payment failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Invoice payment failed');
    } finally {
      setLoading(false);
    }
  };

  if (!userProfile) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wallet</Text>
        <TouchableOpacity style={styles.profileButton}>
          <WalletIcon size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <WalletIcon size={24} color="#3B82F6" />
          </View>
          <Text style={styles.balanceValue}>{formatCurrency(userProfile.walletBalance)}</Text>
          <Text style={styles.balanceSubtext}>PayFlow Wallet</Text>
        </View>

        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => setShowTopUpModal(true)}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#10B981' }]}>
              <Plus size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.actionTitle}>Top Up</Text>
            <Text style={styles.actionSubtitle}>Add funds to wallet</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => setShowPaymentModal(true)}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#3B82F6' }]}>
              <Send size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.actionTitle}>Send Money</Text>
            <Text style={styles.actionSubtitle}>Transfer to another user</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => setShowInvoiceModal(true)}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#8B5CF6' }]}>
              <FileText size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.actionTitle}>Pay Invoice</Text>
            <Text style={styles.actionSubtitle}>Pay business invoice</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <View style={[styles.actionIcon, { backgroundColor: '#F59E0B' }]}>
              <Package size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.actionTitle}>Buy Products</Text>
            <Text style={styles.actionSubtitle}>Pay for goods</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Wallet Features</Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>Instant transactions</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>Secure Firebase encryption</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>Real-time balance updates</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>Transaction history tracking</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Top Up Modal */}
      <Modal visible={showTopUpModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Top Up Wallet</Text>
              <TouchableOpacity onPress={() => setShowTopUpModal(false)}>
                <X size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Amount (SZL)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter amount"
                placeholderTextColor="#6B7280"
                value={topUpAmount}
                onChangeText={setTopUpAmount}
                keyboardType="numeric"
              />
              
              <View style={styles.quickAmounts}>
                {['50', '100', '200', '500'].map((amount) => (
                  <TouchableOpacity
                    key={amount}
                    style={styles.quickAmountButton}
                    onPress={() => setTopUpAmount(amount)}
                  >
                    <Text style={styles.quickAmountText}>SZL {amount}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.modalButton, loading && styles.buttonDisabled]}
                onPress={handleTopUp}
                disabled={loading}
              >
                <CreditCard size={20} color="#FFFFFF" />
                <Text style={styles.modalButtonText}>
                  {loading ? 'Processing...' : 'Top Up Wallet'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Send Money Modal */}
      <Modal visible={showPaymentModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Send Money</Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <X size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Recipient Email</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter email address"
                placeholderTextColor="#6B7280"
                value={receiverEmail}
                onChangeText={setReceiverEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              
              <Text style={styles.inputLabel}>Amount (SZL)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter amount"
                placeholderTextColor="#6B7280"
                value={paymentAmount}
                onChangeText={setPaymentAmount}
                keyboardType="numeric"
              />

              <TouchableOpacity
                style={[styles.modalButton, loading && styles.buttonDisabled]}
                onPress={handlePayment}
                disabled={loading}
              >
                <Send size={20} color="#FFFFFF" />
                <Text style={styles.modalButtonText}>
                  {loading ? 'Sending...' : 'Send Money'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Pay Invoice Modal */}
      <Modal visible={showInvoiceModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pay Invoice</Text>
              <TouchableOpacity onPress={() => setShowInvoiceModal(false)}>
                <X size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Invoice ID</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter invoice ID"
                placeholderTextColor="#6B7280"
                value={invoiceId}
                onChangeText={setInvoiceId}
              />
              
              <Text style={styles.inputLabel}>Amount (SZL)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter amount"
                placeholderTextColor="#6B7280"
                value={paymentAmount}
                onChangeText={setPaymentAmount}
                keyboardType="numeric"
              />

              <TouchableOpacity
                style={[styles.modalButton, loading && styles.buttonDisabled]}
                onPress={handleInvoicePayment}
                disabled={loading}
              >
                <FileText size={20} color="#FFFFFF" />
                <Text style={styles.modalButtonText}>
                  {loading ? 'Processing...' : 'Pay Invoice'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  profileButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  balanceCard: {
    backgroundColor: '#1F2937',
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    alignItems: 'center',
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  balanceValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  balanceSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  actionCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    width: '47%',
    alignItems: 'center',
    gap: 12,
  },
  actionIcon: {
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  featuresSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  featureList: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  featureText: {
    fontSize: 14,
    color: '#E5E7EB',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1F2937',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalBody: {
    padding: 20,
    gap: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  quickAmountButton: {
    backgroundColor: '#374151',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  quickAmountText: {
    color: '#E5E7EB',
    fontSize: 14,
    fontWeight: '500',
  },
  modalButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});