import { Module } from '@nestjs/common';
import { FakePaymentsClient } from 'src/clients/fakePaymentsClient';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';

@Module({
  imports: [],
  controllers: [PaymentsController],
  providers: [PaymentsService, FakePaymentsClient],
})
export class PaymentsModule {}
