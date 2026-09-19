// apps/web/app/api/categories/route.ts
import { db } from "@/server";
import { buildCategoryTree } from "@novalot/shared/category";
import { categories } from "@novalot/shared/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
  const rows = await db
    .select()
    .from(categories)
    .orderBy(categories.displayOrder);

  const tree = buildCategoryTree(rows);

  return NextResponse.json({ categories: tree });
}
