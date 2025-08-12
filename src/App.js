import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { supabase } from './lib/supabase';
import AuthForm from './components/Auth/AuthForm';
import Dashboard from './components/Dashboard/Dashboard';
import LoadingSpinner from './components/UI/LoadingSpinner';
import SetupGuide from './components/Setup/SetupGuide';
import DarkVeil from './components/UI/DarkVeil';
import ClickSpark from './components/UI/ClickSpark';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

// Inner component that has access to theme context
function AppContent({ session }) {
  const { isDarkMode } = useTheme();

  return (
    <ClickSpark
      sparkColor={isDarkMode ? '#a855f7' : '#3b82f6'}
      sparkSize={12}
      sparkRadius={20}
      sparkCount={10}
      duration={500}
    >
      <div className="min-h-screen w-full relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-black dark:to-black transition-colors duration-300">
        {/* Dark mode animated background */}
        {isDarkMode && (
          <DarkVeil
            hueShift={0} // Original colors
            noiseIntensity={0.02}
            scanlineIntensity={0.05}
            speed={0.4}
            scanlineFrequency={0.005}
            warpAmount={0.08}
            resolutionScale={1.0}
          />
        )}

        {/* Content overlay */}
        <div className="relative z-20">
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
    </ClickSpark>
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
