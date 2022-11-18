import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink, Heading, Text, VStack
} from '@chakra-ui/react';
import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, useCatch, useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import dayjs from 'dayjs';
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
import { UploadImage } from '~/components/UploadImage';
import { prisma } from "~/db.server";
import { useUploadCloudinaryImage } from '~/hooks/useUploadCloudinaryImage';
import type { inferSafeParseErrors} from "~/lib/core.validations";
import { badRequest, DateSchema, PositiveDecimalSchema, PositiveIntSchema } from "~/lib/core.validations";
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
    include: { driver: true },
  });
  if (!vehicle) {
    throw new Response("Vehicle record not found", { status: 404 });
  }

  return json({ vehicle });
}

const Schema = z.object({
  plateNumber: z.string().min(1).max(255),
  makeAndModel: z.string().min(1).max(255),
  finesDue: PositiveDecimalSchema,
  vehicleImage: z.string().min(0).max(800),

  year: z.string().max(4),
  colour: z.string().max(10),
  weight: PositiveDecimalSchema,
  netWeight: PositiveDecimalSchema,

  fullName: z.string().min(1).max(255),
  licenseNumber: z.string().min(1).max(255),
  driverImage: z.string().min(0).max(800),

  nationalID: z.string(),
  dob: DateSchema,
  phone: z.string(),
  defensive: z.string(),
  medical: z.string(),
  driverClass: z.string(),
  driverYear: z.string(),
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
  const { plateNumber, makeAndModel, vehicleImage, finesDue } = result.data;
  const { fullName, licenseNumber, driverImage } = result.data;
  const { year, colour, weight, netWeight } = result.data;
  const { nationalID, dob, phone, defensive, medical, driverClass, driverYear } = result.data;

  const vehicle = await prisma.vehicle.findUnique({
    where: { id: id },
    select: { driverId: true },
  });
  if (!vehicle) {
    throw new Response("Vehicle record not found", { status: 404 });
  }

  await Promise.all([
    prisma.vehicle.update({
      where: { id },
      data: {
        plateNumber,
        makeAndModel,
        image: vehicleImage,
        year,
        colour,
        weight,
        netWeight,
        finesDue
      },
    }),
    prisma.driver.update({
      where: { id: vehicle.driverId },
      data: {
        fullName,
        licenseNumber,
        image: driverImage,
        nationalID,
        dob,
        phone,
        defensive,
        medical,
        class: driverClass,
        year: driverYear,
      },
    })
  ]);

  return redirect(`/vehicles/${id}`);
}

export default function EditVehicle () {
  const { vehicle } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<ActionData>();
  const isProcessing = !!fetcher.submission;

  const defaultValues: Fields = {
    plateNumber: vehicle.plateNumber,
    makeAndModel: vehicle.makeAndModel,
    vehicleImage: vehicle.image,
    finesDue: Number(vehicle.finesDue),

    year: vehicle.year || "",
    colour: vehicle.colour || "",
    weight: vehicle.weight || 0,
    netWeight: vehicle.netWeight || 0,

    fullName: vehicle.driver.fullName,
    licenseNumber: vehicle.driver.licenseNumber,
    driverImage: vehicle.driver.image,

    nationalID: vehicle.driver.nationalID || "",
    dob: dayjs(vehicle.driver.dob).format("YYYY-MM-DD"),
    phone: vehicle.driver.phone || "",
    defensive: vehicle.driver.defensive || "",
    medical: vehicle.driver.medical || "",
    driverClass: vehicle.driver.class || "",
    driverYear: vehicle.driver.year || ""
  }

  const vehicleImage = useUploadCloudinaryImage({
    initialPublicId: vehicle.image,
  });

  const driverImage = useUploadCloudinaryImage({
    initialPublicId: vehicle.driver.image,
  });

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
                      <BreadcrumbLink as={Link} to={`/vehicles/${vehicle.id}`}>
                        Owned By {vehicle.driver.fullName}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem isCurrentPage>
                      <Text>Edit Vehicle Details</Text>
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
                  name="plateNumber"
                  label="Plate Number"
                  placeholder="Plate Number"
                />
                <TextField
                  name="makeAndModel"
                  label="Make And Model"
                  placeholder="Make And Model"
                />
                <TextField
                  type="number"
                  step=".01"
                  name="finesDue"
                  label="Total Fines Due"
                  placeholder="Total Fines Due"
                />
                <TextField
                  name="year"
                  label="Year"
                  placeholder="Year"
                />
                <TextField
                  name="colour"
                  label="Colour"
                  placeholder="Colour"
                />
                <TextField
                  type="number"
                  step=".01"
                  name="weight"
                  label="Weight"
                  placeholder="Weight"
                />
                <TextField
                  type="number"
                  step=".01"
                  name="netWeight"
                  label="Net Weight"
                  placeholder="Net Weight"
                />
                <input type="hidden" name="vehicleImage" value={vehicleImage.publicId} />
                <UploadImage {...vehicleImage} identifier={"vehicle's image"} />
              </CardSection>
              <CardSection noBottomBorder py={6}>
                <VStack align="stretch" pb={4}>
                  <Heading role="heading" size="md">
                    Driver Details
                  </Heading>
                </VStack>
                <TextField
                  name="fullName"
                  label="Full Name"
                  placeholder="Full Name"
                />
                <TextField
                  name="licenseNumber"
                  label="License Number"
                  placeholder="License Number"
                />
                <TextField
                  name="nationalID"
                  label="National ID"
                  placeholder="National ID"
                />
                <TextField
                  name="dob"
                  type="date"
                  label="Date of Birth"
                  placeholder="Date of Birth"
                />
                <TextField
                  name="phone"
                  label="Phone Number"
                  placeholder="Phone Number"
                />
                <TextField
                  name="defensive"
                  label="Defensive"
                  placeholder="Defensive"
                />
                <TextField
                  name="medical"
                  label="Medical"
                  placeholder="Medical"
                />
                <TextField
                  name="driverClass"
                  label="Class"
                  placeholder="Class"
                />
                <TextField
                  name="driverYear"
                  label="Year"
                  placeholder="Year"
                />
                <input type="hidden" name="driverImage" value={driverImage.publicId} />
                <UploadImage {...driverImage} identifier={"driver's image"} />
              </CardSection>
              <CardSection noBottomBorder py={2}>
                <PrimaryButton type="submit" isDisabled={isProcessing}>
                  {isProcessing ? "UPDATING RECORD..." : "UPDATE RECORD"}
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