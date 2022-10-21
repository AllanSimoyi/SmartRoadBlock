import { HStack, VStack } from "@chakra-ui/react";
import type { StackProps, } from "@chakra-ui/react";

interface Props extends StackProps {
  children: React.ReactNode;
}

export function CenteredView (props: Props) {
  const { children, ...restOfProps } = props
  return (
    <>
      <HStack justify="center" align="stretch" {...restOfProps}>
        <VStack align="stretch" w={{ base: "100%", md: "90%", lg: "80%" }}>
          {children}
        </VStack>
      </HStack>
    </>
  )
}