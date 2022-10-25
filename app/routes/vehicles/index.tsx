import { Heading, HStack, SimpleGrid, Spacer, VStack } from "@chakra-ui/react";
import type { LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useCatch, useLoaderData, useNavigate } from "@remix-run/react";
import { useCallback } from "react";
import { CustomCatchBoundary } from "~/components/CustomCatchBoundary";
import { CustomErrorBoundary } from "~/components/CustomErrorBoundary";
import { PrimaryButton } from "~/components/PrimaryButton";
import { ScrollAnimateUp } from "~/components/ScrollAnimateUp";
import { VehicleListItem } from "~/components/vehicles/VehicleListItem";
import { prisma } from "~/db.server";
import { requireUser } from "~/session.server";

export const meta: MetaFunction = () => {
  return {
    title: "Smart Road Block - Vehicles",
  };
};

export async function loader ({ request }: LoaderArgs) {
  await requireUser(request);
  const vehicles = await prisma.vehicle.findMany({
    include: { driver: true },
  });
  return json({ vehicles });
}

export default function VehiclesPage () {
  const { vehicles } = useLoaderData<typeof loader>();
  return (
    <VStack align="stretch">
      <HStack align="flex-start" py={4}>
        <Heading size="md">Vehicle Records</Heading>
        <Spacer />
        <Link to="/vehicles/new">
          <PrimaryButton>Add Vehicle</PrimaryButton>
        </Link>
      </HStack>
      <SimpleGrid columns={{ sm: 1, md: 3 }} spacing={5}>
        {vehicles.map((vehicle, index) => (
          <ScrollAnimateUp key={vehicle.id} delay={0 + (index * .1)}>
            <VehicleListItem vehicle={{
              ...vehicle,
              finesDue: Number(vehicle.finesDue),
              createdAt: new Date(vehicle.createdAt),
              updatedAt: new Date(vehicle.updatedAt),
              driver: {
                ...vehicle.driver,
                dob: new Date(vehicle.driver.dob),
                createdAt: new Date(vehicle.driver.createdAt),
                updatedAt: new Date(vehicle.driver.updatedAt),
              }
            }} />
          </ScrollAnimateUp>
        ))}
      </SimpleGrid>
    </VStack>
  )
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