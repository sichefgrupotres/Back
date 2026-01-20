import { Injectable } from '@nestjs/common';
import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';

@Injectable()
export class UploadVideoCloud {
  async uploadVideo(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse & { thumbnailUrl: string }> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: 'video',
            folder: 'tutorials',
          },
          (error, result) => {
            if (error || !result) {
              reject(
                error instanceof Error
                  ? error
                  : new Error('Error al subir el video a Cloudinary'),
              );
              return;
            }

            const thumbnailUrl = cloudinary.url(result.public_id, {
              resource_type: 'video',
              format: 'jpg',
              transformation: [
                { width: 600, height: 400, crop: 'fill' },
                { start_offset: 'auto' },
              ],
            });

            resolve({
              ...result,
              thumbnailUrl,
            });
          },
        )
        .end(file.buffer);
    });
  }
}
