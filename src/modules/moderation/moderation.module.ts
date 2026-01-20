import { Module } from '@nestjs/common';
import { SafetyService } from './text/safety.service';
import { VisionService } from './imagenes/vision.service';

@Module({
  providers: [SafetyService, VisionService],
  exports: [SafetyService, VisionService],
})
export class ModerationModule {}
