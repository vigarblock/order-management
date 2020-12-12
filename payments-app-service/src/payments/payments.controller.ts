import {
  Controller,
  Post,
  Body,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  processPayment(
    @Body('userId') userId: string,
    @Body('paymentMethod') paymentMethod: string,
    @Body('amount') amount: number,
  ) {
    if (!userId) {
      throw new BadRequestException(
        'Failed to find a value for required parameter "userId"',
      );
    }

    if (!paymentMethod) {
      throw new BadRequestException(
        'Failed to find a value for required parameter "paymentMethod"',
      );
    }

    if (!amount) {
      throw new BadRequestException(
        'Failed to find a value for required parameter "amount"',
      );
    }

    if (isNaN(amount)) {
      throw new BadRequestException(
        'Invalid value provided for parameter "amount"',
      );
    }

    try {
      const response = this.paymentsService.processPayment(
        userId,
        paymentMethod,
        amount,
      );
      return response;
    } catch (error) {
      throw new InternalServerErrorException(
        `Unexpected failure occurred when creating an order. Details: ${error.messsage}`,
      );
    }
  }
}
