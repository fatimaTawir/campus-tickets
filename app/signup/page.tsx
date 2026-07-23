"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Ticket } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [role, setRole] = useState("student")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    studentId: "",
    password: "",
    confirmPassword: "",
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  async function handleSubmit() {
    setError("")

    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError("Please fill in all required fields")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          studentId: role === "student" ? formData.studentId : "",
          password: formData.password,
          role: role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error)
        return
      }

      // Success — go to login page
      router.push("/login?success=Account created! Please log in.")

    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">

      {/* Navbar */}
      <nav className="bg-[#002868] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#BF0A30] text-white text-xs font-bold px-2 py-1 rounded">
            USIU-A
          </div>
          <Link href="/" className="text-white text-lg font-bold">CampusTickets</Link>
        </div>
      </nav>

      {/* Signup Form */}
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-md">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#BF0A30] text-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-sm font-black shadow-md border-2 border-red-800">
              USIU-A
            </div>
            <p className="text-xs font-bold text-[#BF0A30] uppercase tracking-widest mb-1">USIU-A</p>
            <h2 className="text-2xl font-bold text-gray-800">Create your account</h2>
            <p className="text-gray-500 text-sm mt-1">Join CampusTickets — some are free.</p>
          </div>

          {/* Role selector */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setRole("student")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                role === "student"
                  ? "bg-[#002868] text-white"
                  : "border border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              Student
            </button>
            <button
              onClick={() => setRole("organizer")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                role === "organizer"
                  ? "bg-[#002868] text-white"
                  : "border border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              Organizer
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* Form */}
          <div className="flex flex-col gap-4">

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 block mb-1">First name</label>
                <input
                  type="text"
                  name="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#002868]"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 block mb-1">Last name</label>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#002868]"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">USIU-A Email address</label>
              <input
                type="email"
                name="email"
                placeholder="you@usiu.ac.ke"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#002868]"
              />
            </div>

            {role === "student" && (
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Student ID</label>
                <input
                  type="text"
                  name="studentId"
                  placeholder="e.g. 123456"
                  value={formData.studentId}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#002868]"
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Password</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#002868]"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#002868]"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-[#BF0A30] text-white w-full py-2.5 rounded-lg text-sm font-medium hover:bg-red-700 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>

          </div>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-[#002868] font-medium hover:underline">
              Log in
            </Link>
          </p>

        </div>
      </div>

    </main>
  )
}