import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Londa Rides API',
      version: '1.0.0',
      description: 'A comprehensive ride-sharing API built with Node.js, Express, and Firebase Firestore',
      contact: {
        name: 'Londa Rides Support',
        email: 'support@londa-rides.com',
        url: 'https://londa-rides.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:8000',
        description: 'Development server'
      },
      {
        url: 'https://api.londa-rides.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            phone_number: { type: 'string' },
            email: { type: 'string' },
            userType: { type: 'string', enum: ['STUDENT', 'PROFESSIONAL', 'PARENT', 'ADMIN'] },
            isActive: { type: 'boolean' },
            isVerified: { type: 'boolean' },
            ratings: { type: 'number' },
            totalRides: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Driver: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            phone_number: { type: 'string' },
            email: { type: 'string' },
            country: { type: 'string' },
            vehicle_type: { type: 'string', enum: ['Car', 'Motorcycle', 'CNG'] },
            registration_number: { type: 'string' },
            driving_license: { type: 'string' },
            rate: { type: 'string' },
            status: { type: 'string', enum: ['inactive', 'online', 'offline', 'busy'] },
            isActive: { type: 'boolean' },
            ratings: { type: 'number' },
            totalEarning: { type: 'number' },
            totalRides: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Ride: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            user_id: { type: 'string' },
            driver_id: { type: 'string' },
            pickup_location: { type: 'object' },
            dropoff_location: { type: 'object' },
            fare: { type: 'number' },
            status: { type: 'string', enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'declined'] },
            ride_type: { type: 'string', enum: ['standard', 'premium', 'xl', 'pool'] },
            rating: { type: 'number' },
            review: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Payment: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            user_id: { type: 'string' },
            ride_id: { type: 'string' },
            amount: { type: 'number' },
            currency: { type: 'string' },
            payment_method: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'completed', 'failed'] },
            transaction_id: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Notification: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            recipient_id: { type: 'string' },
            title: { type: 'string' },
            message: { type: 'string' },
            type: { type: 'string', enum: ['general', 'ride', 'payment', 'system'] },
            isRead: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            error: { type: 'object' }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './routes/*.ts',
    './controllers/*.ts',
    './server.ts'
  ]
};

// Generate Swagger documentation
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Swagger UI options
const swaggerUiOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Londa Rides API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true
  }
};

// Setup Swagger middleware
export const setupSwagger = (app: Application) => {
  // Swagger JSON endpoint
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // Swagger UI endpoint
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));
};

