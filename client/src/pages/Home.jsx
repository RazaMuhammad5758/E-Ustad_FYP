import { Link } from "react-router-dom";
import { CATEGORIES } from "../constants/categories";

export default function Home() {
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="bg-white border rounded-2xl p-8 overflow-hidden relative">
          <div className="absolute -top-20 -right-24 w-72 h-72 bg-gray-100 rounded-full blur-2xl" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-gray-100 rounded-full blur-2xl" />

          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 text-xs font-semibold border rounded-full px-3 py-1 bg-gray-50">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Verified professionals • Safer bookings
              </div>

              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
                Trusted Professionals,
                <br />
                <span className="text-gray-700">One Click Away</span>
              </h1>

              <p className="text-gray-600 text-base md:text-lg">
                E-Ustad helps you find verified service providers like electricians,
                plumbers, AC technicians, tutors and more — easily and safely.
              </p>

              <div className="flex gap-3 flex-wrap">
                <Link
                  to="/professionals"
                  className="bg-black text-white px-5 py-2.5 rounded-lg"
                >
                  Browse Professionals
                </Link>

                <Link
                  to="/register"
                  className="border px-5 py-2.5 rounded-lg bg-white"
                >
                  Join as Client / Professional
                </Link>
              </div>

              <div className="text-sm text-gray-500">
                Note: Professionals require admin approval before login.
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="border rounded-xl p-3 bg-gray-50">
                  <div className="text-xs text-gray-500">Privacy</div>
                  <div className="font-semibold text-sm">Phone Protected</div>
                </div>
                <div className="border rounded-xl p-3 bg-gray-50">
                  <div className="text-xs text-gray-500">Booking</div>
                  <div className="font-semibold text-sm">Fast Requests</div>
                </div>
                <div className="border rounded-xl p-3 bg-gray-50">
                  <div className="text-xs text-gray-500">Trust</div>
                  <div className="font-semibold text-sm">Admin Verified</div>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="bg-gray-50 border rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border flex items-center justify-center">
                    ✅
                  </div>
                  <div>
                    <div className="font-bold">Verified Professionals</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Admin approval + profile details for better trust.
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border flex items-center justify-center">
                    🔒
                  </div>
                  <div>
                    <div className="font-bold">Phone Privacy</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Phone number shows only after booking is accepted.
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border flex items-center justify-center">
                    📅
                  </div>
                  <div>
                    <div className="font-bold">Easy Booking</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Send request, track status, contact after acceptance.
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-black text-white rounded-2xl p-5 flex items-center justify-between gap-4">
                <div>
                  <div className="font-bold">Need help today?</div>
                  <div className="text-sm text-gray-200">
                    Search by city & category in seconds.
                  </div>
                </div>
                <Link
                  to="/professionals"
                  className="bg-white text-black px-4 py-2 rounded-lg font-semibold"
                >
                  Find Now
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Popular Categories (same as dropdown categories.js) */}
        <div className="mt-8">
          <div className="flex items-end justify-between gap-3 flex-wrap mb-3">
            <div>
              <h2 className="text-xl font-bold">Popular Categories</h2>
              <p className="text-sm text-gray-500">
                Click a category to see only related professionals.
              </p>
            </div>
            <Link to="/professionals" className="text-sm underline">
              View all
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
            {CATEGORIES.map((c) => (
              <Link
                key={c}
                to={`/professionals?category=${encodeURIComponent(c)}`}
                className="bg-white border rounded-xl p-4 hover:bg-gray-50 transition"
              >
                <div className="font-semibold">{c}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Browse {c} professionals
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 mt-8">
          © {year} E-Ustad
        </div>
      </section>
    </div>
  );
}
