"use client"

import Link from "next/link"
import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"

function LoginForm() {
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect') || '/dashboard'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  async function handleSubmit() {
    setError("")

    if (!formData.email || !formData.password) {
      setError("Please enter your email and password")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error)
        return
      }

      // Set cookie client side as backup
     if (data.token) {
  localStorage.setItem('token', data.token)
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `token=${data.token}; path=/; max-age=${60 * 60 * 24 * 30}${secure}`
}

      // Go to redirect URL or organizer/dashboard
      let finalRedirectUrl = redirectUrl
      if ((data.user?.role === 'organizer' || data.user?.role === 'admin') && finalRedirectUrl === '/dashboard') {
        finalRedirectUrl = '/organizer'
      }
      window.location.href = finalRedirectUrl

    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">
          Email address
        </label>
        <input
          type="email"
          name="email"
          placeholder="you@usiu.ac.ke"
          value={formData.email}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#002868]"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">
          Password
        </label>
        <input
          type="password"
          name="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#002868]"
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-gray-600">
          <input type="checkbox" className="rounded" />
          Remember me
        </label>
        <a href="#" className="text-[#002868] hover:underline">Forgot password?</a>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-[#002868] text-white w-full py-2.5 rounded-lg text-sm font-medium hover:bg-blue-900 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Logging in..." : "Log in"}
      </button>

    </div>
  )
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">

      <nav className="bg-[#002868] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#BF0A30] text-white text-xs font-bold px-2 py-1 rounded">
            USIU-A
          </div>
          <Link href="/" className="text-white text-lg font-bold">CampusTickets</Link>
        </div>
      </nav>

      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-md">

          <div className="text-center mb-8">
            <div className="bg-[#BF0A30] text-white text-sm font-bold px-3 py-1 rounded inline-block mb-4">
              USIU-A
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Welcome back</h2>
            <p className="text-gray-500 text-sm mt-1">Log in to your CampusTickets account</p>
          </div>

          <Suspense fallback={<div>Loading...</div>}>
            <LoginForm />
          </Suspense>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{" "}
            <Link href="/signup" className="text-[#BF0A30] font-medium hover:underline">
              Sign up
            </Link>
          </p>

        </div>
      </div>

    </main>
  )
}