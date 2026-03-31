type SelectOption = {
  label?: string;
  value?: string;
  description?: string;
};

type BaseField = {
  type?: string;
  name?: string;
  label?: string;
  placeholder?: string;
  value?: string;
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
    | 'slider';
};

type CheckboxField = BaseField & {
  type: 'checkbox';
};

type OptionField = BaseField & {
  type: 'radio' | 'select' | 'multiselect' | 'checkbox-group';
  options?: SelectOption[];
};

export type FormField = InputField | CheckboxField | OptionField;

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

export function getFieldId(field: FormField, index: number) {
  const base = field.name?.trim() || 'field';
  return `${base}-${index}`;
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
        next[id] = field.value ?? '';
        return;
      case 'checkbox':
        next[id] = false;
        return;
      case 'file':
        next[id] = null;
        return;
      case 'checkbox-group':
      case 'multiselect':
        next[id] = [];
        return;
      default:
        next[id] = '';
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
      case 'color': {
        const empty = !String(value ?? '').trim();
        if ((field.type === 'email' || field.required) && empty) {
          errors[fieldId] = REQUIRED_MSG;
        }

        const validationMessage = getNativeValidationMessage(control);

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
        if (field.required && value !== true) {
          errors[fieldId] = REQUIRED_MSG;
        }
        return;

      case 'select':
      case 'radio':
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
