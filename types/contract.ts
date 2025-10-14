// Contract data types
export interface PlayerScore {
  player: string;
  score: number;
}

export interface ContractResponse {
  success: boolean;
  data?: any;
  error?: string;
}