// Swagger JSDoc comments for routes
export const swaggerComments = {
  // User endpoints
  userRegistration: `
    /**
     * @swagger
     * /api/v1/registration:
     *   post:
     *     summary: Register a new user
     *     tags: [Users]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - phone_number
     *             properties:
     *               phone_number:
     *                 type: string
     *                 example: "+1234567890"
     *               name:
     *                 type: string
     *                 example: "John Doe"
     *               email:
     *                 type: string
     *                 example: "john@example.com"
     *     responses:
     *       201:
     *         description: User registered successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Success'
     *       400:
     *         description: Validation error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
  `,

  // Ride endpoints
  requestRide: `
    /**
     * @swagger
     * /api/v1/request-ride:
     *   post:
     *     summary: Request a new ride
     *     tags: [Rides]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - user_id
     *               - pickup_location
     *               - dropoff_location
     *             properties:
     *               user_id:
     *                 type: string
     *                 example: "user123"
     *               pickup_location:
     *                 type: object
     *                 properties:
     *                   latitude:
     *                     type: number
     *                     example: -22.9576
     *                   longitude:
     *                     type: number
     *                     example: 18.4904
     *                   address:
     *                     type: string
     *                     example: "Windhoek, Namibia"
     *               dropoff_location:
     *                 type: object
     *                 properties:
     *                   latitude:
     *                     type: number
     *                     example: -22.9676
     *                   longitude:
     *                     type: number
     *                     example: 18.5004
     *                   address:
     *                     type: string
     *                     example: "Windhoek CBD, Namibia"
     *               ride_type:
     *                 type: string
     *                 enum: [standard, premium, xl, pool]
     *                 example: "standard"
     *               estimated_fare:
     *                 type: number
     *                 example: 15.50
     *     responses:
     *       201:
     *         description: Ride requested successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Success'
     *       400:
     *         description: Validation error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       401:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
  `,

  // Payment endpoints
  calculateFare: `
    /**
     * @swagger
     * /api/v1/payment/calculate-fare:
     *   post:
     *     summary: Calculate ride fare
     *     tags: [Payments]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - pickup_location
     *               - dropoff_location
     *             properties:
     *               pickup_location:
     *                 type: object
     *                 properties:
     *                   latitude:
     *                     type: number
     *                     example: -22.9576
     *                   longitude:
     *                     type: number
     *                     example: 18.4904
     *               dropoff_location:
     *                 type: object
     *                 properties:
     *                   latitude:
     *                     type: number
     *                     example: -22.9676
     *                   longitude:
     *                     type: number
     *                     example: 18.5004
     *               ride_type:
     *                 type: string
     *                 enum: [standard, premium, xl, pool]
     *                 example: "standard"
     *               distance_km:
     *                 type: number
     *                 example: 5.2
     *     responses:
     *       200:
     *         description: Fare calculated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: "Fare calculated successfully"
     *                 data:
     *                   type: object
     *                   properties:
     *                     base_fare:
     *                       type: number
     *                       example: 2.50
     *                     distance_km:
     *                       type: number
     *                       example: 5.2
     *                     per_km_rate:
     *                       type: number
     *                       example: 1.20
     *                     surge_multiplier:
     *                       type: number
     *                       example: 1.0
     *                     total_fare:
     *                       type: number
     *                       example: 8.74
     *                     currency:
     *                       type: string
     *                       example: "USD"
     *       400:
     *         description: Validation error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
  `,

  // Driver Subscription endpoints
  createDriverSubscription: `
    /**
     * @swagger
     * /api/v1/driver/subscription:
     *   post:
     *     summary: Create driver subscription
     *     tags: [Driver Subscription]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - driver_id
     *               - payment_method
     *             properties:
     *               driver_id:
     *                 type: string
     *                 example: "driver123"
     *               payment_method:
     *                 type: string
     *                 enum: [card, bank_transfer, mobile_money]
     *                 example: "card"
     *               payment_token:
     *                 type: string
     *                 example: "tok_test_123456789"
     *     responses:
     *       201:
     *         description: Driver subscription created successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Success'
     *       400:
     *         description: Validation error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
  `,

  getDriverSubscription: `
    /**
     * @swagger
     * /api/v1/driver/subscription/{driver_id}:
     *   get:
     *     summary: Get driver subscription status
     *     tags: [Driver Subscription]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: driver_id
     *         required: true
     *         schema:
     *           type: string
     *         example: "driver123"
     *     responses:
     *       200:
     *         description: Driver subscription retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Success'
     *       404:
     *         description: Subscription not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
  `,

  updateDriverSubscription: `
    /**
     * @swagger
     * /api/v1/driver/subscription/{driver_id}:
     *   put:
     *     summary: Update driver subscription
     *     tags: [Driver Subscription]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: driver_id
     *         required: true
     *         schema:
     *           type: string
     *         example: "driver123"
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               auto_renew:
     *                 type: boolean
     *                 example: true
     *               payment_method:
     *                 type: string
     *                 enum: [card, bank_transfer, mobile_money]
     *                 example: "bank_transfer"
     *               notification_preferences:
     *                 type: object
     *                 example: {"email": true, "sms": true, "push": true}
     *     responses:
     *       200:
     *         description: Driver subscription updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Success'
     */
  `,

  processSubscriptionPayment: `
    /**
     * @swagger
     * /api/v1/driver/subscription/payment:
     *   post:
     *     summary: Process subscription payment
     *     tags: [Driver Subscription]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - driver_id
     *               - payment_method
     *               - amount
     *             properties:
     *               driver_id:
     *                 type: string
     *                 example: "driver123"
     *               payment_method:
     *                 type: string
     *                 enum: [card, bank_transfer, mobile_money]
     *                 example: "card"
     *               payment_token:
     *                 type: string
     *                 example: "tok_test_payment_123"
     *               amount:
     *                 type: number
     *                 example: 150.00
     *     responses:
     *       200:
     *         description: Subscription payment processed successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Success'
     *       400:
     *         description: Invalid amount or payment failed
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
  `,

  getDriverSubscriptionHistory: `
    /**
     * @swagger
     * /api/v1/driver/subscription/history/{driver_id}:
     *   get:
     *     summary: Get driver subscription history
     *     tags: [Driver Subscription]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: driver_id
     *         required: true
     *         schema:
     *           type: string
     *         example: "driver123"
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *           minimum: 1
     *         example: 1
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           minimum: 1
     *           maximum: 100
     *         example: 10
     *       - in: query
     *         name: start_date
     *         schema:
     *           type: string
     *           format: date
     *         example: "2024-01-01"
     *       - in: query
     *         name: end_date
     *         schema:
     *           type: string
     *           format: date
     *         example: "2024-12-31"
     *     responses:
     *       200:
     *         description: Driver subscription history retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Success'
     */
  `
};

export default swaggerSpec;
