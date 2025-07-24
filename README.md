# PayFlow - Digital Wallet App

A simple, user-friendly fintech application for business payments built with React Native Expo and Firebase.

## Features

### Authentication
- Firebase Email/Password authentication
- Role-based access (Client vs Merchant)
- Secure user registration and login
- Demo accounts for testing

### Client Features
- View wallet balance with real-time updates
- Top-up wallet with simulated payments
- Send money to other users by email
- Pay invoices using invoice ID
- Buy products using product codes
- View complete transaction history
- Search and filter transactions

### Merchant Features
- Business dashboard with revenue analytics
- View incoming payments in real-time
- Track total invoices and clients
- Monitor wallet balance
- Generate and export reports
- Integration ready for StockFlow and InvoiceFlow

### Payment System
- Secure wallet-to-wallet transfers
- Real-time balance updates
- Transaction history with detailed metadata
- Support for multiple payment types (topup, payment, invoice, product)
- Firebase Firestore for data persistence

## Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Firebase Firestore
- **Authentication**: Firebase Auth
- **State Management**: React Context API
- **Icons**: Lucide React Native
- **Real-time Updates**: Firebase real-time listeners

## Demo Accounts

### Client Account
- Email: `client@demo.com`
- Password: `demo123`
- Features: SZL 100 starting balance, full payment capabilities

### Merchant Account
- Email: `merchant@demo.com`
- Password: `demo123`
- Features: Business dashboard, payment tracking, analytics

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Use the demo accounts or create new accounts to test the app

## Firebase Configuration

The app is pre-configured with Firebase. In production, you would:

1. Create a Firebase project
2. Enable Authentication and Firestore
3. Update the Firebase config in `config/firebase.ts`
4. Set up Firestore security rules (see `utils/securityRules.txt`)

## Security Features

- Firebase Authentication for secure login
- Firestore security rules to protect user data
- Real-time data validation
- Secure transaction processing with atomic operations

## Integration Ready

The app includes services for external system integration:

- **StockFlow Integration**: Product purchase handling
- **InvoiceFlow Integration**: Invoice payment processing
- **Real-time Updates**: Automatic balance and transaction updates

## Project Structure

```
├── app/                    # Expo Router pages
│   ├── (auth)/            # Authentication screens
│   └── (tabs)/            # Main app tabs
├── components/            # Reusable components
├── contexts/              # React Context providers
├── services/              # Business logic and Firebase services
├── types/                 # TypeScript type definitions
├── config/                # Firebase configuration
└── utils/                 # Utility functions and security rules
```

## Key Features Implemented

✅ Complete authentication flow with role-based access
✅ Real-time wallet balance updates
✅ Comprehensive transaction system
✅ Search and filter functionality
✅ Merchant analytics dashboard
✅ Export and reporting capabilities
✅ Integration-ready payment triggers
✅ Responsive mobile-first design
✅ Error handling and validation
✅ Demo accounts for testing

## Future Enhancements

- QR code scanning for payments
- Push notifications
- Advanced reporting and analytics
- Multi-currency support
- Biometric authentication
- Offline transaction queuing