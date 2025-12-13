import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ContactService } from './contact.service';

@Controller('contacts')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Get()
  async getAllMessages(@Query('limit') limit?: number) {
    const result = await this.contactService.getAllMessages();
    return result.data || [];
  }

  @Get(':id')
  async getMessageById(@Param('id') id: string) {
    const result = await this.contactService.getMessageById(parseInt(id));
    return result.data;
  }

  @Post()
  async createMessage(@Body() body: any) {
    const messageData = {
      name: body.name,
      email: body.email,
      phone: body.phone || null,
      subject: body.subject || 'Liên hệ',
      message: body.message,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    const result = await this.contactService.createMessage(messageData);
    return { success: !result.error, data: result.data, error: result.error };
  }

  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: any) {
    const result = await this.contactService.updateMessageStatus(parseInt(id), body.status);
    return { success: !result.error, data: result.data, error: result.error };
  }

  @Delete(':id')
  async deleteMessage(@Param('id') id: string) {
    const result = await this.contactService.deleteMessage(parseInt(id));
    return { success: !result.error, error: result.error };
  }
}
