"use client"
import { useEffect, useState } from "react"
import { Filter, ChevronDown, ChevronUp, Star, MapPin, Building } from "lucide-react"
import { useCategories } from "../hooks/use-categories"
import { useDestinations } from "../hooks/use-destinations"

const SearchFiltersAdvanced = ({ onFiltersChange, isVisible = true }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState({
    categories: [],
    destinations: [],
    destinationType: "all",
  })

  // Hooks para obtener datos
/*   const { starCategories, loading: categoriesLoading, getCategoryDisplayName } = useCategories() */
  const { cities, zones, loading: destinationsLoading, getDestinationText } = useDestinations()

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleCategoryToggle = (categoryCode) => {
    const newCategories = filters.categories.includes(categoryCode)
      ? filters.categories.filter((code) => code !== categoryCode)
      : [...filters.categories, categoryCode]
    handleFilterChange("categories", newCategories)
  }

  const handleDestinationToggle = (destinationCode) => {
    const newDestinations = filters.destinations.includes(destinationCode)
      ? filters.destinations.filter((code) => code !== destinationCode)
      : [...filters.destinations, destinationCode]
    handleFilterChange("destinations", newDestinations)
  }

  const clearFilters = () => {
    const defaultFilters = {
      categories: [],
      destinations: [],
      destinationType: "all",
    }
    setFilters(defaultFilters)
    onFiltersChange(defaultFilters)
  }

  const getActiveFiltersCount = () => {
    return filters.categories.length + filters.destinations.length
  }

  /* useEffect(() => {
    console.log("🔵 SearchFiltersAdvanced mounted")
    console.log("Categories loading:", categoriesLoading)
    console.log("Star categories:", starCategories)
    return () => console.log("🔴 SearchFiltersAdvanced unmounted")
  }, [categoriesLoading, starCategories])
 */
  if (!isVisible) return null

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between w-full text-left">
        <div className="flex items-center">
          <Filter className="h-5 w-5 mr-2 text-gray-600" />
          <span className="font-semibold text-gray-900">Advanced Filters</span>
          {getActiveFiltersCount() > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">{getActiveFiltersCount()}</span>
          )}
        </div>
        {isOpen ? <ChevronUp className="h-5 w-5 text-gray-600" /> : <ChevronDown className="h-5 w-5 text-gray-600" />}
      </button>

      {isOpen && (
        <div className="mt-4 space-y-6">
          {/* Hotel Categories */}
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Star className="inline h-4 w-4 mr-1 text-yellow-500" />
              Hotel Categories
            </label>
            {categoriesLoading ? (
              <div className="text-sm text-gray-500">Loading categories...</div>
            ) : starCategories && starCategories.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {starCategories.map((category) => (
                  <label key={category.categoryCode} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.categories.includes(category.categoryCode)}
                      onChange={() => handleCategoryToggle(category.categoryCode)}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm flex items-center">
                      {Array.from({ length: Number(category.categoryCode) }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                      ))}
                      <span className="ml-1">{getCategoryDisplayName(category.categoryCode)}</span>
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">No categories available</div>
            )}
          </div>
 */}
          {/* Destination Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building className="inline h-4 w-4 mr-1 text-blue-500" />
              Destination Type
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="destinationType"
                  value="all"
                  checked={filters.destinationType === "all"}
                  onChange={(e) => handleFilterChange("destinationType", e.target.value)}
                  className="text-red-600 focus:ring-red-500"
                />
                <span className="text-sm">All Destinations</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="destinationType"
                  value="CITY"
                  checked={filters.destinationType === "CITY"}
                  onChange={(e) => handleFilterChange("destinationType", e.target.value)}
                  className="text-red-600 focus:ring-red-500"
                />
                <span className="text-sm">Cities Only</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="destinationType"
                  value="ZONE"
                  checked={filters.destinationType === "ZONE"}
                  onChange={(e) => handleFilterChange("destinationType", e.target.value)}
                  className="text-red-600 focus:ring-red-500"
                />
                <span className="text-sm">Zones Only</span>
              </label>
            </div>
          </div>

          {/* Destinations */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <MapPin className="inline h-4 w-4 mr-1 text-green-500" />
              Destinations
            </label>
            {destinationsLoading ? (
              <div className="text-sm text-gray-500">Loading destinations...</div>
            ) : (
              <div className="max-h-40 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {(filters.destinationType === "all" || filters.destinationType === "CITY") &&
                    cities.slice(0, 10).map((destination) => (
                      <label key={destination.code} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.destinations.includes(destination.code)}
                          onChange={() => handleDestinationToggle(destination.code)}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-sm flex items-center">
                          <MapPin className="h-3 w-3 text-green-500 mr-1" />
                          {getDestinationText(destination)} ({destination.code})
                        </span>
                      </label>
                    ))}
                  {(filters.destinationType === "all" || filters.destinationType === "ZONE") &&
                    zones.slice(0, 10).map((destination) => (
                      <label key={destination.code} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.destinations.includes(destination.code)}
                          onChange={() => handleDestinationToggle(destination.code)}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-sm flex items-center">
                          <Building className="h-3 w-3 text-blue-500 mr-1" />
                          {getDestinationText(destination)} ({destination.code})
                        </span>
                      </label>
                    ))}
                </div>
                {((filters.destinationType === "all" || filters.destinationType === "CITY") && cities.length > 10) ||
                  ((filters.destinationType === "all" || filters.destinationType === "ZONE") && zones.length > 10 && (
                    <div className="text-xs text-gray-500 mt-2">
                      Showing first 10 destinations. Use search to find specific locations.
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Clear Filters Button */}
          <div className="flex justify-end">
            <button
              onClick={clearFilters}
              disabled={getActiveFiltersCount() === 0}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear All Filters ({getActiveFiltersCount()})
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchFiltersAdvanced
