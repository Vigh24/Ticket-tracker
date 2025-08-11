import { createClient } from '@supabase/supabase-js'

// These should be replaced with your actual Supabase project credentials
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'placeholder-key'

// Check if we have valid Supabase credentials
const hasValidCredentials =
  supabaseUrl !== 'https://placeholder.supabase.co' &&
  supabaseAnonKey !== 'placeholder-key' &&
  supabaseUrl.includes('supabase.co')

export const supabase = hasValidCredentials
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Database table names
export const TABLES = {
  TICKETS: 'tickets',
  NOTES: 'notes',
  PROFILES: 'profiles'
}

// Ticket status options
export const TICKET_STATUS = {
  RESOLVED: 'Resolved',
  AWAITING_RESPONSE: 'Awaiting Response'
}

// Note priority levels
export const NOTE_PRIORITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical'
}
