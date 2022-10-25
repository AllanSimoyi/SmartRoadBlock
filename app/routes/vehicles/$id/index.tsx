import {
  Avatar,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink, Button, HStack, Img, SimpleGrid, Spacer, Stack, Text, VStack
} from '@chakra-ui/react';
import { AdvancedImage, placeholder } from "@cloudinary/react";
import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useActionData, useCatch, useLoaderData, useNavigate, useTransition } from "@remix-run/react";
import { redirect } from "@remix-run/server-runtime";
import { useCallback } from "react";
import placeholderImage from "~/../public/images/light_placeholder.jpeg";
import { CustomCatchBoundary } from "~/components/CustomCatchBoundary";
import { CustomErrorBoundary } from "~/components/CustomErrorBoundary";
import { DeleteConfirmation } from "~/components/DeleteConfirmation";
import { PrimaryButton } from "~/components/PrimaryButton";
import { useDelete } from "~/hooks/useDelete";
import { PositiveIntSchema } from "~/lib/core.validations";

import { ChevronRight } from 'tabler-icons-react';
import { Card } from '~/components/Card';
import { CardHeading } from '~/components/CardHeading';
import { CardSection } from '~/components/CardSection';
import { prisma } from "~/db.server";
import { cloudinaryImages } from "~/lib/images";
import { requireUser } from "~/session.server";
import { OutlinedButton } from '~/components/OutlinedButton';
import dayjs from 'dayjs';

export const meta: MetaFunction = () => {
  return {
    title: "Smart Road Block - Vehicle Details",
  };
};

function fetchVehicle (id: number) {
  return prisma.vehicle.findUnique({
    where: { id },
    include: { owner: true, payments: true },
  });
}

interface LoaderData {
  vehicle: Awaited<ReturnType<typeof fetchVehicle>>;
  CLOUD_NAME: string;
}

export async function loader ({ request, params }: LoaderArgs) {
  await requireUser(request);

  const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "";
  const UPLOAD_RESET = process.env.CLOUDINARY_UPLOAD_RESET || "";

  const result = await PositiveIntSchema.safeParseAsync(params.id);
  if (!result.success) {
    throw new Response("Invalid vehicle ID", { status: 400 });
  }
  const vehicleId = result.data;

  const vehicle = await fetchVehicle(vehicleId);
  if (!vehicle) {
    throw new Response("Vehicle record not found", { status: 404 });
  }

  return json({ vehicle, CLOUD_NAME, UPLOAD_RESET });
}

interface ActionData {
  updatedVehicle: Awaited<ReturnType<typeof fetchVehicle>>;
}

export async function action ({ request, params }: ActionArgs) {
  await requireUser(request);

  const result = await PositiveIntSchema.safeParseAsync(params.id);
  if (!result.success) {
    throw new Error("Invalid vehicle ID");
  }
  const vehicleId = result.data;

  const form = await request.formData();
  if (form.get("_method") === "delete") {
    await prisma.vehicle.delete({
      where: { id: vehicleId },
    });
    return redirect("/vehicles");
  }

  if (form.get("_method") === "delete_payment") {
    const result = await PositiveIntSchema.safeParseAsync(form.get("paymentId"));
    if (!result.success) {
      throw new Error("Invalid payment ID");
    }
    const paymentId = result.data;
    await prisma.payment.delete({
      where: { id: paymentId }
    });
    const updatedVehicle = await fetchVehicle(vehicleId);
    if (!updatedVehicle) {
      throw new Response("Vehicle record not found", { status: 404 });
    }
    return json({ updatedVehicle });
  }

  return redirect("/vehicles");
}

