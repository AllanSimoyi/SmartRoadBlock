import { Center, VStack } from "@chakra-ui/react";
import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, useCatch, useFetcher, useNavigate } from "@remix-run/react";
import * as React from "react";
import { z } from "zod";
import { ActionContextProvider } from "~/components/ActionContextProvider";
import { Card } from "~/components/Card";
import { CardHeading } from "~/components/CardHeading";
import { CardSection } from "~/components/CardSection";
import { CustomAlert } from "~/components/CustomAlert";
import { CustomCatchBoundary } from "~/components/CustomCatchBoundary";
import { CustomErrorBoundary } from "~/components/CustomErrorBoundary";
import { OutlinedButton } from "~/components/OutlinedButton";
import { PrimaryButton } from "~/components/PrimaryButton";
import { ScrollAnimation } from "~/components/ScrollAnimation";
import { TextField } from "~/components/TextField";
import type { inferSafeParseErrors } from "~/lib/core.validations";
import { badRequest } from "~/lib/core.validations";
import { getSlideUpScrollVariants } from "~/lib/scroll-variants";
import { createUserSession, getUserId } from "~/session.server";
import { createUser, getUserByUsername } from "~/lib/user.server";
import { PasswordSchema, UsernameSchema } from "~/lib/auth.validations";

export const meta: MetaFunction = () => {
  return {
    title: "Smart Road Block - Create Account",
  };
};

const Schema = z.object({
  username: UsernameSchema,
  password: PasswordSchema,
  passwordConfirmation: PasswordSchema,
})
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords don't match",
    path: ["passwordConfirmation"],
  })

type Fields = z.infer<typeof Schema>;
type FieldErrors = inferSafeParseErrors<typeof Schema>;
type ActionData = {
  formError?: string
  fields?: Fields
  fieldErrors?: FieldErrors
};

export async function loader ({ request }: LoaderArgs) {
  const currentUserId = await getUserId(request);
  if (currentUserId) {
    return redirect("/");
  }
  return json({});
}

export async function action ({ request }: ActionArgs) {
  const formData = await request.formData();
  const fields = Object.fromEntries(formData.entries()) as Fields;

  const result = await Schema.safeParseAsync(fields);
  if (!result.success) {
    const { formErrors, fieldErrors } = result.error.flatten();
    return badRequest({ fields, fieldErrors, formError: formErrors.join(", ") });
  }
  const { username, password } = result.data;

  const existingUser = await getUserByUsername(username);
  if (existingUser) {
    return badRequest({
      fields,
      fieldErrors: { username: ["A user already exists with this username"] },
      formError: undefined,
    });
  }

  const user = await createUser(username, password,);

  return createUserSession({
    request,
    userId: user.id,
    remember: false,
    redirectTo: "/",
  });
}

export default function CreateAccount () {
  const fetcher = useFetcher<ActionData>();
  const isCreatingAccount = !!fetcher.submission;

  return (
    <Center>
      <VStack justify={"center"} align="stretch" p={4} w={["100%", "80%", "40%"]}>
        <VStack justify={"center"} align="center" p={4}>
          <ScrollAnimation variants={getSlideUpScrollVariants({ delay: 0.1 })}>
            <Link to="/">
              <CardHeading>SMART ROAD BLOCK</CardHeading>
            </Link>
          </ScrollAnimation>
        </VStack>
        <ScrollAnimation variants={getSlideUpScrollVariants({ delay: 0.25 })}>
          <Card>
            <fetcher.Form method="post">
              <ActionContextProvider
                fields={fetcher.data?.fields}
                fieldErrors={fetcher.data?.fieldErrors}
                formError={fetcher.data?.formError}
                isSubmitting={isCreatingAccount}
              >
                <CardHeading>Create Account</CardHeading>
                <CardSection py={6}>
                  <TextField
                    name="username"
                    label="Username"
                    placeholder="Username"
                  />
                  <TextField
                    name="password"
                    label="Password"
                    placeholder="Password"
                    type="password"
                  />
                  <TextField
                    name="passwordConfirmation"
                    label="Re-enter Password"
                    placeholder="Re-enter Password"
                    type="password"
                  />
                  {fetcher.data?.formError && (
                    <VStack py={2}>
                      <ScrollAnimation variants={getSlideUpScrollVariants({ delay: 0.1 })}>
                        <CustomAlert status={"error"}>
                          {fetcher.data.formError}
                        </CustomAlert>
                      </ScrollAnimation>
                    </VStack>
                  )}
                </CardSection>
                <CardSection>
                  <PrimaryButton type="submit" isDisabled={isCreatingAccount}>
                    {isCreatingAccount ? "Creating Account..." : "Create Account"}
                  </PrimaryButton>
                </CardSection>
              </ActionContextProvider>
            </fetcher.Form>
            <CardSection noBottomBorder>
              <Link to="/login">
                <OutlinedButton w="100%" isDisabled={isCreatingAccount}>
                  {"Already Have An Account"}
                </OutlinedButton>
              </Link>
            </CardSection>
          </Card>
        </ScrollAnimation>
      </VStack>
    </Center>
  );
}

export function CatchBoundary () {
  const caught = useCatch();
  const navigate = useNavigate();
  const reload = React.useCallback(() => {
    navigate('.', { replace: true })
  }, [navigate]);
  return <CustomCatchBoundary reload={reload} caught={caught} />
}

export function ErrorBoundary ({ error }: { error: Error }) {
  console.error(error);
  const navigate = useNavigate();
  const reload = React.useCallback(() => {
    navigate('.', { replace: true })
  }, [navigate]);
  return <CustomErrorBoundary reload={reload} error={error} />
}