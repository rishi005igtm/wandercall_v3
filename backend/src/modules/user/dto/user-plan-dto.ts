export class UserPlanDto {
  userId: string;
  selectedTier: string;
  billingCycle: string;
  price: number;
  status: string;
  nextBillDate?: Date;
  paymentCard: any;
}
