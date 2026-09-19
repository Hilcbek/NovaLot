// app/categories/[slug]/page.tsx
import { notFound } from "next/navigation";
import { fetchCategoryBySlug } from "@/api/categories.api";
import { BrowseView, SortOption } from "@/components/auctions/browse-view";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ search?: string; sort?: string; page?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;

  let category;
  try {
    ({ category } = await fetchCategoryBySlug(slug));
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-1 font-serif text-3xl">{category.name}</h1>
      {category.description && <p className="mb-6 text-sm text-muted-foreground">{category.description}</p>}

      <BrowseView
        categoryId={category.id}
        search={query.search ?? ""}
        sort={(query.sort as SortOption) ?? "ending-soon"}
        page={query.page ? Number(query.page) : 1}
        lockedCategory
      />
    </div>
  );
}