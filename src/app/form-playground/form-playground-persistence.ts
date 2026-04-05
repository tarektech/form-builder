import {
  type FormField,
  type FormValues,
  getFieldId,
} from '@/components/forms/dynamic-form.utils';

export function getBuilderFieldId(field: FormField, index: number) {
  return getFieldId(field, index);
}

export const DEFAULT_OPEN_SIDEBAR_SECTIONS = [
  'field-palette',
  'current-schema',
  'properties',
];

const FORM_PLAYGROUND_STORAGE_KEY = 'form-playground:v1';
export const FORM_PLAYGROUND_STORAGE_VERSION = 1;

const MAX_PERSISTED_STRING_LENGTH = 4000;
const MAX_PERSISTED_ARRAY_ITEMS = 100;
const MAX_PERSISTED_TOTAL_CHARS = 50000;

export type PersistedFormValue = string | boolean | string[] | null;
export type PersistedFormValues = Record<string, PersistedFormValue>;
export type PersistedPlaygroundState = {
  version: number;
  builderFields: FormField[];
  selectedFieldId: string | null;
  openSidebarSections: string[];
  previewValues: PersistedFormValues;
};

function isPersistedFormValue(value: unknown): value is PersistedFormValue {
  return (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    (Array.isArray(value) &&
      value.every((item): item is string => typeof item === 'string'))
  );
}

function sanitizeStoredBuilderFields(value: unknown): FormField[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (field): field is FormField =>
      Boolean(field) &&
      typeof field === 'object' &&
      'type' in field &&
      typeof field.type === 'string',
  );
}

function sanitizeStoredSidebarSections(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : DEFAULT_OPEN_SIDEBAR_SECTIONS;
}

function sanitizeStoredPreviewValues(value: unknown): PersistedFormValues {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter(
      ([fieldId, fieldValue]) =>
        typeof fieldId === 'string' && isPersistedFormValue(fieldValue),
    ),
  );
}

function serializePreviewValues(values: FormValues): PersistedFormValues {
  return Object.entries(values).reduce<PersistedFormValues>(
    (persistedValues, [fieldId, value]) => {
      if (
        value === null ||
        typeof value === 'string' ||
        typeof value === 'boolean'
      ) {
        persistedValues[fieldId] = value;
        return persistedValues;
      }

      if (
        Array.isArray(value) &&
        value.every((item): item is string => typeof item === 'string')
      ) {
        persistedValues[fieldId] = value;
        return persistedValues;
      }

      persistedValues[fieldId] = null;
      return persistedValues;
    },
    {},
  );
}

function compactPreviewValuesForStorage(
  previewValues: PersistedFormValues,
): PersistedFormValues {
  let remainingChars = MAX_PERSISTED_TOTAL_CHARS;

  return Object.entries(previewValues).reduce<PersistedFormValues>(
    (nextPreviewValues, [fieldId, value]) => {
      if (typeof value === 'boolean' || value === null) {
        nextPreviewValues[fieldId] = value;
        return nextPreviewValues;
      }

      if (typeof value === 'string') {
        if (remainingChars <= 0) {
          return nextPreviewValues;
        }

        const trimmedValue = value.slice(
          0,
          Math.min(MAX_PERSISTED_STRING_LENGTH, remainingChars),
        );

        remainingChars -= trimmedValue.length;
        nextPreviewValues[fieldId] = trimmedValue;
        return nextPreviewValues;
      }

      if (remainingChars <= 0) {
        return nextPreviewValues;
      }

      const trimmedItems: string[] = [];

      for (const item of value.slice(0, MAX_PERSISTED_ARRAY_ITEMS)) {
        if (remainingChars <= 0) {
          break;
        }

        const trimmedItem = item.slice(
          0,
          Math.min(MAX_PERSISTED_STRING_LENGTH, remainingChars),
        );

        remainingChars -= trimmedItem.length;
        trimmedItems.push(trimmedItem);
      }

      nextPreviewValues[fieldId] = trimmedItems;
      return nextPreviewValues;
    },
    {},
  );
}

function isQuotaExceededError(error: unknown) {
  return (
    error instanceof DOMException &&
    (error.name === 'QuotaExceededError' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
  );
}

export function writePersistedPlaygroundState(
  state: Omit<PersistedPlaygroundState, 'previewValues'> & {
    previewValues: FormValues;
  },
) {
  if (typeof window === 'undefined') {
    return;
  }

  const baseState = {
    version: state.version,
    builderFields: state.builderFields,
    selectedFieldId: state.selectedFieldId,
    openSidebarSections: state.openSidebarSections,
  };
  const compactPreviewValues = compactPreviewValuesForStorage(
    serializePreviewValues(state.previewValues),
  );

  try {
    window.localStorage.setItem(
      FORM_PLAYGROUND_STORAGE_KEY,
      JSON.stringify({
        ...baseState,
        previewValues: compactPreviewValues,
      } satisfies PersistedPlaygroundState),
    );
  } catch (error) {
    if (!isQuotaExceededError(error)) {
      return;
    }

    try {
      window.localStorage.setItem(
        FORM_PLAYGROUND_STORAGE_KEY,
        JSON.stringify({
          ...baseState,
          previewValues: {},
        } satisfies PersistedPlaygroundState),
      );
    } catch {
      // Ignore storage failures; persistence is best-effort only.
    }
  }
}

export function readPersistedPlaygroundState(): PersistedPlaygroundState | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(FORM_PLAYGROUND_STORAGE_KEY);

    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(
      rawValue,
    ) as Partial<PersistedPlaygroundState>;

    if (parsedValue.version !== FORM_PLAYGROUND_STORAGE_VERSION) {
      return null;
    }

    return {
      version: FORM_PLAYGROUND_STORAGE_VERSION,
      builderFields: sanitizeStoredBuilderFields(parsedValue.builderFields),
      selectedFieldId:
        typeof parsedValue.selectedFieldId === 'string'
          ? parsedValue.selectedFieldId
          : null,
      openSidebarSections: sanitizeStoredSidebarSections(
        parsedValue.openSidebarSections,
      ),
      previewValues: sanitizeStoredPreviewValues(parsedValue.previewValues),
    };
  } catch {
    return null;
  }
}
