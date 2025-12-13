import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { CollectionService } from './collection.service';

@Controller('collections')
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  // GET /collections - Lấy tất cả bộ sưu tập
  @Get()
  async getAllCollections() {
    return this.collectionService.getAllCollections();
  }

  // GET /collections/type/:type - Lấy bộ sưu tập theo loại (main, seasonal)
  @Get('type/:type')
  async getCollectionsByType(@Param('type') type: string) {
    return this.collectionService.getCollectionsByType(type);
  }

  // GET /collections/counts - Lấy số lượng sản phẩm trong mỗi bộ sưu tập
  @Get('counts')
  async getCollectionProductCounts() {
    return this.collectionService.getCollectionProductCounts();
  }

  // GET /collections/slug/:slug - Lấy bộ sưu tập theo slug
  @Get('slug/:slug')
  async getCollectionBySlug(@Param('slug') slug: string) {
    return this.collectionService.getCollectionBySlug(slug);
  }

  // GET /collections/slug/:slug/products - Lấy sản phẩm trong bộ sưu tập
  @Get('slug/:slug/products')
  async getProductsByCollection(@Param('slug') slug: string) {
    return this.collectionService.getProductsByCollection(slug);
  }

  // GET /collections/product/:productId - Lấy các bộ sưu tập của sản phẩm
  @Get('product/:productId')
  async getProductCollections(@Param('productId') productId: number) {
    return this.collectionService.getProductCollections(productId);
  }

  // POST /collections - Tạo bộ sưu tập mới
  @Post()
  async createCollection(
    @Body() collectionData: {
      collection_name: string;
      collection_slug: string;
      collection_description?: string;
      collection_image?: string;
      collection_gradient?: string;
      collection_icon?: string;
      collection_type?: string;
      display_order?: number;
    },
  ) {
    return this.collectionService.createCollection(collectionData);
  }

  // POST /collections/product - Thêm sản phẩm vào bộ sưu tập
  @Post('product')
  async addProductToCollection(
    @Body() data: { productId: number; collectionId: number; displayOrder?: number },
  ) {
    return this.collectionService.addProductToCollection(
      data.productId,
      data.collectionId,
      data.displayOrder || 0,
    );
  }

  // PUT /collections/:id - Cập nhật bộ sưu tập
  @Put(':id')
  async updateCollection(
    @Param('id') id: number,
    @Body() collectionData: Partial<{
      collection_name: string;
      collection_description: string;
      collection_image: string;
      collection_gradient: string;
      collection_icon: string;
      collection_type: string;
      display_order: number;
      is_active: boolean;
    }>,
  ) {
    return this.collectionService.updateCollection(id, collectionData);
  }

  // PUT /collections/product/:productId - Cập nhật các bộ sưu tập của sản phẩm
  @Put('product/:productId')
  async updateProductCollections(
    @Param('productId') productId: number,
    @Body() data: { collectionIds: number[] },
  ) {
    return this.collectionService.updateProductCollections(productId, data.collectionIds);
  }

  // DELETE /collections/:id - Xóa bộ sưu tập
  @Delete(':id')
  async deleteCollection(@Param('id') id: number) {
    return this.collectionService.deleteCollection(id);
  }

  // DELETE /collections/product - Xóa sản phẩm khỏi bộ sưu tập
  @Delete('product')
  async removeProductFromCollection(
    @Body() data: { productId: number; collectionId: number },
  ) {
    return this.collectionService.removeProductFromCollection(data.productId, data.collectionId);
  }
}
