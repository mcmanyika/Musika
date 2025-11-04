import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Replace these with your actual Supabase project URL and public anon key.
// You can find these in your Supabase project's API settings.
const supabaseUrl = 'https://hedjxylapaxiwlqrcosd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhlZGp4eWxhcGF4aXdscXJjb3NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMjE4NDIsImV4cCI6MjA3Nzc5Nzg0Mn0.mhtRHugGNPiafrkzb9bHExlvGBYsUhP_XzySsZWVAAQ';

if (supabaseUrl === 'https://hedjxylapaxiwlqrcosd.supabase.co' || supabaseAnonKey === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhlZGp4eWxhcGF4aXdscXJjb3NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMjE4NDIsImV4cCI6MjA3Nzc5Nzg0Mn0.mhtRHugGNPiafrkzb9bHExlvGBYsUhP_XzySsZWVAAQ') {
  console.warn(
    `Supabase is not configured. Please update supabaseUrl and supabaseAnonKey in services/supabaseClient.ts`
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
