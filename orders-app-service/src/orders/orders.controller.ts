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
    @Body('customerId') customerId: string,
    @Body('amount') amount: number,
  ) {
    if (!customerId) {
      throw new BadRequestException(
        'Failed to find a value for required parameter "customerId"',
      );
    }

    if (!amount) {
      throw new BadRequestException(
        'Failed to find a value for required parameter "amount"',
      );
    }

    try {
      const response = await this.ordersService.createOrder(customerId, amount);
      return response;
    } catch (error) {
      throw new InternalServerErrorException(
        `Unexpected failure occurred when creating an order. Details: ${error.messsage}`,
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
      if (error instanceof OrderNotFoundException) {
        throw new NotFoundException(error.message);
      }

      throw new InternalServerErrorException(
        `Unexpected failure occurred when creating an order. Details: ${error.messsage}`,
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
      if (error instanceof OrderNotFoundException) {
        throw new NotFoundException(error.message);
      }

      throw new InternalServerErrorException(
        `Unexpected failure occurred when creating an order. Details: ${error.messsage}`,
      );
    }
  }

  private validateOrderId(orderId: string) {
    if (!uuidValidate(orderId)) {
      throw new BadRequestException(
        `The provided Order ID: "${orderId}" is invalid`,
      );
    }
  }
}
