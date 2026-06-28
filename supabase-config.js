// Supabase connection for the Post My Problem form.
// These two values are SAFE to ship in client-side code: the anon key is a public
// key, and access is controlled by Row Level Security policies on the database
// (see supabase-setup.sql). This is NOT a secret like the Google service-account key.
//
// Get both from your Supabase project: Settings -> API.
//   - Project URL  -> SUPABASE_URL
//   - anon public  -> SUPABASE_ANON_KEY
window.SUPABASE_URL = "https://fhqesrtkjbpwkasyadzs.supabase.co";
window.SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZocWVzcnRramJwd2thc3lhZHpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4OTUzNTMsImV4cCI6MjA5NzQ3MTM1M30.TTSBtSKBptC76Sggu4Eq-9v8GYEmPLLQFWbsXYzTvv4";
