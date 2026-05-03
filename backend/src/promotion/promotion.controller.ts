import { Controller, Get } from '@nestjs/common';
import { PromotionResponse, PromotionService } from './promotion.service';

@Controller('promotions')
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) {}

  @Get()
  async getPromotions(): Promise<PromotionResponse> {
    return await this.promotionService.getPromotions();
  }
}
