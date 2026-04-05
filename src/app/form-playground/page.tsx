'use client';

import { Plus, Sparkles, Trash2 } from 'lucide-react';
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
  type FormField,
  type FormValues,
} from '@/components/forms/dynamic-form.utils';
import { DynamicFormRenderer } from '@/components/forms/dynamic-form-renderer';
import {
  createOption,
  createPlaygroundField,
  hasPlaceholder,
  isOptionEditableField,
  isRatingField,
  PLAYGROUND_FIELD_PALETTE,
  sanitizeName,
} from '@/components/forms/form-playground-schema';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  DEFAULT_OPEN_SIDEBAR_SECTIONS,
  FORM_PLAYGROUND_STORAGE_VERSION,
  getBuilderFieldId,
  readPersistedPlaygroundState,
  writePersistedPlaygroundState,
} from './form-playground-persistence';
import Link from 'next/link';

function EmptyPreview() {
  return (
    <div className="grid min-h-[360px] place-items-center rounded-3xl border border-dashed border-border/70 bg-muted/20 p-8 text-center">
      <div className="max-w-sm space-y-3">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Sparkles className="size-5" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-lg font-semibold tracking-tight">
            Start a local playground form
          </h2>
          <p className="text-sm text-muted-foreground">
            Add a field from the left to grow the schema and render a live
            preview here.
          </p>
        </div>
      </div>
    </div>
  );
}

