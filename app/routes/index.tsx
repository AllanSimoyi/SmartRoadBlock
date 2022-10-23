import type { LoaderArgs } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import { getUserId } from "~/session.server";

export async function loader ({ request }: LoaderArgs) {
  const userId = await getUserId(request);
  if (userId) {
    return redirect("/vehicles");
  }
  return redirect("/login");
}