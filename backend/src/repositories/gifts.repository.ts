import { getSupabaseClient } from './base.repository';

/**
 * Gifts Repository - Quản lý quà tặng
 */
export class GiftsRepository {
  private get supabase() { return getSupabaseClient(); }

  async createGift(giftData: {
    sender_id?: string;
    sender_name: string;
    sender_email: string;
    sender_message?: string;
    recipient_name: string;
    recipient_email: string;
    recipient_phone?: string;
    recipient_address?: string;
    product_id: number;
    quantity: number;
    verification_code: string;
    status?: string;
    payment_order_code?: string;
  }) {
    const { data, error } = await this.supabase
      .from('gifts')
      .insert(giftData)
      .select()
      .single();
    return { data, error };
  }

  async getGiftById(giftId: string) {
    const { data, error } = await this.supabase
      .from('gifts')
      .select(`
        *,
        products (
          product_id,
          product_name,
          price,
          sale_price,
          image_url,
          product_images (
            image_url,
            is_primary
          )
        )
      `)
      .eq('gift_id', giftId)
      .single();
    return { data, error };
  }

  async getGiftPublicInfo(giftId: string) {
    const { data, error } = await this.supabase
      .from('gifts')
      .select(`
        gift_id,
        sender_name,
        sender_message,
        recipient_name,
        recipient_email,
        status,
        created_at,
        expires_at,
        products (
          product_id,
          product_name,
          price,
          sale_price,
          image_url,
          product_images (
            image_url,
            is_primary
          )
        )
      `)
      .eq('gift_id', giftId)
      .single();
    return { data, error };
  }

  async updateGiftStatus(giftId: string, status: string, extraData?: any) {
    const updateData: any = { status, ...extraData };
    
    if (status === 'verified') {
      updateData.verified_at = new Date().toISOString();
    } else if (status === 'claimed') {
      updateData.claimed_at = new Date().toISOString();
    }

    const { data, error } = await this.supabase
      .from('gifts')
      .update(updateData)
      .eq('gift_id', giftId)
      .select()
      .single();
    return { data, error };
  }

  async createGiftEmail(emailData: {
    gift_id: string;
    email_type: string;
    sent_to: string;
    status?: string;
  }) {
    const { data, error } = await this.supabase
      .from('gift_emails')
      .insert(emailData)
      .select()
      .single();
    return { data, error };
  }

  async getSentGifts(userId: string) {
    const { data, error } = await this.supabase
      .from('gifts')
      .select(`
        *,
        products (
          product_name,
          price,
          sale_price,
          image_url,
          product_images (image_url, is_primary)
        )
      `)
      .eq('sender_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  }

  async getReceivedGifts(email: string) {
    const { data, error } = await this.supabase
      .from('gifts')
      .select(`
        *,
        products (
          product_name,
          price,
          sale_price,
          image_url,
          product_images (image_url, is_primary)
        )
      `)
      .eq('recipient_email', email)
      .order('created_at', { ascending: false });
    return { data, error };
  }
}

// Export singleton instance
export const giftsRepository = new GiftsRepository();
