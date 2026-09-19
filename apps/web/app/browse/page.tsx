// app/browse/page.tsx

import { BrowseView, SortOption } from "@/components/auctions/browse-view";

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string; sort?: string; page?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 font-serif text-3xl">Browse auctions</h1>
      <BrowseView
        categoryId={params.category}
        search={params.search ?? ""}
        sort={(params.sort as SortOption) ?? "ending-soon"}
        page={params.page ? Number(params.page) : 1}
      />
    </div>
  );
}