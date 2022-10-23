export type UploadState = 'uploading' | 'uploaded' | 'error' | 'idle';

export interface ImageUploadResult {
  publicId: string;
  url: string;
  height: number;
  width: number;
}

export async function handleImageUpload (file: File, CLOUD_NAME: string, UPLOAD_RESET: string) {
  return new Promise<ImageUploadResult>((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_RESET);
    formData.append('tags', 'rte');
    formData.append('context', '');

    const url = `https://api.cloudinary.com/v1_1/${ CLOUD_NAME }/upload`;

    fetch(url, {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((result) => {
        return resolve({
          publicId: result.public_id as string,
          url: result.url as string,
          width: result.width as number,
          height: result.height as number,
        });
      })
      .catch((_) => {
        // console.log('Something went wrong', message as string);
        reject(new Error('Upload failed'));
      });
  });
}