function PropertySection({
  value,
  title,
  description,
  children,
}: {
  value: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <AccordionItem
      value={value}
      className="overflow-hidden rounded-2xl border border-border/70 bg-background/75 px-4"
    >
      <AccordionTrigger className="py-4 hover:no-underline">
        <div className="flex min-w-0 flex-1 flex-col gap-1 pr-4 text-left">
          <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
          {description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </AccordionTrigger>
      <AccordionContent>{children}</AccordionContent>
    </AccordionItem>
  );
}

export default function FormPlaygroundPage() {
  const [builderFields, setBuilderFields] = useState<FormField[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [openSidebarSections, setOpenSidebarSections] = useState<string[]>(
    DEFAULT_OPEN_SIDEBAR_SECTIONS,
  );
  const [previewValues, setPreviewValues] = useState<FormValues>({});
  const hasLoadedPersistedStateRef = useRef(false);

  const selectedIndex = useMemo(
    () =>
      builderFields.findIndex(
        (field, index) => getBuilderFieldId(field, index) === selectedFieldId,
      ),
    [builderFields, selectedFieldId],
  );
  const selectedField =
    selectedIndex >= 0 ? builderFields[selectedIndex] : null;

  useEffect(() => {
    const persistedState = readPersistedPlaygroundState();

    if (persistedState) {
      setBuilderFields(persistedState.builderFields);
      setSelectedFieldId(persistedState.selectedFieldId);
      setOpenSidebarSections(persistedState.openSidebarSections);
      setPreviewValues(persistedState.previewValues);
    }

    hasLoadedPersistedStateRef.current = true;
  }, []);

  useEffect(() => {
    if (!hasLoadedPersistedStateRef.current || typeof window === 'undefined') {
      return;
    }

    writePersistedPlaygroundState({
      version: FORM_PLAYGROUND_STORAGE_VERSION,
      builderFields,
      selectedFieldId,
      openSidebarSections,
      previewValues,
    });
  }, [builderFields, openSidebarSections, previewValues, selectedFieldId]);

  function ensureSidebarSectionsOpen(sectionValues: string[]) {
    setOpenSidebarSections((currentValues) => [
      ...currentValues,
      ...sectionValues.filter((value) => !currentValues.includes(value)),
    ]);
  }

  function handleSelectField(fieldId: string) {
    setSelectedFieldId(fieldId);
    ensureSidebarSectionsOpen(['properties']);
  }

  function addField(type: (typeof PLAYGROUND_FIELD_PALETTE)[number]['type']) {
    const nextField = createPlaygroundField(type, builderFields.length);
    const nextFieldId = getBuilderFieldId(nextField, builderFields.length);

    setBuilderFields((currentFields) => [...currentFields, nextField]);
    setSelectedFieldId(nextFieldId);
    ensureSidebarSectionsOpen(['current-schema', 'properties']);
  }

  function updateSelectedField(
    updater: (field: FormField, index: number) => FormField,
  ) {
    if (!selectedFieldId) {
      return;
    }

    setBuilderFields((currentFields) =>
      currentFields.map((field, index) =>
        getBuilderFieldId(field, index) === selectedFieldId
          ? updater(field, index)
          : field,
      ),
    );
  }

  function removeField(fieldId: string) {
    const currentIndex = builderFields.findIndex(
      (field, index) => getBuilderFieldId(field, index) === fieldId,
    );

    if (currentIndex === -1) {
      return;
    }

    const nextFields = builderFields.filter(
      (_, index) => getBuilderFieldId(builderFields[index], index) !== fieldId,
    );

    setBuilderFields(nextFields);

    if (selectedFieldId !== fieldId) {
      return;
    }

    const fallbackField =
      nextFields[currentIndex] ?? nextFields[currentIndex - 1];

    if (!fallbackField) {
      setSelectedFieldId(null);
      return;
    }

    const fallbackIndex = nextFields.indexOf(fallbackField);
    setSelectedFieldId(getBuilderFieldId(fallbackField, fallbackIndex));
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,color-mix(in_oklab,var(--color-primary)_12%,transparent),transparent_34%),linear-gradient(to_bottom,color-mix(in_oklab,var(--color-muted)_45%,transparent),transparent_24%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <section className="space-y-4 rounded-[28px] border border-border/70 bg-card/90 p-5 shadow-sm backdrop-blur">
          <div className="space-y-3">
            <Link href="/form-builder" className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium tracking-[0.18em] text-primary uppercase hover:bg-primary/20 scale-95 transition-all duration-300">
              Back to builder
            </Link>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight">
                Form playground
              </h1>
              <p className="max-w-md text-sm text-muted-foreground">
                Append fields, tweak a compact runtime schema, and inspect the
                live preview without touching the existing JSON-backed builder.
              </p>
            </div>
          </div>

          <Accordion
            multiple
            value={openSidebarSections}
            onValueChange={(value) =>
              setOpenSidebarSections(Array.isArray(value) ? value : [])
            }
            className="gap-4"
          >
            <PropertySection
              value="field-palette"
              title="Field palette"
              description="Each click appends a field to the local schema."
            >
              <div className="grid grid-cols-2 gap-2.5">
                {PLAYGROUND_FIELD_PALETTE.map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => addField(item.type)}
                    className="group flex min-h-20 flex-col items-start justify-between rounded-2xl border border-border/70 bg-background px-3.5 py-3 text-left transition hover:border-primary/40 hover:bg-primary/4 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    <span className="inline-flex items-center gap-2 text-sm font-medium tracking-tight">
                      <Plus className="size-3.5 text-primary transition group-hover:scale-110" />
                      {item.label}
                    </span>
                    <span className="text-xs leading-relaxed text-muted-foreground">
                      {item.description}
                    </span>
                  </button>
                ))}
              </div>
            </PropertySection>

            <PropertySection
              value="current-schema"
              title="Current schema"
              description="Select a field to edit or remove it."
            >
              {builderFields.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-5 text-sm text-muted-foreground">
                  No fields yet. Start with the palette above.
                </div>
              ) : (
                <div className="space-y-2">
                  {builderFields.map((field, index) => {
                    const fieldId = getBuilderFieldId(field, index);
                    const selected = fieldId === selectedFieldId;

                    return (
                      <button
                        key={fieldId}
                        type="button"
                        onClick={() => handleSelectField(fieldId)}
                        className={cn(
                          'flex w-full items-center justify-between gap-3 rounded-2xl border px-3.5 py-3 text-left transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                          selected
                            ? 'border-primary/45 bg-primary/8'
                            : 'border-border/70 bg-background hover:border-primary/25 hover:bg-muted/25',
                        )}
                      >
                        <div className="min-w-0 space-y-1">
                          <p className="truncate text-sm font-medium tracking-tight">
                            {field.label || 'Untitled field'}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {field.type} • {field.name || 'unnamed'}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full border border-border/70 px-2 py-0.5 text-[11px] text-muted-foreground uppercase">
                          {index + 1}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </PropertySection>

            <PropertySection
              value="properties"
              title="Properties"
              description={
                selectedField
                  ? 'Editing the selected field updates the preview immediately.'
                  : 'Pick a field from the schema list to edit it.'
              }
            >
              {!selectedField ? (
                <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-5 text-sm text-muted-foreground">
                  Nothing selected yet.
                </div>
              ) : (
                <div className="space-y-4">
                  <FieldGroup className="gap-4">
                    <Field>
                      <FieldLabel htmlFor="field-label">Label</FieldLabel>
                      <FieldContent>
                        <Input
                          id="field-label"
                          value={selectedField.label ?? ''}
                          onChange={(event) =>
                            updateSelectedField((field) => ({
                              ...field,
                              label: event.target.value,
                            }))
                          }
                        />
                      </FieldContent>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="field-name">Name</FieldLabel>
                      <FieldContent>
                        <Input
                          id="field-name"
                          value={selectedField.name ?? ''}
                          onChange={(event) =>
                            updateSelectedField((field) => ({
                              ...field,
                              name: sanitizeName(event.target.value),
                            }))
                          }
                        />
                        <FieldDescription>
                          Sanitized to keep the form payload stable.
                        </FieldDescription>
                      </FieldContent>
                    </Field>

                    {hasPlaceholder(selectedField) ? (
                      <Field>
                        <FieldLabel htmlFor="field-placeholder">
                          Placeholder
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            id="field-placeholder"
                            value={selectedField.placeholder ?? ''}
                            onChange={(event) =>
                              updateSelectedField((field) => ({
                                ...field,
                                placeholder: event.target.value,
                              }))
                            }
                          />
                        </FieldContent>
                      </Field>
                    ) : null}

                    <Field orientation="horizontal">
                      <Checkbox
                        id="field-required"
                        checked={selectedField.required === true}
                        onCheckedChange={(checked) =>
                          updateSelectedField((field) => ({
                            ...field,
                            required: checked === true,
                          }))
                        }
                      />
                      <FieldContent>
                        <FieldLabel htmlFor="field-required">
                          Required
                        </FieldLabel>
                        <FieldDescription>
                          Validation only runs when this is enabled.
                        </FieldDescription>
                      </FieldContent>
                    </Field>
                  </FieldGroup>

                  {isOptionEditableField(selectedField) ? (
                    <div className="space-y-3 rounded-2xl border border-border/70 bg-muted/15 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h4 className="text-sm font-semibold tracking-tight">
                            Options
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Edit labels and values for runtime choices.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            updateSelectedField((field) =>
                              isOptionEditableField(field)
                                ? {
                                    ...field,
                                    options: [
                                      ...(field.options ?? []),
                                      createOption(field.options?.length ?? 0),
                                    ],
                                  }
                                : field,
                            )
                          }
                          className="inline-flex h-8 items-center rounded-md border border-border/70 bg-background px-3 text-xs font-medium transition hover:border-primary/30 hover:bg-primary/4 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        >
                          Add option
                        </button>
                      </div>

                      <div className="space-y-3">
                        {(selectedField.options ?? []).map(
                          (option, optionIndex) => (
                            <div
                              key={`${getBuilderFieldId(selectedField, selectedIndex)}-${optionIndex}`}
                              className="grid gap-2 rounded-xl border border-border/70 bg-background p-3"
                            >
                              <div className="grid gap-2 sm:grid-cols-2">
                                <Input
                                  value={option.label ?? ''}
                                  placeholder="Option label"
                                  onChange={(event) =>
                                    updateSelectedField((field) =>
                                      isOptionEditableField(field)
                                        ? {
                                            ...field,
                                            options: (field.options ?? []).map(
                                              (currentOption, currentIndex) =>
                                                currentIndex === optionIndex
                                                  ? {
                                                      ...currentOption,
                                                      label: event.target.value,
                                                    }
                                                  : currentOption,
                                            ),
                                          }
                                        : field,
                                    )
                                  }
                                />
                                <Input
                                  value={option.value ?? ''}
                                  placeholder="option_value"
                                  onChange={(event) =>
                                    updateSelectedField((field) =>
                                      isOptionEditableField(field)
                                        ? {
                                            ...field,
                                            options: (field.options ?? []).map(
                                              (currentOption, currentIndex) =>
                                                currentIndex === optionIndex
                                                  ? {
                                                      ...currentOption,
                                                      value: sanitizeName(
                                                        event.target.value,
                                                      ),
                                                    }
                                                  : currentOption,
                                            ),
                                          }
                                        : field,
                                    )
                                  }
                                />
                              </div>
                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateSelectedField((field) =>
                                      isOptionEditableField(field)
                                        ? {
                                            ...field,
                                            options: (
                                              field.options ?? []
                                            ).filter(
                                              (_, currentIndex) =>
                                                currentIndex !== optionIndex,
                                            ),
                                          }
                                        : field,
                                    )
                                  }
                                  className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs text-destructive transition hover:bg-destructive/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                >
                                  <Trash2 className="size-3.5" />
                                  Remove
                                </button>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  ) : null}

                  {isRatingField(selectedField) ? (
                    <div className="grid gap-3 rounded-2xl border border-border/70 bg-muted/15 p-4 sm:grid-cols-2">
                      <Field>
                        <FieldLabel htmlFor="field-rating-max">Max</FieldLabel>
                        <FieldContent>
                          <Input
                            id="field-rating-max"
                            type="number"
                            min={1}
                            max={10}
                            value={String(selectedField.max ?? 5)}
                            onChange={(event) =>
                              updateSelectedField((field) =>
                                isRatingField(field)
                                  ? {
                                      ...field,
                                      max: Math.min(
                                        10,
                                        Math.max(
                                          1,
                                          Number.parseInt(
                                            event.target.value,
                                            10,
                                          ) || 1,
                                        ),
                                      ),
                                    }
                                  : field,
                              )
                            }
                          />
                        </FieldContent>
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="field-rating-default">
                          Default value
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            id="field-rating-default"
                            type="number"
                            min={0}
                            max={selectedField.max ?? 5}
                            value={String(selectedField.value ?? '')}
                            onChange={(event) =>
                              updateSelectedField((field) =>
                                isRatingField(field)
                                  ? {
                                      ...field,
                                      value: event.target.value
                                        ? String(
                                            Math.min(
                                              field.max ?? 5,
                                              Math.max(
                                                0,
                                                Number.parseInt(
                                                  event.target.value,
                                                  10,
                                                ) || 0,
                                              ),
                                            ),
                                          )
                                        : '',
                                    }
                                  : field,
                              )
                            }
                          />
                        </FieldContent>
                      </Field>
                    </div>
                  ) : null}

                  <Field>
                    <FieldLabel htmlFor="field-description">
                      Description
                    </FieldLabel>
                    <FieldContent>
                      <Textarea
                        id="field-description"
                        value={selectedField.description ?? ''}
                        onChange={(event) =>
                          updateSelectedField((field) => ({
                            ...field,
                            description: event.target.value,
                          }))
                        }
                      />
                    </FieldContent>
                  </Field>

                  <button
                    type="button"
                    onClick={() =>
                      removeField(
                        getBuilderFieldId(selectedField, selectedIndex),
                      )
                    }
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 text-sm font-medium text-destructive transition hover:bg-destructive/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    <Trash2 className="size-4" />
                    Remove field
                  </button>
                </div>
              )}
            </PropertySection>
          </Accordion>
        </section>

        <section className="rounded-[32px] border border-border/70 bg-card/95 p-5 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-2 border-b border-border/70 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Live preview
              </p>
              <h2 className="text-2xl font-semibold tracking-tight">
                Runtime schema canvas
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">
              {builderFields.length} field
              {builderFields.length === 1 ? '' : 's'}
            </p>
          </div>

          <div className="mt-6 rounded-[28px] border border-border/70 bg-background p-5 sm:p-7">
            <DynamicFormRenderer
              fields={builderFields}
              submitLabel="Submit preview"
              emptyState={<EmptyPreview />}
              initialValues={previewValues}
              onValuesChange={setPreviewValues}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
