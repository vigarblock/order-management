import { FakePaymentsClient } from '../clients/fakePaymentsClient';
import { PaymentsService } from './payments.service';

describe('PaymentsService', () => {
  let paymentsService: PaymentsService;
  let paymentsClient: FakePaymentsClient;

  beforeEach(() => {
    paymentsClient = new FakePaymentsClient();
    paymentsService = new PaymentsService(paymentsClient);
  });

  describe('processPayment', () => {
    it('should call payments client with correct paymentPayload', async () => {
      // Arrange
      const userId = 'foo-user';
      const paymentMethod = 'foo-payment-method';
      const amount = 250;

      jest
        .spyOn(paymentsClient, 'processPayment')
        .mockImplementation(() => true);
      const mockCalls = jest.spyOn(paymentsClient, 'processPayment').mock.calls;

      // Act
      paymentsService.processPayment(userId, paymentMethod, amount);

      // Assert
      expect(mockCalls[0][0]).toEqual(
        'Mocked string as payload - foo-user-foo-payment-method',
      );
    });

    it('should call payments client with correct amount', async () => {
      // Arrange
      const userId = 'foo-user';
      const paymentMethod = 'foo-payment-method';
      const amount = 250;

      jest
        .spyOn(paymentsClient, 'processPayment')
        .mockImplementation(() => true);
      const mockCalls = jest.spyOn(paymentsClient, 'processPayment').mock.calls;

      // Act
      paymentsService.processPayment(userId, paymentMethod, amount);

      // Assert
      expect(mockCalls[0][1]).toEqual(250);
    });

    it('should return confirmed when payment is successful', async () => {
      // Arrange
      const userId = 'foo-user';
      const paymentMethod = 'foo-payment-method';
      const amount = 250;

      jest
        .spyOn(paymentsClient, 'processPayment')
        .mockImplementation(() => true);

      // Act
      const result = paymentsService.processPayment(
        userId,
        paymentMethod,
        amount,
      );

      // Assert
      expect(result.status).toEqual('confirmed');
    });

    it('should return declined when payment is unsuccessful', async () => {
      // Arrange
      const userId = 'foo-user';
      const paymentMethod = 'foo-payment-method';
      const amount = 250;

      jest
        .spyOn(paymentsClient, 'processPayment')
        .mockImplementation(() => false);

      // Act
      const result = paymentsService.processPayment(
        userId,
        paymentMethod,
        amount,
      );

      // Assert
      expect(result.status).toEqual('declined');
    });
  });
});
