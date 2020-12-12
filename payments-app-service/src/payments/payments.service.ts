import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { FakePaymentsClient } from 'src/clients/fakePaymentsClient';
import { PaymentResponse } from './DTO/paymentResponse';

@Injectable()
export class PaymentsService {
  constructor(private readonly paymentsClient: FakePaymentsClient) {}

  processPayment(
    userId: string,
    paymentMethod: string,
    amount: number,
  ): PaymentResponse {
    // Ideally, this transaction should be saved in a payments requests DB table.
    // I have not done so for brevity.
    const paymentRequestId = uuidv4();
    const paymentPayload = this.getPaymentPayload(userId, paymentMethod);
    const isSuccessful = this.paymentsClient.processPayment(
      paymentPayload,
      amount,
    );

    const paymentStatus = isSuccessful ? 'confirmed' : 'declined';
    return new PaymentResponse(paymentRequestId, paymentStatus);
  }

  private getPaymentPayload(userId: string, paymentMethod: string) {
    // Mock retrieval of pre-configured payment payload to execute payment.
    const payload = `Mocked string as payload - ${userId}-${paymentMethod}`;
    return payload;
  }
}
