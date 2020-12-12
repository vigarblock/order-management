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
      const response = await axios.post(`http://${HOSTNAME}/payments`, {
        userId,
        paymentMethod,
        amount,
      });

      return { status: response.data.status };
    } catch (error) {
      // Rethrowing with message only to prevent additional info bubbling up.
      // Ideally, full error should be logged for traceability.
      throw new Error(error.message);
    }
  }
}
