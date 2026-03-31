import type { ReactNode } from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

import {
  type FieldCtx,
  type FormField,
  getOptions,
} from './dynamic-form.utils';

type DynamicFormOptionFieldProps = {
  field: FormField;
  fieldId: string;
  label: string | null;
  ctx: FieldCtx;
};

type OptionField = Extract<
  FormField,
  { type: 'select' | 'multiselect' | 'radio' | 'checkbox-group' }
>;

type OptionItem = ReturnType<typeof getOptions>[number];

function isOptionField(field: FormField): field is OptionField {
  return (
    field.type === 'select' ||
    field.type === 'multiselect' ||
    field.type === 'radio' ||
    field.type === 'checkbox-group'
  );
}

function getStringValue(value: FieldCtx['values'][string]) {
  return typeof value === 'string' ? value : '';
}

function getArrayValue(value: FieldCtx['values'][string]) {
  return Array.isArray(value) ? value : [];
}

function OptionError({
  description,
  error,
  errorClassName,
}: {
  description?: string;
  error?: string;
  errorClassName?: string;
}) {
  return (
    <>
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      {error ? (
        <FieldError className={errorClassName}>{error}</FieldError>
      ) : null}
    </>
  );
}

function OptionRow({
  optionId,
  option,
  control,
}: {
  optionId: string;
  option: OptionItem;
  control: ReactNode;
}) {
  return (
    <Field orientation="horizontal">
      {control}
      <FieldContent>
        <FieldLabel htmlFor={optionId} className="font-normal">
          {option.label}
        </FieldLabel>
        {option.description ? (
          <FieldDescription>{option.description}</FieldDescription>
        ) : null}
      </FieldContent>
    </Field>
  );
}

export function DynamicFormOptionField({
  field,
  fieldId,
  label,
  ctx,
}: DynamicFormOptionFieldProps) {
  if (!label || !isOptionField(field)) {
    return null;
  }

  const error = ctx.errors[fieldId];
  const options = getOptions(field);

  if (options.length === 0) {
    return null;
  }

  switch (field.type) {
    // select field
    case 'select': {
      const value = getStringValue(ctx.values[fieldId]);

      return (
        <Field data-invalid={error ? true : undefined}>
          <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>
          <FieldContent>
            <Select
              value={value || undefined}
              onValueChange={(nextValue) =>
                ctx.setValue(fieldId, nextValue ?? '')
              }
            >
              <SelectTrigger
                id={fieldId}
                className={cn('w-full', error && 'border-destructive')}
                aria-invalid={error ? true : undefined}
              >
                <SelectValue
                  placeholder={field.placeholder || `Select ${label}`}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {options.map((option) => (
                    <SelectItem
                      key={`${fieldId}-${option.value}`}
                      value={option.value}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <OptionError description={field.description} error={error} />
          </FieldContent>
        </Field>
      );
    }

    // multiselect field
    case 'multiselect': {
      const value = getArrayValue(ctx.values[fieldId]);

      return (
        <Field data-invalid={error ? true : undefined}>
          <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>
          <FieldContent>
            <select
              id={fieldId}
              name={field.name}
              multiple
              required={field.required}
              value={value}
              onChange={(event) => {
                const nextValue = Array.from(event.target.selectedOptions).map(
                  (option) => option.value,
                );
                ctx.setValue(fieldId, nextValue);
              }}
              aria-invalid={error ? true : undefined}
              className={cn(
                'min-h-28 w-full rounded-md border border-input bg-transparent px-2.5 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
                error && 'border-destructive',
              )}
            >
              {options.map((option) => (
                <option key={`${fieldId}-${option.value}`} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <OptionError description={field.description} error={error} />
          </FieldContent>
        </Field>
      );
    }

    // radio field
    case 'radio': {
      const value = getStringValue(ctx.values[fieldId]);

      return (
        <FieldSet data-invalid={error ? true : undefined}>
          <FieldLegend variant="label">{label}</FieldLegend>
          {field.description ? (
            <FieldDescription>{field.description}</FieldDescription>
          ) : null}
          <RadioGroup
            name={field.name}
            value={value || undefined}
            onValueChange={(nextValue) =>
              ctx.setValue(fieldId, nextValue ?? '')
            }
          >
            {options.map((option) => {
              const optionId = `${fieldId}-${option.value}`;

              return (
                <OptionRow
                  key={optionId}
                  optionId={optionId}
                  option={option}
                  control={
                    <RadioGroupItem
                      id={optionId}
                      value={option.value}
                      aria-invalid={error ? true : undefined}
                    />
                  }
                />
              );
            })}
          </RadioGroup>
          {error ? <FieldError className="mt-1">{error}</FieldError> : null}
        </FieldSet>
      );
    }

    // checkbox-group field
    case 'checkbox-group': {
      const selected = getArrayValue(ctx.values[fieldId]);

      return (
        <FieldSet data-invalid={error ? true : undefined}>
          <FieldLegend variant="label">{label}</FieldLegend>
          {field.description ? (
            <FieldDescription>{field.description}</FieldDescription>
          ) : null}
          <FieldGroup className="gap-3">
            {options.map((option) => {
              const optionId = `${fieldId}-${option.value}`;
              const checked = selected.includes(option.value);

              return (
                <OptionRow
                  key={optionId}
                  optionId={optionId}
                  option={option}
                  control={
                    <Checkbox
                      id={optionId}
                      name={field.name ?? fieldId}
                      value={option.value}
                      checked={checked}
                      onCheckedChange={(nextChecked) => {
                        const nextValue =
                          nextChecked === true
                            ? [...selected, option.value]
                            : selected.filter(
                                (value) => value !== option.value,
                              );

                        ctx.setValue(fieldId, nextValue);
                      }}
                      aria-invalid={error ? true : undefined}
                    />
                  }
                />
              );
            })}
          </FieldGroup>
          {error ? <FieldError className="mt-1">{error}</FieldError> : null}
        </FieldSet>
      );
    }

    default:
      return null;
  }
}
