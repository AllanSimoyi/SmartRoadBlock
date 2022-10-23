import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink, Text, VStack
} from '@chakra-ui/react';
import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, useCatch, useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import * as React from "react";
import { ChevronRight } from 'tabler-icons-react';
import { z } from "zod";
import { ActionContextProvider } from "~/components/ActionContextProvider";
import { Card } from '~/components/Card';
import { CardSection } from "~/components/CardSection";
import { CustomAlert } from "~/components/CustomAlert";
import { CustomCatchBoundary } from "~/components/CustomCatchBoundary";
import { CustomErrorBoundary } from "~/components/CustomErrorBoundary";
import { PrimaryButton } from "~/components/PrimaryButton";
import { ScrollAnimateUp } from "~/components/ScrollAnimateUp";
import { TextField } from "~/components/TextField";
import { prisma } from "~/db.server";
import type { inferSafeParseErrors } from "~/lib/core.validations";
import { badRequest, PositiveDecimalSchema, PositiveIntSchema } from "~/lib/core.validations";
import { requireUser } from "~/session.server";

export const meta: MetaFunction = () => {
  return {
    title: "Smart Road Block - Edit Vehicle",
  };
};

export async function loader ({ request, params }: LoaderArgs) {
  await requireUser(request);

  const result = await PositiveIntSchema.safeParseAsync(params.id);
  if (!result.success) {
    throw new Response("Invalid vehicle ID", { status: 400 });
  }
  const id = result.data;

  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: { owner: true },
  });
  if (!vehicle) {
    throw new Response("Vehicle record not found", { status: 404 });
  }

  return json({ vehicle });
}

const Schema = z.object({
  amount: PositiveDecimalSchema,
})

type Fields = z.infer<typeof Schema>;
type FieldErrors = inferSafeParseErrors<typeof Schema>;
type ActionData = {
  formError?: string
  fields?: Fields
  fieldErrors?: FieldErrors
};

export async function action ({ request, params }: ActionArgs) {
  await requireUser(request);

  const slugResult = await PositiveIntSchema.safeParseAsync(params.id);
  if (!slugResult.success) {
    throw new Response("Invalid vehicle ID", { status: 400 });
  }
  const id = slugResult.data;

  const formData = await request.formData();
  const fields = Object.fromEntries(formData.entries());

  const result = await Schema.safeParseAsync(fields);
  if (!result.success) {
    const { formErrors, fieldErrors } = result.error.flatten();
    return badRequest({ fields, fieldErrors, formError: formErrors.join(", ") });
  }
  const { amount } = result.data;

  await prisma.payment.create({
    data: {
      vehicleId: id,
      amount,
    }
  });

  return redirect(`/vehicles/${ id }`);
}

export default function RecordPayment () {
  const { vehicle } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<ActionData>();
  const isProcessing = !!fetcher.submission;

  const defaultValues: Fields = {
    amount: 0,
  }

  return (
    <VStack justify={"center"} align="stretch">
      <ScrollAnimateUp delay={0.25}>
        <fetcher.Form method="post">
          <ActionContextProvider
            fields={fetcher.data?.fields || defaultValues}
            fieldErrors={fetcher.data?.fieldErrors}
            formError={fetcher.data?.formError}
            isSubmitting={isProcessing}
          >
            <Card>
              <CardSection py={2}>
                <VStack align="flex-start" py={4}>
                  <Breadcrumb spacing='8px' separator={<ChevronRight />}>
                    <BreadcrumbItem color="green.600">
                      <BreadcrumbLink as={Link} to="/vehicles">
                        Vehicles
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem color="green.600">
                      <BreadcrumbLink as={Link} to={`/vehicles/${ vehicle.id }`}>
                        Owned By {vehicle.owner.fullName}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem isCurrentPage>
                      <Text>Record Payment</Text>
                    </BreadcrumbItem>
                  </Breadcrumb>
                </VStack>
              </CardSection>
              {fetcher.data?.formError && (
                <CardSection noBottomBorder py={2}>
                  <ScrollAnimateUp delay={0.25}>
                    <CustomAlert status="error">
                      {fetcher.data.formError}
                    </CustomAlert>
                  </ScrollAnimateUp>
                </CardSection>
              )}
              <CardSection py={6}>
                <TextField
                  type="number"
                  step=".01"
                  name="amount"
                  label="Amount"
                  placeholder="Amount"
                />
              </CardSection>
              <CardSection noBottomBorder py={2}>
                <PrimaryButton type="submit" isDisabled={isProcessing}>
                  {isProcessing ? "RECORDING PAYMENT..." : "RECORD PAYMENT"}
                </PrimaryButton>
              </CardSection>
            </Card>
          </ActionContextProvider>
        </fetcher.Form>
      </ScrollAnimateUp>
    </VStack>
  )
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