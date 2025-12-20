import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase.service';
import sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs';

export interface CreateDesignDto {
  userId?: string;
  guestEmail?: string;
  guestName?: string;
  guestPhone?: string;
  templateId?: number;
  phoneModel: string;
  designData: any; // JSON từ Fabric.js
  previewImageBase64?: string; // Ảnh preview dạng base64
}

export interface UpdateDesignDto {
  designData?: any;
  previewImageBase64?: string;
  status?: string;
  adminNotes?: string;
}

export interface SubmitDesignDto {
  designId: number;
  guestEmail?: string;
  guestName?: string;
  guestPhone?: string;
}

@Injectable()
export class DesignService {
  private uploadDir = path.join(process.cwd(), 'uploads', 'designs');

  constructor(private supabaseService: SupabaseService) {
    // Tạo thư mục upload nếu chưa tồn tại
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  // Lấy danh sách phone templates
  async getPhoneTemplates() {
    return this.supabaseService.getPhoneTemplates();
  }

  // Lấy template theo ID
  async getTemplateById(templateId: number) {
    const { data, error } = await this.supabaseService.getPhoneTemplateById(templateId);
    if (error || !data) {
      throw new NotFoundException('Template không tồn tại');
    }
    return data;
  }

  // Tạo template mới
  async createTemplate(dto: any) {
    // Xử lý ảnh base64 nếu có
    let imageUrl = dto.template_image_url;
    if (imageUrl && imageUrl.startsWith('data:image')) {
      imageUrl = await this.saveBase64Image(imageUrl, 'template');
    }

    const { data, error } = await this.supabaseService.createPhoneTemplate({
      phone_model: dto.phone_model,
      brand: dto.brand,
      template_image_url: imageUrl || null,
      print_width_mm: dto.print_width_mm || 70,
      print_height_mm: dto.print_height_mm || 150,
      canvas_width: dto.canvas_width || 700,
      canvas_height: dto.canvas_height || 1500,
      is_active: dto.is_active !== false,
    });

    if (error) {
      throw new BadRequestException('Không thể tạo template: ' + error.message);
    }

    return { success: true, message: 'Đã tạo template!', template: data };
  }

  // Cập nhật template
  async updateTemplate(templateId: number, dto: any) {
    // Xử lý ảnh base64 nếu có
    let imageUrl = dto.template_image_url;
    if (imageUrl && imageUrl.startsWith('data:image')) {
      imageUrl = await this.saveBase64Image(imageUrl, 'template');
    }

    const updateData: any = {};
    if (dto.phone_model !== undefined) updateData.phone_model = dto.phone_model;
    if (dto.brand !== undefined) updateData.brand = dto.brand;
    // Chỉ update image nếu có giá trị mới (không phải empty string)
    if (imageUrl && imageUrl.trim() !== '') {
      updateData.template_image_url = imageUrl;
    }
    if (dto.print_width_mm !== undefined) updateData.print_width_mm = dto.print_width_mm;
    if (dto.print_height_mm !== undefined) updateData.print_height_mm = dto.print_height_mm;
    if (dto.canvas_width !== undefined) updateData.canvas_width = dto.canvas_width;
    if (dto.canvas_height !== undefined) updateData.canvas_height = dto.canvas_height;
    if (dto.is_active !== undefined) updateData.is_active = dto.is_active;

    const { data, error } = await this.supabaseService.updatePhoneTemplate(templateId, updateData);

    if (error) {
      console.error('Update template error:', error);
      throw new BadRequestException('Không thể cập nhật template: ' + error.message);
    }

    return { success: true, message: 'Đã cập nhật template!', template: data };
  }

  // Xóa template
  async deleteTemplate(templateId: number) {
    const { error } = await this.supabaseService.deletePhoneTemplate(templateId);

    if (error) {
      throw new BadRequestException('Không thể xóa template: ' + error.message);
    }

    return { success: true, message: 'Đã xóa template!' };
  }

  // Tạo thiết kế mới
  async createDesign(dto: CreateDesignDto) {
    // Lưu preview image nếu có
    let previewImageUrl: string | null = null;
    if (dto.previewImageBase64) {
      previewImageUrl = await this.saveBase64Image(dto.previewImageBase64, 'preview');
    }

    const { data, error } = await this.supabaseService.createDesign({
      user_id: dto.userId || null,
      guest_email: dto.guestEmail || null,
      guest_name: dto.guestName || null,
      guest_phone: dto.guestPhone || null,
      template_id: dto.templateId || null,
      phone_model: dto.phoneModel,
      design_data: dto.designData,
      preview_image_url: previewImageUrl,
      status: 'draft',
    });

    if (error) {
      console.error('Create design error:', error);
      throw new BadRequestException('Không thể tạo thiết kế: ' + error.message);
    }

    return {
      success: true,
      message: 'Tạo thiết kế thành công',
      design: data,
    };
  }

  // Cập nhật thiết kế
  async updateDesign(designId: number, dto: UpdateDesignDto) {
    // Kiểm tra thiết kế tồn tại
    const { data: existing, error: existError } = await this.supabaseService.getDesignById(designId);
    if (existError || !existing) {
      throw new NotFoundException('Thiết kế không tồn tại');
    }

    // Không cho phép sửa nếu đã submitted
    if (existing.status !== 'draft' && !dto.status && !dto.adminNotes) {
      throw new BadRequestException('Không thể sửa thiết kế đã gửi');
    }

    const updateData: any = {};

    if (dto.designData) {
      updateData.design_data = dto.designData;
    }

    if (dto.previewImageBase64) {
      updateData.preview_image_url = await this.saveBase64Image(dto.previewImageBase64, 'preview');
    }

    if (dto.status) {
      updateData.status = dto.status;
      if (dto.status === 'submitted') {
        updateData.submitted_at = new Date().toISOString();
      }
      if (['approved', 'rejected', 'printed'].includes(dto.status)) {
        updateData.processed_at = new Date().toISOString();
      }
    }

    if (dto.adminNotes !== undefined) {
      updateData.admin_notes = dto.adminNotes;
    }

    const { data, error } = await this.supabaseService.updateDesign(designId, updateData);

    if (error) {
      throw new BadRequestException('Không thể cập nhật thiết kế: ' + error.message);
    }

    return {
      success: true,
      message: 'Cập nhật thiết kế thành công',
      design: data,
    };
  }

  // Gửi thiết kế cho admin duyệt
  async submitDesign(dto: SubmitDesignDto) {
    const { data: existing, error: existError } = await this.supabaseService.getDesignById(dto.designId);
    if (existError || !existing) {
      throw new NotFoundException('Thiết kế không tồn tại');
    }

    if (existing.status !== 'draft') {
      throw new BadRequestException('Thiết kế đã được gửi trước đó');
    }

    // Render ảnh chất lượng cao
    let highResUrl: string | null = null;
    try {
      highResUrl = await this.renderHighResImage(existing.design_data, existing.phone_model);
    } catch (renderError) {
      console.error('Render high-res error:', renderError);
      // Vẫn tiếp tục submit dù không render được
    }

    const { data, error } = await this.supabaseService.updateDesign(dto.designId, {
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      high_res_image_url: highResUrl,
      guest_email: dto.guestEmail || existing.guest_email,
      guest_name: dto.guestName || existing.guest_name,
      guest_phone: dto.guestPhone || existing.guest_phone,
    });

    if (error) {
      throw new BadRequestException('Không thể gửi thiết kế: ' + error.message);
    }

    return {
      success: true,
      message: 'Thiết kế đã được gửi! Admin sẽ xem xét và liên hệ với bạn.',
      design: data,
    };
  }

  // Lấy thiết kế theo ID
  async getDesignById(designId: number) {
    const { data, error } = await this.supabaseService.getDesignById(designId);
    if (error || !data) {
      throw new NotFoundException('Thiết kế không tồn tại');
    }
    return data;
  }

  // Lấy danh sách thiết kế của user
  async getUserDesigns(userId: string) {
    return this.supabaseService.getUserDesigns(userId);
  }

  // Lấy danh sách thiết kế cho admin
  async getAllDesigns(status?: string) {
    return this.supabaseService.getAllDesigns(status);
  }

  // Admin duyệt thiết kế
  async approveDesign(designId: number, adminNotes?: string) {
    return this.updateDesign(designId, {
      status: 'approved',
      adminNotes,
    });
  }

  // Admin từ chối thiết kế
  async rejectDesign(designId: number, adminNotes: string) {
    if (!adminNotes) {
      throw new BadRequestException('Vui lòng nhập lý do từ chối');
    }
    return this.updateDesign(designId, {
      status: 'rejected',
      adminNotes,
    });
  }

  // Lưu ảnh base64
  private async saveBase64Image(base64Data: string, prefix: string): Promise<string> {
    try {
      // Xóa header base64 nếu có
      const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Image, 'base64');

      const fileName = `${prefix}_${Date.now()}_${Math.random().toString(36).substring(7)}.png`;
      const filePath = path.join(this.uploadDir, fileName);

      // Optimize image với sharp
      await sharp(buffer)
        .png({ quality: 90 })
        .toFile(filePath);

      // Trả về URL relative
      return `/uploads/designs/${fileName}`;
    } catch (error) {
      console.error('Save image error:', error);
      throw new BadRequestException('Không thể lưu ảnh');
    }
  }

