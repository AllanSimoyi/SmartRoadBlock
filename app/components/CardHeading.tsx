import type { StackProps} from "@chakra-ui/react";
import { Heading, VStack } from "@chakra-ui/react"

interface Props extends StackProps {
  children: React.ReactNode,
  noBottomBorder?: boolean
}

export function CardHeading (props: Props) {
  const { children, noBottomBorder = false, ...restOfProps } = props
  return (
    <VStack
      justify="center"
      align="center"
      borderBottom={noBottomBorder ? "none" : "1px"}
      borderColor={noBottomBorder ? "none" : "gray.200"}
      borderStyle={noBottomBorder ? "none" : "dashed"}
      p="4"
      {...restOfProps}
    >
      <Heading role="heading" size="md">
        {children}
      </Heading>
    </VStack>
  )
}
