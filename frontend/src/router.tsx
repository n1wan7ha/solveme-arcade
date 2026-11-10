/**
 * Why this exists: every URL in the app and which guard protects it.
 * Drafted with an LLM (Claude Code).
 */
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from './auth/LoginPage';
import { GuestRoute, ProtectedRoute } from './auth/ProtectedRoute';
import { RegisterPage } from './auth/RegisterPage';
import { Dashboard } from './dashboard/Dashboard';
import { PlayPage } from './games/PlayPage';
import { AppLayout } from './layout/AppLayout';

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        element: <GuestRoute />,
        children: [
          { path: '/', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/dashboard', element: <Dashboard /> },
          { path: '/play/:gameId', element: <PlayPage /> },
        ],
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
