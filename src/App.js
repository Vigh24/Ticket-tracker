import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { supabase } from './lib/supabase';
import AuthForm from './components/Auth/AuthForm';
import Dashboard from './components/Dashboard/Dashboard';
import LoadingSpinner from './components/UI/LoadingSpinner';
import SetupGuide from './components/Setup/SetupGuide';
import DarkVeil from './components/UI/DarkVeil';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

// Inner component that has access to theme context
function AppContent({ session }) {
  const { isDarkMode } = useTheme();

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Dark mode animated background */}
      {isDarkMode && (
        <div className="fixed inset-0 z-0">
          <DarkVeil
            hueShift={280} // Purple/blue hue
            noiseIntensity={0.02}
            scanlineIntensity={0.1}
            speed={0.3}
            scanlineFrequency={0.01}
            warpAmount={0.1}
            resolutionScale={0.8}
          />
        </div>
      )}

      {/* Content overlay */}
      <div className="relative z-10">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            className: 'dark:bg-gray-800/90 dark:text-gray-200 dark:border-gray-700/50',
            style: {
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '12px',
              color: '#374151',
            },
          }}
        />

        {!session ? (
          <AuthForm />
        ) : (
          <Dashboard session={session} />
        )}
      </div>
    </div>
  );
}

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Show setup guide if Supabase is not configured
  if (!supabase) {
    return <SetupGuide />;
  }

  return (
    <ThemeProvider>
      <AppContent session={session} />
    </ThemeProvider>
  );
}

export default App;
