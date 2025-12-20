import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { ProductModule } from 'src/product/product.module';

@Module({
    imports: [ProductModule],
  providers: [CloudinaryService],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
