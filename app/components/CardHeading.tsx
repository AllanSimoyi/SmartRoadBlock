import type { StackProps} from "@chakra-ui/react";
import { Heading, VStack } from "@chakra-ui/react"

interface Props extends StackProps {
  children: React.ReactNode
}

export function CardHeading (props: Props) {
  const { children, ...restOfProps } = props
  return (
    <VStack
      justify="center"
      align="center"
      borderBottom="1px"
      borderColor="gray.200"
      borderStyle="dashed"
      p="4"
      {...restOfProps}
    >
      <Heading role="heading" size="md">
        {children}
      </Heading>
    </VStack>
  )
}
