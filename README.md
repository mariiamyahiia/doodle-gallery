# Doodle Gallery

A full-stack web app where users can create, share, and view doodles in a real-time gallery, powered by JavaScript and Supabase for cloud data storage.

Draw something on the canvas, hit save, and it instantly appears in everyone's gallery, no refresh needed. No accounts, no sign-up: just unleash your inner artist (or chaos).

## Features

- **Drawing canvas** with adjustable pen color and width
- **Undo and Clear** for fixing mistakes
- **Cloud persistence**: doodles are saved to a Supabase Postgres database
- **Real-time gallery**: new doodles appear live across all open tabs and devices
- **Lightbox preview**: click any doodle to view it full size (close with ✕, a click outside, or `Esc`)
- **Keyboard accessible** gallery cards and dialog
- **Anonymous and public**: anyone can draw and post
- **Hand-drawn theme**: sage and blush palette with chunky ink outlines

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite |
| Drawing | HTML5 Canvas API |
| Backend / DB | Supabase (Postgres, Row Level Security, Realtime) |
| Styling | Plain CSS with custom properties, Google Fonts (Caveat Brush, Patrick Hand) |

## How It Works

Instead of saving doodles as image files, each doodle is stored as **vector stroke data** in a Postgres `jsonb` column:

```json
[
  {
    "color": "#3d4a37",
    "width": 3,
    "points": [{ "x": 12, "y": 40 }, { "x": 15, "y": 44 }]
  }
]
```

Each element is one continuous pen stroke (mouse down → mouse up), and a whole doodle is an array of strokes. This approach has several advantages:

- **Small storage footprint** compared to images
- **Resolution-independent**: the same data renders as a 200px thumbnail or a full-size preview
- **Easy undo**: removing the last stroke and redrawing is trivial
- **One shared renderer** (`drawStrokes`) used for the thumbnails, the lightbox, and undo

```
Browser (React)
   │  insert({ strokes })            ┌─────────────────────────┐
   ├────────────────────────────────▶│  Supabase (PostgREST)   │
   │                                 │  └─ Postgres: doodles   │
   │  postgres_changes (websocket)   │      (RLS enforced)     │
   ◀────────────────────────────────┤  Realtime server         │
                                     └─────────────────────────┘
```

When the gallery mounts it subscribes to `INSERT` events **before** fetching existing rows (so nothing inserted mid-fetch is missed), then merges and de-duplicates both sources by `id`.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer
- A free [Supabase](https://supabase.com) account

### 1. Clone and install

```bash
git clone https://github.com/<your-username>/doodle-gallery.git
cd doodle-gallery
npm install
```

### 2. Set up Supabase

Create a new Supabase project, then run the following in the **SQL Editor**:

```sql
-- Table
create table doodles (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  strokes jsonb not null
);

-- Row Level Security: anyone can read and insert; nobody can update or delete
alter table doodles enable row level security;

create policy "Anyone can read doodles"
  on doodles for select
  using (true);

create policy "Anyone can insert doodles"
  on doodles for insert
  with check (true);

-- Enable realtime for the table
alter publication supabase_realtime add table doodles;
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-or-publishable-key
```

Find both values in **Project Settings → API** (or **API Keys**).

> **Important:** `VITE_SUPABASE_URL` must be the **base project URL only**, ending at `.supabase.co`. Don't append `/rest/v1/...`; the client library adds paths itself.
>
> Use the `anon` / publishable key, **never** the `service_role` / secret key. The anon key is designed to be public because Row Level Security is what protects the data.

### 4. Run it

```bash
npm run dev
```

Open the local URL Vite prints. Open it in two tabs to watch real-time updates in action.

## Project Structure

```
doodle-gallery/
├── src/
│   ├── components/
│   │   ├── DrawCanvas.jsx    # Canvas, pen controls, undo/clear/save
│   │   ├── Gallery.jsx       # Fetch + realtime subscription + grid
│   │   ├── DoodleCard.jsx    # One scaled-down thumbnail
│   │   └── Lightbox.jsx      # Full-size popup preview
│   ├── utils/
│   │   └── drawStrokes.js    # Shared stroke renderer
│   ├── supabaseClient.js     # Supabase client instance
│   ├── App.jsx               # Page layout and title
│   ├── index.css             # Theme and all styles
│   └── main.jsx              # Entry point
├── .env                      # Local secrets (not committed)
└── package.json
```

## Security Notes

- **Row Level Security is enabled**, with explicit policies for `select` and `insert` only. There are no `update` or `delete` policies, so anonymous users can't modify or remove other people's doodles.
- The `anon` key is exposed in the browser bundle by design; RLS is the actual protection layer.
- Because anyone can insert rows, the frontend **treats database data as untrusted**: `drawStrokes` skips malformed strokes rather than crashing the gallery.
- `.env` is git-ignored.
