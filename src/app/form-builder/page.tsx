'use client';

import formFields from '@/config/form-fields.json';
import type { FormField } from '@/components/forms/dynamic-form.utils';
import { DynamicFormRenderer } from '@/components/forms/dynamic-form-renderer';
import Link from 'next/link';

const fields = Array.isArray(formFields) ? (formFields as FormField[]) : [];

export default function FormBuilderPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <section className="w-full max-w-2xl rounded-2xl border bg-card p-8 shadow-sm">
        <div className="mb-8 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Dynamic Form From JSON
            </p>
            <Link
              href="/form-playground"
              className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium tracking-[0.18em] text-primary uppercase hover:bg-primary/20 scale-95 transition-all duration-300"
            >
              Playground
            </Link>
          </div>
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
        <DynamicFormRenderer fields={fields} />
      </section>
    </main>
  );
}
