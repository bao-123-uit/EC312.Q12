import { getSupabaseClient } from './base.repository';

/**
 * Designs Repository - Quản lý thiết kế tùy chỉnh và phone templates
 */
export class DesignsRepository {
  private get supabase() { return getSupabaseClient(); }

  // ============ PHONE TEMPLATES ============
  async getPhoneTemplates() {
    const { data, error } = await this.supabase
      .from('phone_templates')
      .select('*')
      .eq('is_active', true)
      .order('brand', { ascending: true });
    return { data, error };
  }

  async getPhoneTemplateById(templateId: number) {
    const { data, error } = await this.supabase
      .from('phone_templates')
      .select('*')
      .eq('template_id', templateId)
      .single();
    return { data, error };
  }

  async createPhoneTemplate(templateData: any) {
    const { data, error } = await this.supabase
      .from('phone_templates')
      .insert(templateData)
      .select()
      .single();
    return { data, error };
  }

  async updatePhoneTemplate(templateId: number, templateData: any) {
    const { data, error } = await this.supabase
      .from('phone_templates')
      .update(templateData)
      .eq('template_id', templateId)
      .select()
      .single();
    return { data, error };
  }

  async deletePhoneTemplate(templateId: number) {
    const { error } = await this.supabase
      .from('phone_templates')
      .delete()
      .eq('template_id', templateId);
    return { error };
  }

  // ============ CUSTOM DESIGNS ============
  async createDesign(designData: any) {
    const { data, error } = await this.supabase
      .from('custom_designs')
      .insert(designData)
      .select()
      .single();
    return { data, error };
  }

  async getDesignById(designId: number) {
    const { data, error } = await this.supabase
      .from('custom_designs')
      .select(`
        *,
        phone_templates (
          phone_model,
          brand,
          template_image_url
        )
      `)
      .eq('design_id', designId)
      .single();
    return { data, error };
  }

  async updateDesign(designId: number, updateData: any) {
    const { data, error } = await this.supabase
      .from('custom_designs')
      .update(updateData)
      .eq('design_id', designId)
      .select()
      .single();
    return { data, error };
  }

  async getUserDesigns(userId: string) {
    const { data, error } = await this.supabase
      .from('custom_designs')
      .select(`
        *,
        phone_templates (
          phone_model,
          brand,
          template_image_url
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  }

  async getAllDesigns(status?: string) {
    let query = this.supabase
      .from('custom_designs')
      .select(`
        *,
        phone_templates (
          phone_model,
          brand,
          template_image_url
        ),
        users (
          full_name,
          email,
          phone
        )
      `)
      .order('submitted_at', { ascending: false, nullsFirst: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    return { data, error };
  }

  async deleteDesign(designId: number) {
    const { error } = await this.supabase
      .from('custom_designs')
      .delete()
      .eq('design_id', designId);
    return { error };
  }

  // ============ DESIGN IMAGES ============
  async createDesignImage(imageData: any) {
    const { data, error } = await this.supabase
      .from('design_images')
      .insert(imageData)
      .select()
      .single();
    return { data, error };
  }

  async getDesignImages(designId: number) {
    const { data, error } = await this.supabase
      .from('design_images')
      .select('*')
      .eq('design_id', designId)
      .order('created_at', { ascending: true });
    return { data, error };
  }
}

// Export singleton instance
export const designsRepository = new DesignsRepository();
