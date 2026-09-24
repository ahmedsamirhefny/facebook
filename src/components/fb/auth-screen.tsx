'use client'

import * as React from 'react'
import { signIn } from 'next-auth/react'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'

type Mode = 'login' | 'register'

export function AuthScreen() {
  const [mode, setMode] = React.useState<Mode>('login')
  return (
    <div className="min-h-screen w-full flex flex-col">
      {/* Brand + form, Facebook-style two-pane on desktop */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 px-4 py-10 bg-[#f0f2f5] dark:bg-[#18191a]">
        <div className="max-w-md text-center lg:text-left">
          <h1 className="text-[#1877f2] font-bold text-5xl lg:text-6xl tracking-tight">
            facebook
          </h1>
          <p className="mt-4 text-2xl lg:text-[28px] leading-tight text-[#050505] dark:text-[#e4e6eb]">
            {mode === 'login'
              ? 'Connect with friends and the world around you.'
              : 'Create an account and join the conversation.'}
          </p>
        </div>

        <div className="w-full max-w-md">
          {mode === 'login' ? (
            <LoginForm onSwitch={() => setMode('register')} />
          ) : (
            <RegisterForm onSwitch={() => setMode('login')} />
          )}
        </div>
      </div>

      <footer className="bg-[#ffffff] dark:bg-[#242526] border-t border-[#ced4da] dark:border-[#3a3b3c] py-4 text-center text-xs text-[#65676b] dark:text-[#b0b3b8]">
        Meta © {new Date().getFullYear()} · Facebook clone · built with Next.js + socket.io
      </footer>
    </div>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-[#242526] rounded-xl shadow-md p-5 sm:p-6 space-y-3 border border-[#ced4da] dark:border-[#3a3b3c]">
      {children}
    </div>
  )
}

function Field({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  autoComplete,
  required = true,
}: {
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  autoComplete?: string
  required?: boolean
}) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        className="w-full h-12 rounded-lg border border-[#ced4da] dark:border-[#3a3b3c] bg-[#f0f2f5] dark:bg-[#18191a] px-4 text-[15px] text-[#050505] dark:text-[#e4e6eb] placeholder:text-[#65676b] dark:placeholder:text-[#b0b3b8] outline-none focus:ring-2 focus:ring-[#1877f2] focus:border-transparent"
      />
    </label>
  )
}

function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full h-12 rounded-lg bg-[#1877f2] hover:bg-[#1563c9] text-white font-semibold text-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  )
}

function PasswordField({
  value,
  onChange,
  autoComplete,
}: {
  value: string
  onChange: (v: string) => void
  autoComplete?: string
}) {
  const [show, setShow] = React.useState(false)
  return (
    <div className="relative">
      <Field
        label="Password"
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder="Password"
        autoComplete={autoComplete}
      />
      <button
        type="button"
        aria-label={show ? 'Hide password' : 'Show password'}
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#65676b] dark:text-[#b0b3b8] hover:text-[#050505] dark:hover:text-[#e4e6eb]"
      >
        {show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
      </button>
    </div>
  )
}

function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  const submit = async () => {
    if (!email || !password) {
      toast.error('Please enter your email and password.')
      return
    }
    setLoading(true)
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })
    setLoading(false)
    if (res?.error) {
      toast.error('Wrong email or password. Please try again.')
      return
    }
    // success — full reload so socket boot + providers re-init as the new user
    window.location.reload()
  }

  return (
    <>
      <Card>
        <Field
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="Email address or phone number"
          autoComplete="email"
        />
        <PasswordField value={password} onChange={setPassword} autoComplete="current-password" />
        <PrimaryButton onClick={submit} disabled={loading}>
          {loading ? 'Logging in…' : 'Log In'}
        </PrimaryButton>
        <div className="pt-1 text-center">
          <button className="text-sm text-[#1877f2] hover:underline">
            Forgotten password?
          </button>
        </div>
      </Card>
      <div className="mt-5 text-center">
        <button
          onClick={onSwitch}
          className="w-full max-w-xs h-12 rounded-lg bg-[#42b72a] hover:bg-[#36a420] text-white font-semibold text-[17px] transition-colors"
        >
          Create new account
        </button>
      </div>
    </>
  )
}

function RegisterForm({ onSwitch }: { onSwitch: () => void }) {
  const [firstName, setFirstName] = React.useState('')
  const [lastName, setLastName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  const submit = async () => {
    if (!firstName || !lastName) {
      toast.error('Please enter your first and last name.')
      return
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      toast.error('Please enter a valid email address.')
      return
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setLoading(false)
        toast.error(data?.error || 'Registration failed. Please try again.')
        return
      }
      // auto-login the freshly created account
      const sign = await signIn('credentials', { email, password, redirect: false })
      setLoading(false)
      if (sign?.error) {
        // registered but auto-login failed — fall back to login screen
        toast.success('Account created! Please log in.')
        onSwitch()
        return
      }
      toast.success('Welcome to facebook! Your account is ready.')
      window.location.reload()
    } catch (e) {
      setLoading(false)
      toast.error('Something went wrong. Please try again.')
    }
  }

  return (
    <>
      <Card>
        <div className="flex items-center justify-between pb-2">
          <h2 className="text-2xl font-semibold text-[#050505] dark:text-[#e4e6eb]">
            Sign Up
          </h2>
          <button
            onClick={onSwitch}
            className="text-sm text-[#1877f2] hover:underline"
          >
            Already have an account?
          </button>
        </div>
        <p className="text-sm text-[#65676b] dark:text-[#b0b3b8] -mt-1 pb-1">
          It&apos;s quick and easy.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <Field
            label="First name"
            value={firstName}
            onChange={setFirstName}
            placeholder="First name"
            autoComplete="given-name"
          />
          <Field
            label="Last name"
            value={lastName}
            onChange={setLastName}
            placeholder="Last name"
            autoComplete="family-name"
          />
        </div>
        <Field
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="Email address"
          autoComplete="email"
        />
        <PasswordField value={password} onChange={setPassword} autoComplete="new-password" />
        <PrimaryButton onClick={submit} disabled={loading}>
          {loading ? 'Creating account…' : 'Sign Up'}
        </PrimaryButton>
        <p className="text-[11px] text-[#65676b] dark:text-[#b0b3b8] text-center pt-1">
          By clicking Sign Up, you agree to our Terms and Privacy Policy.
        </p>
      </Card>
      <div className="mt-5 text-center">
        <button
          onClick={onSwitch}
          className="text-sm text-[#1877f2] hover:underline"
        >
          Already have an account? Log in
        </button>
      </div>
    </>
  )
}
