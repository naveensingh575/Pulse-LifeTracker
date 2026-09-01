import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hxrvffpoevfvoscwvcvd.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4cnZmZnBvZXZmdm9zY3d2Y3ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyODA4ODEsImV4cCI6MjEwMzg1Njg4MX0.0bFJho55ayre82zXCHKIYeO59FPIBifCx3jM4NG3f8s';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
