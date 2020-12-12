import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { env } from 'process';

const HOSTNAME = env.PAYMENTS_SVC_HOSTNAME;

@Injectable()
export class PaymentsServiceClient {
  async postPaymentRequest(
    userId: string,
    paymentMethod: string,
    amount: number,
  ) {
    try {
      const response = await axios.post(`${HOSTNAME}/payments`, {
        userId,
        paymentMethod,
        amount,
      });

      return { status: response.data.status };
    } catch (error) {
      // Ideally, error should be logged.
      // So that additional information does not need to bubble up to consumer.
      throw new Error(error.message);
    }
  }
}
