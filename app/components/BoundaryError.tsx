import {
  Alert, AlertDescription, AlertIcon,
  AlertTitle
} from '@chakra-ui/react';
import { getSlideUpScrollVariants } from '../lib/scroll-variants';
import { ScrollAnimation } from './ScrollAnimation';
import { UltraCenteredView } from './UltraCenteredView';

interface Props {
  title: string;
  children: React.ReactNode;
}

export function BoundaryError (props: Props) {
  const { title, children } = props;
  return (
    <UltraCenteredView py={4}>
      <ScrollAnimation variants={getSlideUpScrollVariants({ delay: 0.1 })}>
        <Alert
          flexDirection='column' alignItems='center' justifyContent='center'
          status='error' variant='subtle' textAlign='center' minHeight='200px'
          borderRadius={10}
        >
          <AlertIcon boxSize='40px' mr={0} />
          <AlertTitle mt={4} mb={1} fontSize='lg'>{title}</AlertTitle>
          <AlertDescription maxWidth='sm'>{children}</AlertDescription>
        </Alert>
      </ScrollAnimation>
    </UltraCenteredView>
  )
}