export default function VehiclePage () {
  // const { vehicle: initialVehicle, CLOUD_NAME } = useLoaderData<typeof loader>();
  const { vehicle: initialVehicle, CLOUD_NAME } = useLoaderData() as LoaderData;
  const actionData = useActionData() as ActionData;

  const vehicle = actionData?.updatedVehicle || initialVehicle!;

  const transition = useTransition();
  const isSubmitting = transition.state === "submitting";

  const {
    confirmDeleteIsOpen, handleDeleteSubmit,
    onConfirmDelete, onCloseConfirmDelete, cancelDeleteRef
  } = useDelete();

  const totalPaymentsMade = vehicle.payments
    .reduce((acc, payment) => acc + Number(payment.amount), 0);

  return (
    <VStack key={vehicle.id} align="stretch" py={8}>
      <DeleteConfirmation
        identifier="Vehicle"
        isOpen={confirmDeleteIsOpen}
        isDeleting={isSubmitting}
        onConfirm={onConfirmDelete}
        onCancel={onCloseConfirmDelete}
        cancelRef={cancelDeleteRef}
      />
      <VStack align="stretch" spacing={8}>
        <Card>
          <CardSection>
            <Stack direction={{ base: "column", lg: "row" }} align={{ base: "flex-start", lg: "center" }} spacing={4}>
              <VStack align="center">
                <Breadcrumb spacing='8px' separator={<ChevronRight />}>
                  <BreadcrumbItem color="green.600">
                    <BreadcrumbLink as={Link} to="/vehicles">
                      <Text fontSize="md" fontWeight="bold">Vehicles</Text>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </Breadcrumb>
              </VStack>
              <Spacer />
              <Link to={`/vehicles/${ vehicle.id }/record-payment`}>
                <OutlinedButton isDisabled={isSubmitting}>
                  Record Payment
                </OutlinedButton>
              </Link>
              <Link to={`/vehicles/${ vehicle.id }/edit`}>
                <PrimaryButton isDisabled={isSubmitting}>
                  Edit Details
                </PrimaryButton>
              </Link>
              <Form onSubmit={handleDeleteSubmit} method="post">
                <input type="hidden" name="_method" value="delete" />
                <PrimaryButton type="submit" colorScheme="red" w="100%" isDisabled={isSubmitting}>
                  Delete Record
                </PrimaryButton>
              </Form>
            </Stack>
          </CardSection>
          <CardSection>
            <Stack direction={{ base: "column", lg: "row" }} align="flex-start" spacing={4}>
              {Boolean(vehicle.image) && (
                <VStack maxW={{ base: "100%", lg: "50%" }} align="stretch">
                  <AdvancedImage
                    cldImg={cloudinaryImages(CLOUD_NAME).getFullImage(vehicle.image)}
                    plugins={[placeholder({ mode: 'blur' })]}
                  />
                </VStack>
              )}
              {!vehicle.image && (
                <Img boxSize='400px' src={placeholderImage} alt={vehicle.makeAndModel} />
              )}
              <VStack align="flex-start" spacing={6}>
                <Text fontSize="md">
                  {`Make and Model: `}<b>{vehicle.makeAndModel}</b>
                </Text>
                <Text fontSize="md">
                  {`Plate Number: `}<b>{vehicle.plateNumber}</b>
                </Text>
                <Text fontSize="md">
                  {`Total Fines Due: `}<b>ZWL {Number(vehicle.finesDue || 0).toLocaleString()}</b>
                </Text>
                <Text fontSize="md">
                  {`Total Payments Made: `}<b>ZWL {totalPaymentsMade.toLocaleString()}</b>
                </Text>
              </VStack>
            </Stack>
          </CardSection>
          <CardHeading align="flex-start" noBottomBorder>Owner Details</CardHeading>
          <CardSection>
            <Stack direction={{ base: "column", lg: "row" }} align="flex-start" spacing={4}>
              {Boolean(vehicle.owner.image) && (
                <VStack maxW={{ base: "100%", lg: "50%" }} align="stretch">
                  <AdvancedImage
                    cldImg={cloudinaryImages(CLOUD_NAME).getUploadThumbnail(vehicle.owner.image)}
                    plugins={[placeholder({ mode: 'blur' })]}
                  />
                </VStack>
              )}
              {!vehicle.owner.image && (
                <Avatar name={vehicle.owner.fullName} src={vehicle.owner.image} />
              )}
              <VStack align="flex-start" spacing={2}>
                <Text fontSize="md" fontWeight="bold">
                  {vehicle.owner.fullName}
                </Text>
                <Text fontSize="md">
                  {vehicle.owner.licenseNumber}
                </Text>
              </VStack>
            </Stack>
          </CardSection>
          <CardHeading align="flex-start" noBottomBorder>Payments Made</CardHeading>
          <CardSection noBottomBorder>
            {Boolean(vehicle.payments.length) && (
              <SimpleGrid columns={{ sm: 1, md: 2 }} spacing={5}>
                {vehicle.payments.map((payment, index) => (
                  <VStack key={index.toString()} p={2} bgColor="gray.100" borderRadius={5} align="stretch" spacing={0}>
                    <HStack align="center">
                      <Text fontSize="md">
                        ZWL {Number(payment.amount).toLocaleString()} -
                      </Text>
                      <Text fontSize="xs" color="gray.600">
                        {dayjs(payment.createdAt).format('DD-MMM-YYYY')}
                      </Text>
                    </HStack>
                    <Form method="post" onSubmit={handleDeleteSubmit}>
                      <input type="hidden" name="_method" value="delete_payment" />
                      <input type="hidden" name="paymentId" value={payment.id} />
                      <Button type="submit" variant="link" colorScheme="red">
                        Delete
                      </Button>
                    </Form>
                  </VStack>
                ))}
              </SimpleGrid>
            )}
            {!vehicle.payments.length && (
              <Text fontSize="xs" color="gray.600">
                No payments made so far
              </Text>
            )}
          </CardSection>
        </Card>
      </VStack>
    </VStack>
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