import { Injectable } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

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
    const productSales: Record<string, {name: string, sold: number, revenue: number}> = {};
    for (const o of orders) {
      if (Array.isArray(o.products)) {
        for (const p of o.products) {
          const key = String(p.id);
          if (!productSales[key]) {
            const prod = products.find(pr => pr.id == p.id) || {};
            productSales[key] = { name: prod.name || '', sold: 0, revenue: 0 };
          }
          productSales[key].sold += p.quantity || 0;
          productSales[key].revenue += (p.quantity || 0) * (p.price || 0);
        }
      }
    }
    const bestSellers = Object.entries(productSales)
      .sort((a,b) => b[1].sold - a[1].sold)
      .slice(0,5)
      .map(([id, info]) => ({ id, ...info }));

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
