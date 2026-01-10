import { Injectable } from '@nestjs/common';
import toStream from 'buffer-to-stream';
import { UploadApiResponse, v2 } from 'cloudinary';

@Injectable()
export class UploadImagenClou {
  async uploadImage(
    file: Express.Multer.File,
    options?: Record<string, any>,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream(
        {
          resource_type: 'image',
          ...options,
        },
        (error, result) => {
          if (error || !result) {
            return reject(new Error('Error al cargar la imagen'));
          }
          resolve(result);
        },
      );

      toStream(file.buffer).pipe(upload);
    });
  }
}
