// features/auctions/components/browse-view.tsx
"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAuctions } from "@/hooks";
import { AuctionCard } from "./auction-card";
import { CategoryFilterSidebar } from "./category-filter-sidebar";

export type SortOption = "ending-soon" | "newest" | "price-asc" | "price-desc";

export interface BrowseFilters {
  categoryId?: string;
  search: string;
  sort: SortOption;
  page: number;
}

export function BrowseView({
  categoryId,
  search,
  sort,
  page,
  lockedCategory = false,
}: BrowseFilters & { lockedCategory?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchInput, setSearchInput] = useState(search);

  const { data, isLoading } = useAuctions({ categoryId, search, sort, page });
  const auctions = data?.data ?? [];
  const totalPages = data?.pagination.totalPages ?? 1;

  function updateParams(next: Partial<BrowseFilters>) {
    const params = new URLSearchParams();
    const merged = { categoryId, search, sort, page, ...next };

    if (merged.categoryId) params.set("category", merged.categoryId);
    if (merged.search) params.set("search", merged.search);
    if (merged.sort) params.set("sort", merged.sort);
    if (merged.page && merged.page > 1) params.set("page", String(merged.page));

    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateParams({ search: searchInput, page: 1 });
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[220px_1fr]">
      {!lockedCategory && (
        <aside>
          <CategoryFilterSidebar
            activeCategoryId={categoryId}
            buildHref={(id) => {
              const params = new URLSearchParams();
              if (id) params.set("category", id);
              if (search) params.set("search", search);
              if (sort) params.set("sort", sort);
              const qs = params.toString();
              return qs ? `${pathname}?${qs}` : pathname;
            }}
          />
        </aside>
      )}

      <div className={lockedCategory ? "md:col-span-2" : ""}>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <Input
              placeholder="Search auctions…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-56"
            />
            <Button type="submit" variant="outline">Search</Button>
          </form>

          <Select value={sort} onValueChange={(v) => updateParams({ sort: v as SortOption, page: 1 })}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ending-soon">Ending soon</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-asc">Price: low to high</SelectItem>
              <SelectItem value="price-desc">Price: high to low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <p className="py-12 text-center text-sm text-muted-foreground">Loading auctions…</p>
        ) : auctions.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">No auctions found.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {auctions.map((auction) => (
              <AuctionCard key={auction.id} auction={auction} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() => updateParams({ page: page - 1 })}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => updateParams({ page: page + 1 })}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}