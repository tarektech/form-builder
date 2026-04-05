'use client';

import {
  type ReactNode,
  type SubmitEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { FieldGroup } from '@/components/ui/field';

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

type DynamicFormRendererProps = {
  fields: FormField[];
  className?: string;
  submitLabel?: string;
  emptyState?: ReactNode;
  initialValues?: FormValues;
  onValuesChange?: (values: FormValues) => void;
};

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
    field.type === 'checkbox' ||
    field.type === 'date' ||
    field.type === 'phone' ||
    field.type === 'switch' ||
    field.type === 'rating' ||
    field.type === 'slider'
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
    field.type === 'checkbox-group' ||
    field.type === 'combobox'
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

function getFieldIds(fields: FormField[]) {
  return new Set(fields.map((field, index) => getFieldId(field, index)));
}

function reconcileValues(fields: FormField[], previousValues: FormValues) {
  const nextValues = buildInitialValues(fields);

  fields.forEach((field, index) => {
    const fieldId = getFieldId(field, index);

    if (fieldId in previousValues) {
      nextValues[fieldId] = previousValues[fieldId];
    }
  });

  return nextValues;
}

function areFormValuesEqual(left: FormValues, right: FormValues) {
  const leftEntries = Object.entries(left);
  const rightEntries = Object.entries(right);

  if (leftEntries.length !== rightEntries.length) {
    return false;
  }

  for (const [fieldId, leftValue] of leftEntries) {
    const rightValue = right[fieldId];

    if (Array.isArray(leftValue) || Array.isArray(rightValue)) {
      if (!Array.isArray(leftValue) || !Array.isArray(rightValue)) {
        return false;
      }

      if (leftValue.length !== rightValue.length) {
        return false;
      }

      for (let index = 0; index < leftValue.length; index += 1) {
        if (leftValue[index] !== rightValue[index]) {
          return false;
        }
      }

      continue;
    }

    if (leftValue !== rightValue) {
      return false;
    }
  }

  return true;
}

export function DynamicFormRenderer({
  fields,
  className,
  submitLabel = 'Submit',
  emptyState,
  initialValues,
  onValuesChange,
}: DynamicFormRendererProps) {
  const safeFields = useMemo(
    () => (Array.isArray(fields) ? fields.filter(Boolean) : []),
    [fields],
  );
  const [values, setValues] = useState<FormValues>(() =>
    reconcileValues(safeFields, initialValues ?? {}),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const lastEmittedValuesRef = useRef<FormValues | null>(null);

  useEffect(() => {
    const fieldIds = getFieldIds(safeFields);

    setValues((previousValues) =>
      (() => {
        const nextValues = reconcileValues(
          safeFields,
          initialValues ?? previousValues,
        );

        return areFormValuesEqual(previousValues, nextValues)
          ? previousValues
          : nextValues;
      })(),
    );
    setErrors((previousErrors) =>
      Object.fromEntries(
        Object.entries(previousErrors).filter(([fieldId]) =>
          fieldIds.has(fieldId),
        ),
      ),
    );
  }, [initialValues, safeFields]);

  useEffect(() => {
    if (!onValuesChange) {
      return;
    }

    if (
      lastEmittedValuesRef.current &&
      areFormValuesEqual(lastEmittedValuesRef.current, values)
    ) {
      return;
    }

    lastEmittedValuesRef.current = values;
    onValuesChange(values);
  }, [onValuesChange, values]);

  const setValue = useCallback((fieldId: string, value: FormValue) => {
    setValues((previousValues) => ({ ...previousValues, [fieldId]: value }));
    setErrors((previousErrors) => {
      if (!previousErrors[fieldId]) {
        return previousErrors;
      }

      const nextErrors = { ...previousErrors };
      delete nextErrors[fieldId];
      return nextErrors;
    });
  }, []);

  const ctx = useMemo<FieldCtx>(
    () => ({ values, setValue, errors }),
    [errors, setValue, values],
  );

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const nextErrors = validate(safeFields, values, formElement);
    setErrors(nextErrors);
  }

  if (safeFields.length === 0) {
    return emptyState ? <div className={className}>{emptyState}</div> : null;
  }

  return (
    <div className={className}>
      <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
        <FieldGroup>
          {safeFields.map((field, index) => renderField(field, index, ctx))}
        </FieldGroup>
        <button
          type="submit"
          className="inline-flex h-10 cursor-pointer items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-[transform,box-shadow,filter] duration-150 ease-out hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-[0.98] active:brightness-95 active:shadow-inner"
        >
          {submitLabel}
        </button>
      </form>
    </div>
  );
}
