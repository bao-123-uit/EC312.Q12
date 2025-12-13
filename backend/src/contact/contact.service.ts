import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase.service';

@Injectable()
export class ContactService {
  constructor(private supabaseService: SupabaseService) {}

  async getAllMessages() {
    return this.supabaseService.getAllContactMessages();
  }

  async getMessageById(id: number) {
    return this.supabaseService.getContactMessageById(id);
  }

  async createMessage(messageData: any) {
    return this.supabaseService.createContactMessage(messageData);
  }

  async updateMessageStatus(id: number, status: string) {
    return this.supabaseService.updateContactMessageStatus(id, status);
  }

  async deleteMessage(id: number) {
    return this.supabaseService.deleteContactMessage(id);
  }
}
