'use client';

import { Star } from 'lucide-react';
import type { ChangeEvent } from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { PasswordToggle } from '../password-toggle';
import type { FieldCtx, FormField } from './dynamic-form.utils';

type DynamicFormInputFieldProps = {
  field: FormField;
  fieldId: string;
  label: string | null;
  ctx: FieldCtx;
};

export function DynamicFormInputField({
  field,
  fieldId,
  label,
  ctx,
}: DynamicFormInputFieldProps) {
  if (field.type === 'hidden') {
    return (
      <Input
        id={fieldId}
        name={field.name}
        type="hidden"
        defaultValue={
          typeof field.value === 'string' || typeof field.value === 'number'
            ? String(field.value)
            : ''
        }
      />
    );
  }

  if (!label) {
    return null;
  }

  const error = ctx.errors[fieldId];

  if (field.type === 'checkbox') {
    return (
      <Field
        key={fieldId}
        orientation="horizontal"
        data-invalid={error ? true : undefined}
      >
        <Checkbox
          id={fieldId}
          name={field.name}
          checked={ctx.values[fieldId] === true}
          onCheckedChange={(checked) => ctx.setValue(fieldId, checked === true)}
          aria-invalid={error ? true : undefined}
        />
        <FieldContent>
          <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>
          {field.description ? (
            <FieldDescription>{field.description}</FieldDescription>
          ) : null}
          {error ? <FieldError>{error}</FieldError> : null}
        </FieldContent>
      </Field>
    );
  }

  if (field.type === 'switch') {
    const checked = ctx.values[fieldId] === true;

    return (
      <Field
        key={fieldId}
        orientation="horizontal"
        data-invalid={error ? true : undefined}
      >
        <button
          id={fieldId}
          type="button"
          role="switch"
          aria-checked={checked}
          aria-invalid={error ? true : undefined}
          onClick={() => ctx.setValue(fieldId, !checked)}
          className={cn(
            'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
            checked
              ? 'border-primary bg-primary/90'
              : 'border-input bg-muted/70',
            error && 'border-destructive',
          )}
        >
          <span
            className={cn(
              'inline-block size-5 rounded-full bg-background shadow-sm transition-transform',
              checked ? 'translate-x-5' : 'translate-x-0.5',
            )}
          />
        </button>
        <FieldContent>
          <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>
          {field.description ? (
            <FieldDescription>{field.description}</FieldDescription>
          ) : null}
          {error ? <FieldError>{error}</FieldError> : null}
        </FieldContent>
      </Field>
    );
  }

  if (field.type === 'textarea') {
    return (
      <Field key={fieldId} data-invalid={error ? true : undefined}>
        <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>
        <FieldContent>
          <Textarea
            id={fieldId}
            name={field.name}
            placeholder={field.placeholder}
            value={String(ctx.values[fieldId] ?? '')}
            onChange={(event) => ctx.setValue(fieldId, event.target.value)}
            required={field.required}
            aria-invalid={error ? true : undefined}
            className={cn(error && 'border-destructive')}
          />
          {field.description ? (
            <FieldDescription>{field.description}</FieldDescription>
          ) : null}
          {error ? <FieldError>{error}</FieldError> : null}
        </FieldContent>
      </Field>
    );
  }

  if (field.type === 'password') {
    return (
      <PasswordToggle
        field={field}
        fieldId={fieldId}
        label={label}
        ctx={ctx}
        error={error}
      />
    );
  }

  if (field.type === 'rating') {
    const max =
      typeof field.max === 'number' && Number.isFinite(field.max)
        ? Math.min(10, Math.max(1, Math.round(field.max)))
        : 5;
    const selected =
      Number.parseInt(String(ctx.values[fieldId] ?? ''), 10) || 0;

    return (
      <Field key={fieldId} data-invalid={error ? true : undefined}>
        <FieldLabel>{label}</FieldLabel>
        <FieldContent>
          <div className="flex flex-wrap items-center gap-1.5">
            {Array.from({ length: max }, (_, index) => {
              const value = index + 1;
              const active = value <= selected;

              return (
                <button
                  key={`${fieldId}-${value}`}
                  type="button"
                  onClick={() =>
                    ctx.setValue(
                      fieldId,
                      selected === value ? '' : String(value),
                    )
                  }
                  className="rounded-sm p-1.5 text-muted-foreground transition hover:text-amber-500 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  aria-label={`Set rating to ${value}`}
                  aria-pressed={selected === value}
                >
                  <Star
                    className={cn(
                      'size-5 transition',
                      active
                        ? 'fill-amber-400 text-amber-500'
                        : 'fill-transparent text-muted-foreground',
                    )}
                  />
                </button>
              );
            })}
          </div>
          {field.description ? (
            <FieldDescription>{field.description}</FieldDescription>
          ) : null}
          {error ? <FieldError>{error}</FieldError> : null}
        </FieldContent>
      </Field>
    );
  }

  if (
    field.type === 'text' ||
    field.type === 'email' ||
    field.type === 'number' ||
    field.type === 'file' ||
    field.type === 'color' ||
    field.type === 'date' ||
    field.type === 'phone' ||
    field.type === 'slider'
  ) {
    const inputType =
      field.type === 'phone'
        ? 'tel'
        : field.type === 'slider'
          ? 'range'
          : field.type;

    return (
      <Field key={fieldId} data-invalid={error ? true : undefined}>
        <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>
        <FieldContent>
          <Input
            id={fieldId}
            name={field.name}
            type={inputType}
            placeholder={field.placeholder}
            {...(field.type === 'file'
              ? {
                  onChange: (event: ChangeEvent<HTMLInputElement>) =>
                    ctx.setValue(fieldId, event.target.files),
                }
              : {
                  value: String(ctx.values[fieldId] ?? ''),
                  onChange: (event: ChangeEvent<HTMLInputElement>) =>
                    ctx.setValue(fieldId, event.target.value),
                })}
            required={field.required}
            aria-invalid={error ? true : undefined}
            className={cn(error && 'border-destructive')}
          />
          {field.description ? (
            <FieldDescription>{field.description}</FieldDescription>
          ) : null}
          {error ? <FieldError>{error}</FieldError> : null}
        </FieldContent>
      </Field>
    );
  }

  return null;
}
