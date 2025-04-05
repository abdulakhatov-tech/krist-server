import { User } from "src/entities";

export interface UserResponseType {
  success: boolean;
  message: string;
  data: User;
}
