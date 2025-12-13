import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { CategoryService } from './category.service';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async getCategories() {
    return await this.categoryService.getCategories();
  }

  @Get('with-count')
  async getCategoriesWithProductCount() {
    return await this.categoryService.getCategoriesWithProductCount();
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

  @Post()
  async createCategory(@Body() categoryData: any) {
    return await this.categoryService.createCategory(categoryData);
  }

  @Put(':id')
  async updateCategory(@Param('id') id: string, @Body() categoryData: any) {
    return await this.categoryService.updateCategory(parseInt(id), categoryData);
  }

  @Delete(':id')
  async deleteCategory(@Param('id') id: string) {
    return await this.categoryService.deleteCategory(parseInt(id));
  }
}
