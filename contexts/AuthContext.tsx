import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { User } from '@/types';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: 'client' | 'merchant', firstName: string, lastName: string, businessName?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateWalletBalance: (newBalance: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Fetch user profile from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          setUserProfile({
            ...userData,
            id: firebaseUser.uid,
            createdAt: userData.createdAt?.toDate?.() || new Date(),
            updatedAt: userData.updatedAt?.toDate?.() || new Date(),
          });
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (
    email: string, 
    password: string, 
    role: 'client' | 'merchant', 
    firstName: string, 
    lastName: string,
    businessName?: string
  ) => {
    const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user profile in Firestore
    const userData: Omit<User, 'id'> = {
      email,
      role,
      firstName,
      lastName,
      walletBalance: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), userData);

    // If merchant, create merchant profile
    if (role === 'merchant' && businessName) {
      await setDoc(doc(db, 'merchants', firebaseUser.uid), {
        id: firebaseUser.uid,
        businessName,
        totalRevenue: 0,
        totalInvoices: 0,
        pendingAmount: 0,
        totalClients: 0,
        linkedSystems: {
          stockFlow: false,
          invoiceFlow: false,
        },
      });
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateWalletBalance = async (newBalance: number) => {
    if (user && userProfile) {
      await updateDoc(doc(db, 'users', user.uid), {
        walletBalance: newBalance,
        updatedAt: new Date(),
      });
      
      setUserProfile(prev => prev ? { ...prev, walletBalance: newBalance } : null);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      loading,
      signIn,
      signUp,
      logout,
      updateWalletBalance,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}