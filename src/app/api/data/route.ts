import { NextResponse } from "next/server";
import { getAppData } from "@/app/actions";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getAppData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error al obtener datos:", error);
    return NextResponse.json(
      { error: "Error al recuperar datos de la aplicación" },
      { status: 500 }
    );
  }
}
