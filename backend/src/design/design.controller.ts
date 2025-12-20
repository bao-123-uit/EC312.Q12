import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DesignService } from './design.service';
import type { CreateDesignDto, UpdateDesignDto, SubmitDesignDto } from './design.service';

@Controller('designs')
export class DesignController {
  constructor(private readonly designService: DesignService) {}

  // ============ PHONE TEMPLATES ============

  // Lấy danh sách templates
  @Get('templates')
  async getTemplates() {
    return this.designService.getPhoneTemplates();
  }

  // Lấy template theo ID
  @Get('templates/:templateId')
  async getTemplateById(@Param('templateId', ParseIntPipe) templateId: number) {
    return this.designService.getTemplateById(templateId);
  }

  // Tạo template mới
  @Post('templates')
  async createTemplate(@Body() dto: any) {
    return this.designService.createTemplate(dto);
  }

  // Cập nhật template
  @Put('templates/:templateId')
  async updateTemplate(
    @Param('templateId', ParseIntPipe) templateId: number,
    @Body() dto: any,
  ) {
    return this.designService.updateTemplate(templateId, dto);
  }

  // Xóa template
  @Delete('templates/:templateId')
  async deleteTemplate(@Param('templateId', ParseIntPipe) templateId: number) {
    return this.designService.deleteTemplate(templateId);
  }

  // ============ DESIGNS ============

  // Tạo thiết kế mới
  @Post()
  async createDesign(@Body() dto: CreateDesignDto) {
    return this.designService.createDesign(dto);
  }

  // Lấy thiết kế theo ID
  @Get(':designId')
  async getDesignById(@Param('designId', ParseIntPipe) designId: number) {
    return this.designService.getDesignById(designId);
  }

  // Cập nhật thiết kế
  @Put(':designId')
  async updateDesign(
    @Param('designId', ParseIntPipe) designId: number,
    @Body() dto: UpdateDesignDto,
  ) {
    return this.designService.updateDesign(designId, dto);
  }

  // Gửi thiết kế cho admin
  @Post(':designId/submit')
  async submitDesign(
    @Param('designId', ParseIntPipe) designId: number,
    @Body() dto: Omit<SubmitDesignDto, 'designId'>,
  ) {
    return this.designService.submitDesign({ ...dto, designId });
  }

  // Lấy thiết kế của user
  @Get('user/:userId')
  async getUserDesigns(@Param('userId') userId: string) {
    return this.designService.getUserDesigns(userId);
  }

  // Xóa thiết kế
  @Delete(':designId')
  async deleteDesign(@Param('designId', ParseIntPipe) designId: number) {
    return this.designService.deleteDesign(designId);
  }

  // ============ ADMIN ============

  // Lấy tất cả thiết kế (admin)
  @Get('admin/all')
  async getAllDesigns(@Query('status') status?: string) {
    return this.designService.getAllDesigns(status);
  }

  // Duyệt thiết kế
  @Put('admin/:designId/approve')
  async approveDesign(
    @Param('designId', ParseIntPipe) designId: number,
    @Body('adminNotes') adminNotes?: string,
  ) {
    return this.designService.approveDesign(designId, adminNotes);
  }

  // Từ chối thiết kế
  @Put('admin/:designId/reject')
  async rejectDesign(
    @Param('designId', ParseIntPipe) designId: number,
    @Body('adminNotes') adminNotes: string,
  ) {
    return this.designService.rejectDesign(designId, adminNotes);
  }

  // ============ IMAGES ============

  // Upload ảnh cho thiết kế
  @Post(':designId/images')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Param('designId', ParseIntPipe) designId: number,
    @UploadedFile() file: any,
  ) {
    return this.designService.uploadDesignImage(designId, file);
  }

  // Lấy danh sách ảnh của thiết kế
  @Get(':designId/images')
  async getDesignImages(@Param('designId', ParseIntPipe) designId: number) {
    return this.designService.getDesignImages(designId);
  }
}
