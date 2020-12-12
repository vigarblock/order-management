import { Module } from '@nestjs/common';
import { OrdersModule } from './orders/orders.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { env } from 'process';

@Module({
  imports: [
    OrdersModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: env.DATABASE_HOST,
      port: Number(env.DATABASE_PORT),
      username: env.DATABASE_USERNAME,
      password: env.DATABASE_PASSWORD,
      database: env.DATABASE_NAME,
      entities: ['.src/**/*.entity{.ts,.js}', 'dist/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
  ],
})
export class AppModule {}
