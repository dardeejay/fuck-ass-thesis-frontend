import { getServerAuthSession } from '@/auth'
import { SignInForm } from '@/components/auth/sign-in-form'
import { redirect } from 'next/navigation'

export default async function LoginPage() {
  const session = await getServerAuthSession()

  if (session?.user) {
    redirect('/dashboard')
  }

  return <SignInForm />
}
