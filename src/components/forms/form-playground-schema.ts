import type { FormField, SelectOption } from './dynamic-form.utils';

export type PlaygroundFieldType =
  | 'checkbox'
  | 'combobox'
  | 'date'
  | 'file'
  | 'text'
  | 'multiselect'
  | 'password'
  | 'phone'
  | 'select'
  | 'switch'
  | 'textarea'
  | 'rating'
  | 'radio';

export const PLAYGROUND_FIELD_PALETTE: Array<{
  type: PlaygroundFieldType;
  label: string;
  description: string;
}> = [
  {
    type: 'text',
    label: 'Input',
    description: 'Single-line text entry.',
  },
  {
    type: 'textarea',
    label: 'Textarea',
    description: 'Long-form response area.',
  },
  {
    type: 'password',
    label: 'Password',
    description: 'Masked text with reveal toggle.',
  },
  {
    type: 'phone',
    label: 'Phone',
    description: 'Telephone-style input.',
  },
  {
    type: 'date',
    label: 'Date Picker',
    description: 'Native calendar input.',
  },
  {
    type: 'file',
    label: 'File Input',
    description: 'Upload a file from disk.',
  },
  {
    type: 'select',
    label: 'Select',
    description: 'Pick one option from a menu.',
  },
  {
    type: 'combobox',
    label: 'Combobox',
    description: 'Type or choose from suggestions.',
  },
  {
    type: 'multiselect',
    label: 'Multi Select',
    description: 'Choose multiple values.',
  },
  {
    type: 'radio',
    label: 'RadioGroup',
    description: 'Pick exactly one inline option.',
  },
  {
    type: 'checkbox',
    label: 'Checkbox',
    description: 'Single opt-in agreement.',
  },
  {
    type: 'switch',
    label: 'Switch',
    description: 'Binary on/off control.',
  },
  {
    type: 'rating',
    label: 'Rating',
    description: 'Star-based satisfaction input.',
  },
];

function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return slug || 'field';
}

function createFieldId(type: PlaygroundFieldType) {
  const suffix =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);

  return `${type}-${suffix}`;
}

function createName(label: string, index: number) {
  return `${slugify(label)}_${index + 1}`;
}

function createOptions(prefix: string): SelectOption[] {
  return [
    { label: `${prefix} One`, value: `${slugify(prefix)}_one` },
    { label: `${prefix} Two`, value: `${slugify(prefix)}_two` },
    { label: `${prefix} Three`, value: `${slugify(prefix)}_three` },
  ];
}

export function createOption(index: number): SelectOption {
  return {
    label: `Option ${index + 1}`,
    value: `option_${index + 1}`,
  };
}

export function createPlaygroundField(
  type: PlaygroundFieldType,
  index: number,
): FormField {
  switch (type) {
    case 'text':
      return {
        id: createFieldId(type),
        type: 'text',
        name: createName('input', index),
        label: 'Short answer',
        placeholder: 'Type here',
        required: false,
      };
    case 'textarea':
      return {
        id: createFieldId(type),
        type: 'textarea',
        name: createName('textarea', index),
        label: 'Long answer',
        placeholder: 'Write your response',
        required: false,
      };
    case 'password':
      return {
        id: createFieldId(type),
        type: 'password',
        name: createName('password', index),
        label: 'Password',
        placeholder: 'Enter a secure password',
        required: false,
      };
    case 'phone':
      return {
        id: createFieldId(type),
        type: 'phone',
        name: createName('phone', index),
        label: 'Phone number',
        placeholder: '+20 100 000 0000',
        required: false,
      };
    case 'date':
      return {
        id: createFieldId(type),
        type: 'date',
        name: createName('date', index),
        label: 'Start date',
        required: false,
      };
    case 'file':
      return {
        id: createFieldId(type),
        type: 'file',
        name: createName('file', index),
        label: 'Attachment',
        required: false,
      };
    case 'select':
      return {
        id: createFieldId(type),
        type: 'select',
        name: createName('select', index),
        label: 'Select an option',
        placeholder: 'Choose one',
        options: createOptions('Choice'),
        required: false,
      };
    case 'combobox':
      return {
        id: createFieldId(type),
        type: 'combobox',
        name: createName('combobox', index),
        label: 'Searchable choice',
        placeholder: 'Type or pick',
        options: createOptions('Category'),
        required: false,
      };
    case 'multiselect':
      return {
        id: createFieldId(type),
        type: 'multiselect',
        name: createName('multi_select', index),
        label: 'Select many',
        options: createOptions('Skill'),
        required: false,
      };
    case 'radio':
      return {
        id: createFieldId(type),
        type: 'radio',
        name: createName('radio_group', index),
        label: 'Preferred option',
        options: createOptions('Answer'),
        required: false,
      };
    case 'checkbox':
      return {
        id: createFieldId(type),
        type: 'checkbox',
        name: createName('checkbox', index),
        label: 'I agree to the terms',
        required: false,
      };
    case 'switch':
      return {
        id: createFieldId(type),
        type: 'switch',
        name: createName('switch', index),
        label: 'Enable notifications',
        required: false,
      };
    case 'rating':
      return {
        id: createFieldId(type),
        type: 'rating',
        name: createName('rating', index),
        label: 'Rate your experience',
        description: 'Tap a star to set the score.',
        max: 5,
        required: false,
      };
    default:
      return {
        id: createFieldId('text'),
        type: 'text',
        name: createName('field', index),
        label: 'New field',
        placeholder: 'Type here',
        required: false,
      };
  }
}

export function isOptionEditableField(
  field: FormField,
): field is Extract<
  FormField,
  { type: 'combobox' | 'select' | 'multiselect' | 'radio' | 'checkbox-group' }
> {
  return (
    field.type === 'combobox' ||
    field.type === 'select' ||
    field.type === 'multiselect' ||
    field.type === 'radio' ||
    field.type === 'checkbox-group'
  );
}

export function hasPlaceholder(field: FormField) {
  return (
    field.type === 'text' ||
    field.type === 'textarea' ||
    field.type === 'password' ||
    field.type === 'phone' ||
    field.type === 'select' ||
    field.type === 'combobox'
  );
}

export function isRatingField(
  field: FormField,
): field is Extract<FormField, { type: 'rating' }> {
  return field.type === 'rating';
}

export function sanitizeName(value: string) {
  return slugify(value);
}
