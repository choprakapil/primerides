import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  cookieStore.delete("primerides_admin_token");
  return NextResponse.redirect(new URL("/admin/login", req.url));
}

export async function GET(req: Request) {
  const cookieStore = await cookies();
  cookieStore.delete("primerides_admin_token");
  return NextResponse.redirect(new URL("/admin/login", req.url));
}
