import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { prisma } from "~/db.server";
import { FALLBACK_ERROR_MESSAGE } from "~/lib/errors";

export async function loader (_: LoaderArgs) {
  try {
    const drivers = await prisma.driver.findMany({
      include: { vehicles: true },
    });

    return json({ drivers });
  } catch ({ message }) {
    return json({ errorMessage: message as string || FALLBACK_ERROR_MESSAGE }, { status: 400 });
  }
}