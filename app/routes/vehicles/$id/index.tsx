import {
  Avatar,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink, Img, Spacer, Stack, Text, VStack
} from '@chakra-ui/react';
import { AdvancedImage, placeholder } from "@cloudinary/react";
import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useCatch, useLoaderData, useNavigate, useTransition } from "@remix-run/react";
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

export const meta: MetaFunction = () => {
  return {
    title: "Smart Road Block - Vehicle Details",
  };
};

export async function loader ({ request, params }: LoaderArgs) {
  await requireUser(request);

  const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "";
  const UPLOAD_RESET = process.env.CLOUDINARY_UPLOAD_RESET || "";

  const result = await PositiveIntSchema.safeParseAsync(params.id);
  if (!result.success) {
    throw new Response("Invalid vehicle ID", { status: 400 });
  }
  const id = result.data;

  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: { owner: true, payments: true },
  });
  if (!vehicle) {
    throw new Response("Vehicle record not found", { status: 404 });
  }

  return json({ vehicle, CLOUD_NAME, UPLOAD_RESET });
}

export async function action ({ request, params }: ActionArgs) {
  await requireUser(request);

  const result = await PositiveIntSchema.safeParseAsync(params.id);
  if (!result.success) {
    throw new Error("Invalid vehicle ID");
  }
  const id = result.data;

  const form = await request.formData();
  if (form.get("_method") !== "delete") {
    throw new Response(
      `The _method ${ form.get("_method") } is not supported`,
      { status: 400 }
    );
  }

  await prisma.vehicle.delete({ where: { id } });

  return redirect("/vehicles");
}

export default function VehiclePage () {
  const { vehicle, CLOUD_NAME, UPLOAD_RESET } = useLoaderData<typeof loader>();

  const transition = useTransition();
  const isSubmitting = transition.state === "submitting";

  const {
    confirmDeleteIsOpen, handleDeleteSubmit,
    onConfirmDelete, onCloseConfirmDelete, cancelDeleteRef
  } = useDelete();

  const totalPaymentsMade = vehicle.payments.reduce((acc, payment) => acc + Number(payment.amount), 0);

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
                <AdvancedImage
                  cldImg={cloudinaryImages(CLOUD_NAME).getUploadThumbnail(vehicle.image)}
                  plugins={[placeholder({ mode: 'blur' })]}
                />
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
          <CardSection noBottomBorder>
            <Stack direction={{ base: "column", lg: "row" }} align="flex-start" spacing={4}>
              {Boolean(vehicle.owner.image) && (
                <AdvancedImage
                  cldImg={cloudinaryImages(CLOUD_NAME).getUploadThumbnail(vehicle.owner.image)}
                  plugins={[placeholder({ mode: 'blur' })]}
                />
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