import { Request, Response } from 'express';
import { googleMapsService } from '../utils/google-maps-service';

// Geocode an address to get coordinates
export const geocodeAddress = async (req: Request, res: Response) => {
  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Address is required'
      });
    }

    const result = await googleMapsService.geocodeAddress(address);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Address geocoded successfully',
      data: result
    });
  } catch (error) {
    console.error('Geocode address error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to geocode address'
    });
  }
};

// Reverse geocode coordinates to get address
export const reverseGeocode = async (req: Request, res: Response) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const result = await googleMapsService.reverseGeocode(latitude, longitude);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Location reverse geocoded successfully',
      data: result
    });
  } catch (error) {
    console.error('Reverse geocode error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reverse geocode location'
    });
  }
};

// Calculate distance between two points
export const calculateDistance = async (req: Request, res: Response) => {
  try {
    const { origin, destination, mode = 'driving' } = req.body;

    if (!origin || !destination) {
      return res.status(400).json({
        success: false,
        message: 'Origin and destination are required'
      });
    }

    const result = await googleMapsService.calculateDistance(origin, destination, mode);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Could not calculate distance'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Distance calculated successfully',
      data: result
    });
  } catch (error) {
    console.error('Calculate distance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate distance'
    });
  }
};

// Get directions between two points
export const getDirections = async (req: Request, res: Response) => {
  try {
    const { origin, destination, mode = 'driving' } = req.body;

    if (!origin || !destination) {
      return res.status(400).json({
        success: false,
        message: 'Origin and destination are required'
      });
    }

    const result = await googleMapsService.getDirections(origin, destination, mode);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Could not get directions'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Directions retrieved successfully',
      data: result
    });
  } catch (error) {
    console.error('Get directions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get directions'
    });
  }
};

// Find nearby places
export const findNearbyPlaces = async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, radius = 1000, type = 'establishment' } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const result = await googleMapsService.findNearbyPlaces(
      { latitude, longitude },
      radius,
      type
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'No nearby places found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Nearby places found successfully',
      data: result
    });
  } catch (error) {
    console.error('Find nearby places error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to find nearby places'
    });
  }
};

// Calculate fare for a ride
export const calculateFare = async (req: Request, res: Response) => {
  try {
    const { 
      origin, 
      destination, 
      baseFare = 13.00, 
      perKmRate = 2.50, 
      perMinuteRate = 0.30 
    } = req.body;

    if (!origin || !destination) {
      return res.status(400).json({
        success: false,
        message: 'Origin and destination are required'
      });
    }

    // Get distance and duration
    const distanceData = await googleMapsService.calculateDistance(origin, destination);

    if (!distanceData) {
      return res.status(404).json({
        success: false,
        message: 'Could not calculate distance for fare'
      });
    }

    // Calculate fare
    const fareResult = googleMapsService.calculateFare(
      distanceData.distance,
      distanceData.duration,
      baseFare,
      perKmRate,
      perMinuteRate
    );

    res.status(200).json({
      success: true,
      message: 'Fare calculated successfully',
      data: {
        ...fareResult,
        distance_info: {
          distance: distanceData.distance,
          duration: distanceData.duration,
          distance_text: distanceData.distance_text,
          duration_text: distanceData.duration_text
        }
      }
    });
  } catch (error) {
    console.error('Calculate fare error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate fare'
    });
  }
};
