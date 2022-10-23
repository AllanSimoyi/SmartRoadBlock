import { HStack, Text, VStack } from '@chakra-ui/react';
import type { ChangeEvent } from 'react';
import { useCallback } from 'react';
import type { UploadState } from '../lib/imageUploading';
import { useIsSubmitting } from './ActionContextProvider';
import { ImageUploadIcon } from './ImageUploadIcon';

interface Props {
  onChange: (files: File[]) => void;
  uploadState: UploadState;
  uploadError: string;
  publicId: string;
  identifier: string;
}

export function UploadImage (props: Props) {
  const { onChange, uploadState, uploadError, publicId, identifier } = props;
  const isProcessing = useIsSubmitting();
  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      onChange([event.target.files[0]!]);
    }
  }, [onChange]);
  return (
    <>
      <label htmlFor={`file${ identifier }`}>
        <VStack justify="center" align="flex-start" border='1px' borderColor='gray.200' borderRadius={"md"} p="4" cursor={"pointer"} _hover={{ background: "gray.100" }}>
          <HStack spacing="12px">
            <ImageUploadIcon
              status={uploadState}
              publicId={publicId}
              cursor={"pointer"} 
              style={{ color: getIconColor(uploadState) }}
            />
            <div>
              <Text cursor={"pointer"} fontSize="md">Upload {identifier}</Text>
              <Text cursor={"pointer"} fontSize="xs">The file should not exceed 5mb</Text>
              {uploadError && (<Text fontSize="md" color="red.600">{uploadError}</Text>)}
            </div>
          </HStack>
        </VStack>
      </label>
      <input disabled={isProcessing} onChange={handleChange} id={`file${ identifier }`} accept="image/*" type="file" style={{ position: "absolute", visibility: "hidden", opacity: 0, top: 0, left: 0, }} />
    </>
  );
}

function getIconColor (status: UploadState) {
  const mapping: [string, string][] = [
    ["uploaded", "green"],
    ["uploading", "blue"],
    ["error", "red"],
  ];
  const match = mapping.find(el => el[0] === status);
  return match?.[1] || "grey";
}
