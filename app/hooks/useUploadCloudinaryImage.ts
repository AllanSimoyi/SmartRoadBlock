import { useUploadImages } from "app/hooks/useUploadImage";
import { useCallback, useState } from "react";
import type { UploadState } from "~/lib/imageUploading";

interface Props {
  initialPublicId: string;
}

export interface UploadCloudinaryImageToolSet {
  onChange: (files: File[]) => Promise<void>;
  publicId: string;
  uploadState: UploadState;
  uploadError: string;
}

export function useUploadCloudinaryImage (props: Props): UploadCloudinaryImageToolSet {
  const { initialPublicId } = props;
  const [publicId, setPublicId] = useState(initialPublicId || '');
  const { uploadState, uploadError, uploadImages } = useUploadImages({
    initialUploadState: initialPublicId ? 'uploaded' : 'idle',
  });

  const onChange = useCallback(async (files: File[]) => {
    if (files?.length) {
      const results = await uploadImages(files);
      if (results.length) {
        setPublicId(results[0].publicId!);
      }
    }
  }, [uploadImages, setPublicId]);

  return { onChange, publicId, uploadState, uploadError }
}
