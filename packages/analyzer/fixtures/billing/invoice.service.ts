// VIOLATION: circular dependency invoice.service <-> payment.service
import { PaymentService } from './payment.service';

export class InvoiceService {
  constructor(private readonly payment: PaymentService) {}
  settle() {
    return this.payment.charge();
  }
}
