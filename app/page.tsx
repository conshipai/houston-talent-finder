// app/page.tsx
import Link from 'next/link'
import { WORK_CATEGORIES } from '@/lib/categories'
import SiteHeader from '@/components/site/SiteHeader'
import SiteFooter from '@/components/site/SiteFooter'

const steps = [
  { title: 'Create your free profile', text: 'Tell us what kind of work you want, add photos and set your boundaries.' },
  { title: 'Get verified', text: 'Our team verifies your age and approves your photos to keep the network safe.' },
  { title: 'Get connected', text: 'Producers and SOB employers find your profile and message you directly.' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-600/40 via-fuchsia-900/30 to-black" />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-pink-500/20 blur-3xl" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
            We Connect You With <span className="text-pink-400">Producers</span> &amp; SOB Employers
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-200 max-w-2xl mx-auto">
            Dancers, models, cam talent, bartenders, VIP hosts and more. Join Houston&apos;s private
            network and get discovered by verified producers, clubs, studios and agencies.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="bg-pink-600 hover:bg-pink-500 text-white font-bold text-lg px-10 py-4 rounded-full shadow-lg shadow-pink-900/40 transition">
              Get Connected – Join Free
            </Link>
            <Link href="/login" className="border border-white/40 hover:border-white text-white font-semibold text-lg px-10 py-4 rounded-full transition">
              Member Sign In
            </Link>
          </div>
          <p className="mt-6 text-sm text-gray-400">18+ only · ID verified · Private members-only profiles</p>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl md:text-3xl font-extrabold text-white text-center">Work We Connect You With</h2>
        <p className="text-gray-400 text-center mt-2">Producers and employers are looking for talent in all of these areas.</p>
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {WORK_CATEGORIES.map(c => (
            <Link
              key={c.value}
              href="/register"
              className="group rounded-xl bg-gray-900 border border-gray-800 hover:border-pink-500 p-4 text-center transition"
            >
              <div className="text-3xl">{c.emoji}</div>
              <p className="mt-2 text-sm font-bold text-white group-hover:text-pink-300">{c.label}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-950 border-y border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white text-center">How It Works</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.title} className="rounded-2xl bg-gray-900 border border-gray-800 p-6">
                <div className="w-10 h-10 rounded-full bg-pink-600 text-white font-extrabold flex items-center justify-center">
                  {i + 1}
                </div>
                <h3 className="mt-4 text-xl font-bold text-white">{s.title}</h3>
                <p className="mt-2 text-gray-400">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why join */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl bg-gradient-to-br from-pink-600 to-fuchsia-700 p-8">
          <h3 className="text-2xl font-extrabold text-white">For Talent</h3>
          <ul className="mt-4 space-y-2 text-pink-50">
            <li>✓ Free to join</li>
            <li>✓ Your profile is private – only verified members can see it</li>
            <li>✓ Set your own rates and boundaries</li>
            <li>✓ Message directly with producers and employers</li>
          </ul>
          <Link href="/register" className="inline-block mt-6 bg-white text-pink-700 font-bold px-6 py-3 rounded-full hover:bg-pink-50">
            Create Free Profile
          </Link>
        </div>
        <div className="rounded-2xl bg-gray-900 border border-gray-800 p-8">
          <h3 className="text-2xl font-extrabold text-white">For Producers &amp; Employers</h3>
          <ul className="mt-4 space-y-2 text-gray-300">
            <li>✓ Find age-verified local talent</li>
            <li>✓ Browse profiles by type of work, look and experience</li>
            <li>✓ Reach out directly through private messaging</li>
          </ul>
          <Link href="/login" className="inline-block mt-6 bg-pink-600 text-white font-bold px-6 py-3 rounded-full hover:bg-pink-500">
            Producer Sign In
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
