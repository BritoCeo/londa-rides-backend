import { PaymentStatus } from '../enums/PaymentStatus';
import { PaymentMethod } from '../enums/PaymentMethod';

/**
 * Payment entity interface
 */
export interface IPayment {
  getId(): string;
  getUserId(): string;
  getRideId(): string | null;
  getAmount(): number;
  getCurrency(): string;
  getPaymentMethod(): PaymentMethod;
  getStatus(): PaymentStatus;
  getTransactionId(): string | null;
  getCreatedAt(): Date;
  getUpdatedAt(): Date;
  complete(transactionId: string): void;
  fail(reason: string): void;
  refund(): void;
}

