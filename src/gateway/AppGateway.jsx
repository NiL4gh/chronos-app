import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProviderGateway, useGatewayAuth } from './AuthProviderGateway';
import LoginGateway from './LoginGateway';
import SignupGateway from './SignupGateway';
import OnboardingGateway from './OnboardingGateway';

/**
 * Internal component that has access to GatewayAuthContext
 * and handles routing based on user + profile state.
 */
function GatewayRoutes({ onAuthSuccess }) {
  const { user, profile, loading } = useGatewayAuth();
  const location = useLocation();

  // Call onAuthSuccess when user has org_id (ready for main app)
  useEffect(() => {
    if (!loading && user && profile?.org_id) {
      onAuthSuccess();
    }
  }, [loading, user, profile, onAuthSuccess]);

  // If still loading, show nothing (parent shows loading)
  if (loading) return null;

  // User authenticated but no org_id → onboarding
  if (user && !profile?.org_id) {
    return (
      <Routes>
        <Route path="/onboarding" element={<OnboardingGateway onAuthSuccess={onAuthSuccess} />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    );
  }

  // No session → show login/signup
  return (
    <Routes>
      <Route path="/login" element={<LoginGateway onAuthSuccess={onAuthSuccess} />} />
      <Route path="/signup" element={<SignupGateway onAuthSuccess={onAuthSuccess} />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

/**
 * Standalone auth gateway — renders inside the app-level HashRouter.
 * Routes: /login, /signup, /onboarding
 * After successful auth, calls onAuthSuccess so the root component
 * can switch from gateway rendering to the main app.
 */
export default function AppGateway({ onAuthSuccess }) {
  return (
    <AuthProviderGateway onAuthSuccess={onAuthSuccess}>
      <GatewayRoutes onAuthSuccess={onAuthSuccess} />
    </AuthProviderGateway>
  );
}