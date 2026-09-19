// features/auctions/components/category-filter-sidebar.tsx
"use client";

import Link from "next/link";
import type { CategoryNode } from "@novalot/shared/category";
import { useCategories } from "@/hooks";

function CategoryLink({
  node,
  depth,
  activeCategoryId,
  buildHref,
}: {
  node: CategoryNode;
  depth: number;
  activeCategoryId?: string;
  buildHref: (categoryId: string) => string;
}) {
  const isActive = node.id === activeCategoryId;

  return (
    <div>
      <Link
        href={buildHref(node.id)}
        className={`block rounded px-2 py-1 text-sm ${
          isActive ? "bg-[#1F5D48]/10 font-medium text-[#1F5D48]" : "text-muted-foreground hover:text-foreground"
        }`}
        style={{ paddingLeft: 8 + depth * 12 }}
      >
        {node.name}
      </Link>
      {node.children.map((child) => (
        <CategoryLink
          key={child.id}
          node={child}
          depth={depth + 1}
          activeCategoryId={activeCategoryId}
          buildHref={buildHref}
        />
      ))}
    </div>
  );
}

export function CategoryFilterSidebar({
  activeCategoryId,
  buildHref,
}: {
  activeCategoryId?: string;
  buildHref: (categoryId: string) => string;
}) {
  const { data: tree = [], isLoading } = useCategories();

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading categories…</p>;
  }

  return (
    <nav className="space-y-1">
      <Link
        href={buildHref("")}
        className={`block rounded px-2 py-1 text-sm ${
          !activeCategoryId ? "bg-[#1F5D48]/10 font-medium text-[#1F5D48]" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        All categories
      </Link>
      {tree.map((node) => (
        <CategoryLink
          key={node.id}
          node={node}
          depth={0}
          activeCategoryId={activeCategoryId}
          buildHref={buildHref}
        />
      ))}
    </nav>
  );
}