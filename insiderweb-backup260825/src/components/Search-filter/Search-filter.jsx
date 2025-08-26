"use client"

import { useState } from "react"
import { Filter, ChevronDown, ChevronUp } from "lucide-react"

const SearchFilters = ({ onFiltersChange, results = [] }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState({
    priceRange: { min: 0, max: 1000 },
    paymentType: "",
    refundable: "",
    boardType: "",
    sortBy: "price",
  })

  // Obtener valores únicos para los filtros
  const getUniqueValues = (key) => {
    const values = results.map((result) => result[key]).filter(Boolean)
    return [...new Set(values)]
  }

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handlePriceRangeChange = (type, value) => {
    const newPriceRange = { ...filters.priceRange, [type]: Number(value) }
    const newFilters = { ...filters, priceRange: newPriceRange }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    const defaultFilters = {
      priceRange: { min: 0, max: 1000 },
      paymentType: "",
      refundable: "",
      boardType: "",
      sortBy: "price",
    }
    setFilters(defaultFilters)
    onFiltersChange(defaultFilters)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between w-full text-left">
        <div className="flex items-center">
          <Filter className="h-5 w-5 mr-2 text-gray-600" />
          <span className="font-semibold text-gray-900">Filters & Sort</span>
        </div>
        {isOpen ? <ChevronUp className="h-5 w-5 text-gray-600" /> : <ChevronDown className="h-5 w-5 text-gray-600" />}
      </button>

      {isOpen && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.priceRange.min}
                onChange={(e) => handlePriceRangeChange("min", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.priceRange.max}
                onChange={(e) => handlePriceRangeChange("max", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>

          {/* Payment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
            <select
              value={filters.paymentType}
              onChange={(e) => handleFilterChange("paymentType", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Payment Types</option>
              {getUniqueValues("paymentType").map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Refundable */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cancellation</label>
            <select
              value={filters.refundable}
              onChange={(e) => handleFilterChange("refundable", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Options</option>
              <option value="true">Refundable</option>
              <option value="false">Non-refundable</option>
            </select>
          </div>

          {/* Board Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Board Type</label>
            <select
              value={filters.boardType}
              onChange={(e) => handleFilterChange("boardType", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Board Types</option>
              {getUniqueValues("board").map((board) => (
                <option key={board} value={board}>
                  {board === "1"
                    ? "Room Only"
                    : board === "14"
                      ? "Breakfast"
                      : board === "19"
                        ? "Half Board"
                        : board === "20"
                          ? "Full Board"
                          : board === "21"
                            ? "All Inclusive"
                            : `Board ${board}`}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="price">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
              <option value="name">Hotel Name</option>
              <option value="refundable">Refundable First</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchFilters
