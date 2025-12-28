import express from 'express';
import {
  geocodeAddress,
  reverseGeocode,
  calculateDistance,
  getDirections,
  findNearbyPlaces,
  calculateFare
} from '../controllers/maps.controller';
import { asyncHandler } from '../middleware/errorHandler';

const mapsRouter = express.Router();

// ==================== GOOGLE MAPS APIs ====================

// Geocode an address to get coordinates
mapsRouter.post('/geocode', asyncHandler(geocodeAddress));

// Reverse geocode coordinates to get address
mapsRouter.post('/reverse-geocode', asyncHandler(reverseGeocode));

// Calculate distance between two points
mapsRouter.post('/distance', asyncHandler(calculateDistance));

// Get directions between two points
mapsRouter.post('/directions', asyncHandler(getDirections));

// Find nearby places
mapsRouter.post('/nearby-places', asyncHandler(findNearbyPlaces));

// Calculate fare for a ride
mapsRouter.post('/calculate-fare', asyncHandler(calculateFare));

export default mapsRouter;
