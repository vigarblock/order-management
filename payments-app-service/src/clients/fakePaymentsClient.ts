import { Injectable } from '@nestjs/common';

@Injectable()
export class FakePaymentsClient {
  processPayment(paymentPayload: any, amount: number) {
    const randomResult =
      Math.floor(Math.random() * Math.floor(amount)) % 2 === 0;

    return randomResult;
  }
}
