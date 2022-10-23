import { Button, ButtonGroup, Heading, Spacer, Stack, VStack } from "@chakra-ui/react";
import { Link } from "@remix-run/react";
import type { CurrentUser } from "~/lib/auth.validations";
import { CenteredView } from "./CenteredView";

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
        </Stack>
      </CenteredView>
    </VStack>
  )
}