import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { z } from "zod";
import { prisma } from "~/db.server";
import { badRequest, PositiveDecimalSchema, PositiveIntSchema } from "~/lib/core.validations";
import { FALLBACK_ERROR_MESSAGE } from "~/lib/errors";

const Schema = z.object({
  amount: PositiveDecimalSchema,
});

export async function action ({ request, params }: ActionArgs) {
  try {
    const formData = await request.formData();
    const fields = Object.fromEntries(formData.entries());

    const slugResult = await PositiveIntSchema.safeParseAsync(params.id);
    if (!slugResult.success) {
      throw new Error("Invalid vehicle ID");
    }
    const id = slugResult.data;

    const result = await Schema.safeParseAsync(fields);
    if (!result.success) {
      const { formErrors, fieldErrors } = result.error.flatten();
      return badRequest({ fields, fieldErrors, formError: formErrors.join(", ") });
    }
    const { amount } = result.data;

    await prisma.vehicle.update({
      where: { id },
      data: {
        finesDue: {
          increment: amount
        }
      },
    });

    return json({}, { status: 400 });
  } catch ({ message }) {
    return json({ errorMessage: message as string || FALLBACK_ERROR_MESSAGE }, { status: 400 });
  }
}