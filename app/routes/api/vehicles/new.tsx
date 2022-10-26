import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { z } from "zod";
import { prisma } from "~/db.server";
import { badRequest, PositiveDecimalSchema } from "~/lib/core.validations";
import { FALLBACK_ERROR_MESSAGE } from "~/lib/errors";

const Schema = z.object({
  plateNumber: z.string().min(1).max(255),
  makeAndModel: z.string().min(1).max(255),
  finesDue: PositiveDecimalSchema,
  vehicleImage: z.string().min(0).max(800),

  fullName: z.string().min(1).max(255),
  licenseNumber: z.string().min(1).max(255),
  driverImage: z.string().min(0).max(800),
})

export async function action ({ request }: ActionArgs) {
  try {
    const formData = await request.formData();
    const fields = Object.fromEntries(formData.entries());

    const result = await Schema.safeParseAsync(fields);
    if (!result.success) {
      const { formErrors, fieldErrors } = result.error.flatten();
      return badRequest({ fields, fieldErrors, formError: formErrors.join(", ") });
    }
    const { plateNumber, makeAndModel, vehicleImage, finesDue } = result.data;
    const { fullName, licenseNumber, driverImage } = result.data;

    const driver = await prisma.driver.create({
      data: {
        fullName, licenseNumber, image: driverImage,
      }
    });

    const vehicle = await prisma.vehicle.create({
      data: {
        plateNumber, makeAndModel, image: vehicleImage, finesDue,
        driverId: driver.id
      }
    });

    return json({ vehicle: { ...vehicle, driver } }, { status: 400 });
  } catch ({ message }) {
    return json({ errorMessage: message as string || FALLBACK_ERROR_MESSAGE }, { status: 400 });
  }
}