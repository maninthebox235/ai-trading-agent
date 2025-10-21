export interface DiaryEntry {
  timestamp: string;
  asset: string;
  action: 'buy' | 'sell' | 'hold' | 'close' | 'reconcile_close';
  allocation_usd?: number;
  amount?: number;
  entry_price?: number;
  tp_price?: number;
  tp_oid?: number;
  sl_price?: number;
  sl_oid?: number;
  exit_plan?: string;
  rationale?: string;
  order_result?: string;
  opened_at?: string;
  filled?: boolean;
  reason?: string;
}

export interface DiaryResponse {
  entries: DiaryEntry[];
}
