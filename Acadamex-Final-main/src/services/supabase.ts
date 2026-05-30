import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://sjpaglxqoladgprpbwle.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqcGFnbHhxb2xhZGdwcnBid2xlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxNTg3NDUsImV4cCI6MjA5NTczNDc0NX0.b2p19F7djCBysdwk-UkT5sXvEiLdrsQNBSn8lFirolo'
)
