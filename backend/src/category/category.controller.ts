import { Controller, Get, Param } from '@nestjs/common';
import { CategoryService } from './category.service';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async getCategories() {
    return await this.categoryService.getCategories();
  }

  @Get('root')
  async getRootCategories() {
    return await this.categoryService.getRootCategories();
  }

  @Get('slug/:slug')
  async getCategoryBySlug(@Param('slug') slug: string) {
    return await this.categoryService.getCategoryBySlug(slug);
  }

  @Get(':id/children')
  async getChildCategories(@Param('id') id: string) {
    return await this.categoryService.getChildCategories(parseInt(id));
  }

  @Get(':id')
  async getCategoryById(@Param('id') id: string) {
    return await this.categoryService.getCategoryById(parseInt(id));
  }
}
