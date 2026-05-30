import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://sjpaglxqoladgprpbwle.supabase.co',
  'YOUR_SUPABASE_ANON_KEY'
)
