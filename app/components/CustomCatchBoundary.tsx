import { Text, VStack } from '@chakra-ui/react';
import type { ThrownResponse } from "@remix-run/react";
import { Link } from "@remix-run/react";
import { BoundaryError } from "~/components/BoundaryError";
import { PrimaryButton } from './PrimaryButton';

interface Props {
  reload: () => void;
  caught: ThrownResponse<number, any>
}

export function CustomCatchBoundary (props: Props) {
  const { reload, caught } = props;
  switch (caught.status) {
    case 400: {
      return (
        <BoundaryError title="400 - Bad Request">
          <VStack spacing={4} py={2}>
            <Text fontSize="md">
              <code>{JSON.stringify(caught.data, null, 2)}</code>
            </Text>
            <PrimaryButton onClick={reload}>Reload</PrimaryButton>
          </VStack>
        </BoundaryError>
      );
    }
    case 404: {
      return (
        <BoundaryError title="404 - Not Found">
          <VStack spacing={4} py={2}>
            <Text fontSize="md">
              <code>{JSON.stringify(caught.data, null, 2)}</code>
            </Text>
            <Link to={`/`}>
              <PrimaryButton w="100%">Go To Home Page</PrimaryButton>
            </Link>
          </VStack>
        </BoundaryError>
      );
    }
    case 401: {
      return (
        <BoundaryError title="401 - Unauthorised">
          <VStack spacing={4} py={2}>
            <Text fontSize="md">
              <code>{JSON.stringify(caught.data, null, 2)}</code>
            </Text>
            <Link to={`/login`}>
              <PrimaryButton w="100%">Go To Log In Page</PrimaryButton>
            </Link>
          </VStack>
        </BoundaryError>
      );
    }
    case 403: {
      return (
        <BoundaryError title="403 - Forbidden">
          <VStack spacing={4} py={2}>
            <Text fontSize="md">
              <code>{JSON.stringify(caught.data, null, 2)}</code>
            </Text>
            <Link to={`/login`}>
              <PrimaryButton w="100%">Go To Log In Page</PrimaryButton>
            </Link>
          </VStack>
        </BoundaryError>
      );
    }
    default: {
      throw new Error(`Unhandled error: ${ caught.status }`);
    }
  }
}