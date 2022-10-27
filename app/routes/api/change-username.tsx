import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { z } from "zod";
import { prisma } from "~/db.server";
import { UsernameSchema } from "~/lib/auth.validations";
import { badRequest, PositiveIntSchema } from "~/lib/core.validations";
import { FALLBACK_ERROR_MESSAGE } from "~/lib/errors";

const Schema = z.object({
  userId: PositiveIntSchema,
  username: UsernameSchema,
});

export async function action ({ request }: ActionArgs) {
  try {
    const formData = await request.formData();
    const fields = Object.fromEntries(formData.entries());

    const result = await Schema.safeParseAsync(fields);
    if (!result.success) {
      const { formErrors, fieldErrors } = result.error.flatten();
      return badRequest({ fields, fieldErrors, formError: formErrors.join(", ") });
    }
    const { userId, username } = result.data;

    await prisma.user.update({
      where: { id: userId },
      data: { username },
    });

    return json({}, { status: 400 });
  } catch ({ message }) {
    return json({ errorMessage: message as string || FALLBACK_ERROR_MESSAGE }, { status: 400 });
  }
}