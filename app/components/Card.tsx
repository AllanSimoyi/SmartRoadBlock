import type { StackProps} from "@chakra-ui/react";
import { VStack } from "@chakra-ui/react"

interface Props extends StackProps {
  children: React.ReactNode
}

export function Card (props: Props) {
  const { children, ...restOfProps } = props
  return (
    <VStack
      align="stretch"
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      boxShadow="md"
      bg="#fff"
      spacing={0}
      {...restOfProps}
    >
      {children}
    </VStack>
  )
}
