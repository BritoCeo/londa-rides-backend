/**
 * Location Manager
 * Manages driver locations and location-based operations
 */

const geolib = require('geolib');
const Logger = require('./logger');
const config = require('./config');

class LocationManager {
  constructor() {
    this.logger = new Logger('LocationManager');
    this.driverLocations = new Map(); // driverId -> location data
    this.lastSyncTime = Date.now();
  }

  /**
   * Update driver location
   */
  updateDriverLocation(driverId, locationData) {
    try {
      const location = {
        driverId,
        latitude: parseFloat(locationData.latitude),
        longitude: parseFloat(locationData.longitude),
        status: locationData.status || 'online',
        accuracy: locationData.accuracy || null,
        heading: locationData.heading || null,
        speed: locationData.speed || null,
        timestamp: Date.now(),
        lastUpdated: Date.now()
      };

      // Validate coordinates
      if (!this.isValidCoordinates(location.latitude, location.longitude)) {
        this.logger.warn('Invalid coordinates provided', { driverId, location });
        return false;
      }

      this.driverLocations.set(driverId, location);
      this.logger.debug('Driver location updated', { driverId, location });
      return true;

    } catch (error) {
      this.logger.error(error, 'Failed to update driver location');
      return false;
    }
  }

  /**
   * Get driver location
   */
  getDriverLocation(driverId) {
    return this.driverLocations.get(driverId);
  }

  /**
   * Remove driver location
   */
  removeDriverLocation(driverId) {
    const removed = this.driverLocations.delete(driverId);
    if (removed) {
      this.logger.debug('Driver location removed', { driverId });
    }
    return removed;
  }

  /**
   * Find nearby drivers
   */
  findNearbyDrivers(userLat, userLon, radius = config.DEFAULT_SEARCH_RADIUS, status = 'online') {
    try {
      const userLocation = { latitude: userLat, longitude: userLon };
      const nearbyDrivers = [];

      // Limit search radius
      const searchRadius = Math.min(radius, config.MAX_SEARCH_RADIUS);

      for (const [driverId, location] of this.driverLocations) {
        // Filter by status
        if (status && location.status !== status) continue;

        // Calculate distance
        const distance = geolib.getDistance(userLocation, {
          latitude: location.latitude,
          longitude: location.longitude
        });

        // Convert meters to kilometers
        const distanceKm = distance / 1000;

        if (distanceKm <= searchRadius) {
          nearbyDrivers.push({
            driverId: location.driverId,
            latitude: location.latitude,
            longitude: location.longitude,
            distance: distanceKm,
            status: location.status,
            accuracy: location.accuracy,
            heading: location.heading,
            speed: location.speed,
            lastUpdated: location.lastUpdated
          });
        }
      }

      // Sort by distance
      nearbyDrivers.sort((a, b) => a.distance - b.distance);

      this.logger.debug('Nearby drivers found', { 
        userLocation: { lat: userLat, lon: userLon }, 
        radius: searchRadius,
        count: nearbyDrivers.length 
      });

      return nearbyDrivers;

    } catch (error) {
      this.logger.error(error, 'Failed to find nearby drivers');
      return [];
    }
  }

  /**
   * Get all driver locations
   */
  getAllDriverLocations() {
    return Array.from(this.driverLocations.values());
  }

  /**
   * Get drivers by status
   */
  getDriversByStatus(status) {
    const drivers = [];
    for (const [driverId, location] of this.driverLocations) {
      if (location.status === status) {
        drivers.push(location);
      }
    }
    return drivers;
  }

  /**
   * Validate coordinates
   */
  isValidCoordinates(lat, lon) {
    return (
      typeof lat === 'number' && 
      typeof lon === 'number' &&
      lat >= -90 && lat <= 90 &&
      lon >= -180 && lon <= 180 &&
      !isNaN(lat) && !isNaN(lon)
    );
  }

  /**
   * Clean up stale locations
   */
  cleanupStaleLocations(timeout = config.LOCATION_TIMEOUT) {
    const now = Date.now();
    const staleDrivers = [];

    for (const [driverId, location] of this.driverLocations) {
      if (now - location.lastUpdated > timeout) {
        staleDrivers.push(driverId);
      }
    }

    staleDrivers.forEach(driverId => {
      this.logger.warn('Cleaning up stale driver location', { driverId });
      this.removeDriverLocation(driverId);
    });

    return staleDrivers.length;
  }

  /**
   * Get location statistics
   */
  getStats() {
    const locations = Array.from(this.driverLocations.values());
    const statusCounts = locations.reduce((acc, location) => {
      acc[location.status] = (acc[location.status] || 0) + 1;
      return acc;
    }, {});

    return {
      totalDrivers: this.driverLocations.size,
      statusCounts,
      lastSyncTime: this.lastSyncTime,
      oldestLocation: locations.length > 0 ? Math.min(...locations.map(l => l.lastUpdated)) : null,
      newestLocation: locations.length > 0 ? Math.max(...locations.map(l => l.lastUpdated)) : null
    };
  }

  /**
   * Calculate distance between two points
   */
  calculateDistance(point1, point2) {
    try {
      return geolib.getDistance(point1, point2) / 1000; // Return in kilometers
    } catch (error) {
      this.logger.error(error, 'Failed to calculate distance');
      return null;
    }
  }

  /**
   * Check if location is within bounds
   */
  isWithinBounds(lat, lon, bounds) {
    try {
      return geolib.isPointInPolygon(
        { latitude: lat, longitude: lon },
        bounds.map(point => ({ latitude: point.lat, longitude: point.lon }))
      );
    } catch (error) {
      this.logger.error(error, 'Failed to check bounds');
      return false;
    }
  }
}

module.exports = LocationManager;
