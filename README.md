# QuickDocs

**Professional PDF Document Builder**

QuickDocs is a powerful drag-and-drop document template builder that allows you to create professional PDF documents with ease. Build invoices, receipts, contracts, salary slips, and more with our intuitive visual editor.

---

## Architecture

### Microservices Architecture

QuickDocs is designed with a **microservices-ready architecture** that allows for scalable, maintainable, and independently deployable services:

```
┌─────────────────────────────────────────────────────────────┐
│                      QuickDocs System                        │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Frontend   │  │   Template   │  │    Export    │       │
│  │   Service    │  │   Service    │  │   Service    │       │
│  │  (Next.js)   │  │  (Builder)   │  │   (PDF/HTML) │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │    Data      │  │    Auth      │  │   Storage    │       │
│  │   Service    │  │   Service    │  │   Service    │       │
│  │  (Prisma)    │  │  (NextAuth)  │  │  (File/CDN)  │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

### SOLID Principles

This project follows **SOLID principles** for clean, maintainable code:

| Principle | Implementation |
|-----------|----------------|
| **S**ingle Responsibility | Each component handles one concern (TemplateBuilder, PropertiesPanel, DataFormPanel) |
| **O**pen/Closed | Element types are extensible without modifying core rendering logic |
| **L**iskov Substitution | All element types follow the same `TemplateElement` interface |
| **I**nterface Segregation | Separate interfaces for different element categories (Input, Display, Layout) |
| **D**ependency Inversion | Components depend on abstractions (Zustand store) not concrete implementations |

---

## Features

### Completed Features ✅

- **Drag & Drop Editor** - Intuitive canvas-based template building with @dnd-kit
- **50+ Element Types** - Comprehensive element library organized in 8 categories
- **Real-time Preview** - Live preview as you build templates
- **Data Binding** - Dynamic form filling with template variables
- **Multiple Export Formats** - Export to PDF, HTML, or JSON
- **Template Library** - Pre-built templates for common document types
- **Properties Panel** - Configure element properties (fonts, colors, sizes, etc.)
- **Data Form Panel** - Fill template variables dynamically
- **Table Support** - Add and configure table elements with editable data
- **Responsive Design** - Works on desktop and tablet devices
- **Template Import/Export** - Save and load templates as JSON
- **Canvas Controls** - Zoom, pan, and navigate large templates

### Remaining Features 🚧

| Feature | Priority | Description |
|---------|----------|-------------|
| **Element Functionality** | High | All 50+ elements need full working implementation |
| **Form Data Binding** | High | Connect input elements to form data state |
| **Link Inputs** | High | URL inputs for hyperlink, button navigation elements |
| **PDF Export Service** | High | Server-side PDF generation with Puppeteer/Playwright |
| **User Authentication** | Medium | NextAuth.js integration for user accounts |
| **Template Persistence** | Medium | Save templates to database with Prisma |
| **Image Upload** | Medium | File upload service for images in templates |
| **Collaboration** | Low | Real-time collaborative editing |
| **Version History** | Low | Template version control and rollback |
| **API Documentation** | Low | REST API for template management |

---

## Document Types Supported

- ✅ Invoices
- ✅ Receipts
- ✅ Expense Reports
- ✅ Salary Slips
- ✅ Business Proposals
- ✅ Contracts
- ✅ Custom Templates

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS 4 |
| **UI Components** | shadcn/ui |
| **State Management** | Zustand |
| **Drag & Drop** | @dnd-kit |
| **Database** | Prisma ORM |
| **Icons** | Lucide React |
| **Charts** | Recharts |

---

## Element Categories

The template builder includes **50+ element types** across 8 categories:

### 1. Text Elements
| Element | Description | Status |
|---------|-------------|--------|
| Heading | H1-H6 headings | ✅ Working |
| Paragraph | Body text blocks | ✅ Working |
| Rich Text | Formatted text with Markdown | 🚧 Partial |
| Label | Simple text labels | ✅ Working |

### 2. Input Elements
| Element | Description | Status |
|---------|-------------|--------|
| Text Field | Single-line text input | ✅ Working |
| Textarea | Multi-line text input | ✅ Working |
| Number Input | Numeric input with validation | 🚧 Needs formData |
| Checkbox | Boolean checkbox | ✅ Working |
| Radio Group | Single-choice radio buttons | 🚧 Needs options |
| Select | Dropdown selection | 🚧 Needs options |
| Toggle | Switch component | 🚧 Needs formData |
| Slider | Range slider | 🚧 Needs formData |
| Rating | Star rating input | 🚧 Needs formData |
| Date Picker | Date selection | 🚧 Needs formData |
| File Upload | File input | 🚧 Needs implementation |
| Color Picker | Color selection | 🚧 Needs implementation |
| Multi-Select | Multiple selection dropdown | 🚧 Needs options |

### 3. Media Elements
| Element | Description | Status |
|---------|-------------|--------|
| Image | Image placeholder/upload | 🚧 Needs upload |
| Video | Video embed/player | 🚧 Needs URL input |
| Audio | Audio player | 🚧 Needs URL input |

### 4. Shape Elements
| Element | Description | Status |
|---------|-------------|--------|
| Rectangle | Basic rectangle shape | ✅ Working |
| Ellipse | Circle/ellipse shape | ✅ Working |
| Line | Horizontal/vertical lines | ✅ Working |
| Polygon | Custom polygon shapes | 🚧 Needs vertices |
| Rounded Box | Rectangle with rounded corners | ✅ Working |

### 5. Data Elements
| Element | Description | Status |
|---------|-------------|--------|
| Table | Data table with rows/columns | ✅ Working |
| List | Bulleted/numbered list | 🚧 Needs items |
| Chart | Bar/Line/Pie charts | 🚧 Needs data |
| Progress Bar | Progress indicator | 🚧 Needs value |

### 6. Navigation Elements
| Element | Description | Status |
|---------|-------------|--------|
| Button | Clickable button | 🚧 Needs link/action |
| Hyperlink | Link element | 🚧 Needs URL input |

### 7. Decorative Elements
| Element | Description | Status |
|---------|-------------|--------|
| Badge | Status badge | ✅ Working |
| Tooltip | Hover tooltip | 🚧 Needs content |
| Divider | Horizontal/vertical divider | ✅ Working |
| Icon | Lucide icons | ✅ Working |

### 8. Layout Elements
| Element | Description | Status |
|---------|-------------|--------|
| Container | Grouping container | 🚧 Needs children |
| Columns | Multi-column layout | 🚧 Needs structure |

---

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- npm, yarn, or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/quickdocs.git

# Navigate to project directory
cd quickdocs

# Install dependencies
npm install
# or
bun install

# Copy environment variables
cp .env.example .env

# Initialize database
npm run db:push

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
npm start
```

---

## Project Structure

```
quickdocs/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── page.tsx           # Main dashboard page
│   │   ├── layout.tsx         # Root layout
│   │   └── api/               # API routes
│   ├── components/
│   │   ├── builder/           # Template builder
│   │   │   ├── TemplateBuilder.tsx    # Main builder component
│   │   │   ├── types.ts       # Element type definitions
│   │   │   └── store.ts       # Zustand state store
│   │   └── ui/                # shadcn/ui components
│   ├── lib/                   # Utility functions
│   ├── hooks/                 # React hooks
│   └── store/                 # Global state stores
├── prisma/                    # Database schema
├── public/                    # Static assets
├── .env.example               # Environment variables template
└── package.json
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/templates` | List all templates |
| POST | `/api/templates` | Create new template |
| GET | `/api/templates/:id` | Get template by ID |
| PUT | `/api/templates/:id` | Update template |
| DELETE | `/api/templates/:id` | Delete template |
| POST | `/api/export/pdf` | Export template as PDF |
| POST | `/api/export/html` | Export template as HTML |

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT License

---

## Support

For support, please open an issue on GitHub.
