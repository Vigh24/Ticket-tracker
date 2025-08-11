import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Key, CheckCircle, ExternalLink, Copy } from 'lucide-react';
import Button from '../UI/Button';

const SetupGuide = () => {
  const [copiedStep, setCopiedStep] = useState(null);

  const copyToClipboard = (text, step) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(step);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const steps = [
    {
      id: 1,
      title: 'Create a Supabase Project',
      description: 'Sign up for a free Supabase account and create a new project',
      action: 'Go to Supabase',
      link: 'https://supabase.com',
      icon: Database
    },
    {
      id: 2,
      title: 'Set up the Database',
      description: 'Run the SQL commands to create the required tables and policies',
      action: 'Copy SQL Commands',
      copyText: `-- TicketTrack Pro Database Schema
-- Run these commands in your Supabase SQL editor

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Resolved', 'Awaiting Response')),
  notes TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(ticket_id, user_id)
);

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
  ticket_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for tickets
CREATE POLICY "Users can view own tickets" ON tickets
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tickets" ON tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tickets" ON tickets
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tickets" ON tickets
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for notes
CREATE POLICY "Users can view own notes" ON notes
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notes" ON notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notes" ON notes
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notes" ON notes
  FOR DELETE USING (auth.uid() = user_id);

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();`,
      icon: Database
    },
    {
      id: 3,
      title: 'Get Your API Keys',
      description: 'Copy your project URL and anon key from Settings > API',
      action: 'Go to API Settings',
      link: 'https://supabase.com/dashboard/project/_/settings/api',
      icon: Key
    },
    {
      id: 4,
      title: 'Create Environment File',
      description: 'Create a .env file in your project root with your Supabase credentials',
      action: 'Copy .env Template',
      copyText: `REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key`,
      icon: CheckCircle
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <div className="card">
          <div className="text-center mb-8">
            <motion.h1
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-gray-800 mb-2"
            >
              Welcome to TicketTrack Pro
            </motion.h1>
            <p className="text-gray-600">
              Let's set up your Supabase backend to get started
            </p>
          </div>

          <div className="space-y-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                className="bg-white/30 backdrop-blur-sm border border-white/30 rounded-lg p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <step.icon className="w-5 h-5 text-primary-600" />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {step.id}. {step.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {step.description}
                    </p>
                    
                    {step.link && (
                      <Button
                        onClick={() => window.open(step.link, '_blank')}
                        className="flex items-center gap-2"
                      >
                        <ExternalLink size={16} />
                        {step.action}
                      </Button>
                    )}
                    
                    {step.copyText && (
                      <Button
                        onClick={() => copyToClipboard(step.copyText, step.id)}
                        variant="secondary"
                        className="flex items-center gap-2"
                      >
                        {copiedStep === step.id ? (
                          <CheckCircle size={16} className="text-green-600" />
                        ) : (
                          <Copy size={16} />
                        )}
                        {copiedStep === step.id ? 'Copied!' : step.action}
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Next Steps:</h4>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Complete the setup steps above</li>
              <li>2. Create your .env file with the correct credentials</li>
              <li>3. Restart the development server (npm start)</li>
              <li>4. Register your first user account</li>
            </ol>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SetupGuide;
