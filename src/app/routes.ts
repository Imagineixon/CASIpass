import { createBrowserRouter } from 'react-router';
import { LoginScreen } from './components/auth/login-screen';
import { RegisterScreen } from './components/auth/register-screen';
import { ForgotPasswordScreen } from './components/auth/forgot-password-screen';
import { MyAccountScreen } from './components/auth/my-account-screen';
import { StaffLoginScreen } from './components/auth/staff-login-screen';
import { AppShell } from './components/app-shell';
import { CheckoutFlow } from './components/checkout/checkout-flow';
import { MyOrders } from './components/orders/my-orders';
import { MyTickets } from './components/wallet/my-tickets';
import { VerificationPanel } from './components/admin/verification-panel';
import { StaffScanner } from './components/staff/scanner';

export const router = createBrowserRouter([
  { path: '/', Component: LoginScreen },
  { path: '/vitrine', Component: AppShell },
  { path: '/login', Component: LoginScreen },
  { path: '/register', Component: RegisterScreen },
  { path: '/forgot-password', Component: ForgotPasswordScreen },
  { path: '/my-account', Component: MyAccountScreen },
  { path: '/staff-login', Component: StaffLoginScreen },
  { path: '/checkout', Component: CheckoutFlow },
  { path: '/my-orders', Component: MyOrders },
  { path: '/my-tickets', Component: MyTickets },
  { path: '/admin/verificacao', Component: VerificationPanel },
  { path: '/staff/scanner', Component: StaffScanner },
]);
