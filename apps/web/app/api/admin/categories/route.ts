// apps/web/app/api/admin/categories/route.ts
import { db } from "@/server";
import { requireAdmin } from "@/server";
import { slugify, validateCategoryParent } from "@novalot/shared/category";
import { createCategorySchema } from "@novalot/shared/category-validation"; // ← still unconfirmed, see note
import { categories } from "@novalot/shared/db/schema";
import { validate } from "@novalot/shared/validation";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => null);
  const parsed = validate(createCategorySchema, body);

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.errors }, { status: 400 });
  }

  const { name, parentId, description, imageUrl, displayOrder } = parsed.data;
  const slug = parsed.data.slug ?? slugify(name);

  if (parentId) {
    const allCategories = await db.select().from(categories);
    const parentExists = allCategories.some((c) => c.id === parentId);

    if (!parentExists) {
      return NextResponse.json(
        { error: "Parent category not found" },
        { status: 400 },
      );
    }

    // categoryId doesn't exist yet — a fresh id can't self-match or appear as anyone's
    // ancestor, so this reduces cleanly to just the depth check for a brand-new node.
    const result = validateCategoryParent(allCategories, {
      categoryId: crypto.randomUUID(),
      newParentId: parentId,
    });

    if (!result.valid) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }
  }

  try {
    const [created] = await db
      .insert(categories)
      .values({
        name,
        slug,
        parentId: parentId ?? null,
        description: description ?? null,
        imageUrl: imageUrl ?? null,
        displayOrder: displayOrder ?? 0,
      })
      .returning();

    return NextResponse.json({ category: created }, { status: 201 });
  } catch (err: any) {
    if (err?.code === "23505") {
      return NextResponse.json(
        { error: "A category with this slug already exists" },
        { status: 409 },
      );
    }
    throw err;
  }
}
