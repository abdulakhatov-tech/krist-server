export interface FindAllPropsType {
  page: number;
  limit: number;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  subcategory?: string;
  search?: string;
  startDate?: Date;
  endDate?: Date;
}
