/*********************************************************************************************
 * src/services/tgx.bookingRead.service.js
 * TravelgateX — Booking read service
 * Reuses client and retry/capture logic from tgx.booking.service.js
 *********************************************************************************************/

import { gql } from "graphql-request"
import { requestWithCapture } from "./tgx.capture.js"
import { requestWithRetry } from "./tgx.booking.service.js"

const BOOKING_READ_Q = gql`
  query ($criteria: HotelBookingCriteriaInput!, $settings: HotelSettingsInput!) {
    hotelX {
      booking(criteria: $criteria, settings: $settings) {
        bookings {
          status
          reference { bookingID client supplier hotel }
          price { currency net gross binding }
          holder { name surname }
          hotel {
            hotelCode
            hotelName
            bookingDate
            start
            end
            boardCode
            rooms {
              code
              description
              occupancyRefId
            }
          }
          remarks
        }
        errors   { code type description }
        warnings { code type description }
      }
    }
  }
`

export async function readBookingTGX(criteria, settings) {
  const parsedCriteria =
    typeof criteria === "string" ? { bookingID: criteria.trim() } : criteria

  const vars = { criteria: parsedCriteria, settings }
  const exec = () => requestWithRetry(BOOKING_READ_Q, vars, { attempts: 2 })
  const data = await requestWithCapture("bookingRead", vars, exec, { doc: BOOKING_READ_Q })
  const payload = data?.hotelX?.booking || {}
  return {
    errors: payload.errors || [],
    warnings: payload.warnings || [],
    bookings: payload.bookings || [],
  }
}

