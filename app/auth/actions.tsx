'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: 'Could not authenticate user.' }
  }

  return redirect('/')
}

export async function signUp(formData: FormData) {
  const origin = headers().get('origin')
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('name') as string 
  const username = fullName.toLowerCase().replace(/\s+/g, '_') 

  const supabase = createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        full_name: fullName,
        username: username, 
      },
    },
  })

  if (error) {
    console.error('Sign up error:', error)
    return { error: 'Could not authenticate user. Please try again.' }
  }

  return { success: true, message: 'Check your email to continue signing up.' }
}
