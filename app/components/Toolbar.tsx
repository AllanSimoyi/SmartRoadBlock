import { Button, ButtonGroup, Heading, HStack, Image, Spacer, Stack, Text, VStack } from "@chakra-ui/react";
import { Link } from "@remix-run/react";
import type { CurrentUser } from "~/auth/validations";
import { ADMIN, APPLICANT, LENDER } from "~/auth/validations";
import { AdminDropDownMenu } from "~/users/components/AdminDropDownMenu";
import { ApplicantDropDownMenu } from "~/users/components/ApplicantDropDownMenu";
import { LenderDropDownMenu } from "~/users/components/LenderDropDownMenu";
import logo from "../../../public/images/logo.png";
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
        <Stack direction={{ base: "column", lg: "row" }} align="center" p={4}>
          <HStack align="center" spacing={4}>
            <Link to="/">
              <Image objectFit='contain' height={12} src={logo} alt='Logo' />
            </Link>
            <Link to="/">
              <Heading color="blue.600" size="lg" fontWeight="bold">
                ZIM LOANS ONLINE
              </Heading>
            </Link>
          </HStack>
          <Spacer />
          {!currentUser && (
            <ButtonGroup>
              {navItems.map(item => (
                <VStack key={item.text} p={0} align="stretch">
                  <Link prefetch="intent" to={item.href}>
                    <Button variant={item.primary ? "solid" : "ghost"} colorScheme={"blue"}>
                      {item.text}
                    </Button>
                  </Link>
                </VStack>
              ))}
            </ButtonGroup>
          )}
          {currentUser && (
            <HStack p={0} justify="flex-end" align="center">
              <Text fontSize="md" px="4" noOfLines={1}>
                {currentUser.fullName}
              </Text>
              {currentUser.kind === ADMIN && (
                <AdminDropDownMenu />
              )}
              {currentUser.kind === LENDER && (
                <LenderDropDownMenu />
              )}
              {currentUser.kind === APPLICANT && (
                <ApplicantDropDownMenu />
              )}
            </HStack>
          )}
        </Stack>
      </CenteredView>
    </VStack>
  )
}