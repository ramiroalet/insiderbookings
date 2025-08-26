"use client"

import {
  MapPin,
  Phone,
  Mail,
  Wifi,
  Waves,
  Coffee,
  Shield,
  Star,
  Heart,
  Building2,
  ChevronLeft,
  ChevronRight,
  Home,
} from "lucide-react"
import { useState, useEffect } from "react"
import PartnerBookingSection from "../../components/PartnerBooking/PartnerBooking"

export default function MaxinesLanding() {
  const [currentImage, setCurrentImage] = useState(0)

  const images = [
    {
      src: "https://res.cloudinary.com/doqyrz0sg/image/upload/v1748471749/hotels/0001-catalina-hotel-beach-club/jzskhwx6hjids9ha216l.jpg",
      alt: "Maxines Dorset Catalina Hotel Exterior",
    },
    {
      src: "https://res.cloudinary.com/doqyrz0sg/image/upload/v1748471743/hotels/0001-catalina-hotel-beach-club/dsamsew8ifzlo36cruix.jpg",
      alt: "Luxury Hotel Room",
    },
    {
      src: "https://res.cloudinary.com/doqyrz0sg/image/upload/v1748471748/hotels/0001-catalina-hotel-beach-club/wpqohgtv15pgpcsbhtxe.jpg",
      alt: "Hotel Pool Area",
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [images.length])

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % images.length)
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + images.length) % images.length)

  const scrollToBooking = () => {
    const el = document.getElementById("partner-booking")
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Floating CTA — smaller */}
      <button
        onClick={scrollToBooking}
        className="fixed bottom-5 right-5 z-[1000] bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold px-4 py-2.5 rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95 text-sm"
        aria-label="Book Now"
      >
        Book Now
      </button>

      {/* Hero */}
      <section className="relative py-14 lg:py-18 bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="absolute top-16 right-20 w-24 h-24 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-12 left-16 w-20 h-20 bg-gray-300/20 rounded-full blur-2xl" />

        <div className="mx-auto max-w-6xl px-4 lg:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Info */}
            <div className="space-y-6 text-gray-900">
              <div className="inline-flex items-center bg-red-500 text-white px-4 py-2 rounded-full text-sm shadow-md">
                <Shield className="w-4 h-4 mr-2" />
                Professionally Managed
              </div>

              <div className="space-y-3">
                <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight text-gray-900">
                  Maxines Dorset
                  <span className="block text-red-500">Catalina Hotel</span>
                </h1>
                <p className="text-base lg:text-lg text-gray-600">
                  A boutique hotel managed by InsiderBookings in the heart of Miami Beach.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-5 h-5 text-red-500" />
                  <span className="font-medium text-gray-700">1720 Collins Ave, Miami Beach, FL</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-red-500 text-red-500" />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-gray-900">4.8</span>
                  <span className="text-gray-500 text-sm">• Premium Location</span>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 gap-4 pt-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-red-500 rounded-full grid place-items-center shadow-md">
                    <Waves className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Steps from Beach</p>
                    <p className="text-gray-600 text-sm">Prime oceanfront location</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-200 border border-gray-300 rounded-full grid place-items-center">
                    <Building2 className="w-5 h-5 text-gray-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">15 Boutique Rooms</p>
                    <p className="text-gray-600 text-sm">Intimate luxury experience</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Carousel */}
            <div className="relative">
              <div className="relative h-[360px] lg:h-[460px] rounded-xl overflow-hidden shadow-xl">
                {images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img.src || "/placeholder.svg"}
                    alt={img.alt}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                      idx === currentImage ? "opacity-100" : "opacity-0"
                    }`}
                  />
                ))}
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                <button
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-1.5 rounded-full"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-1.5 rounded-full"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImage(i)}
                      className={`w-2.5 h-2.5 rounded-full ${i === currentImage ? "bg-white" : "bg-white/50"}`}
                    />
                  ))}
                </div>
              </div>

              {/* Floating label */}
              <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-lg shadow-xl border-l-4 border-red-500">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-red-500 rounded-full grid place-items-center">
                    <Home className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Boutique Experience</p>
                    <p className="text-gray-600 text-xs">Premium Miami Beach</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About — smaller */}
      <section className="py-14 bg-gradient-to-br from-gray-800 via-gray-900 to-black">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3">Miami Beach's Hidden Gem</h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Experience the perfect blend of Art Deco charm and modern luxury
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <p className="text-gray-200 text-base leading-relaxed">
                  Maxines Dorset Catalina is a boutique hotel on Collins Avenue, steps from the beach. We manage 15
                  daily rooms at competitive rates, providing travelers with a stylish and central stay in Miami Beach.
                </p>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Our property offers the perfect blend of modern comfort and Miami Beach charm, ensuring exceptional
                  guest experiences in the heart of the Art Deco District.
                </p>
              </div>

              <div className="bg-red-500 p-6 rounded-lg text-white shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-6 h-6" />
                  <h3 className="font-bold text-lg">Professional Management</h3>
                </div>
                <p className="text-red-100 text-sm">
                  Managed by InsiderBookings LLC - ensuring quality service and guest satisfaction at every stay.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <h3 className="text-2xl font-bold text-white">Why Choose Maxines?</h3>
              <div className="space-y-4">
                {[
                  { icon: MapPin, title: "Prime Collins Avenue Location", desc: "Heart of Miami Beach's Art Deco District" },
                  { icon: Waves,  title: "Steps from the Beach",          desc: "Direct access to pristine Miami Beach" },
                  { icon: Heart,  title: "Boutique Experience",            desc: "Intimate 15-room luxury property" },
                  { icon: Home,   title: "Premium Service",                desc: "Recognized for excellence in hospitality" },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-all border-l-4 border-red-500"
                  >
                    <div className="w-9 h-9 bg-red-500 rounded-full grid place-items-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-sm">{item.title}</h4>
                      <p className="text-gray-300 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="text-center p-4 bg-white/10 rounded-lg text-white">
                  <Wifi className="w-6 h-6 mx-auto mb-2 text-red-500" />
                  <span className="font-medium text-sm">Free WiFi</span>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-lg text-white">
                  <Waves className="w-6 h-6 mx-auto mb-2 text-red-500" />
                  <span className="font-medium text-sm">Pool Access</span>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-lg text-white">
                  <Coffee className="w-6 h-6 mx-auto mb-2 text-red-500" />
                  <span className="font-medium text-sm">Beach Service</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location — smaller */}
      <section className="py-14 bg-white">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">Perfect Miami Beach Location</h2>
            <p className="text-lg text-gray-600">Where luxury meets convenience</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-xl overflow-hidden">
              <div className="bg-gray-900 text-white p-5">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-red-500 rounded-full grid place-items-center">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold">Hotel Address</h3>
                </div>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <p className="font-bold text-lg text-gray-900">Maxines Dorset Catalina Hotel</p>
                  <p className="text-gray-700">1720 Collins Ave</p>
                  <p className="text-gray-700">Miami Beach, FL 33139</p>
                </div>
                <div className="w-full h-px bg-gray-200" />
                <div>
                  <p className="font-bold text-gray-900 mb-2">Nearby Attractions</p>
                  <ul className="text-gray-600 space-y-1.5 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                      <span>Miami Beach - 2 minutes walk</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                      <span>Art Deco District - In the heart</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                      <span>Lincoln Road - 5 minutes walk</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-xl overflow-hidden">
              <div className="bg-gray-900 text-white p-5">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-red-500 rounded-full grid place-items-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold">Management Office</h3>
                </div>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <p className="font-bold text-lg text-gray-900">InsiderBookings LLC</p>
                  <p className="text-gray-700">1110 NW 1st Ave</p>
                  <p className="text-gray-700">Miami, FL 33128</p>
                </div>
                <div className="w-full h-px bg-gray-200" />
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-red-500 rounded-full grid place-items-center">
                      <Phone className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700 text-sm">+1 786-820-3697</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-red-500 rounded-full grid place-items-center">
                      <Mail className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700 text-sm">partners@insiderbookings.com</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking (moved down, compact) */}
      <section id="partner-booking" className="py-12 bg-white scroll-mt-24">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <PartnerBookingSection
            hotelId={1}
            source="PARTNER"
            paymentType="MERCHANT"
            defaultCurrency="USD"
            defaultAdults={2}
            defaultChildren={0}
          />
        </div>
      </section>

      {/* Policies — compact */}
      <section className="py-14 bg-white">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">Hotel Policies</h2>
            <p className="text-lg text-gray-600">Important information for your stay</p>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-6 h-6 text-red-500" />
                <h3 className="text-xl font-bold text-gray-900">Reservation & Cancellation Policy</h3>
              </div>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2" />
                  <span>All reservations are final and non-refundable</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2" />
                  <span>Cancellations must be made 72 hours prior to arrival (by 2 PM EST) to avoid penalties</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2" />
                  <span>A valid card is required at check-in for incidentals ($1 hold) and released after checkout</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <Home className="w-6 h-6 text-red-500" />
                <h3 className="text-xl font-bold text-gray-900">Fees & Additional Charges</h3>
              </div>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2" />
                  <span>$30 + tax daily resort fee (Wi-Fi, pool access, beach towels)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2" />
                  <span>Non-smoking hotel; violations incur a $250 fee</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2" />
                  <span>Pets allowed (dogs up to 40 lb) with a $250 refundable deposit</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mt-8">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Terms of Service</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                By booking through our site, you agree to penalty-free cancellation up to 72 hours before arrival.
                Cancellations within 72 hours, no-shows, and early departures are charged the full stay rate.
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Privacy Policy</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                InsiderBookings LLC collects guest data solely for reservation management. We don't share personal
                information except for payment processing and legal compliance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact — compact */}
      <section className="py-14 bg-gradient-to-br from-gray-800 to-gray-900">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-8">Get in Touch</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                <div className="p-8 text-center">
                  <div className="w-14 h-14 bg-red-500 rounded-full grid place-items-center mx-auto mb-4">
                    <Mail className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Email Us</h3>
                  <p className="text-gray-700">partners@insiderbookings.com</p>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                <div className="p-8 text-center">
                  <div className="w-14 h-14 bg-red-500 rounded-full grid place-items-center mx-auto mb-4">
                    <Phone className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Call Us</h3>
                  <p className="text-gray-700">+1 786-820-3697</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer — unchanged feel, slightly tighter */}
      <footer className="bg-black text-white py-12">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-red-500">insiderbookings</h3>
              <p className="text-gray-300">Reservations for Maxines Dorset Catalina Hotel</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-gray-300 text-sm">
              <span>© 2025 InsiderBookings LLC</span>
              <a href="#" className="hover:text-red-500 font-medium">Terms of Service</a>
              <a href="#" className="hover:text-red-500 font-medium">Privacy Policy</a>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-gray-300 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-red-500 rounded-full grid place-items-center">
                  <Mail className="w-4 h-4" />
                </div>
                <span>partners@insiderbookings.com</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-red-500 rounded-full grid place-items-center">
                  <Phone className="w-4 h-4" />
                </div>
                <span>+1 786-820-3697</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
