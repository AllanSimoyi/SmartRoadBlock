import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { z } from "zod";
import { UsernameSchema } from "~/lib/auth.validations";
import { badRequest } from "~/lib/core.validations";
import { FALLBACK_ERROR_MESSAGE } from "~/lib/errors";
import { verifyLogin } from "~/lib/user.server";

const Schema = z.object({
  username: UsernameSchema,
  password: z.string().min(1),
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
    const { username, password } = result.data;

    const user = await verifyLogin(username, password);
    if (!user) {
      return badRequest({ fields, formError: `Incorrect credentials` });
    }

    return json({ user }, { status: 400 });
  } catch ({ message }) {
    return json({ errorMessage: message as string || FALLBACK_ERROR_MESSAGE }, { status: 400 });
  }
}