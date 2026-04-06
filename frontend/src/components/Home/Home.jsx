import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BuildingIcon,
  CalendarDaysIcon,
  WrenchIcon,
  BellIcon,
  ArrowRightIcon,
} from 'lucide-react'

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
}

const stagger = {
  animate: {
    transition: { staggerChildren: 0.1 },
  },
}

const HERO_SLIDES = [
  {
    src: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1920&q=85&auto=format&fit=crop',
    alt: 'University campus with historic buildings and green lawns',
  },
  {
    src: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&q=85&auto=format&fit=crop',
    alt: 'Students collaborating at a table on campus',
  },
  {
    src: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1920&q=85&auto=format&fit=crop',
    alt: 'School hallway with lockers and natural light',
  },
  {
    src: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=1920&q=85&auto=format&fit=crop',
    alt: 'Library shelves and quiet study space',
  },
  {
    src: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=85&auto=format&fit=crop',
    alt: 'Modern campus workspace with natural light',
  },
]

const HERO_INTERVAL_MS = 6000

const IMAGES = {
  bookings:
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80&auto=format&fit=crop',
  tickets:
    'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80&auto=format&fit=crop',
  notifications:
    'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80&auto=format&fit=crop',
}

const features = [
  {
    title: 'Facility & asset bookings',
    description:
      'Reserve rooms, labs, and equipment in one place—fewer conflicts, clearer schedules.',
    image: IMAGES.bookings,
    alt: 'Modern open office space with desks and large windows',
    icon: CalendarDaysIcon,
  },
  {
    title: 'Incidents & maintenance',
    description:
      'Report issues and track work in real time so facilities teams can respond faster.',
    image: IMAGES.tickets,
    alt: 'Technician in protective gear working with industrial equipment',
    icon: WrenchIcon,
  },
  {
    title: 'Timely notifications',
    description:
      'Stay informed on approvals, assignments, and updates that matter to your role.',
    image: IMAGES.notifications,
    alt: 'Team collaborating around laptops in a bright workspace',
    icon: BellIcon,
  },
]

