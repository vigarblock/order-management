import {
  Controller,
  Post,
  Patch,
  Get,
  Body,
  Param,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { OrderNotFoundException } from './errors/orderNotFoundException';
import { OrdersService } from './orders.service';

import { validate as uuidValidate } from 'uuid';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder(
    @Body('userId') userId: string,
    @Body('amount') amount: number,
  ) {
    if (!userId) {
      throw new BadRequestException(
        "Failed to find a value for required parameter 'userId'",
      );
    }

    if (!amount) {
      throw new BadRequestException(
        "Failed to find a value for required parameter 'amount'",
      );
    }

    if (isNaN(amount)) {
      throw new BadRequestException(
        "Invalid value provided for parameter 'amount'",
      );
    }

    try {
      const response = await this.ordersService.createOrder(userId, amount);
      return response;
    } catch (error) {
      const details = error.message;
      throw new InternalServerErrorException(
        `Unexpected failure occurred when creating an order. Details: ${details}`,
      );
    }
  }

  @Get(':id/status')
  async getOrderStatus(@Param('id') orderId: string) {
    this.validateOrderId(orderId);

    try {
      const orderStatus = await this.ordersService.getOrderStatus(orderId);
      return { orderStatus };
    } catch (error) {
      const message = error.message;
      if (error instanceof OrderNotFoundException) {
        throw new NotFoundException(message);
      }

      throw new InternalServerErrorException(
        `Unexpected failure occurred when creating an order. Details: ${message}`,
      );
    }
  }

  @Patch(':id/cancel')
  async cancelOrder(@Param('id') orderId: string) {
    this.validateOrderId(orderId);

    try {
      const orderStatus = await this.ordersService.cancelOrder(orderId);
      return { orderStatus };
    } catch (error) {
      const message = error.message;
      if (error instanceof OrderNotFoundException) {
        throw new NotFoundException(message);
      }

      throw new InternalServerErrorException(
        `Unexpected failure occurred when creating an order. Details: ${message}`,
      );
    }
  }

  private validateOrderId(orderId: string) {
    if (!uuidValidate(orderId)) {
      throw new BadRequestException(
        `The provided Order ID: '${orderId}' is invalid`,
      );
    }
  }
}
