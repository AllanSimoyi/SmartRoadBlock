import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { prisma } from "~/db.server";
import { PositiveIntSchema } from "~/lib/core.validations";
import { FALLBACK_ERROR_MESSAGE } from "~/lib/errors";

function fetchVehicle (id: number) {
  return prisma.driver.findUnique({
    where: { id },
    include: { vehicles: { include: { payments: true } } },
  });
}

export async function loader ({ params }: LoaderArgs) {
  try {
    const result = await PositiveIntSchema.safeParseAsync(params.id);
    if (!result.success) {
      throw new Error("Invalid vehicle ID");
    }
    const vehicleId = result.data;

    const vehicle = await fetchVehicle(vehicleId);
    if (!vehicle) {
      throw new Error("Vehicle record not found");
    }

    return json({ vehicle });
  } catch ({ message }) {
    return json({ errorMessage: message as string || FALLBACK_ERROR_MESSAGE }, { status: 400 });
  }
}