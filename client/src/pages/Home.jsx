import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-bold text-lg">
            E-Ustad
          </Link>

          <div className="flex items-center gap-4 text-sm">
            <Link to="/professionals" className="underline">
              Find Professionals
            </Link>
            <Link to="/login" className="underline">
              Login
            </Link>
            <Link
              to="/register"
              className="bg-black text-white px-3 py-2 rounded"
            >
              Register
            </Link>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="bg-white border rounded-2xl p-8 grid md:grid-cols-2 gap-6 items-center">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold leading-tight">
              Trusted Professionals, One Click Away
            </h1>
            <p className="text-gray-600">
              E-Ustad helps you find verified service providers like electricians,
              plumbers, AC technicians, tutors and more — easily and safely.
            </p>

            <div className="flex gap-3 flex-wrap">
              <Link
                to="/professionals"
                className="bg-black text-white px-4 py-2 rounded"
              >
                Browse Professionals
              </Link>
              <Link to="/register" className="border px-4 py-2 rounded">
                Join as Client / Professional
              </Link>
            </div>

            <div className="text-xs text-gray-500">
              Note: Professionals require admin approval before login.
            </div>
          </div>

          {/* Small info cards */}
          <div className="grid gap-3">
            <div className="bg-gray-50 border rounded-xl p-4">
              <div className="font-semibold">✅ Verified Professionals</div>
              <div className="text-sm text-gray-600">
                Admin approval + profile details for trust.
              </div>
            </div>
            <div className="bg-gray-50 border rounded-xl p-4">
              <div className="font-semibold">🔒 Phone Privacy</div>
              <div className="text-sm text-gray-600">
                Phone number shows only after booking is accepted.
              </div>
            </div>
            <div className="bg-gray-50 border rounded-xl p-4">
              <div className="font-semibold">📅 Easy Booking</div>
              <div className="text-sm text-gray-600">
                Send request, track status, contact after acceptance.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 mt-6">
          © {new Date().getFullYear()} E-Ustad
        </div>
      </div>
    </div>
  );
}
