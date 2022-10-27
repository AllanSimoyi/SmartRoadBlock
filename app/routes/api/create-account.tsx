import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { z } from "zod";
import { PasswordSchema, UsernameSchema } from "~/lib/auth.validations";
import { badRequest } from "~/lib/core.validations";
import { FALLBACK_ERROR_MESSAGE } from "~/lib/errors";
import { createUser, getUserByUsername } from "~/lib/user.server";

const Schema = z.object({
  username: UsernameSchema,
  password: PasswordSchema,
  passwordConfirmation: PasswordSchema,
})
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords don't match",
    path: ["passwordConfirmation"],
  })

export async function action ({ request }: ActionArgs) {
  try {
    const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "";

    const formData = await request.formData();
    const fields = Object.fromEntries(formData.entries());
  
    const result = await Schema.safeParseAsync(fields);
    if (!result.success) {
      const { formErrors, fieldErrors } = result.error.flatten();
      return badRequest({ fields, fieldErrors, formError: formErrors.join(", ") });
    }
    const { username, password } = result.data;
  
    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      return badRequest({
        fields,
        fieldErrors: { username: ["A user already exists with this username"] },
        formError: undefined,
      });
    }
  
    const user = await createUser(username, password,);
  
    return json({ user, CLOUD_NAME }, { status: 400 });
  } catch ({message}) {
    return json({ errorMessage: message as string || FALLBACK_ERROR_MESSAGE }, { status: 400 });
  }
}