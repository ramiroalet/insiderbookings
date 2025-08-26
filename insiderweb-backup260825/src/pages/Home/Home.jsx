/* ────────────────────────────────────────────────
   src/pages/Home.jsx — 100 % COMPLETE, NO LINES OMITTED
   ──────────────────────────────────────────────── */
"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import {
  Users,
  Star,
  BarChart3,
  Mail,
  CheckCircle,
  Loader2,
  ArrowRight,
  Hotel,
  Gift,
  Sparkles,
  ChevronRight,
  Play,
  Award,
  Globe,
  Clock,
  CheckCircle2,
  Shield,
} from "lucide-react"

const Home = () => {
  const navigate = useNavigate()
  const heroRef  = useRef(null)

  /* Newsletter */
  const [email, setEmail]               = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted,  setIsSubmitted]  = useState(false)

  /* UI States */
  const [isMobile,       setIsMobile]       = useState(false)
  const [mousePosition,  setMousePosition]  = useState({ x: 0, y: 0 })
  const [activeFeature,  setActiveFeature]  = useState(0)
  const [scrollY,        setScrollY]        = useState(0)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

  /* ─── HANDLE MOBILE BREAKPOINT ─────────────────── */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  /* ─── MOUSE TRACKING FOR PARALLAX ─────────────── */
  useEffect(() => {
    const handleMouseMove = (e) =>
      setMousePosition({
        x: (e.clientX / window.innerWidth)  * 100,
        y: (e.clientY / window.innerHeight) * 100,
      })

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  /* ─── SCROLL TRACKING ─────────────────────────── */
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  /* ─── AUTO‑ROTATE FEATURES ────────────────────── */
  useEffect(() => {
    const interval = setInterval(
      () => setActiveFeature((prev) => (prev + 1) % 3),
      4000
    )
    return () => clearInterval(interval)
  }, [])

  /* ─── NEWSLETTER SUBMIT ───────────────────────── */
  const handleNewsletterSubmit = (e) => {
    e.preventDefault()
    if (!email || !email.includes("@"))
      return alert("Please enter a valid email address")

    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      setEmail("")
      setTimeout(() => setIsSubmitted(false), 5000)
    }, 1000)
  }

  const handleExploreHotels = () => navigate("/hotels")
  const handlePartnerWithUs = () => navigate("/partner")

  /* ─── DATA ────────────────────────────────────── */
  const features = [
    {
      icon: <Hotel className="h-8 w-8" />,
      title: "Smart Booking Engine",
      description:
        "Booking optimization that increases conversion rates by 40 % through intelligent pricing and availability management",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Revenue Analytics",
      description:
        "Real‑time insights and predictive analytics for maximum profitability with comprehensive reporting dashboards",
      color: "from-green-500 to-green-600",
    },
    {
      icon: <Gift className="h-8 w-8" />,
      title: "Experience Manager",
      description:
        "Curate and monetize premium experiences and personalized services to enhance guest satisfaction and increase revenue",
      color: "from-purple-500 to-purple-600",
    },
  ]

  const testimonials = [
    {
      name:  "Maria Rodriguez",
      role:  "General Manager",
      hotel: "Ocean View Resort",
      image: "/placeholder.svg?height=60&width=60",
      quote:
        "Insider Bookings transformed our revenue strategy. We've seen a 45 % increase in direct bookings and our guest satisfaction scores have never been higher.",
      rating: 5,
    },
    {
      name:  "James Chen",
      role:  "Revenue Director",
      hotel: "Metropolitan Suites",
      image: "/placeholder.svg?height=60&width=60",
      quote:
        "The analytics platform is incredible. We can predict demand patterns and optimize pricing in real‑time. It's like having a crystal ball for hospitality.",
      rating: 5,
    },
    {
      name:  "Sarah Williams",
      role:  "Owner",
      hotel: "Boutique Collection",
      image: "/placeholder.svg?height=60&width=60",
      quote:
        "What sets Insider apart is their understanding of luxury hospitality. They don't just provide technology; they provide strategic partnership.",
      rating: 5,
    },
  ]

  /* ─────────────────────────────────────────────── */
  return (
    <div className={`min-h-screen bg-white ${isMobile ? "pb-20" : ""} overflow-x-hidden`}>
      {/* ── HERO SECTION ───────────────────────────── */}
    <section
  ref={heroRef}
  className="relative pt-6 min-h-[80vh] bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden flex items-center"
>
  {/* Fondo animado */}
  <div className="absolute inset-0">
    {/* Orbes flotantes (más pequeños) */}
    <div
      className="absolute w-72 h-72 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-full blur-3xl animate-pulse"
      style={{
        top:  `${22 + mousePosition.y * 0.1}%`,
        left: `${12 + mousePosition.x * 0.1}%`,
        transform: `translate(-50%, -50%) scale(${1 + scrollY * 0.0004})`,
      }}
    />
    <div
      className="absolute w-52 h-52 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"
      style={{
        top:   `${62 + mousePosition.y * -0.05}%`,
        right: `${17 + mousePosition.x * -0.05}%`,
        transform: `translate(50%, -50%) scale(${1 + scrollY * 0.00025})`,
      }}
    />

    {/* Patrón de cuadrícula */}
    <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
  </div>

  {/* Contenido */}
  <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
    <div className="text-center">
      {/* Logo */}
      <div className="mb-6 animate-in fade-in slide-in-from-top duration-700">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 via-red-500 to-orange-500 bg-clip-text text-transparent md:text-5xl lg:text-6xl">
          insider<span className="text-white">bookings</span>
        </h1>
        <div className="mt-1 h-1 w-24 bg-gradient-to-r from-red-500 to-orange-500 mx-auto rounded-full" />
      </div>

      {/* Encabezado principal */}
      <div className="animate-in fade-in slide-in-from-bottom duration-700 delay-150">
        <h2 className="mx-auto max-w-4xl text-3xl font-bold text-white sm:text-4xl md:text-5xl lg:text-6xl leading-tight">
          The Future of
          <span className="block bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
            Hotel Revenue
          </span>
          is Here
        </h2>
      </div>

      <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-300 sm:text-xl animate-in fade-in slide-in-from-bottom duration-700 delay-300">
        Transform your hotel into a revenue powerhouse with booking optimisation,
        premium experience management, and next‑generation guest intelligence.
      </p>

      {/* Botón CTA */}
      <div className="mt-10 flex justify-center animate-in fade-in slide-in-from-bottom duration-700 delay-500">
        <button
          onClick={handlePartnerWithUs}
          className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-8 py-4 text-base font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-red-500/25 focus:outline-none focus:ring-4 focus:ring-red-500/40"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <span className="relative flex items-center">
            Start Your Transformation
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-[3px]" />
          </span>
        </button>
      </div>
    </div>
       <div className="mt-16 animate-in fade-in slide-in-from-bottom duration-1000 delay-1000">

            </div>
  </div>

  {/* Indicador de scroll */}
 
</section>


      {/* ── WHAT WE DO ─────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 sm:text-4xl">What is Insider Bookings?</h3>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              We're not just another OTA. We're your strategic partner in maximizing hotel revenue and creating
              exceptional guest experiences through innovative technology and personalized service.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                icon: <BarChart3 className="h-12 w-12 text-red-500" />,
                title: "New Revenue Channel",
                description:
                  "Coordinate more bookings through our specialized platform designed to maximize your occupancy and revenue per room.",
              },
              {
                icon: <Gift className="h-12 w-12 text-red-500" />,
                title: "Manage Premium Services",
                description:
                  "Easily manage and upsell hotel perks, add-ons, and exclusive experiences that enhance guest satisfaction and boost profits.",
              },
              {
                icon: <Star className="h-12 w-12 text-red-500" />,
                title: "Elevate Guest Experience",
                description:
                  "Deliver personalized, memorable experiences that turn first-time guests into loyal customers and brand ambassadors.",
              },
            ].map((item, index) => (
              <div key={index} className="text-center p-8 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                  {item.icon}
                </div>
                <h4 className="mb-4 text-xl font-semibold text-gray-900">{item.title}</h4>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE FEATURES SHOWCASE ───────────── */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h3 className="text-4xl font-bold text-gray-900 sm:text-5xl mb-6">
              Revolutionary Hotel Technology
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the next generation of hospitality technology designed to maximize revenue and elevate guest experiences
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Interactive feature display */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-3xl" />

                {/* Feature content */}
                <div className="relative z-10">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${features[activeFeature].color} mb-6`}>
                    <div className="text-white">
                      {features[activeFeature].icon}
                    </div>
                  </div>

                  <h4 className="text-2xl font-bold text-white mb-4">
                    {features[activeFeature].title}
                  </h4>

                  <p className="text-gray-300 text-lg leading-relaxed">
                    {features[activeFeature].description}
                  </p>

                  {/* Mock interface */}
                  <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-3 h-3 bg-red-500 rounded-full" />
                      <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 bg-white/20 rounded animate-pulse" />
                      <div className="h-2 bg-white/20 rounded w-3/4 animate-pulse" />
                      <div className="h-2 bg-white/20 rounded w-1/2 animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature list */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  onClick={() => setActiveFeature(index)}
                  className={`group cursor-pointer rounded-2xl p-6 transition-all duration-300 ${
                    activeFeature === index
                      ? "bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 shadow-lg"
                      : "bg-white border-2 border-gray-100 hover:border-gray-200 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-white transition-transform group-hover:scale-110`}>
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h5 className="text-lg font-semibold text-gray-900 mb-2">
                        {feature.title}
                      </h5>
                      <p className="text-gray-600">
                        {feature.description}
                      </p>
                    </div>
                    <ChevronRight className={`w-5 h-5 text-gray-400 transition-all ${activeFeature === index ? "rotate-90 text-red-500" : "group-hover:translate-x-1"}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────── */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 sm:text-4xl">How We Elevate Your Hotel</h3>
            <p className="mt-4 text-lg text-gray-600">
              Our proven process transforms your hotel into a revenue-generating powerhouse
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
            {/* Left side - Steps */}
            <div className="space-y-8">
              {[
                {
                  step: "01",
                  title: "Strategic Partnership",
                  description:
                    "We analyze your hotel's unique strengths and create a customized revenue strategy that aligns with your goals.",
                },
                {
                  step: "02",
                  title: "Platform Integration",
                  description:
                    "Seamlessly integrate with our booking platform and start managing premium services, perks, and exclusive experiences.",
                },
                {
                  step: "03",
                  title: "Revenue Optimization",
                  description:
                    "Watch your bookings increase and revenue grow through our targeted marketing and optimized guest experience delivery.",
                },
              ].map((item, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500 text-white font-bold text-lg flex-shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h4>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right side - Benefits */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h4 className="text-2xl font-bold text-gray-900 mb-6">Partner Benefits</h4>
              <div className="space-y-4">
                {[
                  { icon: <BarChart3 className="h-5 w-5 text-green-500" />,  text: "Increase revenue by up to 35%" },
                  { icon: <Users    className="h-5 w-5 text-blue-500"  />,  text: "Access to premium guest segments" },
                  { icon: <Hotel    className="h-5 w-5 text-yellow-500" />,  text: "Real-time booking management" },
                  { icon: <Gift     className="h-5 w-5 text-purple-500" />, text: "Targeted marketing campaigns" },
                  { icon: <Shield   className="h-5 w-5 text-red-500"    />, text: "Secure payment processing" },
                  { icon: <Clock    className="h-5 w-5 text-indigo-500" />, text: "24/7 dedicated support" },
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    {benefit.icon}
                    <span className="text-gray-700">{benefit.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

    
      {/* ── ADVANCED CTA SECTION ───────────────────── */}
      <section className="relative py-24 bg-gradient-to-br from-red-600 via-red-500 to-orange-500 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] animate-pulse" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-32 -translate-x-32" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-8">
            <Award className="w-16 h-16 text-white mx-auto mb-6" />
            <h3 className="text-4xl font-bold text-white md:text-5xl mb-6">
              Ready to Lead the Future?
            </h3>
            <p className="text-xl text-red-100 max-w-2xl mx-auto">
              Join the exclusive network of forward‑thinking hotels that are already transforming
              their revenue and guest experiences with cutting‑edge technology.
            </p>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col gap-6 sm:flex-row sm:justify-center mb-12">
            <button
              onClick={handlePartnerWithUs}
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-white px-10 py-5 text-lg font-semibold text-red-600 transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-white/30"
            >
              <span className="absolute inset-0 bg-gray-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="relative flex items-center">
                <Sparkles className="mr-3 h-5 w-5" />
                Become a Partner
                <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
            </button>

            <button
              onClick={handleExploreHotels}
              className="group inline-flex items-center justify-center rounded-full border-2 border-white px-10 py-5 text-lg font-semibold text-white transition-all duration-300 hover:bg-white/10 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white/30"
            >
              <Globe className="mr-3 h-5 w-5" />
              Explore Success Stories
            </button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {[
              { icon: <Shield className="w-6 h-6" />,      text: "Enterprise Security" },
              { icon: <Award  className="w-6 h-6" />,      text: "Industry Leader"    },
              { icon: <Clock  className="w-6 h-6" />,      text: "24/7 Support"       },
              { icon: <CheckCircle2 className="w-6 h-6" />, text: "Proven Results"     },
            ].map((badge, i) => (
              <div key={i} className="flex items-center space-x-2 text-white/90">
                {badge.icon}
                <span className="text-sm font-medium">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PREMIUM NEWSLETTER SECTION ─────────────── */}
      <section className="py-24 bg-gradient-to-b from-gray-900 to-black">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl mb-6">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-4xl font-bold text-white md:text-5xl mb-6">
              Stay Ahead of the Curve
            </h3>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Get exclusive insights, industry trends, and advanced strategies delivered to your inbox.
              Join 10,000+ hospitality leaders.
            </p>
          </div>

          {isSubmitted ? (
            <div className="mx-auto flex max-w-md items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 p-6 text-white shadow-2xl animate-in slide-in-from-bottom-2 fade-in duration-500">
              <CheckCircle className="h-6 w-6" />
              <span className="font-semibold">Welcome to the insider circle!</span>
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="mx-auto max-w-lg">
              <div className="relative group">
                <input
                  type="email"
                  placeholder="Enter your professional email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 px-6 py-5 text-lg text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-red-500/30 focus:border-red-500/50 transition-all duration-300"
                  disabled={isSubmitting}
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="absolute right-2 top-2 bottom-2 px-6 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-xl hover:from-red-600 hover:to-orange-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Subscribe
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
              <p className="mt-4 text-sm text-gray-400">
                No spam, unsubscribe anytime. Read our{" "}
                <a href="#" className="text-red-400 hover:text-red-300 underline">
                  privacy policy
                </a>
              </p>
            </form>
          )}
        </div>
      </section>

      {/* ── ENHANCED FOOTER ────────────────────────── */}
      <footer className="bg-black border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          {/* Main footer content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand column */}
            <div className="md:col-span-2">
              <div className="text-3xl font-bold text-red-500 mb-4">
                insider<span className="text-white">bookings</span>
              </div>
              <p className="text-gray-400 text-lg leading-relaxed mb-6 max-w-md">
                Transforming the hospitality industry through innovative technology,
                strategic partnerships, and unparalleled guest experiences.
              </p>
              <div className="flex space-x-4">
                {["LinkedIn", "Twitter", "Instagram"].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-red-500 hover:text-white transition-all duration-300"
                  >
                    <span className="text-sm font-medium">{social[0]}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="text-white font-semibold mb-6">Solutions</h4>
              <ul className="space-y-3">
                {[
                  "Revenue Optimization",
                  "Guest Experience",
                  "Analytics Platform",
                  "Automation Suite",
                ].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-gray-400 hover:text-red-400 transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-white font-semibold mb-6">Support</h4>
              <ul className="space-y-3">
                {["Partner Portal", "Documentation", "24/7 Support", "Training"].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-gray-400 hover:text-red-400 transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0">
              © {new Date().getFullYear()} Insider Bookings. All rights reserved.
            </p>
            <div className="flex space-x-6">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="text-gray-400 hover:text-red-400 transition-colors text-sm"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Video modal */}
      {isVideoPlaying && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full aspect-video bg-gray-900 rounded-2xl overflow-hidden">
            <button
              onClick={() => setIsVideoPlaying(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              ×
            </button>
            <div className="w-full h-full flex items-center justify-center text-white">
              <div className="text-center">
                <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-gray-400">Demo video would play here</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
