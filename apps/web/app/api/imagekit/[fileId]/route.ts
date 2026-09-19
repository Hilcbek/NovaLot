// apps/web/app/api/imagekit/[fileId]/route.ts
import { getAuthenticatedUser, imagekit } from "@/server";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> },
) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { fileId } = await params;

  try {
    await imagekit.deleteFile(fileId);
  } catch {
    // Non-fatal — the DB row (if any) is what actually matters for display.
  }

  return NextResponse.json({ success: true });
}