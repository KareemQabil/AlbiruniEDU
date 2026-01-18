/**
 * Supabase Client for Al-Biruni EDU
 *
 * Provides browser-side and server-side Supabase clients
 * following Next.js App Router best practices
 */

import { createBrowserClient } from '@supabase/ssr';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

/**
 * Get Supabase URL and Anon Key from environment
 */
const getSupabaseConfig = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check your .env.local file.'
    );
  }

  return { supabaseUrl, supabaseAnonKey };
};

/**
 * Create a Supabase client for use in Client Components
 *
 * @example
 * ```tsx
 * 'use client'
 *
 * import { createClient } from '@/lib/supabase/client'
 *
 * export function MyComponent() {
 *   const supabase = createClient()
 *   // Use supabase client...
 * }
 * ```
 */
export function createClient() {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

/**
 * Create a Supabase client for use in Server Components
 *
 * @example
 * ```tsx
 * import { createServerComponentClient } from '@/lib/supabase/client'
 *
 * export async function MyServerComponent() {
 *   const supabase = createServerComponentClient()
 *   const { data } = await supabase.from('lessons').select('*')
 *   // ...
 * }
 * ```
 */
export function createServerComponentClient() {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
  const cookieStore = cookies();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
    },
  });
}

/**
 * Create a Supabase client for use in Server Actions and Route Handlers
 *
 * @example
 * ```tsx
 * import { createActionClient } from '@/lib/supabase/client'
 *
 * export async function myServerAction() {
 *   'use server'
 *   const supabase = createActionClient()
 *   // Use supabase client...
 * }
 * ```
 */
export function createActionClient() {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
  const cookieStore = cookies();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: '', ...options });
      },
    },
  });
}

/**
 * Create an admin Supabase client with service role key
 * WARNING: Only use in secure server-side contexts!
 *
 * @example
 * ```tsx
 * import { createAdminClient } from '@/lib/supabase/client'
 *
 * export async function POST(req: Request) {
 *   const supabase = createAdminClient()
 *   // Can bypass RLS for admin operations
 * }
 * ```
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing Supabase admin credentials. Service role key required.'
    );
  }

  return createServerClient<Database>(supabaseUrl, supabaseServiceKey, {
    cookies: {},
  });
}