export function Home() {
  const navigate = useNavigate()
  const [heroIndex, setHeroIndex] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      setHeroIndex((i) => (i + 1) % HERO_SLIDES.length)
    }, HERO_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [])

  // Preload every slide: lazy + opacity:0 stacked layers often never enter the
  // viewport, so browsers skip loading slides 2+ unless we fetch them eagerly.
  useEffect(() => {
    HERO_SLIDES.forEach((slide) => {
      const img = new Image()
      img.src = slide.src
    })
  }, [])

  return (
    <div className="min-h-screen bg-campus-gray-50 text-campus-gray-900">
      <main>
        <section
          className="relative min-h-[100dvh] overflow-hidden"
          aria-roledescription="carousel"
          aria-label="Campus highlights"
        >
          <div className="absolute inset-0" aria-hidden>
            {HERO_SLIDES.map((slide, i) => (
              <motion.div
                key={slide.src}
                className="absolute inset-0 overflow-hidden"
                initial={false}
                animate={{
                  opacity: i === heroIndex ? 1 : 0,
                  zIndex: i === heroIndex ? 1 : 0,
                }}
                transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
              >
                <img
                  src={slide.src}
                  alt=""
                  className="h-full w-full scale-105 object-cover blur-sm"
                  width={1920}
                  height={1080}
                  decoding="async"
                  loading="eager"
                  fetchPriority={i === 0 ? 'high' : 'auto'}
                />
              </motion.div>
            ))}
          </div>

          <div
            className="absolute inset-0 bg-gradient-to-r from-navy-950/85 via-navy-900/55 to-navy-900/25"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-navy-950/30"
            aria-hidden
          />

          <header className="absolute left-0 right-0 top-0 z-50 border-b border-white/10 bg-black/20 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
              <a
                href="/"
                className="flex items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-lg shadow-teal-900/40">
                  <BuildingIcon className="h-6 w-6" aria-hidden />
                </div>
                <div>
                  <p className="text-lg font-bold text-white drop-shadow-sm">
                    CampusOps Hub
                  </p>
                  <p className="text-xs text-teal-300">Smart Campus Operations</p>
                </div>
              </a>
              <nav className="flex items-center gap-3">
                <a
                  href="#features"
                  className="hidden rounded-lg px-3 py-2 text-sm font-medium text-white/90 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900 sm:inline-block"
                >
                  Learn more
                </a>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-md outline-none transition-colors hover:bg-teal-500 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
                >
                  Sign in
                </button>
              </nav>
            </div>
          </header>

          <div className="relative z-10 flex min-h-[100dvh] flex-col justify-center px-4 pb-28 pt-24 sm:px-6">
            <div className="relative mx-auto w-full max-w-6xl">
              <motion.div
                initial="initial"
                animate="animate"
                variants={stagger}
                className="max-w-xl"
              >
                <motion.p
                  variants={fadeUp}
                  transition={{ duration: 0.45 }}
                  className="mb-3 text-sm font-semibold uppercase tracking-wide text-teal-300 drop-shadow-md"
                >
                  Campus operations, simplified
                </motion.p>
                <motion.h1
                  variants={fadeUp}
                  transition={{ duration: 0.45 }}
                  className="text-4xl font-bold leading-tight text-white drop-shadow-md sm:text-5xl lg:text-6xl"
                >
                  Run your campus from a single, modern hub
                </motion.h1>
                <motion.p
                  variants={fadeUp}
                  transition={{ duration: 0.45 }}
                  className="mt-5 text-lg text-white/90 drop-shadow [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]"
                >
                  Streamline bookings, incident reporting, and notifications so
                  staff and students spend less time on admin—and more time on
                  what matters.
                </motion.p>
                <motion.div
                  variants={fadeUp}
                  transition={{ duration: 0.45 }}
                  className="mt-8 flex flex-wrap items-center gap-3"
                >
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-3 text-base font-semibold text-white shadow-lg outline-none transition-colors hover:bg-teal-500 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
                  >
                    Sign in
                    <ArrowRightIcon className="h-5 w-5" aria-hidden />
                  </button>
                  <a
                    href="#features"
                    className="inline-flex items-center rounded-lg border-2 border-white/80 bg-white/10 px-5 py-3 text-base font-semibold text-white backdrop-blur-sm outline-none transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
                  >
                    Learn more
                  </a>
                </motion.div>
              </motion.div>

              
            </div>
          </div>

          <div
            className="absolute bottom-8 left-0 right-0 z-20 flex flex-col items-center gap-4 px-4"
            role="tablist"
            aria-label="Slide indicators"
          >
            <p className="sr-only" aria-live="polite">
              {HERO_SLIDES[heroIndex].alt}
            </p>
            <div className="flex gap-2">
              {HERO_SLIDES.map((slide, i) => (
                <button
                  key={slide.src}
                  type="button"
                  role="tab"
                  aria-selected={i === heroIndex}
                  aria-label={`Show slide ${i + 1}: ${slide.alt}`}
                  onClick={() => setHeroIndex(i)}
                  className={`h-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900 ${
                    i === heroIndex
                      ? 'w-8 bg-teal-400'
                      : 'w-2 bg-white/50 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        <section
          id="features"
          className="scroll-mt-20 border-b border-campus-gray-200 bg-campus-gray-50 py-20"
          aria-labelledby="features-heading"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2
                id="features-heading"
                className="text-3xl font-bold text-navy-900 sm:text-4xl"
              >
                Everything your teams need day to day
              </h2>
              <p className="mt-4 text-lg text-campus-gray-600">
                The same capabilities you use after sign-in—presented clearly
                for newcomers exploring the product.
              </p>
            </div>

            <motion.ul
              className="mt-14 grid gap-8 md:grid-cols-3"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: '-80px' }}
              variants={stagger}
            >
              {features.map((f) => {
                const FeatureIcon = f.icon
                return (
                <motion.li
                  key={f.title}
                  variants={fadeUp}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col overflow-hidden rounded-2xl border border-campus-gray-200 bg-white shadow-sm"
                >
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={f.image}
                      alt={f.alt}
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                      width={800}
                      height={500}
                      loading="lazy"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                      <FeatureIcon className="h-5 w-5" aria-hidden />
                    </div>
                    <h3 className="text-lg font-semibold text-navy-900">
                      {f.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-campus-gray-600">
                      {f.description}
                    </p>
                  </div>
                </motion.li>
                )
              })}
            </motion.ul>
          </div>
        </section>

        <section className="bg-gradient-to-br from-navy-900 to-navy-800 py-20 text-white">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
            >
              <h2 className="text-3xl font-bold sm:text-4xl">
                Ready to open the dashboard?
              </h2>
              <p className="mt-4 text-lg text-campus-gray-200">
                Sign in with the demo flow to explore roles and campus workflows.
              </p>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="mt-8 inline-flex items-center gap-2 rounded-lg bg-teal-500 px-6 py-3 text-base font-semibold text-white outline-none transition-colors hover:bg-teal-400 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
              >
                Sign in
                <ArrowRightIcon className="h-5 w-5" aria-hidden />
              </button>
              <p className="mt-6 text-sm text-campus-gray-300">
                Demo application—no real authentication required.
              </p>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="border-t border-campus-gray-200 bg-white py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-center text-sm text-campus-gray-500 sm:flex-row sm:text-left sm:px-6">
          <p>© {new Date().getFullYear()} CampusOps Hub. Demo purposes only.</p>
          <a
            href="#features"
            className="font-medium text-teal-700 outline-none hover:text-teal-800 focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 rounded"
          >
            Features
          </a>
        </div>
      </footer>
    </div>
  )
}

export default Home
