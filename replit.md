# AI PDF Visualizer

A beautifully designed web application that transforms PDF documents into AI-powered visualizations using OpenAI GPT-5.

## Overview

This application allows users to upload PDF documents and generate intelligent visualizations including flowcharts, mindmaps, and Cornell notes. The AI analyzes the content and creates structured visual representations to aid in learning and understanding.

## Current State (MVP Implementation)

### Implemented Features

**Core Functionality:**
- PDF file upload with drag-and-drop interface
- User selection of visualization type (flowchart, mindmap, or Cornell notes)
- Background AI processing using OpenAI GPT-5
- Document library with search functionality
- Export functionality for all visualization types (PNG, SVG, PDF)

**UI/UX:**
- Beautiful, responsive design following Linear/Figma-inspired guidelines
- Sidebar navigation with clean layout
- Dark/light theme toggle
- Proper loading states and error feedback
- Smooth animations and transitions

**Technical Stack:**
- Frontend: React, TypeScript, Tailwind CSS, Shadcn UI, React Flow (flowcharts), D3 (mindmaps)
- Backend: Express, Node.js, OpenAI GPT-5, pdf-parse, Multer
- Storage: In-memory storage (MemStorage)

### Architecture

**Data Model:**
- Documents: Store uploaded PDF metadata and processing status
- Visualizations: Store generated AI visualizations linked to documents

**Design Decision:**
Users select ONE visualization type per upload to optimize AI costs and processing time. The UI conditionally renders tabs based on available visualizations.

**Processing Flow:**
1. User uploads PDF and selects visualization type
2. Backend extracts text from PDF using pdf-parse
3. OpenAI GPT-5 analyzes text and generates visualization data
4. Frontend polls for completion and auto-navigates to visualization
5. User can view and export the generated visualization

### Known Areas for Improvement

**Polling & State Management:**
- Visualization polling logic could be more robust to handle all edge cases
- Query key normalization across the application
- Additional data-testid attributes for comprehensive testing

**Error Handling:**
- Backend error propagation could be more comprehensive
- Additional user feedback for edge cases

**Export Functionality:**
- Cornell notes PDF pagination for very long documents

### Project Structure

```
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                    # Shadcn UI components
│   │   │   ├── app-sidebar.tsx        # Navigation sidebar
│   │   │   ├── theme-provider.tsx     # Dark/light theme
│   │   │   ├── theme-toggle.tsx       # Theme switch button
│   │   │   ├── flowchart-viewer.tsx   # React Flow visualization
│   │   │   ├── mindmap-viewer.tsx     # D3 tree visualization
│   │   │   └── cornell-viewer.tsx     # Cornell notes display
│   │   ├── pages/
│   │   │   ├── dashboard.tsx          # Upload & recent documents
│   │   │   ├── documents.tsx          # Document library
│   │   │   └── document-detail.tsx    # Visualization viewer
│   │   ├── App.tsx
│   │   └── index.css                  # Theme configuration
├── server/
│   ├── routes.ts                      # API endpoints
│   ├── storage.ts                     # In-memory storage
│   └── openai.ts                      # AI generation functions
├── shared/
│   └── schema.ts                      # TypeScript types
└── design_guidelines.md               # UI/UX design system
```

### Environment Variables

- `OPENAI_API_KEY`: OpenAI API key for GPT-5
- `SESSION_SECRET`: Session secret for Express

### User Preferences

None documented yet.

### Recent Changes

- **2025-11-13**: Initial MVP implementation with all core features
- Beautiful UI with sidebar navigation and theme toggle
- PDF upload with AI-powered visualization generation
- Export functionality for all visualization types
- Polling system for background processing
- Comprehensive error handling

### Next Steps (Future Enhancements)

1. Enhance polling reliability for all edge cases
2. Add comprehensive data-testid coverage for testing
3. Implement multi-page Cornell notes PDF export
4. Add user authentication and document persistence
5. Support multiple visualizations per document
6. Add visualization editing capabilities
7. Implement batch processing for multiple PDFs
8. Add collaborative sharing features
