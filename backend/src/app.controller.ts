import { Controller, Get, Query, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { SupabaseService } from './supabase.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // ============ TEST ENDPOINTS ============
  @Get('supabase-test')
  async supabaseTest() {
    return await this.supabaseService.getCustomers();
  }

  @Get('customers')
  async getCustomers() {
    const result = await this.supabaseService.getCustomers();
    return result.data || [];
  }

  @Get('products')
  async getProducts(@Query('limit') limit: string = '10') {
    const result = await this.supabaseService.getProducts(parseInt(limit));
    return result.data || [];
  }

  @Get('orders')
  async getOrders(@Query('limit') limit: string = '20') {
    const result = await this.supabaseService.getOrders(parseInt(limit));
    return result.data || [];
  }

  @Get('categories')
  async getCategories() {
    const result = await this.supabaseService.getCategories();
    return result.data || [];
  }

  @Get('categories/root')
  async getRootCategories() {
    const result = await this.supabaseService.getRootCategories();
    return result.data || [];
  }

  @Get('categories/slug/:slug')
  async getCategoryBySlug(@Param('slug') slug: string) {
    const result = await this.supabaseService.getCategoryBySlug(slug);
    return result.data || null;
  }

  @Get('categories/:id/children')
  async getChildCategories(@Param('id') id: string) {
    const result = await this.supabaseService.getChildCategories(parseInt(id));
    return result.data || [];
  }

  @Get('categories/:id')
  async getCategoryById(@Param('id') id: string) {
    const result = await this.supabaseService.getCategoryById(parseInt(id));
    return result.data || null;
  }
}
