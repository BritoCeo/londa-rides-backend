import { ILocation } from '../entities/IRide';

/**
 * Data Transfer Object for creating a ride
 */
export interface CreateRideDTO {
  userId: string;
  childId?: string;
  pickupLocation: ILocation;
  dropoffLocation: ILocation;
  pickupCoordinates?: ILocation;
  dropoffCoordinates?: ILocation;
  rideType?: string;
  estimatedFare?: number;
  scheduledTime?: Date;
  passengerCount?: number;
  vehicleType?: string;
}

/**
 * Factory method to create DTO from request body
 */
export class CreateRideDTOFactory {
  public static fromRequest(body: any): CreateRideDTO {
    return {
      userId: body.user_id || body.userId,
      childId: body.child_id || body.childId,
      pickupLocation: body.pickup_location || body.pickupLocation,
      dropoffLocation: body.dropoff_location || body.dropoffLocation,
      pickupCoordinates: body.pickup_coordinates || body.pickupCoordinates,
      dropoffCoordinates: body.dropoff_coordinates || body.dropoffCoordinates,
      rideType: body.ride_type || body.rideType || 'standard',
      estimatedFare: body.estimated_fare || body.estimatedFare || 13.00,
      scheduledTime: body.scheduled_time ? new Date(body.scheduled_time) : undefined,
      passengerCount: body.passenger_count || body.passengerCount || 1,
      vehicleType: body.vehicle_type || body.vehicleType || 'Car'
    };
  }
}

