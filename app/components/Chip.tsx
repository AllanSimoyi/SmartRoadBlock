import type { StackProps} from "@chakra-ui/react";
import { VStack } from "@chakra-ui/react"

interface Props extends StackProps {
  children: React.ReactNode
}

export function Chip (props: Props) {
  const { children, ...otherProps } = props
  return (
    <VStack align="stretch" bgColor="gray.50" borderRadius="md" p="2" {...otherProps}>
      {children}
    </VStack>
  )
}
