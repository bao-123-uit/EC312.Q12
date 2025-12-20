/**
 * Phone Model Controller
 * API endpoints cho dòng máy điện thoại
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PhoneModelService, PhoneModel } from './phone-model.service';

@Controller('phone-models')
export class PhoneModelController {
  private readonly logger = new Logger(PhoneModelController.name);

  constructor(private readonly phoneModelService: PhoneModelService) {}

  /**
   * GET /phone-models
   * Lấy tất cả dòng máy (grouped by brand)
   */
  @Get()
  async getAllPhoneModels() {
    this.logger.log('Lấy tất cả phone models');
    try {
      const result = await this.phoneModelService.getAllPhoneModels();
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error(`Lỗi: ${error.message}`);
      throw new BadRequestException('Không thể lấy danh sách dòng máy');
    }
  }

  /**
   * GET /phone-models/popular
   * Lấy dòng máy phổ biến
   */
  @Get('popular')
  async getPopularPhoneModels() {
    this.logger.log('Lấy popular phone models');
    try {
      const models = await this.phoneModelService.getPopularPhoneModels();
      return {
        success: true,
        data: models,
      };
    } catch (error) {
      this.logger.error(`Lỗi: ${error.message}`);
      throw new BadRequestException('Không thể lấy dòng máy phổ biến');
    }
  }

  /**
   * GET /phone-models/search?keyword=iphone
   * Tìm kiếm dòng máy
   */
  @Get('search')
  async searchPhoneModels(@Query('keyword') keyword: string) {
    if (!keyword || keyword.length < 2) {
      throw new BadRequestException('Keyword phải có ít nhất 2 ký tự');
    }

    this.logger.log(`Tìm kiếm phone models: ${keyword}`);
    try {
      const models = await this.phoneModelService.searchPhoneModels(keyword);
      return {
        success: true,
        data: models,
      };
    } catch (error) {
      this.logger.error(`Lỗi: ${error.message}`);
      throw new BadRequestException('Không thể tìm kiếm dòng máy');
    }
  }

  /**
   * GET /phone-models/brand/:brandName
   * Lấy dòng máy theo brand
   */
  @Get('brand/:brandName')
  async getPhoneModelsByBrand(@Param('brandName') brandName: string) {
    this.logger.log(`Lấy phone models theo brand: ${brandName}`);
    try {
      const models = await this.phoneModelService.getPhoneModelsByBrand(brandName);
      return {
        success: true,
        data: models,
      };
    } catch (error) {
      this.logger.error(`Lỗi: ${error.message}`);
      throw new BadRequestException('Không thể lấy dòng máy theo hãng');
    }
  }

  /**
   * GET /phone-models/product/:productId
   * Lấy dòng máy tương thích với sản phẩm
   */
  @Get('product/:productId')
  async getCompatibleModels(@Param('productId') productId: string) {
    const id = parseInt(productId, 10);
    if (isNaN(id)) {
      throw new BadRequestException('Product ID không hợp lệ');
    }

    this.logger.log(`Lấy compatible models cho product: ${id}`);
    try {
      const models = await this.phoneModelService.getCompatibleModels(id);
      return {
        success: true,
        data: models,
      };
    } catch (error) {
      this.logger.error(`Lỗi: ${error.message}`);
      throw new BadRequestException('Không thể lấy dòng máy tương thích');
    }
  }

  /**
   * GET /phone-models/:id
   * Lấy chi tiết dòng máy
   */
  @Get(':id')
  async getPhoneModelById(@Param('id') id: string) {
    const modelId = parseInt(id, 10);
    if (isNaN(modelId)) {
      throw new BadRequestException('Model ID không hợp lệ');
    }

    this.logger.log(`Lấy phone model: ${modelId}`);
    try {
      const model = await this.phoneModelService.getPhoneModelById(modelId);
      if (!model) {
        throw new NotFoundException('Không tìm thấy dòng máy');
      }
      return {
        success: true,
        data: model,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Lỗi: ${error.message}`);
      throw new BadRequestException('Không thể lấy thông tin dòng máy');
    }
  }

  // ==================== ADMIN ENDPOINTS ====================

  /**
   * POST /phone-models
   * Tạo dòng máy mới (Admin)
   */
  @Post()
  async createPhoneModel(@Body() modelData: Partial<PhoneModel>) {
    if (!modelData.brand_name || !modelData.model_name) {
      throw new BadRequestException('Thiếu brand_name hoặc model_name');
    }

    this.logger.log(`Tạo phone model: ${modelData.model_name}`);
    try {
      const model = await this.phoneModelService.createPhoneModel(modelData);
      return {
        success: true,
        message: 'Tạo dòng máy thành công',
        data: model,
      };
    } catch (error) {
      this.logger.error(`Lỗi: ${error.message}`);
      throw new BadRequestException('Không thể tạo dòng máy');
    }
  }

  /**
   * PUT /phone-models/:id
   * Cập nhật dòng máy (Admin)
   */
  @Put(':id')
  async updatePhoneModel(
    @Param('id') id: string,
    @Body() modelData: Partial<PhoneModel>,
  ) {
    const modelId = parseInt(id, 10);
    if (isNaN(modelId)) {
      throw new BadRequestException('Model ID không hợp lệ');
    }

    this.logger.log(`Cập nhật phone model: ${modelId}`);
    try {
      const model = await this.phoneModelService.updatePhoneModel(modelId, modelData);
      return {
        success: true,
        message: 'Cập nhật dòng máy thành công',
        data: model,
      };
    } catch (error) {
      this.logger.error(`Lỗi: ${error.message}`);
      throw new BadRequestException('Không thể cập nhật dòng máy');
    }
  }

  /**
   * DELETE /phone-models/:id
   * Xóa dòng máy (Admin)
   */
  @Delete(':id')
  async deletePhoneModel(@Param('id') id: string) {
    const modelId = parseInt(id, 10);
    if (isNaN(modelId)) {
      throw new BadRequestException('Model ID không hợp lệ');
    }

    this.logger.log(`Xóa phone model: ${modelId}`);
    try {
      await this.phoneModelService.deletePhoneModel(modelId);
      return {
        success: true,
        message: 'Xóa dòng máy thành công',
      };
    } catch (error) {
      this.logger.error(`Lỗi: ${error.message}`);
      throw new BadRequestException('Không thể xóa dòng máy');
    }
  }

  /**
   * POST /phone-models/product/:productId/compatibility
   * Set dòng máy tương thích cho sản phẩm (Admin)
   */
  @Post('product/:productId/compatibility')
  async setProductCompatibility(
    @Param('productId') productId: string,
    @Body() body: { phoneModelIds: number[] },
  ) {
    const id = parseInt(productId, 10);
    if (isNaN(id)) {
      throw new BadRequestException('Product ID không hợp lệ');
    }

    if (!Array.isArray(body.phoneModelIds)) {
      throw new BadRequestException('phoneModelIds phải là mảng');
    }

    this.logger.log(`Set compatibility cho product ${id}: ${body.phoneModelIds.length} models`);
    try {
      await this.phoneModelService.setProductCompatibility(id, body.phoneModelIds);
      return {
        success: true,
        message: 'Cập nhật tương thích thành công',
      };
    } catch (error) {
      this.logger.error(`Lỗi: ${error.message}`);
      throw new BadRequestException('Không thể cập nhật tương thích');
    }
  }
}
