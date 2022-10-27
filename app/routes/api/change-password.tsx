import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "~/db.server";
import { PasswordSchema } from "~/lib/auth.validations";
import { badRequest, PositiveIntSchema } from "~/lib/core.validations";
import { FALLBACK_ERROR_MESSAGE } from "~/lib/errors";

const Schema = z
  .object({
    userId: PositiveIntSchema,
    oldPassword: PasswordSchema,
    newPassword: PasswordSchema,
    passwordConfirmation: PasswordSchema,
  })
  .refine((data) => data.newPassword === data.passwordConfirmation, {
    message: "Passwords don't match",
    path: ["passwordConfirmation"],
  });

export async function action ({ request }: ActionArgs) {
  try {
    const formData = await request.formData();
    const fields = Object.fromEntries(formData.entries());

    const result = await Schema.safeParseAsync(fields);
    if (!result.success) {
      const { formErrors, fieldErrors } = result.error.flatten();
      return badRequest({ fieldErrors, formError: formErrors.join(", ") });
    }
    const { userId, oldPassword, newPassword } = result.data;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      return badRequest({ formError: "User record not found" });
    }

    const isValid = await bcrypt.compare(oldPassword, user.hashedPassword);
    if (!isValid) {
      return badRequest({ formError: "Incorrect current password" });
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        hashedPassword: await bcrypt.hash(newPassword, 10),
      },
    });

    return json({}, { status: 400 });
  } catch ({ message }) {
    return json({ errorMessage: message as string || FALLBACK_ERROR_MESSAGE }, { status: 400 });
  }
}