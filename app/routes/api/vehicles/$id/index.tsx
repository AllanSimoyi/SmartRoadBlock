import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { prisma } from "~/db.server";
import { PositiveIntSchema } from "~/lib/core.validations";
import { FALLBACK_ERROR_MESSAGE } from "~/lib/errors";
import { requireUser } from "~/session.server";

function fetchVehicle (id: number) {
  return prisma.vehicle.findUnique({
    where: { id },
    include: { driver: true, payments: true },
  });
}

export async function loader ({ request, params }: LoaderArgs) {
  try {
    await requireUser(request);

    const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "";
    const UPLOAD_RESET = process.env.CLOUDINARY_UPLOAD_RESET || "";

    const result = await PositiveIntSchema.safeParseAsync(params.id);
    if (!result.success) {
      throw new Error("Invalid vehicle ID");
    }
    const vehicleId = result.data;

    const vehicle = await fetchVehicle(vehicleId);
    if (!vehicle) {
      throw new Error("Vehicle record not found");
    }

    return json({ vehicle, CLOUD_NAME, UPLOAD_RESET });
  } catch ({ message }) {
    return json({ errorMessage: message as string || FALLBACK_ERROR_MESSAGE }, { status: 400 });
  }
}