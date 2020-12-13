import { Test, TestingModule } from '@nestjs/testing';
import { FakePaymentsClient } from '../clients/fakePaymentsClient';
import { PaymentResponse } from './DTO/paymentResponse';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

describe('PaymentsController', () => {
  let paymentsController: PaymentsController;
  let paymentsService: PaymentsService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [PaymentsService, FakePaymentsClient],
    }).compile();

    paymentsController = moduleRef.get<PaymentsController>(PaymentsController);
    paymentsService = moduleRef.get<PaymentsService>(PaymentsService);
  });

  describe('processPayment', () => {
    it('should throw 400 when userId is empty', () => {
      // Arrange
      const userId = '';
      const paymentMethod = 'foo';
      const amount = 500;

      let caughtError;

      // Act
      try {
        paymentsController.processPayment(userId, paymentMethod, amount);
      } catch (error) {
        caughtError = error;
      }

      // Assert
      expect(caughtError.status).toEqual(400);
      expect(caughtError.message).toEqual(
        "Failed to find a value for required parameter 'userId'",
      );
    });

    it('should throw 400 when paymentMethod is empty', () => {
      // Arrange
      const userId = 'foo-user';
      const paymentMethod = '';
      const amount = 500;

      let caughtError;

      // Act
      try {
        paymentsController.processPayment(userId, paymentMethod, amount);
      } catch (error) {
        caughtError = error;
      }

      // Assert
      expect(caughtError.status).toEqual(400);
      expect(caughtError.message).toEqual(
        "Failed to find a value for required parameter 'paymentMethod'",
      );
    });

    it('should throw 400 when amount is empty', () => {
      // Arrange
      const userId = 'foo-user';
      const paymentMethod = 'foo';
      const amount = null;

      let caughtError;

      // Act
      try {
        paymentsController.processPayment(userId, paymentMethod, amount);
      } catch (error) {
        caughtError = error;
      }

      // Assert
      expect(caughtError.status).toEqual(400);
      expect(caughtError.message).toEqual(
        "Failed to find a value for required parameter 'amount'",
      );
    });

    it('should throw 400 when amount is not a valid number', () => {
      // Arrange
      const userId = 'foo-user';
      const paymentMethod = 'foo';
      const amount: any = '2505ss';

      let caughtError;

      // Act
      try {
        paymentsController.processPayment(userId, paymentMethod, amount);
      } catch (error) {
        caughtError = error;
      }

      // Assert
      expect(caughtError.status).toEqual(400);
      expect(caughtError.message).toEqual(
        "Invalid value provided for parameter 'amount'",
      );
    });

    it('should throw 500 when payments service errors out', () => {
      // Arrange
      const userId = 'foo-user';
      const paymentMethod = 'foo';
      const amount: any = '250.50';

      jest.spyOn(paymentsService, 'processPayment').mockImplementation(() => {
        throw new Error('Simulated service failure');
      });

      let caughtError;

      // Act
      try {
        paymentsController.processPayment(userId, paymentMethod, amount);
      } catch (error) {
        caughtError = error;
      }

      // Assert
      expect(caughtError.status).toEqual(500);
      expect(caughtError.message).toEqual(
        'Unexpected failure occurred when creating an order. Details: Simulated service failure',
      );
    });

    it('should return payment response successfully', () => {
      // Arrange
      const userId = 'foo-user';
      const paymentMethod = 'foo';
      const amount: any = '1250';

      jest.spyOn(paymentsService, 'processPayment').mockImplementation(() => {
        return new PaymentResponse('payment-id', 'confirmed');
      });

      // Act
      const result = paymentsController.processPayment(
        userId,
        paymentMethod,
        amount,
      );

      // Assert
      expect(result.id).toEqual('payment-id');
      expect(result.status).toEqual('confirmed');
    });
  });
});
