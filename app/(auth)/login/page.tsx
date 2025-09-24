'use client'

import React, { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const registered = searchParams.get('registered') === 'true'

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted with email:', formData.email)
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })
      
      console.log('SignIn result:', result)

      if (result?.error) {
        console.error('Login error:', result.error)
        setError(result.error)
      } else if (result?.ok) {
        console.log('Login successful, redirecting to dashboard...')
        // Try window.location for redirect as a fallback
        window.location.href = '/dashboard'
      } else {
        console.error('Unexpected result:', result)
        setError('Login failed. Please try again.')
      }
    } catch (err) {
      console.error('SignIn error:', err)
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-400">
            Sign in to Houston Talent Finder
          </p>
        </div>

        {/* Success Message */}
        {registered && (
          <div className="mb-6 p-4 bg-green-900/50 border border-green-600 rounded-lg">
            <p className="text-green-200 text-sm">
              Registration successful! Please sign in with your credentials.
            </p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              autoComplete="username email"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              autoComplete="current-password"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
              placeholder="Enter your password"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-900/50 border border-red-600 rounded-lg">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Links */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-400">
            Don't have an account?{' '}
            <Link href="/register" className="text-red-500 hover:text-red-400">
              Create Account
            </Link>
          </p>
          <p className="text-sm text-gray-400">
            <Link href="/forgot-password" className="text-red-500 hover:text-red-400">
              Forgot Password?
            </Link>
          </p>
        </div>

        {/* Legal Notice */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <p className="text-xs text-gray-500 text-center">
            By signing in, you confirm that you are 18 years or older and agree to our{' '}
            <Link href="/terms" className="text-red-500 hover:text-red-400">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-red-500 hover:text-red-400">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
