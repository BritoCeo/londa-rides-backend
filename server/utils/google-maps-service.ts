import { Client } from '@googlemaps/google-maps-services-js';

export class GoogleMapsService {
  private client: Client;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || '';
    this.client = new Client({});
  }

  /**
   * Geocode an address to get coordinates
   */
  async geocodeAddress(address: string): Promise<{
    latitude: number;
    longitude: number;
    formatted_address: string;
  } | null> {
    try {
      const response = await this.client.geocode({
        params: {
          address: address,
          key: this.apiKey,
        },
      });

      if (response.data.results && response.data.results.length > 0) {
        const result = response.data.results[0];
        const location = result.geometry.location;
        
        return {
          latitude: location.lat,
          longitude: location.lng,
          formatted_address: result.formatted_address,
        };
      }

      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  /**
   * Reverse geocode coordinates to get address
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<{
    address: string;
    formatted_address: string;
  } | null> {
    try {
      const response = await this.client.reverseGeocode({
        params: {
          latlng: { lat: latitude, lng: longitude },
          key: this.apiKey,
        },
      });

      if (response.data.results && response.data.results.length > 0) {
        const result = response.data.results[0];
        
        return {
          address: result.formatted_address,
          formatted_address: result.formatted_address,
        };
      }

      return null;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }

  /**
   * Calculate distance and duration between two points
   */
  async calculateDistance(
    origin: { latitude: number; longitude: number },
    destination: { latitude: number; longitude: number },
    mode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving'
  ): Promise<{
    distance: number; // in meters
    duration: number; // in seconds
    distance_text: string;
    duration_text: string;
  } | null> {
    try {
      // If no API key, use fallback calculation
      if (!this.apiKey) {
        console.warn('Google Maps API key not configured, using fallback calculation');
        return this.calculateFallbackDistance(origin, destination);
      }

      const response = await this.client.distancematrix({
        params: {
          origins: [{ lat: origin.latitude, lng: origin.longitude }],
          destinations: [{ lat: destination.latitude, lng: destination.longitude }],
          mode: mode,
          key: this.apiKey,
        },
      });

      if (response.data.rows && response.data.rows[0].elements[0].status === 'OK') {
        const element = response.data.rows[0].elements[0];
        
        return {
          distance: element.distance.value,
          duration: element.duration.value,
          distance_text: element.distance.text,
          duration_text: element.duration.text,
        };
      }

      return null;
    } catch (error) {
      console.error('Distance calculation error:', error);
      // Fallback to calculation without API
      return this.calculateFallbackDistance(origin, destination);
    }
  }

  /**
   * Fallback distance calculation using Haversine formula
   */
  private calculateFallbackDistance(
    origin: { latitude: number; longitude: number },
    destination: { latitude: number; longitude: number }
  ): {
    distance: number;
    duration: number;
    distance_text: string;
    duration_text: string;
  } {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRadians(destination.latitude - origin.latitude);
    const dLon = this.toRadians(destination.longitude - origin.longitude);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(origin.latitude)) * Math.cos(this.toRadians(destination.latitude)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in meters
    
    // Estimate duration (assuming 30 km/h average speed)
    const duration = (distance / 1000) * 2; // 2 minutes per km
    
    return {
      distance: distance,
      duration: duration * 60, // Convert to seconds
      distance_text: `${(distance / 1000).toFixed(2)} km`,
      duration_text: `${Math.round(duration)} mins`,
    };
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Get directions between two points
   */
  async getDirections(
    origin: { latitude: number; longitude: number },
    destination: { latitude: number; longitude: number },
    mode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving'
  ): Promise<{
    distance: number;
    duration: number;
    distance_text: string;
    duration_text: string;
    steps: Array<{
      instruction: string;
      distance: number;
      duration: number;
    }>;
    polyline: string;
  } | null> {
    try {
      const response = await this.client.directions({
        params: {
          origin: { lat: origin.latitude, lng: origin.longitude },
          destination: { lat: destination.latitude, lng: destination.longitude },
          mode: mode,
          key: this.apiKey,
        },
      });

      if (response.data.routes && response.data.routes.length > 0) {
        const route = response.data.routes[0];
        const leg = route.legs[0];
        
        const steps = route.legs[0].steps.map(step => ({
          instruction: step.html_instructions.replace(/<[^>]*>/g, ''), // Remove HTML tags
          distance: step.distance.value,
          duration: step.duration.value,
        }));

        return {
          distance: leg.distance.value,
          duration: leg.duration.value,
          distance_text: leg.distance.text,
          duration_text: leg.duration.text,
          steps: steps,
          polyline: route.overview_polyline.points,
        };
      }

      return null;
    } catch (error) {
      console.error('Directions error:', error);
      return null;
    }
  }

  /**
   * Find nearby places
   */
  async findNearbyPlaces(
    location: { latitude: number; longitude: number },
    radius: number = 1000, // in meters
    type: string = 'establishment'
  ): Promise<Array<{
    name: string;
    place_id: string;
    latitude: number;
    longitude: number;
    rating: number;
    vicinity: string;
  }> | null> {
    try {
      const response = await this.client.placesNearby({
        params: {
          location: { lat: location.latitude, lng: location.longitude },
          radius: radius,
          type: type,
          key: this.apiKey,
        },
      });

      if (response.data.results) {
        return response.data.results.map(place => ({
          name: place.name,
          place_id: place.place_id,
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
          rating: place.rating || 0,
          vicinity: place.vicinity,
        }));
      }

      return null;
    } catch (error) {
      console.error('Nearby places error:', error);
      return null;
    }
  }

  /**
   * Calculate fare based on distance and duration
   */
  calculateFare(
    distance: number, // in meters
    duration: number, // in seconds
    baseFare: number = 13.00,
    perKmRate: number = 2.50,
    perMinuteRate: number = 0.30
  ): {
    base_fare: number;
    distance_fare: number;
    time_fare: number;
    total_fare: number;
    breakdown: {
      distance_km: number;
      duration_minutes: number;
      base_fare: number;
      distance_fare: number;
      time_fare: number;
      total_fare: number;
    };
  } {
    const distanceKm = distance / 1000;
    const durationMinutes = duration / 60;
    
    const distanceFare = distanceKm * perKmRate;
    const timeFare = durationMinutes * perMinuteRate;
    const totalFare = baseFare + distanceFare + timeFare;

    return {
      base_fare: baseFare,
      distance_fare: distanceFare,
      time_fare: timeFare,
      total_fare: Math.round(totalFare * 100) / 100, // Round to 2 decimal places
      breakdown: {
        distance_km: Math.round(distanceKm * 100) / 100,
        duration_minutes: Math.round(durationMinutes * 100) / 100,
        base_fare: baseFare,
        distance_fare: distanceFare,
        time_fare: timeFare,
        total_fare: Math.round(totalFare * 100) / 100,
      },
    };
  }
}

export const googleMapsService = new GoogleMapsService();
