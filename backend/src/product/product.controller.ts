import { Controller, Get, Post, Put, Delete, Query, Param, Body } from '@nestjs/common';
import { ProductService } from './product.service';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async getProducts(@Query('limit') limit: string = '10') {
    return await this.productService.getProducts(parseInt(limit));
  }

  // Season routes - đặt trước :id để tránh conflict
  @Get('season/counts')
  async getSeasonProductCounts() {
    return await this.productService.getSeasonProductCounts();
  }

  @Get('season/:season')
  async getProductsBySeason(@Param('season') season: string) {
    return await this.productService.getProductsBySeason(season);
  }

  @Get(':id')
  async getProductById(@Param('id') id: string) {
    return await this.productService.getProductById(parseInt(id));
  }

  @Post()
  async createProduct(@Body() productData: any) {
    return await this.productService.createProduct(productData);
  }

  @Put(':id')
  async updateProduct(@Param('id') id: string, @Body() productData: any) {
    return await this.productService.updateProduct(parseInt(id), productData);
  }

  @Delete(':id')
  async deleteProduct(@Param('id') id: string) {
    return await this.productService.deleteProduct(parseInt(id));
  }
}
