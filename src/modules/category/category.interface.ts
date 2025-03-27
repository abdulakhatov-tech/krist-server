import { Category } from "src/entities";

export interface FindAllCategoryResponseType {
    success: boolean;
    message: string;
    data: Category[]
}

export interface CreateCategoryResponseType {
    success: boolean;
    message: string;
    data: Category
}

export interface DeleteCategoryResponseType {
    success: boolean;
    message: string;
}