// VIOLATION: circular dependency payment.service <-> invoice.service
import { InvoiceService } from './invoice.service';

export class PaymentService {
  constructor(private readonly invoice: InvoiceService) {}
  charge() {
    return this.invoice.settle();
  }
}
