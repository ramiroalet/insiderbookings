import {
  MapPin,
  Star,
  Waves,
  Building2,
  Phone,
  Mail,
  ArrowRight,
  Heart,
  Shield,
  Coffee,
  Wifi,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function PartnersHotels() {
  const navigate = useNavigate()

  const partnerHotels = [
    {
      id: 1,
      name: "Maxines Dorset Catalina Hotel",
      location: "1720 Collins Ave, Miami Beach, FL",
      rating: 4.8,
      rooms: 15,
      image:
        "https://res.cloudinary.com/doqyrz0sg/image/upload/v1748471748/hotels/0001-catalina-hotel-beach-club/wpqohgtv15pgpcsbhtxe.jpg",
      description:
        "Boutique luxury in the heart of Miami Beach's Art Deco District. Experience premium comfort just steps from pristine beaches.",
      amenities: ["Complimentary WiFi", "Pool Access", "Beach Service", "Art Deco Design"],
      phone: "+1 786-820-3697",
      email: "partners@insiderbookings.com",
      badge: "Premium",
      route: "/partners-hotels/maxinesdorsetcatalina",
    },
    // añade más hoteles aquí
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* ───── Header (ligero, sin tocar CTA/Footer) ───── */}
      <section className="py-10 bg-gradient-to-br from-gray-50 via-white to-red-50/30">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center bg-red-500/10 text-red-600 px-5 py-2.5 rounded-full font-semibold">
              <Shield className="w-4 h-4 mr-2" />
              Exclusive Partner Network
            </div>
            <h2 className="mt-6 text-3xl lg:text-4xl font-extrabold text-gray-900">
              Premium Collection
            </h2>
            <p className="mt-2 text-gray-600">
              Each hotel in our network has been selected for its excellence, prime location, and
              exceptional service standards
            </p>
          </div>
        </div>
      </section>

      {/* ───── GRID COMPACTA (cards pequeñas) ───── */}
      <section className="pb-16">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
              {partnerHotels.map((hotel) => (
                <article
                  key={hotel.id}
                  className="relative rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition"
                >
                  {/* Imagen compacta */}
                  <div className="relative h-40 overflow-hidden rounded-t-lg">
                    <img
                      src={hotel.image || "/placeholder.svg"}
                      alt={hotel.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-white/95 px-2 py-0.5 rounded-full text-[10px] font-bold shadow">
                      {hotel.badge}
                    </div>
                    <button
                      type="button"
                      className="absolute top-2 left-2 w-6 h-6 bg-black/30 rounded-full grid place-items-center"
                      aria-label="favorite"
                    >
                      <Heart className="w-3 h-3 text-white" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-white/95 px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow">
                      <Star className="w-3 h-3 fill-red-500 text-red-500" />
                      <span className="font-semibold text-[10px]">{hotel.rating}</span>
                    </div>
                  </div>

                  {/* Contenido condensado */}
                  <div className="p-3 space-y-2 text-[12px]">
                    <h3 className="text-[13px] font-bold text-gray-900 leading-snug line-clamp-2">
                      {hotel.name}
                    </h3>

                    <div className="flex items-center gap-1.5 text-gray-600">
                      <MapPin className="w-3.5 h-3.5 text-red-500" />
                      <span className="truncate">{hotel.location}</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-700">
                      <div className="px-1.5 py-0.5 bg-gray-50 rounded text-[10px] border">
                        {hotel.rooms} rooms
                      </div>
                      <div className="px-1.5 py-0.5 bg-gray-50 rounded text-[10px] border">
                        Beach 2m
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-gray-700">
                      <div className="w-6 h-6 rounded bg-red-50 grid place-items-center">
                        <Wifi className="w-3.5 h-3.5 text-red-500" />
                      </div>
                      <div className="w-6 h-6 rounded bg-red-50 grid place-items-center">
                        <Waves className="w-3.5 h-3.5 text-red-500" />
                      </div>
                      <div className="w-6 h-6 rounded bg-red-50 grid place-items-center">
                        <Coffee className="w-3.5 h-3.5 text-red-500" />
                      </div>
                      <div className="w-6 h-6 rounded bg-red-50 grid place-items-center">
                        <Building2 className="w-3.5 h-3.5 text-red-500" />
                      </div>
                    </div>

                    <div className="flex gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => navigate(hotel.route)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] py-1.5 rounded-md grid place-items-center"
                      >
                        Details
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/contact${hotel.route}`)}
                        className="w-8 bg-gray-900 hover:bg-black text-white rounded-md grid place-items-center"
                        title="Email"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/contact${hotel.route}`)}
                        className="w-8 bg-gray-900 hover:bg-black text-white rounded-md grid place-items-center"
                        title="Call"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───── CTA GRANDE (restaurado, igual que antes) ───── */}
      <section className="py-10 bg-gradient-to-br from-gray-800 via-gray-900 to-black">
  <div className="container mx-auto px-4 lg:px-6">
    <div className="max-w-5xl mx-auto text-center">
      <div className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
            Own a Hotel?
          </h2>
          <p className="text-lg lg:text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
            Join our exclusive partner network and elevate your hospitality business to new heights
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-5 justify-center">
          <button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl text-base">
            <span>Become a Partner</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button className="bg-white hover:bg-gray-100 text-gray-900 font-bold py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl text-base">
            <span>Learn More</span>
            <Mail className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</section>

      {/* ───── FOOTER ORIGINAL (restaurado, sin cambios) ───── */}
      <footer className="bg-black text-white py-20">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="text-center space-y-10">
            <div className="space-y-6">
              <h3 className="text-4xl font-bold text-red-500">insiderbookings</h3>
              <p className="text-gray-300 text-xl">Exclusive Partner Hotel Network</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-12 text-gray-300 text-lg">
              <span>© 2025 InsiderBookings LLC</span>
              <a href="#" className="hover:text-red-500 transition-colors font-semibold">
                Terms of Service
              </a>
              <a href="#" className="hover:text-red-500 transition-colors font-semibold">
                Privacy Policy
              </a>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-gray-300 text-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <span>partners@insiderbookings.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5" />
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
