import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // API tổng hợp số liệu dashboard admin
  @Get('admin/dashboard')
  async getAdminDashboard() {
    return await this.appService.getAdminDashboard();
  }
}
