import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { z } from "zod";
import { prisma } from "~/db.server";
import { badRequest, PositiveDecimalSchema, PositiveIntSchema } from "~/lib/core.validations";
import { FALLBACK_ERROR_MESSAGE } from "~/lib/errors";

const Schema = z.object({
  amount: PositiveDecimalSchema,
});

function fieldErrorsToString (fieldErrors: FieldErrors) {
  const { amount } = fieldErrors;
  const array = [amount?.join(", ") || ""];
  return array.filter(el => el).join(", ");
}

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
      const strFieldErrors = fieldErrorsToString(fieldErrors);
      const strFormErrors = formErrors.join(", ") || "";
      const errorMessage = [strFieldErrors, strFormErrors]
        .filter(el => el)
        .join(", ");
      console.log("errorMessage: ", errorMessage);
      return json({ errorMessage }, { status: 200 });
    }
    const { amount } = result.data;

    await prisma.payment.create({
      data: {
        vehicleId: id,
        amount,
      }
    });

    return json({}, { status: 200 });
  } catch ({ message }) {
    return json({ errorMessage: message as string || FALLBACK_ERROR_MESSAGE }, { status: 200 });
  }
}