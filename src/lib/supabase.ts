import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Server-side client with service role
export function createServerClient() {
  // Use NEXT_PUBLIC_SUPABASE_KEY (which is service_role key) for server-side
  return createClient(supabaseUrl, supabaseKey)
}
