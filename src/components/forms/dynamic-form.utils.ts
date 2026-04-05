export type SelectOption = {
  label?: string;
  value?: string;
  description?: string;
};

type BaseField = {
  id?: string;
  type?: string;
  name?: string;
  label?: string;
  placeholder?: string;
  value?: string | boolean | string[] | number;
  description?: string;
  required?: boolean;
};

type InputField = BaseField & {
  type:
    | 'text'
    | 'email'
    | 'number'
    | 'password'
    | 'textarea'
    | 'file'
    | 'color'
    | 'hidden'
    | 'slider'
    | 'date'
    | 'phone';
};

type CheckboxField = BaseField & {
  type: 'checkbox' | 'switch';
};

type OptionField = BaseField & {
  type: 'radio' | 'select' | 'multiselect' | 'checkbox-group' | 'combobox';
  options?: SelectOption[];
};

type RatingField = BaseField & {
  type: 'rating';
  max?: number;
};

export type FormField = InputField | CheckboxField | OptionField | RatingField;

export type FormValues = Record<
  string,
  string | boolean | string[] | FileList | null
>;
export type FormValue = FormValues[string];

export type FieldCtx = {
  values: FormValues;
  setValue: (fieldId: string, value: FormValue) => void;
  errors: Record<string, string>;
};

const REQUIRED_MSG = 'This field is required.';

function getNativeControl(
  formEl: HTMLFormElement | null,
  fieldId: string,
): HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null {
  if (!formEl) {
    return null;
  }

  return formEl.querySelector<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >(`#${CSS.escape(fieldId)}`);
}

function getNativeValidationMessage(
  control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null,
) {
  if (!control || control.checkValidity()) {
    return null;
  }

  return control.validationMessage || REQUIRED_MSG;
}

function getStringFieldValue(value: BaseField['value']) {
  return typeof value === 'string' || typeof value === 'number'
    ? String(value)
    : '';
}

function getBooleanFieldValue(value: BaseField['value']) {
  return value === true || value === 'true' || value === 1;
}

function getArrayFieldValue(value: BaseField['value']) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

export function getFieldId(field: FormField, index: number) {
  if (typeof field.id === 'string' && field.id.trim().length > 0) {
    return field.id.trim();
  }

  if (typeof field.name === 'string' && field.name.trim().length > 0) {
    return `${field.name.trim()}-${index}`;
  }

  return `field-${index}`;
}

export function getFieldLabel(field: FormField) {
  return typeof field.label === 'string' && field.label.trim().length > 0
    ? field.label
    : null;
}

export function getOptions(field: OptionField) {
  return Array.isArray(field.options)
    ? field.options.filter(
        (option): option is Required<SelectOption> =>
          typeof option?.label === 'string' &&
          typeof option?.value === 'string',
      )
    : [];
}

export function buildInitialValues(list: FormField[]): FormValues {
  const next: FormValues = {};

  list.forEach((field, index) => {
    const id = getFieldId(field, index);

    switch (field.type) {
      case 'hidden':
        next[id] = getStringFieldValue(field.value);
        return;
      case 'checkbox':
      case 'switch':
        next[id] = getBooleanFieldValue(field.value);
        return;
      case 'file':
        next[id] = null;
        return;
      case 'checkbox-group':
      case 'multiselect':
        next[id] = getArrayFieldValue(field.value);
        return;
      case 'rating':
        next[id] = getStringFieldValue(field.value);
        return;
      default:
        next[id] = getStringFieldValue(field.value);
    }
  });

  return next;
}

export function validate(
  list: FormField[],
  values: FormValues,
  formEl: HTMLFormElement | null,
): Record<string, string> {
  const errors: Record<string, string> = {};

  list.forEach((field, index) => {
    if (field.type === 'hidden') return;
    if (!getFieldLabel(field)) return;

    const fieldId = getFieldId(field, index);
    const value = values[fieldId];
    const control = getNativeControl(formEl, fieldId);

    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
      case 'password':
      case 'textarea':
      case 'date':
      case 'phone':
      case 'slider':
      case 'color': {
        const empty = !String(value ?? '').trim();
        if (field.required && empty) {
          errors[fieldId] = REQUIRED_MSG;
        }

        const validationMessage =
          field.required || !empty ? getNativeValidationMessage(control) : null;

        if (validationMessage) {
          errors[fieldId] = validationMessage;
        }

        return;
      }

      case 'file': {
        if (
          field.required &&
          (!(value instanceof FileList) || value.length === 0)
        ) {
          errors[fieldId] = REQUIRED_MSG;
        }

        const validationMessage = getNativeValidationMessage(control);

        if (validationMessage) {
          errors[fieldId] = validationMessage;
        }

        return;
      }

      case 'checkbox':
      case 'switch':
        if (field.required && value !== true) {
          errors[fieldId] = REQUIRED_MSG;
        }
        return;

      case 'select':
      case 'radio':
      case 'combobox':
      case 'rating':
        if (field.required && !String(value ?? '').trim()) {
          errors[fieldId] = REQUIRED_MSG;
        }
        return;

      case 'multiselect': {
        if (field.required && (!Array.isArray(value) || value.length === 0)) {
          errors[fieldId] = REQUIRED_MSG;
        }

        const validationMessage = getNativeValidationMessage(control);

        if (validationMessage) {
          errors[fieldId] = validationMessage;
        }

        return;
      }

      case 'checkbox-group':
        if (field.required && (!Array.isArray(value) || value.length === 0)) {
          errors[fieldId] = REQUIRED_MSG;
        }
        return;

      default:
        return;
    }
  });

  return errors;
}
