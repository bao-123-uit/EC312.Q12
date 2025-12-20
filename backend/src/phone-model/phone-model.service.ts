/**
 * Phone Model Service
 * Quản lý dòng máy điện thoại tương thích với sản phẩm
 */

import { Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Interface cho Phone Model
export interface PhoneModel {
  model_id: number;
  brand_name: string;
  model_name: string;
  model_code?: string;
  release_year?: number;
  screen_size?: number;
  image_url?: string;
  is_popular: boolean;
  is_active: boolean;
  display_order: number;
}

// Interface cho Product Compatibility
export interface ProductCompatibility {
  compatibility_id: number;
  product_id: number;
  phone_model_id: number;
  fit_type: string;
  notes?: string;
  phone_model?: PhoneModel;
}

@Injectable()
export class PhoneModelService {
  private readonly logger = new Logger(PhoneModelService.name);
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    );
  }

  /**
   * Lấy tất cả dòng máy (grouped by brand)
   */
  async getAllPhoneModels(): Promise<{ brand: string; models: PhoneModel[] }[]> {
    try {
      const { data, error } = await this.supabase
        .from('phone_models')
        .select('*')
        .order('brand_name')
        .order('display_order')
        .order('model_name');

      if (error) {
        this.logger.error(`Lỗi lấy phone models: ${error.message}`);
        throw error;
      }

      // Group by brand
      const groupedByBrand: { [key: string]: PhoneModel[] } = {};
      (data || []).forEach((model: PhoneModel) => {
        if (!groupedByBrand[model.brand_name]) {
          groupedByBrand[model.brand_name] = [];
        }
        groupedByBrand[model.brand_name].push(model);
      });

      // Convert to array format: [{ brand: 'Apple', models: [...] }, ...]
      const result = Object.entries(groupedByBrand).map(([brand, models]) => ({
        brand,
        models,
      }));

      return result;
    } catch (error) {
      this.logger.error(`Lỗi getAllPhoneModels: ${error.message}`);
      throw error;
    }
  }

  /**
   * Lấy dòng máy theo brand
   */
  async getPhoneModelsByBrand(brandName: string): Promise<PhoneModel[]> {
    try {
      const { data, error } = await this.supabase
        .from('phone_models')
        .select('*')
        .eq('brand_name', brandName)
        .order('display_order')
        .order('model_name');

      if (error) {
        this.logger.error(`Lỗi lấy phone models by brand: ${error.message}`);
        throw error;
      }

      return data || [];
    } catch (error) {
      this.logger.error(`Lỗi getPhoneModelsByBrand: ${error.message}`);
      throw error;
    }
  }

  /**
   * Lấy dòng máy phổ biến
   */
  async getPopularPhoneModels(): Promise<PhoneModel[]> {
    try {
      const { data, error } = await this.supabase
        .from('phone_models')
        .select('*')
        .eq('is_popular', true)
        .order('brand_name')
        .order('display_order')
        .limit(20);

      if (error) {
        this.logger.error(`Lỗi lấy popular phone models: ${error.message}`);
        throw error;
      }

      return data || [];
    } catch (error) {
      this.logger.error(`Lỗi getPopularPhoneModels: ${error.message}`);
      throw error;
    }
  }

  /**
   * Lấy dòng máy tương thích với sản phẩm
   */
  async getCompatibleModels(productId: number): Promise<PhoneModel[]> {
    try {
      const { data, error } = await this.supabase
        .from('product_compatibility')
        .select(`
          *,
          phone_models (*)
        `)
        .eq('product_id', productId);

      if (error) {
        this.logger.error(`Lỗi lấy compatible models: ${error.message}`);
        throw error;
      }

      // Extract phone models từ kết quả
      const models = (data || [])
        .map((c: any) => c.phone_models)
        .filter((m: any) => m && m.is_active);

      return models;
    } catch (error) {
      this.logger.error(`Lỗi getCompatibleModels: ${error.message}`);
      throw error;
    }
  }

  /**
   * Lấy chi tiết một dòng máy
   */
  async getPhoneModelById(modelId: number): Promise<PhoneModel | null> {
    try {
      const { data, error } = await this.supabase
        .from('phone_models')
        .select('*')
        .eq('model_id', modelId)
        .single();

      if (error) {
        this.logger.error(`Lỗi lấy phone model: ${error.message}`);
        return null;
      }

      return data;
    } catch (error) {
      this.logger.error(`Lỗi getPhoneModelById: ${error.message}`);
      return null;
    }
  }

  /**
   * Tìm kiếm dòng máy
   */
  async searchPhoneModels(keyword: string): Promise<PhoneModel[]> {
    try {
      const { data, error } = await this.supabase
        .from('phone_models')
        .select('*')
        .or(`model_name.ilike.%${keyword}%,brand_name.ilike.%${keyword}%,model_code.ilike.%${keyword}%`)
        .order('is_popular', { ascending: false })
        .order('brand_name')
        .limit(20);

      if (error) {
        this.logger.error(`Lỗi search phone models: ${error.message}`);
        throw error;
      }

      return data || [];
    } catch (error) {
      this.logger.error(`Lỗi searchPhoneModels: ${error.message}`);
      throw error;
    }
  }

  // ==================== ADMIN FUNCTIONS ====================

  /**
   * Tạo dòng máy mới (Admin)
   */
  async createPhoneModel(modelData: Partial<PhoneModel>): Promise<PhoneModel> {
    try {
      const { data, error } = await this.supabase
        .from('phone_models')
        .insert([modelData])
        .select()
        .single();

      if (error) {
        this.logger.error(`Lỗi tạo phone model: ${error.message}`);
        throw error;
      }

      this.logger.log(`Đã tạo phone model: ${data.model_name}`);
      return data;
    } catch (error) {
      this.logger.error(`Lỗi createPhoneModel: ${error.message}`);
      throw error;
    }
  }

  /**
   * Cập nhật dòng máy (Admin)
   */
  async updatePhoneModel(modelId: number, modelData: Partial<PhoneModel>): Promise<PhoneModel> {
    try {
      const { data, error } = await this.supabase
        .from('phone_models')
        .update(modelData)
        .eq('model_id', modelId)
        .select()
        .single();

      if (error) {
        this.logger.error(`Lỗi cập nhật phone model: ${error.message}`);
        throw error;
      }

      this.logger.log(`Đã cập nhật phone model: ${modelId}`);
      return data;
    } catch (error) {
      this.logger.error(`Lỗi updatePhoneModel: ${error.message}`);
      throw error;
    }
  }

  /**
   * Xóa dòng máy (Admin) - soft delete
   */
  async deletePhoneModel(modelId: number): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('phone_models')
        .update({ is_active: false })
        .eq('model_id', modelId);

      if (error) {
        this.logger.error(`Lỗi xóa phone model: ${error.message}`);
        throw error;
      }

      this.logger.log(`Đã xóa phone model: ${modelId}`);
      return true;
    } catch (error) {
      this.logger.error(`Lỗi deletePhoneModel: ${error.message}`);
      throw error;
    }
  }

  /**
   * Thêm tương thích sản phẩm - dòng máy (Admin)
   */
  async addProductCompatibility(
    productId: number,
    phoneModelId: number,
    fitType: string = 'exact',
    notes?: string,
  ): Promise<ProductCompatibility> {
    try {
      const { data, error } = await this.supabase
        .from('product_compatibility')
        .insert([
          {
            product_id: productId,
            phone_model_id: phoneModelId,
            fit_type: fitType,
            notes: notes,
          },
        ])
        .select()
        .single();

      if (error) {
        this.logger.error(`Lỗi thêm compatibility: ${error.message}`);
        throw error;
      }

      return data;
    } catch (error) {
      this.logger.error(`Lỗi addProductCompatibility: ${error.message}`);
      throw error;
    }
  }

  /**
   * Xóa tương thích sản phẩm - dòng máy (Admin)
   */
  async removeProductCompatibility(productId: number, phoneModelId: number): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('product_compatibility')
        .delete()
        .eq('product_id', productId)
        .eq('phone_model_id', phoneModelId);

      if (error) {
        this.logger.error(`Lỗi xóa compatibility: ${error.message}`);
        throw error;
      }

      return true;
    } catch (error) {
      this.logger.error(`Lỗi removeProductCompatibility: ${error.message}`);
      throw error;
    }
  }

  /**
   * Bulk thêm tương thích cho sản phẩm (Admin)
   */
  async setProductCompatibility(
    productId: number,
    phoneModelIds: number[],
  ): Promise<void> {
    try {
      // Xóa tất cả compatibility cũ
      await this.supabase
        .from('product_compatibility')
        .delete()
        .eq('product_id', productId);

      // Thêm compatibility mới
      if (phoneModelIds.length > 0) {
        const inserts = phoneModelIds.map((modelId) => ({
          product_id: productId,
          phone_model_id: modelId,
          fit_type: 'exact',
        }));

        const { error } = await this.supabase
          .from('product_compatibility')
          .insert(inserts);

        if (error) {
          this.logger.error(`Lỗi bulk insert compatibility: ${error.message}`);
          throw error;
        }
      }

      this.logger.log(`Đã set ${phoneModelIds.length} compatible models cho product ${productId}`);
    } catch (error) {
      this.logger.error(`Lỗi setProductCompatibility: ${error.message}`);
      throw error;
    }
  }
}
