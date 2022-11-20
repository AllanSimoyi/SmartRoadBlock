import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { z } from "zod";
import { UsernameSchema } from "~/lib/auth.validations";
import type { inferSafeParseErrors } from "~/lib/core.validations";
import { FALLBACK_ERROR_MESSAGE } from "~/lib/errors";
import { verifyLogin } from "~/lib/user.server";

const Schema = z.object({
  username: UsernameSchema,
  password: z.string().min(1),
});

type FieldErrors = inferSafeParseErrors<typeof Schema>;

function fieldErrorsToString (fieldErrors: FieldErrors) {
  const { username, password } = fieldErrors;
  const array = [username?.join(", ") || "", password?.join(", ") || ""];
  return array.filter(el => el).join(", ");
}

export async function action ({ request }: ActionArgs) {
  try {
    const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "";

    const formData = await request.formData();
    const fields = Object.fromEntries(formData.entries());

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
    const { username, password } = result.data;

    const user = await verifyLogin(username, password);
    if (!user) {
      console.log("Incorrect credentials");
      return json({ errorMessage: "Incorrect credentials" }, { status: 200 });
    }

    return json({ user, CLOUD_NAME });
  } catch ({ message }) {
    console.log("Caught Error", message as string);
    return json({ errorMessage: message as string || FALLBACK_ERROR_MESSAGE }, { status: 200 });
  }
}