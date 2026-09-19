// apps/web/app/api/categories/[slug]/route.ts
import { db } from "@/server";
import { requireAdmin } from "@/server";
import { validateCategoryParent } from "@novalot/shared/category";
import { categories } from "@novalot/shared/db/schema";
import { updateCategorySchema, validate } from "@novalot/shared/validation";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);

  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const children = await db
    .select()
    .from(categories)
    .where(eq(categories.parentId, category.id))
    .orderBy(categories.displayOrder);

  return NextResponse.json({
    category,
    children,
    // auctionCount: intentionally omitted — no auctions table/relation yet, wire in when that lands
  });
}

// apps/web/app/api/admin/categories/[slug]/route.ts

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  const { slug: currentSlug } = await params;

  const body = await req.json().catch(() => null);
  const parsed = validate(updateCategorySchema, body);

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.errors }, { status: 400 });
  }

  const [existing] = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, currentSlug))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  if ("parentId" in parsed.data) {
    const newParentId = parsed.data.parentId ?? null;
    const allCategories = await db.select().from(categories);

    if (newParentId) {
      const parentExists = allCategories.some((c) => c.id === newParentId);
      if (!parentExists) {
        return NextResponse.json(
          { error: "Parent category not found" },
          { status: 400 },
        );
      }
    }

    const result = validateCategoryParent(allCategories, {
      categoryId: existing.id,
      newParentId,
    });

    if (!result.valid) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }
  }

  try {
    const [updated] = await db
      .update(categories)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(categories.id, existing.id))
      .returning();

    return NextResponse.json({ category: updated });
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  const { slug } = await params;

  const [existing] = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const children = await db
    .select()
    .from(categories)
    .where(eq(categories.parentId, existing.id));
  if (children.length > 0) {
    return NextResponse.json(
      {
        error:
          "Cannot delete a category that has subcategories. Remove or reassign them first.",
      },
      { status: 409 },
    );
  }

  // TODO: block delete if auctions reference this category — no auctions table/relation yet.

  await db.delete(categories).where(eq(categories.id, existing.id));

  return NextResponse.json({ success: true });
}
