import { useCallback, useState } from 'react';
import type { UploadState } from '~/lib/imageUploading';
import { handleImageUpload } from '~/lib/imageUploading';
import { useCloudinary } from '../components/CloudinaryContextProvider';

interface Props {
  initialUploadState: UploadState;
}

export function useUploadImages (props: Props) {
  const { initialUploadState } = props;
  const [uploadState, setUploadState] = useState<UploadState>(initialUploadState);
  const [uploadError, setUploadError] = useState('');
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_RESET } = useCloudinary();

  const uploadImages = useCallback(async (files: File[]) => {
    try {
      setUploadState('uploading');
      const results = await Promise.all(
        files.map((file) => handleImageUpload(file, CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_RESET))
      );
      setUploadState('uploaded');
      return results;
    } catch ({ message }) {
      setUploadError((message as string) || "Something went wrong, please try again");
      setUploadState('error');
      return [];
    }
  }, [CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_RESET]);

  return { uploadState, uploadError, uploadImages };
}
