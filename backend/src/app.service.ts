import { Injectable } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { getSupabaseClient } from './repositories/base.repository';

@Injectable()
export class AppService {
  constructor(private readonly supabaseService: SupabaseService) {}

  getHello(): string {
    return 'Hello World!';
  }

  // Tổng hợp số liệu dashboard admin
  async getAdminDashboard() {
    // Tổng doanh thu
    const ordersRes = await this.supabaseService.getOrders(1000);
    const orders = ordersRes.data || [];
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    // Số đơn hàng
    const orderCount = orders.length;
    // Số sản phẩm
    const productsRes = await this.supabaseService.getProducts(1000);
    const products = productsRes.data || [];
    const productCount = products.length;
    // Số khách hàng
    const customersRes = await this.supabaseService.getCustomers();
    const customers = customersRes.data || [];
    const customerCount = customers.length;
    // Doanh thu 7 ngày qua
    const now = new Date();
    const revenue7Days = Array(7).fill(0);
    for (const o of orders) {
      if (o.created_at) {
        const d = new Date(o.created_at);
        const diff = Math.floor((now.getTime() - d.getTime()) / (1000*60*60*24));
        if (diff >= 0 && diff < 7) {
          revenue7Days[6-diff] += o.total_amount || 0;
        }
      }
    }
    // Top sản phẩm bán chạy
    const supabase = getSupabaseClient();
    const { data: orderItems, error: orderItemsError } = await supabase
      .from('order_items')
      .select(`
        product_id,
        quantity,
        unit_price,
        total_price,
        products (
          product_id,
          product_name,
          image_url,
          product_images (
            image_url,
            is_primary
          )
        )
      `);

    const productSales: Record<string, { name: string; sold: number; revenue: number; image_url: string | null }> = {};
    if (!orderItemsError && Array.isArray(orderItems)) {
      for (const item of orderItems) {
        const key = String(item.product_id);
        if (!productSales[key]) {
          const product = Array.isArray(item.products) ? item.products[0] : item.products;
          const primaryImage =
            product?.product_images?.find((img: any) => img.is_primary) ||
            product?.product_images?.[0];
          productSales[key] = {
            name: product?.product_name || '',
            sold: 0,
            revenue: 0,
            image_url: primaryImage?.image_url || product?.image_url || null
          };
        }
        const qty = item.quantity || 0;
        const itemTotal = item.total_price || (qty * (item.unit_price || 0));
        productSales[key].sold += qty;
        productSales[key].revenue += itemTotal;
      }
    }

    const bestSellers = Object.entries(productSales)
      .sort((a, b) => b[1].sold - a[1].sold)
      .slice(0, 5)
      .map(([id, info]) => ({ id: Number(id), ...info }));

    if (bestSellers.length === 0 && products.length > 0) {
      const fallbackProducts = products
        .slice(0, 5)
        .map((product: any) => ({
          id: product.product_id || product.id,
          name: product.product_name || product.name || '',
          sold: 0,
          revenue: 0,
          image_url: product.image_url || null
        }));
      bestSellers.push(...fallbackProducts);
    }

    return {
      totalRevenue,
      orderCount,
      productCount,
      customerCount,
      revenue7Days,
      bestSellers
    };
  }
}
