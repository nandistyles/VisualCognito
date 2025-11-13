# Design Guidelines: AI-Powered PDF Visualization Platform

## Design Approach
**Selected Approach:** Modern Productivity System inspired by Linear, Figma, and Notion
**Rationale:** This is a utility-focused tool where clarity, performance, and efficient workflows are paramount. The interface must balance sophisticated visualization capabilities with intuitive file management.

## Core Design Principles
1. **Canvas-First Thinking:** Maximize space for generated visualizations
2. **Purposeful Density:** Pack information efficiently without clutter
3. **Instant Clarity:** Users should immediately understand state and available actions
4. **Professional Polish:** This is a serious productivity tool, not a playful app

---

## Typography System

**Font Stack:**
- Primary: Inter (Google Fonts) - UI elements, body text
- Monospace: JetBrains Mono - Code snippets, technical details

**Type Scale:**
- Headings: text-3xl (dashboard headers), text-2xl (section titles), text-xl (card headers)
- Body: text-base (standard content), text-sm (supporting text, metadata)
- Labels: text-xs font-medium uppercase tracking-wide (categories, status badges)
- Display: text-4xl font-bold (empty states, onboarding)

**Weights:** 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

---

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16, 24
- Tight spacing: p-2, gap-2 (compact lists, badges)
- Standard spacing: p-4, gap-4, p-6 (cards, form fields)
- Section spacing: p-8, py-12, py-16 (major layout sections)
- Generous spacing: p-24 (empty states, isolated CTAs)

**Grid Structure:**
- Dashboard: Sidebar (280px fixed) + Main content area (flex-1)
- File library: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
- Visualization canvas: Full viewport with floating toolbars

**Container Widths:**
- Dashboard content: max-w-7xl mx-auto
- Forms/modals: max-w-2xl
- Visualization canvas: w-full h-full (no max-width)

---

## Component Library

### Navigation
**Left Sidebar (Fixed):**
- Logo/branding at top (h-16)
- Primary navigation items with icons (Heroicons)
- Upload button prominently placed (w-full, h-12)
- User profile/settings at bottom
- Dividers between logical sections (border-t)

### File Management
**Upload Zone:**
- Drag-and-drop area (min-h-64, border-2 border-dashed)
- Center-aligned icon (w-16 h-16), headline, supporting text
- File input trigger button (h-12 px-6)
- Supported formats list (text-xs)

**Library Grid Cards:**
- Thumbnail preview area (aspect-square, gradient placeholder)
- Book title (text-lg font-semibold, line-clamp-2)
- Metadata row: file size, upload date (text-sm)
- Status badges (rounded-full px-3 py-1 text-xs)
- Action menu (top-right corner, hidden until hover)

### Visualization Viewers

**Flowchart Viewer:**
- Full-screen canvas with pan/zoom controls
- Floating toolbar (top-center, backdrop-blur-xl, rounded-full px-6 py-3)
- Node inspector panel (right sidebar, w-80, slide-in animation)
- Export button group (bottom-right, gap-2)

**Mindmap Viewer:**
- Centered tree layout with expand/collapse nodes
- Connection lines (curved paths, not straight)
- Zoom controls (bottom-left, vertical stack)
- Branch color coding indicators

**Cornell Notes Viewer:**
- Three-section layout (cues: w-1/4, notes: w-1/2, summary: w-1/4)
- Section headers with visual separation (border-l-4)
- Editable text areas with subtle hover states
- Print-optimized layout option

### Processing States
**Loading Indicator:**
- Centered spinner with progress percentage
- Processing step indicator ("Extracting text...", "Analyzing structure...")
- Estimated time remaining (text-sm)

**Empty States:**
- Centered illustration placeholder (w-64 h-64)
- Action-oriented headline (text-2xl font-bold)
- Descriptive subtext (max-w-md)
- Primary CTA button (h-12 px-8)

### Forms & Inputs
**Upload Configuration:**
- Output type selector (radio group with visual cards)
- Advanced options accordion (chevron icon toggle)
- Setting toggles with labels (switch components)
- Generate button (w-full h-14, prominent)

**File Input:**
- Rounded borders (rounded-lg)
- Focus ring states (ring-2 ring-offset-2)
- Inline validation messages (text-sm, mt-1)

### Modals & Overlays
**Export Modal:**
- Backdrop (backdrop-blur-sm)
- Content card (max-w-lg, rounded-2xl, p-8)
- Format selection (grid-cols-2 gap-4)
- Quality slider with preview
- Download/cancel actions (flex justify-end gap-3)

---

## Interactions & Animations

**Minimize Animations - Use Only:**
- Sidebar collapse/expand (transition-all duration-300)
- Card hover lift (transform hover:scale-[1.02])
- Modal fade-in/out (opacity transition)
- Loading spinners (animate-spin)

**Avoid:**
- Scroll-triggered animations
- Complex page transitions
- Decorative motion effects

---

## Icons
**Icon Library:** Heroicons (via CDN)
**Common Icons:**
- Upload: CloudArrowUpIcon
- Flowchart: PresentationChartLineIcon
- Mindmap: CircleStackIcon
- Cornell: DocumentTextIcon
- Settings: Cog6ToothIcon
- Export: ArrowDownTrayIcon

**Icon Sizing:** w-5 h-5 (standard), w-6 h-6 (prominent), w-4 h-4 (compact)

---

## Images

**No Traditional Hero Section** - Dashboard-first design

**Image Placements:**
1. **Empty State Illustrations:** Abstract diagrams/visualization graphics (w-48 h-48, centered)
2. **PDF Thumbnails:** First page preview or generic document icon (aspect-square)
3. **Tutorial Overlays:** Screenshot examples showing flowchart/mindmap outputs

**Placeholder Strategy:** Use gradient backgrounds (from-blue-50 to-indigo-50) for missing thumbnails

---

## Accessibility

- Keyboard navigation throughout (tab order, escape to close)
- ARIA labels on icon-only buttons
- Focus visible states on all interactive elements (ring-2)
- Sufficient contrast ratios (WCAG AA minimum)
- Screen reader announcements for processing states

---

## Responsive Behavior

**Desktop-First Tool** (optimized for lg+ screens):
- Sidebar: Always visible on lg+, drawer on mobile
- File grid: 4 columns (xl), 3 columns (lg), 2 columns (md), 1 column (sm)
- Visualization canvas: Optimized for desktop, basic viewing on tablet
- Mobile: Simplified upload + list view only