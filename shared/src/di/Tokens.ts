/**
 * Dependency injection tokens
 * Used to identify services in the DI container
 */
export const TYPES = {
  // Repositories
  UserRepository: Symbol.for('UserRepository'),
  DriverRepository: Symbol.for('DriverRepository'),
  RideRepository: Symbol.for('RideRepository'),
  PaymentRepository: Symbol.for('PaymentRepository'),
  NotificationRepository: Symbol.for('NotificationRepository'),

  // Services
  UserService: Symbol.for('UserService'),
  DriverService: Symbol.for('DriverService'),
  AuthService: Symbol.for('AuthService'),
  JwtService: Symbol.for('JwtService'),
  RideService: Symbol.for('RideService'),
  PaymentService: Symbol.for('PaymentService'),
  NotificationService: Symbol.for('NotificationService'),
  LocationService: Symbol.for('LocationService'),
  AnalyticsService: Symbol.for('AnalyticsService'),

  // Controllers
  UserController: Symbol.for('UserController'),
  DriverController: Symbol.for('DriverController'),
  AuthController: Symbol.for('AuthController'),
  RideController: Symbol.for('RideController'),
  PaymentController: Symbol.for('PaymentController'),

  // Infrastructure
  Logger: Symbol.for('Logger'),
  Firestore: Symbol.for('Firestore'),
  EventBus: Symbol.for('EventBus'),
  Cache: Symbol.for('Cache'),
  HttpClient: Symbol.for('HttpClient')
} as const;

