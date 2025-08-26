"use client"

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { Check, Download, Home } from "lucide-react"
import { resetBooking } from "../../features/booking/bookingSlice"
import { clearCode } from "../../features/discount/discountSlice"
import styles from "./Receipt.module.css"

const Receipt = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const {
    confirmation,
    selectedRoom,
    hotel,
    checkIn,
    checkOut,
    guestInfo,
    totalNights,
    totalPrice,
    discountedPrice,
    bookingId,
  } = useSelector((state) => state.booking)
  const { active: discountActive, percentage: discountPercentage } = useSelector((state) => state.discount)

  // Redirect if no confirmation
  useEffect(() => {
    if (!confirmation) {
      navigate("/hotels")
    }
  }, [confirmation, navigate])

  const handleBackToHome = () => {
    // Reset booking and discount state
    dispatch(resetBooking())
    dispatch(clearCode())

    // Navigate to home
    navigate("/")
  }

  if (!confirmation || !selectedRoom || !hotel) {
    return null
  }

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className={styles.receiptPage}>
      <div className={styles.receiptContainer}>
        <div className={styles.successHeader}>
          <div className={styles.checkmarkCircle}>
            <Check size={32} />
          </div>
          <h1 className={styles.successTitle}>Booking Confirmed!</h1>
          <p className={styles.successMessage}>Your reservation has been successfully processed.</p>
        </div>

        <div className={styles.receiptCard}>
          <div className={styles.receiptHeader}>
            <div className={styles.brandLogo}>
              <span className={styles.logoText}>Insider</span>
            </div>
            <h2 className={styles.receiptTitle}>BOOKING CONFIRMATION</h2>
          </div>

          <div className={styles.receiptDetails}>
            <div className={styles.detailRow}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Booking ID</span>
                <span className={styles.detailValue}>{bookingId}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Number of Rooms</span>
                <span className={styles.detailValue}>1</span>
              </div>
            </div>

            <div className={styles.detailRow}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Guest Name</span>
                <span className={styles.detailValue}>{guestInfo.fullName}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Number of Guests</span>
                <span className={styles.detailValue}>{selectedRoom.capacity}</span>
              </div>
            </div>

            <div className={styles.detailRow}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Member ID</span>
                <span className={styles.detailValue}>54213082</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Check-in Date</span>
                <span className={styles.detailValue}>{formatDate(checkIn)}</span>
              </div>
            </div>

            <div className={styles.detailRow}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Country of Residence</span>
                <span className={styles.detailValue}>United States</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Check-out Date</span>
                <span className={styles.detailValue}>{formatDate(checkOut)}</span>
              </div>
            </div>

            <div className={styles.detailRow}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Property</span>
                <span className={styles.detailValue}>{hotel.name}</span>
              </div>
            </div>

            <div className={styles.detailRow}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Address</span>
                <span className={styles.detailValue}>{hotel.address}</span>
              </div>
            </div>

            <div className={styles.detailRow}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Property Contact</span>
                <span className={styles.detailValue}>+1 305-674-3878</span>
              </div>
            </div>
          </div>

          <div className={styles.cancellationPolicy}>
            <p>
              <strong>Cancellation Policy:</strong> This booking is non-refundable and cannot be amended. If you fail to
              arrive or cancel no refund will be given.
            </p>
          </div>

          <div className={styles.paymentDetails}>
            <h3 className={styles.paymentTitle}>RATES AND PAYMENT</h3>

            <div className={styles.paymentRow}>
              <span>{totalNights} nights</span>
              <span>Insider Rate</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>

            {discountActive && (
              <div className={styles.paymentRow}>
                <span></span>
                <span>Discount ({discountPercentage}%)</span>
                <span>-${(totalPrice - discountedPrice).toFixed(2)}</span>
              </div>
            )}

            <div className={styles.paymentRow}>
              <span></span>
              <span>Taxes and Fees</span>
              <span>${(discountActive ? discountedPrice : totalPrice) * (0.12).toFixed(2)}</span>
            </div>

            <div className={styles.totalRow}>
              <span>Total Cost</span>
              <span>${((discountActive ? discountedPrice : totalPrice) * 1.12).toFixed(2)}</span>
            </div>

            <div className={styles.paymentMethod}>
              <span>Payment Method</span>
              <span>Credit Card</span>
            </div>
          </div>

          <div className={styles.signature}>
            <p>Please present this booking confirmation upon check-in.</p>
            <div className={styles.signatureImage}>
              <span>Authorized Signature</span>
            </div>
          </div>
        </div>

        <div className={styles.receiptActions}>
          <button className={styles.downloadButton}>
            <Download size={20} />
            <span>Download Receipt</span>
          </button>

          <button className={styles.homeButton} onClick={handleBackToHome}>
            <Home size={20} />
            <span>Back to Home</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Receipt
