import { Body, Controller, Post, RawBodyRequest, Req } from '@nestjs/common';
import { Auth } from 'src/infraestructure/common/decorators/auth.decorator.decorator';
import { ValidRoles } from 'src/infraestructure/common/interfaces/valid-roles';
import { CreatePaymentIntentDto } from '../../dto/payment/payment-intent.dto';
import { CreatePaymentUseCase } from 'src/application/use-cases/payment/create-payment.use-case';
import { Payment } from 'src/domain/payment';
import { GetUser } from 'src/infraestructure/common/decorators/get-user.decorator';
import { User } from 'src/domain/user';
import { ProcessPaymentUseCase } from 'src/application/use-cases/payment/process-payment.use-case';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller('api/payments')
export class PaymentController {
  constructor(
    private readonly createPaymentUseCase: CreatePaymentUseCase,
    private readonly processPaymentUseCase: ProcessPaymentUseCase,
  ) {}

  @Auth(ValidRoles.client)
  @Post()
  async createPayment(
    @Body() paymentIntentDto: CreatePaymentIntentDto,
    @GetUser() user: User,
  ): Promise<Partial<Payment>> {
    const { paymentId, orderId, stripePaymentId, amount, currency, status } =
      await this.createPaymentUseCase.execute({
        ...paymentIntentDto,
        userId: user.id,
      });

    return { paymentId, orderId, stripePaymentId, amount, currency, status };
  }

  @Post('webhook')
  async stripeWebhook(
    @Req() request: RawBodyRequest<Request>,
  ): Promise<Payment> {
    const signature = request.headers['stripe-signature'];

    const {
      created,
      data: {
        object: {
          metadata: { paymentId },
        },
      },
    } = request.body as any;

    const paymentResponse = await this.processPaymentUseCase.execute({
      paymentId,
      rawBody: request.rawBody,
      signature,
      paymentAt: created,
    });

    return paymentResponse;
  }
}
