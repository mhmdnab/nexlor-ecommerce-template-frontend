'use client';

import type { CategoryNode } from '@repo/types';
import { Badge, Button, Card, Dialog, EmptyState, ErrorState, Field, GradientText, Input, Select, Skeleton, useToast } from '@repo/ui';
import { FolderTree, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
  useAdminCategories,
  useDeleteCategory,
  useSaveCategory,
} from '@/lib/queries';

interface EditState {
  id?: string;
  name: string;
  slug: string;
  parentId: string;
}

export default function CategoriesPage() {
  const { data: tree, isLoading, isError, refetch } = useAdminCategories();
  const del = useDeleteCategory();
  const { toast } = useToast();
  const [editing, setEditing] = useState<EditState | null>(null);

  const flat = tree ? flatten(tree) : [];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            <GradientText>Categories</GradientText>
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Organize your catalog with a hierarchy of categories.</p>
        </div>
        <Button variant="gradient" onClick={() => setEditing({ name: '', slug: '', parentId: '' })}>
          <Plus className="h-4 w-4" aria-hidden /> New category
        </Button>
      </div>

      {/* List */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} className="rounded-none border-0" />
        ) : flat.length === 0 ? (
          <EmptyState
            icon={<FolderTree className="h-6 w-6" />}
            title="No categories"
            description="Organize your catalog with categories."
            action={
              <Button size="sm" onClick={() => setEditing({ name: '', slug: '', parentId: '' })}>
                <Plus className="h-4 w-4" aria-hidden /> New category
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-border" role="list">
            {flat.map(({ node, depth }) => (
              <li
                key={node.id}
                className="flex min-h-[44px] items-center gap-3 py-2 pr-4"
                style={{ paddingLeft: 16 + depth * 24 }}
              >
                <FolderTree className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                <span className="font-medium">{node.name}</span>
                <Badge tone="neutral" className="tabular">{node.productCount}</Badge>
                <span className="ml-auto flex gap-1">
                  <button
                    aria-label={`Edit ${node.name}`}
                    onClick={() => setEditing({ id: node.id, name: node.name, slug: node.slug, parentId: node.parentId ?? '' })}
                    className="grid h-11 w-11 place-items-center rounded-md hover:bg-surface-sunken focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    <Pencil className="h-4 w-4" aria-hidden />
                  </button>
                  <button
                    aria-label={`Delete ${node.name}`}
                    onClick={async () => {
                      await del.mutateAsync(node.id);
                      toast({ title: 'Category deleted', tone: 'success' });
                    }}
                    className="grid h-11 w-11 place-items-center rounded-md text-muted-foreground hover:bg-surface-sunken hover:text-danger focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {editing && (
        <CategoryDialog
          state={editing}
          options={flat.filter((f) => f.node.id !== editing.id)}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function CategoryDialog({
  state,
  options,
  onClose,
}: {
  state: EditState;
  options: { node: CategoryNode; depth: number }[];
  onClose: () => void;
}) {
  const save = useSaveCategory();
  const { toast } = useToast();
  const [name, setName] = useState(state.name);
  const [slug, setSlug] = useState(state.slug);
  const [parentId, setParentId] = useState(state.parentId);

  async function submit() {
    if (!name.trim()) return;
    try {
      await save.mutateAsync({
        id: state.id,
        body: { name, slug: slug || undefined, parentId: parentId || null },
      });
      toast({ title: state.id ? 'Category updated' : 'Category created', tone: 'success' });
      onClose();
    } catch (err) {
      toast({ title: 'Save failed', description: (err as Error).message, tone: 'error' });
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(o) => !o && onClose()}
      title={state.id ? 'Edit category' : 'New category'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button loading={save.isPending} onClick={submit}>Save</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Name" required>
          {({ id }) => <Input id={id} value={name} onChange={(e) => setName(e.target.value)} />}
        </Field>
        <Field label="Slug" helper="Leave blank to auto-generate.">
          {({ id }) => <Input id={id} value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto" />}
        </Field>
        <Field label="Parent category">
          {({ id }) => (
            <Select id={id} value={parentId} onChange={(e) => setParentId(e.target.value)}>
              <option value="">None (top level)</option>
              {options.map(({ node, depth }) => (
                <option key={node.id} value={node.id}>
                  {'— '.repeat(depth)}{node.name}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </div>
    </Dialog>
  );
}

function flatten(nodes: CategoryNode[], depth = 0): { node: CategoryNode; depth: number }[] {
  return nodes.flatMap((node) => [{ node, depth }, ...flatten(node.children, depth + 1)]);
}
