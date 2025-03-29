// Generic response type for consistent structure
export interface ResponseType<T = null> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    total: number; 
    totalPages: number
    currentPage: number;
    perPage: number;
    hasNext: boolean;
    hasPrev: boolean
  }
}
