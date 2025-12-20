import { Controller, Get, Post, Put, Delete, Query, Param, Body,UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductService } from './product.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
@Controller('products')
export class ProductController {
  constructor(
    // private readonly cloudinaryService: CloudinaryService,
    private readonly productService: ProductService
  ) {}

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

  // @Post('upload')
  // @UseInterceptors(FileInterceptor('image'))
  // async uploadProduct(
  //   @UploadedFile() file: Express.Multer.File,
  //   @Body('name') name: string,
  // ) {
  //   const imageUrl = await this.cloudinaryService.uploadImage(
  //     file.buffer,
  //     'products',
  //   );

  //   return this.productService.create({
  //     name,
  //     image_url: imageUrl,
  //   });
  // }
}
