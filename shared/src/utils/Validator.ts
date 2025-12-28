import { ValidationException } from '../exceptions/ValidationException';

/**
 * Validation utilities
 */
export class Validator {
  /**
   * Validate phone number format
   */
  public static isValidPhoneNumber(phoneNumber: string): boolean {
    // Basic phone number validation (can be enhanced)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
  }

  /**
   * Validate email format
   */
  public static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate required fields
   */
  public static validateRequired(data: any, fields: string[]): void {
    const missing = fields.filter(field => !data[field]);
    if (missing.length > 0) {
      throw new ValidationException(`Missing required fields: ${missing.join(', ')}`, { missing });
    }
  }

  /**
   * Validate string length
   */
  public static validateLength(value: string, min: number, max: number, fieldName: string): void {
    if (value.length < min || value.length > max) {
      throw new ValidationException(`${fieldName} must be between ${min} and ${max} characters`, {
        field: fieldName,
        value: value.length,
        min,
        max
      });
    }
  }
}

