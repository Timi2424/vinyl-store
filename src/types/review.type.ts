import { UserType } from '../types/user.type';
import { VinylType } from '../types/vinyl.type';

export interface ReviewType {
  id: string;
  content: string;
  rating: number;
  userId: string;
  vinylId: string;
  user?: UserType;
  vinyl?: VinylType; 
}
