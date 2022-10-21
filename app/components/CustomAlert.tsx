import {
  Alert,
  AlertIcon
} from '@chakra-ui/react';

interface Props {
  status: "error" | "info" | "warning";
  children: React.ReactNode;
}

export function CustomAlert (props: Props) {
  const { children, status } = props;
  return (
    <Alert borderRadius={6} status={status}>
      <AlertIcon />
      {children}
    </Alert>
  )
}