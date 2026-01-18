import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';

interface FormDataBody {
  category?: string[] | string;
  ingredients?: unknown;
  steps?: unknown;
}

@Injectable()
export class FormDataInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context
      .switchToHttp()
      .getRequest<Request<object, any, FormDataBody>>();

    // ✅ category
    if (request.body?.category) {
      request.body.category = Array.isArray(request.body.category)
        ? request.body.category
        : [request.body.category];
    }

    // ✅ ingredients
    if (request.body?.ingredients) {
      if (typeof request.body.ingredients === 'string') {
        try {
          request.body.ingredients = JSON.parse(request.body.ingredients);
        } catch (e) {
          console.warn('⚠️ No se pudo parsear ingredients:', e);
        }
      }
    }

    // ✅ steps
    if (request.body?.steps) {
      if (typeof request.body.steps === 'string') {
        try {
          request.body.steps = JSON.parse(request.body.steps);
        } catch (e) {
          console.warn('⚠️ No se pudo parsear steps:', e);
        }
      }
    }

    console.log('🔍 FormDataInterceptor - body procesado:', {
      hasCategory: !!request.body?.category,
      hasIngredients: !!request.body?.ingredients,
      hasSteps: !!request.body?.steps,
      ingredientsType: typeof request.body?.ingredients,
      stepsType: typeof request.body?.steps,
    });

    return next.handle();
  }
}
