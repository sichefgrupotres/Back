import { Injectable } from "@nestjs/common";
import toStream from "buffer-to-stream";
import { UploadApiResponse, v2 } from "cloudinary";

@Injectable()
export class UploadImagenClou {
    async uploadImage(file: Express.Multer.File): Promise<UploadApiResponse> {
        return new Promise((resolve, reject) => {
            const upload = v2.uploader.upload_stream(
                { resource_type: "auto" },
                (error, result) => {
                    if (error || !result) {
                        reject(
                            error || new Error(
                                'Error al cargar la imagen'))
                    } else {
                        resolve(result)
                    }
                }
            )
            toStream(file.buffer).pipe(upload)
        })
    }

}