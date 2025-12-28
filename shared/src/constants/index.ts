/**
 * Application constants
 */

export const CURRENCY = {
  DEFAULT: 'NAD',
  SYMBOL: 'N$'
} as const;

export const RIDE = {
  DEFAULT_FARE: 13.00,
  DEFAULT_PASSENGER_COUNT: 1,
  DEFAULT_VEHICLE_TYPE: 'Car',
  MAX_PASSENGERS: 8
} as const;

export const SUBSCRIPTION = {
  PARENT_MONTHLY: 1000.00,
  PARENT_PER_RIDE: 13.00,
  DRIVER_MONTHLY: 150.00
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
} as const;

export const JWT = {
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d'
} as const;

export const LOCATION = {
  DEFAULT_SEARCH_RADIUS: 5.0, // km
  MAX_SEARCH_RADIUS: 50.0, // km
  LOCATION_TIMEOUT: 300000 // 5 minutes in milliseconds
} as const;

export const RATE_LIMIT = {
  GENERAL: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // requests per window
  },
  AUTH: {
    windowMs: 15 * 60 * 1000,
    max: 5 // login attempts
  }
} as const;

