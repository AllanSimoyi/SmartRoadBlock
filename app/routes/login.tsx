import { Center, Heading, VStack } from "@chakra-ui/react";
import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, useCatch, useFetcher, useLoaderData, useNavigate, useSearchParams } from "@remix-run/react";
import { z } from "zod";
import { ActionContextProvider } from "~/components/ActionContextProvider";
import { Card } from "~/components/Card";
import { CardHeading } from "~/components/CardHeading";
import { CardSection } from "~/components/CardSection";
import { CustomAlert } from "~/components/CustomAlert";
import { OutlinedButton } from "~/components/OutlinedButton";
import { PrimaryButton } from "~/components/PrimaryButton";
import { ScrollAnimation } from "~/components/ScrollAnimation";
import { TextField } from "~/components/TextField";
import type { inferSafeParseErrors } from "~/lib/core.validations";
import { badRequest } from "~/lib/core.validations";
import { getSlideUpScrollVariants } from "~/lib/scroll-variants";
import { verifyLogin } from "~/lib/user.server";
import { createUserSession } from "~/session.server";
import { safeRedirect } from "~/utils";

import { useCallback } from "react";
import { CustomCatchBoundary } from "~/components/CustomCatchBoundary";
import { CustomErrorBoundary } from "~/components/CustomErrorBoundary";
import { getUserId } from "~/session.server";

export const meta: MetaFunction = () => {
  return {
    title: "Smart Road Block - Login",
  };
};

export async function loader ({ request }: LoaderArgs) {
  const userId = await getUserId(request);
  if (userId) {
    return redirect("/");
  }

  const url = new URL(request.url);
  const message = url.searchParams.get("message") || '';

  return json({ message });
}

const Schema = z.object({
  username: z.string().min(1).max(50),
  password: z.string().min(1).max(50),
  redirectTo: z.string(),
})

type Fields = z.infer<typeof Schema>;
type FieldErrors = inferSafeParseErrors<typeof Schema>;
type ActionData = {
  formError?: string
  fields?: Fields
  fieldErrors?: FieldErrors
};

export async function action ({ request }: ActionArgs) {
  const formData = await request.formData();
  const fields = Object.fromEntries(formData.entries()) as Fields;

  const result = await Schema.safeParseAsync(fields);
  if (!result.success) {
    const { formErrors, fieldErrors } = result.error.flatten();
    return badRequest({ fields, fieldErrors, formError: formErrors.join(", ") });
  }
  const { username, password } = result.data;

  const user = await verifyLogin(username, password);
  if (!user) {
    return badRequest({ fields, formError: `Incorrect credentials` });
  }

  const redirectTo = safeRedirect(fields.redirectTo, "/");
  return createUserSession({
    request,
    userId: user.id,
    remember: true,
    redirectTo,
  });
}

export default function LoginPage () {
  const { message } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<ActionData>();
  const isLoggingIn = !!fetcher.submission;

  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";

  return (
    <Center>
      <VStack justify={"center"} align="stretch" p={4} w={["100%", "80%", "40%"]}>
        <VStack justify={"center"} align="center" p={4}>
          <ScrollAnimation variants={getSlideUpScrollVariants({ delay: 0.1 })}>
            <Link to="/">
              <Heading color="green.600" size="lg" fontWeight="bold">
                SMART ROAD BLOCK
              </Heading>
            </Link>
          </ScrollAnimation>
        </VStack>
        {message && (
          <VStack py={2}>
            <ScrollAnimation variants={getSlideUpScrollVariants({ delay: 0.1 })}>
              <CustomAlert status="warning">{message}</CustomAlert>
            </ScrollAnimation>
          </VStack>
        )}
        <ScrollAnimation variants={getSlideUpScrollVariants({ delay: 0.25 })}>
          <Card>
            <fetcher.Form method="post">
              <ActionContextProvider
                fields={fetcher.data?.fields}
                fieldErrors={fetcher.data?.fieldErrors}
                formError={fetcher.data?.formError}
                isSubmitting={isLoggingIn}
              >
                <input type="hidden" name="redirectTo" value={redirectTo} />
                <CardHeading>Log In</CardHeading>
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
                  {fetcher.data?.formError && (
                    <VStack py={2} align="stretch">
                      <ScrollAnimation variants={getSlideUpScrollVariants({ delay: 0.1 })}>
                        <CustomAlert status={"error"}>
                          {fetcher.data.formError}
                        </CustomAlert>
                      </ScrollAnimation>
                    </VStack>
                  )}
                </CardSection>
                <CardSection>
                  <PrimaryButton type="submit" isDisabled={isLoggingIn}>
                    {isLoggingIn ? "Logging In..." : "Log In"}
                  </PrimaryButton>
                </CardSection>
              </ActionContextProvider>
            </fetcher.Form>
            <CardSection noBottomBorder>
              <Link to="/join">
                <OutlinedButton w="100%" isDisabled={isLoggingIn}>
                  {"Don't Have An Account"}
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
  const reload = useCallback(() => {
    navigate('.', { replace: true })
  }, [navigate]);
  return <CustomCatchBoundary reload={reload} caught={caught} />
}

export function ErrorBoundary ({ error }: { error: Error }) {
  console.error(error);
  const navigate = useNavigate();
  const reload = useCallback(() => {
    navigate('.', { replace: true })
  }, [navigate]);
  return <CustomErrorBoundary reload={reload} error={error} />
}