  // Render ảnh chất lượng cao (300dpi) từ design data
  private async renderHighResImage(designData: any, phoneModel: string): Promise<string> {
    try {
      // Kích thước chuẩn cho in ấn (300 DPI)
      // Giả sử kích thước ốp là 70mm x 150mm
      // 70mm * (300/25.4) ≈ 827 pixels
      // 150mm * (300/25.4) ≈ 1772 pixels
      const DPI = 300;
      const MM_TO_INCH = 25.4;
      const printWidth = Math.round(70 * DPI / MM_TO_INCH); // ~827px
      const printHeight = Math.round(150 * DPI / MM_TO_INCH); // ~1772px

      // Tạo canvas trắng với kích thước in
      const canvas = sharp({
        create: {
          width: printWidth,
          height: printHeight,
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        }
      });

      const composites: any[] = [];

      // Xử lý từng object trong design data
      if (designData.objects && Array.isArray(designData.objects)) {
        for (const obj of designData.objects) {
          if (obj.type === 'image' && obj.src) {
            try {
              // Download và resize ảnh
              const response = await fetch(obj.src);
              const arrayBuffer = await response.arrayBuffer();
              const imageBuffer = Buffer.from(arrayBuffer);

              // Tính toán scale từ canvas sang print size
              const scaleX = printWidth / (designData.width || 700);
              const scaleY = printHeight / (designData.height || 1500);

              const width = Math.round((obj.width || 100) * (obj.scaleX || 1) * scaleX);
              const height = Math.round((obj.height || 100) * (obj.scaleY || 1) * scaleY);
              const left = Math.round((obj.left || 0) * scaleX);
              const top = Math.round((obj.top || 0) * scaleY);

              const resizedImage = await sharp(imageBuffer)
                .resize(width, height, { fit: 'fill' })
                .toBuffer();

              composites.push({
                input: resizedImage,
                left: Math.max(0, left),
                top: Math.max(0, top),
              });
            } catch (imgError) {
              console.error('Process image error:', imgError);
            }
          }
        }
      }

      // Composite tất cả ảnh
      const finalImage = await canvas
        .composite(composites)
        .png({ quality: 100 })
        .toBuffer();

      // Lưu file
      const fileName = `highres_${Date.now()}_${Math.random().toString(36).substring(7)}.png`;
      const filePath = path.join(this.uploadDir, fileName);
      await sharp(finalImage).toFile(filePath);

      return `/uploads/designs/${fileName}`;
    } catch (error) {
      console.error('Render high-res error:', error);
      throw error;
    }
  }

