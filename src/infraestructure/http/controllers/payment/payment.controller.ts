import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Auth } from 'src/infraestructure/common/decorators/auth.decorator.decorator';
import { ValidRoles } from 'src/infraestructure/common/interfaces/valid-roles';
import { CreatePaymentIntentDto } from '../../dto/payment/payment-intent.dto';
import { CreatePaymentUseCase } from 'src/application/use-cases/payment/create-payment.use-case';
import { Payment } from 'src/domain/payment';
import { GetUser } from 'src/infraestructure/common/decorators/get-user.decorator';
import { User } from 'src/domain/user';

@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }),
)
@Controller('api/payments')
export class PaymentController {
  constructor(private readonly createPaymentUseCase: CreatePaymentUseCase) {}

  @Auth(ValidRoles.client)
  @Post()
  async createPayment(
    @Body() paymentIntentDto: CreatePaymentIntentDto,
    @GetUser() user: User,
  ): Promise<Payment> {
    console.log(user);
    const payment = await this.createPaymentUseCase.execute(paymentIntentDto);
    return payment;
  }
}
