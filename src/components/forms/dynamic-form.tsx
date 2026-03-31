'use client';

import { type FormEvent, useCallback, useMemo, useState } from 'react';

import { FieldGroup } from '@/components/ui/field';
import formFields from '@/config/form-fields.json';
import {
  buildInitialValues,
  type FieldCtx,
  type FormField,
  type FormValue,
  type FormValues,
  getFieldId,
  getFieldLabel,
  validate,
} from './dynamic-form.utils';
import { DynamicFormInputField } from './dynamic-form-input-field';
import { DynamicFormOptionField } from './dynamic-form-option-field';

const fields = Array.isArray(formFields) ? (formFields as FormField[]) : [];

function renderField(field: FormField, index: number, ctx: FieldCtx) {
  if (!field || typeof field !== 'object' || !field.type) {
    return null;
  }

  const fieldId = getFieldId(field, index);
  const label = getFieldLabel(field);

  if (
    field.type === 'hidden' ||
    field.type === 'text' ||
    field.type === 'email' ||
    field.type === 'number' ||
    field.type === 'password' ||
    field.type === 'file' ||
    field.type === 'color' ||
    field.type === 'textarea' ||
    field.type === 'checkbox'
  ) {
    return (
      <DynamicFormInputField
        key={fieldId}
        field={field}
        fieldId={fieldId}
        label={label}
        ctx={ctx}
      />
    );
  }

  if (
    field.type === 'select' ||
    field.type === 'multiselect' ||
    field.type === 'radio' ||
    field.type === 'checkbox-group'
  ) {
    return (
      <DynamicFormOptionField
        key={fieldId}
        field={field}
        fieldId={fieldId}
        label={label}
        ctx={ctx}
      />
    );
  }

  return null;
}

export function DynamicForm() {
  const initialValues = useMemo(() => buildInitialValues(fields), []);
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setValue = useCallback((fieldId: string, value: FormValue) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
    setErrors((prev) => {
      if (!prev[fieldId]) return prev;
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
  }, []);

  const ctx = useMemo<FieldCtx>(
    () => ({ values, setValue, errors }),
    [values, setValue, errors],
  );

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const nextErrors = validate(fields, values, formEl);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      console.error('[DynamicForm] Validation failed', nextErrors);
      return;
    }

    console.log('[DynamicForm] Submit OK', values);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <section className="w-full max-w-2xl rounded-2xl border bg-card p-8 shadow-sm">
        <div className="mb-8 flex flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">
            Dynamic Form From JSON
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Local schema-driven form
          </h1>
          <p className="text-sm text-muted-foreground">
            Edit{' '}
            <code className="rounded bg-muted px-1.5 py-0.5">
              src/config/form-fields.json
            </code>{' '}
            and the UI updates from that file.
          </p>
        </div>

        <form
          className="flex flex-col gap-6"
          onSubmit={handleSubmit}
          noValidate
        >
          <FieldGroup>
            {fields.map((field, index) => renderField(field, index, ctx))}
          </FieldGroup>
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            Submit
          </button>
        </form>
      </section>
    </main>
  );
}
