import { Injectable } from '@nestjs/common';
import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';

@Injectable()
@Injectable()
export class UploadVideoClou {
  async uploadVideo(file: Express.Multer.File): Promise<UploadApiResponse> {
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

            resolve(result);
          },
        )
        .end(file.buffer);
    });
  }
}
