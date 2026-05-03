import { getSupabaseClient } from './base.repository';

/**
 * Contacts Repository - Quản lý tin nhắn liên hệ
 */
export class ContactsRepository {
  private get supabase() { return getSupabaseClient(); }

  async getAllContactMessages(limit = 50) {
    const { data, error } = await this.supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    return { data, error };
  }

  async getContactMessageById(id: number) {
    const { data, error } = await this.supabase
      .from('contact_messages')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  }

  async createContactMessage(messageData: any) {
    const { data, error } = await this.supabase
      .from('contact_messages')
      .insert([messageData])
      .select();
    return { data, error };
  }

  async updateContactMessageStatus(id: number, status: string) {
    const { data, error } = await this.supabase
      .from('contact_messages')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();
    return { data, error };
  }

  async deleteContactMessage(id: number) {
    const { data, error } = await this.supabase
      .from('contact_messages')
      .delete()
      .eq('id', id);
    return { data, error };
  }
}

// Export singleton instance
export const contactsRepository = new ContactsRepository();
