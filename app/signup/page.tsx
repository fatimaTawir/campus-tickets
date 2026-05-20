import Link from "next/link"

export default function SignupPage() {
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
            <div className="bg-[#BF0A30] text-white text-sm font-bold px-3 py-1 rounded inline-block mb-4">
              USIU-A
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Create your account</h2>
            <p className="text-gray-500 text-sm mt-1">Join CampusTickets — it's free</p>
          </div>

          {/* Role selector */}
          <div className="flex gap-3 mb-6">
            <button className="flex-1 py-2 rounded-lg text-sm font-medium bg-[#002868] text-white">
              Student
            </button>
            <button className="flex-1 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-600 hover:bg-gray-50">
              Organizer
            </button>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-4">

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  First name
                </label>
                <input
                  type="text"
                  placeholder="John"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#002868]"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Last name
                </label>
                <input
                  type="text"
                  placeholder="Doe"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#002868]"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                USIU-A Email address
              </label>
              <input
                type="email"
                placeholder="you@usiu.ac.ke"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#002868]"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Student ID
              </label>
              <input
                type="text"
                placeholder="e.g. 123456"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#002868]"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#002868]"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#002868]"
              />
            </div>

            <label className="flex items-start gap-2 text-sm text-gray-600">
              <input type="checkbox" className="mt-0.5 rounded" />
              I agree to the{" "}
              <a href="#" className="text-[#002868] hover:underline">
                Terms and Conditions
              </a>
            </label>

            <button className="bg-[#BF0A30] text-white w-full py-2.5 rounded-lg text-sm font-medium hover:bg-red-700 mt-2">
              Create Account
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