import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest<{ originalUrl?: string; url: string }>();

    return next.handle().pipe(
      map((data) => ({
        code: 0,
        message: 'ok',
        data,
        timestamp: new Date().toISOString(),
        path: request.originalUrl ?? request.url,
      })),
    );
  }
}
