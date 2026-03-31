# form-builder

A **Next.js** app that renders a **JSON-defined form**: you edit a local schema file and the UI updates—no code changes required for new fields (within supported types).

## What it does

- Loads field definitions from `src/config/form-fields.json` (an array of field objects).
- Renders inputs, textareas, checkboxes, password (with show/hide), selects, multiselects, radio groups, and checkbox groups.
- Keeps values in React state, validates on submit (required rules plus native HTML5 validity where applicable), and surfaces errors next to fields.
- The home page (`src/app/page.tsx`) mounts the `DynamicForm` client component inside the App Router layout.

Supported field `type` values include: `text`, `email`, `number`, `password`, `textarea`, `file`, `color`, `hidden`, `checkbox`, `select`, `multiselect`, `radio`, `checkbox-group`. Option-based fields use an `options` array of `{ label, value }` objects.

## Tech stack

- **Next.js** 16 (App Router), **React** 19, **TypeScript**
- **Tailwind CSS** v4, **Biome** for lint/format
- UI primitives built on **@base-ui/react** (shadcn-style components under `src/components/ui/`)
- **react-hook-form** and **@hookform/resolvers** are installed for future integration; the current form uses manual `useState` in `dynamic-form.tsx`.

## Project structure

```
form-builder/
├── src/
│   ├── app/
│   │   ├── globals.css          # Global styles / theme tokens
│   │   ├── layout.tsx           # Root layout, fonts
│   │   └── page.tsx             # Home — renders <DynamicForm />
│   ├── components/
│   │   ├── forms/
│   │   │   ├── dynamic-form.tsx              # Form shell, state, submit, validation wiring
│   │   │   ├── dynamic-form.utils.ts         # Schema types, defaults, validate(), helpers
│   │   │   ├── dynamic-form-input-field.tsx  # Text-like, checkbox, textarea, password, hidden
│   │   │   └── dynamic-form-option-field.tsx # Select, multiselect, radio, checkbox-group
│   │   ├── password-toggle.tsx               # Show/hide for password fields
│   │   └── ui/                               # Reusable primitives (field, input, select, …)
│   ├── config/
│   │   └── form-fields.json      # Editable form schema (source of truth for the demo UI)
│   └── lib/
│       └── utils.ts              # `cn()` className helper
├── package.json
├── biome.json                  # Biome lint/format config
└── README.md
```

## Customizing the form

Edit **`src/config/form-fields.json`**. Each entry can include `type`, `name`, `label`, `placeholder`, `description`, `required`, `value` (e.g. for `hidden`), and `options` for choice fields. After saving, refresh the dev server if needed; the JSON is imported at build time.

## Scripts

| Command          | Description        |
| ---------------- | ------------------ |
| `npm run dev`    | Start dev server   |
| `npm run build`  | Production build   |
| `npm run start`  | Run production app |
| `npm run lint`   | Biome check        |
| `npm run format` | Biome format       |

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

This project started from [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app). For Next.js features and deployment, see the [Next.js documentation](https://nextjs.org/docs).
