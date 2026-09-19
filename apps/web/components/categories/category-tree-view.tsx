// features/categories/components/category-tree-view.tsx
"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CategoryNode } from "@novalot/shared/category";
import type { Category } from "@novalot/shared/db/schema";

function TreeRow({
  node,
  depth,
  onEdit,
  onDelete,
}: {
  node: CategoryNode;
  depth: number;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <div
        className="flex items-center gap-2 border-b py-2 pr-2"
        style={{ paddingLeft: depth * 20 }}
      >
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-muted-foreground disabled:opacity-0"
          disabled={!hasChildren}
        >
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>

        <span className="flex-1 text-sm font-medium">{node.name}</span>
        <span className="text-xs text-muted-foreground">{node.slug}</span>
        {/* auctionCount: no auctions table yet — wire in once that lands */}
        <span className="w-16 text-right text-xs text-muted-foreground">—</span>

        <Button variant="ghost" size="icon" onClick={() => onEdit(node)}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(node)}>
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </Button>
      </div>

      {expanded &&
        node.children.map((child) => (
          <TreeRow key={child.id} node={child} depth={depth + 1} onEdit={onEdit} onDelete={onDelete} />
        ))}
    </div>
  );
}

export function CategoryTreeView({
  tree,
  onEdit,
  onDelete,
}: {
  tree: CategoryNode[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}) {
  if (tree.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No categories yet.</p>;
  }

  return (
    <div className="rounded-md border">
      <div className="flex items-center gap-2 border-b bg-muted/40 px-2 py-2 text-xs font-medium text-muted-foreground">
        <span className="w-4" />
        <span className="flex-1">Name</span>
        <span>Slug</span>
        <span className="w-16 text-right">Auctions</span>
        <span className="w-[68px]" />
      </div>
      {tree.map((node) => (
        <TreeRow key={node.id} node={node} depth={0} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}