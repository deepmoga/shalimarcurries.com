import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      ok: true,
      message:
        "Reservation form received. This endpoint is ready to connect to email, MySQL or an admin workflow."
    },
    { status: 202 }
  );
}
