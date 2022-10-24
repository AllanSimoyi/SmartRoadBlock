import { Button, ButtonGroup, Heading, HStack, Spacer, Stack, Text, VStack } from "@chakra-ui/react";
import { Form, Link } from "@remix-run/react";
import type { CurrentUser } from "~/lib/auth.validations";
import { CenteredView } from "./CenteredView";
import { OutlinedButton } from "./OutlinedButton";

interface NavItem {
  text: string;
  href: string;
  primary?: boolean;
}

const navItems: NavItem[] = [
  { text: "Create Account", href: "/", primary: true },
  { text: "Log In", href: "/login" },
];

interface Props {
  currentUser: CurrentUser | undefined;
}

export function Toolbar (props: Props) {
  const { currentUser } = props;
  return (
    <VStack bgColor={"white"} align={"stretch"} boxShadow="md">
      <CenteredView>
        <Stack direction={{ base: "column", lg: "row" }} align="center" py={4}>
          <Link to="/">
            <Heading color="green.600" size="lg" fontWeight="bold">
              SMART ROAD BLOCK
            </Heading>
          </Link>
          <Spacer />
          {!currentUser && (
            <ButtonGroup>
              {navItems.map(item => (
                <VStack key={item.text} p={0} align="stretch">
                  <Link prefetch="intent" to={item.href}>
                    <Button variant={item.primary ? "solid" : "ghost"} colorScheme={"green"}>
                      {item.text}
                    </Button>
                  </Link>
                </VStack>
              ))}
            </ButtonGroup>
          )}
          {currentUser && (
            <HStack p={0} justify="flex-end" align="center">
              <Text color="white" fontSize="md" px="4" noOfLines={1}>
                {currentUser.username}
              </Text>
              <Form action="/logout" method="post">
                <OutlinedButton size="sm" type="submit" w="100%" colorScheme="whiteAlpha">
                  Log Out
                </OutlinedButton>
              </Form>
            </HStack>
          )}
        </Stack>
      </CenteredView>
    </VStack>
  )
}