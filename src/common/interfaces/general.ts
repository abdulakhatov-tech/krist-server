// Generic response type for consistent structure
export interface ResponseType<T = null> {
  success: boolean;
  message: string;
  data?: T;
}
