import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  // Lấy danh sách yêu thích của user
  @UseGuards(JwtAuthGuard)
  @Get()
  async getWishlist(@Request() req) {
    const userId = req.user.sub || req.user.id;
    return this.wishlistService.getWishlist(userId);
  }

  // Lấy danh sách product_id trong wishlist
  @UseGuards(JwtAuthGuard)
  @Get('product-ids')
  async getWishlistProductIds(@Request() req) {
    const userId = req.user.sub || req.user.id;
    return this.wishlistService.getWishlistProductIds(userId);
  }

  // Thêm sản phẩm vào wishlist
  @UseGuards(JwtAuthGuard)
  @Post(':productId')
  async addToWishlist(
    @Request() req,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    const userId = req.user.sub || req.user.id;
    return this.wishlistService.addToWishlist(userId, productId);
  }

  // Xóa sản phẩm khỏi wishlist
  @UseGuards(JwtAuthGuard)
  @Delete(':productId')
  async removeFromWishlist(
    @Request() req,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    const userId = req.user.sub || req.user.id;
    return this.wishlistService.removeFromWishlist(userId, productId);
  }

  // Toggle wishlist (thêm/xóa)
  @UseGuards(JwtAuthGuard)
  @Post('toggle/:productId')
  async toggleWishlist(
    @Request() req,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    const userId = req.user.sub || req.user.id;
    return this.wishlistService.toggleWishlist(userId, productId);
  }

  // Kiểm tra sản phẩm có trong wishlist không
  @UseGuards(JwtAuthGuard)
  @Get('check/:productId')
  async isInWishlist(
    @Request() req,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    const userId = req.user.sub || req.user.id;
    const isInWishlist = await this.wishlistService.isInWishlist(userId, productId);
    return { isInWishlist };
  }
}
