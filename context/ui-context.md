# UI Context

## Theme

RestDesk uses a **sleek, premium dark technical theme** (with toggleable light mode option) optimized for developers. It features near-black backgrounds, card/panel surfaces, fine borders, and vibrant accent colors to distinguish HTTP methods and active states. 

- **Dark & Light Modes**: Supports both themes (saving preference in localStorage), defaulting to dark mode.
- **Glassmorphism**: Subtle backdrops and translucent panel headers.
- **Micro-Animations & Indicators**: Pulsing orange indicator for saved responses, rotating spinner for pending network calls, and smooth scale transitions on hover.
- **Shadcn UI Base**: Integrates Tailwind-styled base components (Buttons, Input fields, Tabs, Dialogs, Dropdown Menus) for unified design elements.

## Colors (Tailwind v4 Integration)

Tailwind CSS v4 handles theme customization via standard CSS variables in `@theme`. We define the following palette:

| Role            | CSS Variable       | Color / Hex | Tailwind Utility Class |
| --------------- | ------------------ | ----------- | -----------------------|
| Page background | `--bg-base`        | `#09090b`   | `bg-zinc-950`          |
| Surface         | `--bg-surface`     | `#18181b`   | `bg-zinc-900`          |
| Card / Panel    | `--bg-panel`       | `#202024`   | `bg-zinc-800/40`       |
| Primary text    | `--text-primary`   | `#fafafa`   | `text-zinc-50`         |
| Muted text      | `--text-muted`     | `#a1a1aa`   | `text-zinc-400`        |
| Accent Primary  | `--accent-primary` | `#a78bfa`   | `text-violet-400`      |
| Border          | `--border-default` | `#27272a`   | `border-zinc-800`      |
| Success         | `--state-success`  | `#34d399`   | `text-emerald-400`     |
| Error / Danger  | `--state-error`    | `#f87171`   | `text-red-400`         |

### HTTP Method Colors
- **GET**: `text-emerald-400 bg-emerald-500/10 border-emerald-500/20`
- **POST**: `text-amber-400 bg-amber-500/10 border-amber-500/20`
- **PUT**: `text-sky-400 bg-sky-500/10 border-sky-500/20`
- **DELETE**: `text-rose-400 bg-rose-500/10 border-rose-500/20`
- **PATCH**: `text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20`

## Typography

| Role      | Font Family              | CSS / Tailwind Variable |
| --------- | ------------------------ | ----------------------- |
| UI text   | Inter, sans-serif        | `font-sans`             |
| Code/mono | JetBrains Mono, monospace| `font-mono`             |

## Border Radius

- **Inline / Small UI** (Buttons, inputs, method badges): `rounded-md` (6px) matching Shadcn design defaults
- **Cards / Panels / Tabs**: `rounded-lg` (8px)
- **Modals / Overlays**: `rounded-xl` (12px)
- **Focus Rings**: Standardized ring behavior (`focus-visible:ring-1 focus-visible:ring-ring`) from Shadcn instead of manual borders.

## Layout Patterns

- **Root Layout**: Full viewport, height-constrained layout (`h-screen overflow-hidden`) split into:
  - **Left Sidebar** (Fixed width: `280px`): Navigation tabs (Collections / History), search bar, and action buttons.
  - **Main Content Area** (Flex-1, height-constrained):
    - Header bar with window title/app status.
    - Split workspace (Request Builder on top, Response Inspector on bottom).
- **Split Workspace Layout**: Supports resizing or a standard 50/50 vertical division (collapsible panel sections).
- **Tab Bar Layout**: Request details structured into custom tabs (Query Params, Headers, Body, Auth).

## Icons

We use **Lucide React** for icons:
- Size: `14px` (`h-3.5 w-3.5`) or `16px` (`h-4 w-4`) for normal UI labels.
- Size: `20px` (`h-5 w-5`) for main category selectors.
- Stroke width: default `2px` or `1.5px` for a modern, sleek appearance.
