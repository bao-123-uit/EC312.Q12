import { Controller, Get, Query, Param } from '@nestjs/common';
import { ProductService } from './product.service';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async getProducts(@Query('limit') limit: string = '10') {
    return await this.productService.getProducts(parseInt(limit));
  }

  @Get(':id')
  async getProductById(@Param('id') id: string) {
    return await this.productService.getProductById(parseInt(id));
  }
}
