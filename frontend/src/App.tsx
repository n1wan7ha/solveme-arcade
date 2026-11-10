/**
 * Why this exists: the root component. Auth wraps the router so every page
 * knows who is signed in.
 * Drafted with an LLM (Claude Code).
 */
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { router } from './router';

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
