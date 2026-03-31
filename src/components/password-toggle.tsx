import { Eye, EyeOff } from 'lucide-react';
import { type ChangeEvent, useState } from 'react';
import type {
  FieldCtx,
  FormField,
} from '@/components/forms/dynamic-form.utils';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function PasswordToggle({
  field,
  fieldId,
  label,
  ctx,
  error,
}: {
  field: FormField;
  fieldId: string;
  label: string;
  ctx: FieldCtx;
  error: string | undefined;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <Field key={fieldId} data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>
      <FieldContent>
        <div className="relative">
          <Input
            id={fieldId}
            name={field.name}
            type={visible ? 'text' : 'password'}
            placeholder={field.placeholder}
            value={String(ctx.values[fieldId] ?? '')}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              ctx.setValue(fieldId, event.target.value)
            }
            required={field.required}
            aria-invalid={error ? true : undefined}
            className={cn('pr-10', error && 'border-destructive')}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded-sm p-1 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={visible ? 'Hide password' : 'Show password'}
          >
            {visible ? (
              <EyeOff className="size-4 shrink-0" aria-hidden />
            ) : (
              <Eye className="size-4 shrink-0" aria-hidden />
            )}
          </button>
        </div>
        {field.description ? (
          <FieldDescription>{field.description}</FieldDescription>
        ) : null}
        {error ? <FieldError>{error}</FieldError> : null}
      </FieldContent>
    </Field>
  );
}
