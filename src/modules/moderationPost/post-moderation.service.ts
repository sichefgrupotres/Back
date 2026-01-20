import { Injectable } from '@nestjs/common';
import {
  SafetyService,
  TextModerationResult,
} from '../moderation/text/safety.service';
import {
  VisionService,
  VisionModerationResult,
} from '../moderation/imagenes/vision.service';
import { PostCreateDto } from '../moderation/Dto/post.create.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PostEvent } from '../../posts/post.event';
import { PostStatus } from '../../posts/dto/create-post.dto';
import { ModerationResult } from '../moderationPost/interfaces/result.interface';
import { ModerationResultGlobal } from './interfaces/resultGlobal-interface';

@Injectable()
export class PostModerationService {
  constructor(
    private readonly safetyService: SafetyService,
    private readonly visionService: VisionService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async moderatePost(
    post: PostCreateDto,
    userEmail: string,
  ): Promise<ModerationResultGlobal> {
    const text = `${post.title}\n${post.description}\n${post.ingredients}`;
    const textResponse: TextModerationResult =
      await this.safetyService.checkText(text);

    const textResult: ModerationResult = {
      status: textResponse.statusPost,
      category:
        (textResponse.category as ModerationResult['category']) ?? 'NONE',
      source: 'TEXT',
      cleanText: textResponse.cleanText,
      originalText: text,
    };

    let imageResult: ModerationResult | undefined;
    if (post.imageUrl) {
      const imageResponse: VisionModerationResult =
        await this.visionService.checkImage(post.imageUrl);

      const categoryMapped = this.mapImageCategory(imageResponse.categories);

      imageResult = {
        status: imageResponse.statusPost,
        category: categoryMapped,
        source: 'IMAGE',
      };
    }

    let finalStatus: PostStatus;
    let alertMessage = 'Su post fue publicado correctamente.';

    if (
      textResult.status === PostStatus.BLOCKED ||
      imageResult?.status === PostStatus.BLOCKED
    ) {
      finalStatus = PostStatus.BLOCKED;
      const categoryFinal =
        imageResult?.status === PostStatus.BLOCKED
          ? imageResult.category
          : textResult.category;
      alertMessage = `Este post fue bloqueado porque presentaba contenido ${categoryFinal}.`;

      this.eventEmitter.emit(
        'post.blocked',
        new PostEvent(
          post.title,
          post.imageUrl ?? '',
          userEmail,
          categoryFinal,
        ),
      );
    } else if (
      textResult.status === PostStatus.NEEDS_REVIEW ||
      imageResult?.status === PostStatus.NEEDS_REVIEW
    ) {
      finalStatus = PostStatus.NEEDS_REVIEW;
      const categoryFinal =
        imageResult?.status === PostStatus.NEEDS_REVIEW
          ? imageResult.category
          : textResult.category;
      alertMessage = `Su posteo presenta contenido ${categoryFinal}, será revisado por la app.`;
      console.log(`category FINAL : ${categoryFinal}`);
      this.eventEmitter.emit(
        'post.review',
        new PostEvent(
          post.title,
          post.imageUrl ?? '',
          userEmail,
          categoryFinal,
        ),
      );
    } else {
      finalStatus = PostStatus.SAFE;
      this.eventEmitter.emit(
        'post.created',
        new PostEvent(post.title, post.imageUrl ?? '', userEmail),
      );
    }

    const returnFinal = {
      statusPost: finalStatus,
      alertMessage,
      results: [textResult, ...(imageResult ? [imageResult] : [])],
    };
    return returnFinal;
  }

  private mapImageCategory(categories: {
    adult: string;
    spoof: string;
    medical: string;
    violence: string;
    racy: string;
  }): 'VIOLENCE' | 'SEXUAL' | 'INSULTO' | 'NONE' {
    if (
      categories.violence === 'LIKELY' ||
      categories.violence === 'VERY_LIKELY'
    ) {
      return 'VIOLENCE';
    }
    if (
      categories.adult === 'LIKELY' ||
      categories.adult === 'VERY_LIKELY' ||
      categories.racy === 'LIKELY'
    ) {
      return 'SEXUAL';
    }
    return 'NONE';
  }

  private buildTextMessage(textResponse: TextModerationResult): string {
    if (textResponse.statusPost === PostStatus.BLOCKED) {
      return `El texto fue bloqueado porque contenía insultos (${textResponse.insultosDetectados.join(', ')})`;
    }
    if (textResponse.statusPost === PostStatus.NEEDS_REVIEW) {
      return `El texto presenta contenido ${textResponse.category}, será revisado por la app.`;
    }
    return 'El texto no contiene problemas.';
  }
}
