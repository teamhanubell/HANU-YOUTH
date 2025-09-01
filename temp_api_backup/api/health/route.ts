import { NextResponse } from "next/server";

// Force static export for this route
export const dynamic = "force-static"

export async function GET() {
  return NextResponse.json({ message: "Good!" });
}