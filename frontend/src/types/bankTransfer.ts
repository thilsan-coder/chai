import type { Order } from './order';

export type VerificationStatus = 'pending_verification' | 'verified' | 'rejected';

export interface BankTransferSummary {
  pending_count: number;
  pending_amount_lkr: number;
  verified_today_lkr: number;
  total_bank_volume_lkr: number;
  rejected_count: number;
}

export interface BankTransferListResponse {
  success: boolean;
  data: Order[];
  summary: BankTransferSummary;
}
