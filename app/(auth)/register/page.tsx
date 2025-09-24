'use client'

import React, { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterContent />
    </Suspense>
  )
}

function RegisterContent() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    
    setLoading(true)

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          password: formData.password,
          birthDate: formData.birthDate,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Registration successful, redirect to login
        router.push('/login?registered=true')
      } else {
        setError(data.message || 'Registration failed')
      }
    } catch (err) {
      console.error('Registration error:', err)
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Calculate max date for 18 years ago
  const maxDate = new Date()
  maxDate.setFullYear(maxDate.getFullYear() - 18)
  const maxDateStr = maxDate.toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Create Your Account
          </h1>
          <p className="text-gray-400">
            Join Houston Talent Finder Today
          </p>
        </div>

        {/* Registration Form */}
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
              autoComplete="new-password"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              pattern="[a-zA-Z0-9_]{3,20}"
              title="Username can only contain letters, numbers, and underscores"
              autoComplete="username"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
              placeholder="Choose a username"
            />
            <p className="text-xs text-gray-500 mt-1">
              This will be part of your profile URL
            </p>
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
              minLength={6}
              autoComplete="new-password"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
              placeholder="Create a password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              autoComplete="new-password"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
              placeholder="Confirm your password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Date of Birth
            </label>
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleInputChange}
              required
              max={maxDateStr}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              You must be 18 or older to register
            </p>
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
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Links */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="text-red-500 hover:text-red-400">
              Sign In
            </Link>
          </p>
        </div>

        {/* Legal Notice */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <p className="text-xs text-gray-500 text-center">
            By creating an account, you confirm that you are 18 years or older and agree to our{' '}
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
