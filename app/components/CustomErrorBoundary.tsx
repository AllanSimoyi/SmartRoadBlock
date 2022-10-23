import { Text, VStack } from '@chakra-ui/react';
import { BoundaryError } from "~/components/BoundaryError";
import { PrimaryButton } from './PrimaryButton';

interface Props {
  error: Error;
  reload: () => void;
}

export function CustomErrorBoundary (props: Props) {
  const { error, reload } = props;
  console.log("Error >>>", error);
  return (
    <BoundaryError title="Something unexpected happened">
      <VStack spacing={4} py={2}>
        <Text fontSize="md">
          <code>We're already working on it.</code>
        </Text>
        <PrimaryButton onClick={reload}>Reload</PrimaryButton>
      </VStack>
    </BoundaryError>
  )
}