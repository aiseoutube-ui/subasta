
export interface User {
  id: string;
  name: string;
  phone: string;
  verified: boolean;
}

export interface AuctionStatus {
  productId: string;
  productName: string;
  currentPrice: number;
  lastBidder: string;
  endTime: number; // Timestamp
  isActive: boolean;
  isPaused: boolean; // Nuevo: Control de pausa
}

export interface Product {
  id: string;
  name: string;
  basePrice: number;
}

export interface HistoryItem {
  bidder: string;
  amount: number;
  time: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
