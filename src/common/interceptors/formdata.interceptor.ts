import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

@Injectable()
export class FormDataInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();

    if (request.body?.category) {
      request.body.category = Array.isArray(request.body.category)
        ? request.body.category
        : [request.body.category];
    }

    return next.handle();
  }
}
