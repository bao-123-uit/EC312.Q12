import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase.service';

@Injectable()
export class UsersService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getUsers() {
    const result = await this.supabaseService.getCustomers();
    return result.data || [];
  }
}
