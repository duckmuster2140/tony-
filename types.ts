
export interface MarketDataInput {
  coinName: string;
}

export interface TradeSignal {
  hasSignal: boolean;
  direction?: '做多' | '做空';
  entryRange?: string;
  stopLoss?: string;
  tp1?: string;
  tp2?: string;
  leverage?: string;
  makerAnalysis?: {
    stage: string;
    evidence: string[];
  };
  trends?: {
    m1: string;
    m5: string;
    m15: string;
  };
  rawText: string;
}
