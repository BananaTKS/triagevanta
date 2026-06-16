import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/session";

// Route handler (cookies are mutable here, unlike during a page render). Used to
// clear a session — e.g. when it points at a user that no longer exists.
export async function GET(request: Request) {
  await deleteSession();
  return NextResponse.redirect(new URL("/login", request.url));
}