  // Upload ảnh cho thiết kế
  async uploadDesignImage(designId: number, file: any) {
    // Kiểm tra thiết kế tồn tại
    const { data: existing } = await this.supabaseService.getDesignById(designId);
    if (!existing) {
      throw new NotFoundException('Thiết kế không tồn tại');
    }

    // Tạo thumbnail
    const thumbnailBuffer = await sharp(file.buffer)
      .resize(200, 200, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toBuffer();

    // Lưu ảnh gốc
    const originalFileName = `original_${Date.now()}_${file.originalname}`;
    const originalPath = path.join(this.uploadDir, originalFileName);
    await sharp(file.buffer).toFile(originalPath);

    // Lưu thumbnail
    const thumbnailFileName = `thumb_${Date.now()}_${file.originalname}`;
    const thumbnailPath = path.join(this.uploadDir, thumbnailFileName);
    await sharp(thumbnailBuffer).toFile(thumbnailPath);

    // Lấy metadata
    const metadata = await sharp(file.buffer).metadata();

    // Lưu vào database
    const { data, error } = await this.supabaseService.createDesignImage({
      design_id: designId,
      original_url: `/uploads/designs/${originalFileName}`,
      thumbnail_url: `/uploads/designs/${thumbnailFileName}`,
      file_name: file.originalname,
      file_size: file.size,
      width: metadata.width,
      height: metadata.height,
    });

    if (error) {
      throw new BadRequestException('Không thể lưu ảnh: ' + error.message);
    }

    return {
      success: true,
      image: data,
    };
  }

  // Lấy danh sách ảnh của thiết kế
  async getDesignImages(designId: number) {
    return this.supabaseService.getDesignImages(designId);
  }

  // Xóa thiết kế
  async deleteDesign(designId: number) {
    const { error } = await this.supabaseService.deleteDesign(designId);
    if (error) {
      throw new BadRequestException('Không thể xóa thiết kế: ' + error.message);
    }
    return { success: true, message: 'Đã xóa thiết kế' };
  }
}
