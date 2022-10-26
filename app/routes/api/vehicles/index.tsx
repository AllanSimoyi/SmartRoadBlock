import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { prisma } from "~/db.server";
import { FALLBACK_ERROR_MESSAGE } from "~/lib/errors";
import { requireUser } from "~/session.server";

export async function loader ({ request }: LoaderArgs) {
  try {
    await requireUser(request);
    const vehicles = await prisma.vehicle.findMany({
      include: { driver: true },
    });
    return json({ vehicles });
  } catch ({ message }) {
    return json({ errorMessage: message as string || FALLBACK_ERROR_MESSAGE }, { status: 400 });
  }
}