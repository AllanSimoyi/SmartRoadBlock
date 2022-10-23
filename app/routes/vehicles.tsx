import { VStack } from "@chakra-ui/react";
import type { LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useCatch, useLoaderData, useNavigate } from "@remix-run/react";
import { useCallback } from "react";
import { CenteredView } from "~/components/CenteredView";
import { CustomCatchBoundary } from "~/components/CustomCatchBoundary";
import { CustomErrorBoundary } from "~/components/CustomErrorBoundary";
import { Toolbar } from "~/components/Toolbar";
import { requireUser } from "~/session.server";

export const meta: MetaFunction = () => {
  return {
    title: "Smart Road Block - Vehicles",
  };
};

export async function loader ({ request }: LoaderArgs) {
  const currentUser = await requireUser(request);
  return json({ currentUser });
}

export default function VehiclesPage () {
  const { currentUser } = useLoaderData<typeof loader>();
  return (
    <VStack align="stretch" spacing={0}>
      <Toolbar currentUser={currentUser} />
      <VStack align="stretch" py={6}>
        <CenteredView flexGrow={1}>
          <Outlet />
        </CenteredView>
      </VStack>
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