'use client';

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
        defaultValue={field.value || ''}
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

  if (
    field.type === 'text' ||
    field.type === 'email' ||
    field.type === 'number' ||
    field.type === 'file' ||
    field.type === 'color'
  ) {
    return (
      <Field key={fieldId} data-invalid={error ? true : undefined}>
        <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>
        <FieldContent>
          <Input
            id={fieldId}
            name={field.name}
            type={field.type}
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
