'use client';

import type { VariantPreset } from '@repo/types';
import {
  Badge,
  Button,
  Card,
  Dialog,
  EmptyState,
  ErrorState,
  Eyebrow,
  Field,
  GradientText,
  Input,
  Skeleton,
  useToast,
} from '@repo/ui';
import { Layers, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import {
  useAdminVariantPresets,
  useDeleteVariantPreset,
  useSaveVariantPreset,
} from '@/lib/queries';

export default function VariantsPage() {
  const { data, isLoading, isError, refetch } = useAdminVariantPresets();
  const del = useDeleteVariantPreset();
  const { toast } = useToast();

  // undefined = closed, null = new, VariantPreset = editing
  const [editing, setEditing] = useState<VariantPreset | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<VariantPreset | null>(null);

  function openCreate() {
    setEditing(null);
  }
  function openEdit(preset: VariantPreset) {
    setEditing(preset);
  }
  function closeDialog() {
    setEditing(undefined);
  }

  function confirmDelete(preset: VariantPreset) {
    setDeleting(preset);
  }
  function closeDeleteDialog() {
    setDeleting(null);
  }

  function handleDelete() {
    if (!deleting) return;
    del.mutate(deleting.id, {
      onSuccess: () => {
        toast({ title: 'Preset deleted', tone: 'success' });
        setDeleting(null);
      },
      onError: (e) =>
        toast({ title: 'Delete failed', description: (e as Error).message, tone: 'error' }),
    });
  }

  const presets = data ?? [];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Eyebrow>Catalog</Eyebrow>
          <h1 className="mt-1 font-serif text-2xl font-semibold tracking-tight">
            Variant <GradientText>Presets</GradientText>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Reusable variant option sets you can apply to products.
          </p>
        </div>
        <Button variant="gradient" onClick={openCreate}>
          <Plus className="h-4 w-4" aria-hidden /> New preset
        </Button>
      </div>

      {/* List */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} className="rounded-none border-0" />
        ) : presets.length === 0 ? (
          <EmptyState
            icon={<Layers className="h-6 w-6" />}
            title="No presets yet"
            description="Create reusable option sets like Size or Color to speed up product setup."
            action={
              <Button size="sm" onClick={openCreate}>
                <Plus className="h-4 w-4" aria-hidden /> New preset
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-border" role="list">
            {presets.map((preset) => (
              <li
                key={preset.id}
                className="flex min-h-[56px] flex-wrap items-center gap-3 px-4 py-3"
              >
                <span className="font-medium">{preset.name}</span>
                <span className="flex flex-wrap gap-1">
                  {preset.options.map((opt) => (
                    <Badge key={opt} tone="neutral">
                      {opt}
                    </Badge>
                  ))}
                </span>
                <span className="ml-auto flex gap-1">
                  <button
                    aria-label={`Edit ${preset.name}`}
                    onClick={() => openEdit(preset)}
                    className="grid h-11 w-11 place-items-center rounded-md hover:bg-surface-sunken focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    <Pencil className="h-4 w-4" aria-hidden />
                  </button>
                  <button
                    aria-label={`Delete ${preset.name}`}
                    onClick={() => confirmDelete(preset)}
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

      {/* Create / edit dialog */}
      {editing !== undefined && (
        <PresetDialog preset={editing} onClose={closeDialog} />
      )}

      {/* Delete confirm dialog */}
      {deleting && (
        <Dialog
          open
          onOpenChange={(o) => !o && closeDeleteDialog()}
          title="Delete preset?"
          description={`"${deleting.name}" will be permanently removed. This cannot be undone.`}
          footer={
            <>
              <Button variant="ghost" onClick={closeDeleteDialog}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                loading={del.isPending}
                onClick={handleDelete}
              >
                Delete
              </Button>
            </>
          }
        >
          {null}
        </Dialog>
      )}
    </div>
  );
}

function PresetDialog({
  preset,
  onClose,
}: {
  preset: VariantPreset | null;
  onClose: () => void;
}) {
  const save = useSaveVariantPreset();
  const { toast } = useToast();

  const [name, setName] = useState(preset?.name ?? '');
  const [options, setOptions] = useState<string[]>(preset?.options ?? ['']);
  const [err, setErr] = useState<string | null>(null);

  const setOption = (i: number, v: string) =>
    setOptions((p) => p.map((x, j) => (j === i ? v : x)));
  const addOption = () => setOptions((p) => [...p, '']);
  const removeOption = (i: number) =>
    setOptions((p) => (p.length > 1 ? p.filter((_, j) => j !== i) : p));

  function submit() {
    setErr(null);
    const cleanName = name.trim();
    const cleanOptions = options.map((o) => o.trim()).filter(Boolean);

    if (!cleanName) {
      setErr('Name is required.');
      return;
    }
    if (cleanOptions.length === 0) {
      setErr('Add at least one option.');
      return;
    }

    save.mutate(
      { id: preset?.id, body: { name: cleanName, options: cleanOptions } },
      {
        onSuccess: () => {
          toast({
            title: preset ? 'Preset updated' : 'Preset created',
            tone: 'success',
          });
          onClose();
        },
        onError: (e) =>
          toast({
            title: 'Save failed',
            description: (e as Error).message,
            tone: 'error',
          }),
      },
    );
  }

  return (
    <Dialog
      open
      onOpenChange={(o) => !o && onClose()}
      title={preset ? 'Edit preset' : 'New preset'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={save.isPending} onClick={submit}>
            Save
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Name" required error={err && !name.trim() ? err : undefined}>
          {({ id, invalid }) => (
            <Input
              id={id}
              invalid={invalid}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (err) setErr(null);
              }}
              placeholder="e.g. Size"
            />
          )}
        </Field>

        {/* Options editor */}
        <div className="space-y-2">
          <p className="text-sm font-medium leading-none">Options</p>
          <div className="space-y-2">
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={opt}
                  onChange={(e) => {
                    setOption(i, e.target.value);
                    if (err) setErr(null);
                  }}
                  placeholder={`Option ${i + 1}`}
                  aria-label={`Option ${i + 1}`}
                />
                <button
                  type="button"
                  aria-label="Remove option"
                  onClick={() => removeOption(i)}
                  disabled={options.length === 1}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-surface-sunken hover:text-danger focus-visible:outline-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-40"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>
            ))}
          </div>

          <Button type="button" variant="secondary" size="sm" onClick={addOption}>
            <Plus className="h-4 w-4" aria-hidden /> Add option
          </Button>

          {err && (
            <p role="alert" className="text-sm text-danger">
              {err}
            </p>
          )}
        </div>
      </div>
    </Dialog>
  );
}
