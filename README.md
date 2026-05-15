# DocuForge Pro - Enterprise PDF Generation Platform

A comprehensive, microservice-based PDF generation platform for businesses. Generate expenses, tenders, proposals, salary slips, and any document type with professional templates.

## 🏗️ Architecture Overview

### Microservice Architecture (Loosely Coupled)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API Gateway (Caddy)                             │
│                                  Port: 3000                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        │                             │                             │
        ▼                             ▼                             ▼
┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐
│   Main Frontend   │     │  PDF Generator    │     │ Template Manager  │
│   (Next.js App)   │     │    Service        │     │    Service        │
│    Port: 3000     │     │   Port: 3001      │     │   Port: 3002      │
└───────────────────┘     └───────────────────┘     └───────────────────┘
        │                             │                             │
        │                             │                             │
        ▼                             ▼                             ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                           Shared SQLite Database                           │
│                         (via Prisma ORM)                                   │
└───────────────────────────────────────────────────────────────────────────┘
```

## 📦 Services Breakdown

### 1. Main Frontend Service (Port: 3000)
- **Technology**: Next.js 16 with App Router
- **Purpose**: User interface for document generation, template management
- **Responsibilities**:
  - UI/UX for document creation
  - Template builder interface
  - Document preview
  - User dashboard

### 2. PDF Generator Service (Port: 3001)
- **Technology**: Bun + TypeScript
- **Purpose**: Core PDF generation engine
- **Responsibilities**:
  - PDF document generation
  - Template rendering
  - Document formatting
  - Export to various formats

### 3. Template Manager Service (Port: 3002)
- **Technology**: Bun + TypeScript
- **Purpose**: Template CRUD and marketplace
- **Responsibilities**:
  - Template storage and retrieval
  - Template versioning
  - Template marketplace integration
  - Web scraping for external templates

## 🎯 SOLID Principles Implementation

### Single Responsibility Principle (SRP)
- Each service handles one domain concern
- Separate controllers for different operations
- Dedicated classes for PDF rendering, template parsing, etc.

### Open/Closed Principle (OCP)
- Plugin-based template system
- Extension points for new document types
- Strategy pattern for PDF generation

### Liskov Substitution Principle (LSP)
- Abstract base template class with interchangeable implementations
- Interface-based service contracts

### Interface Segregation Principle (ISP)
- Fine-grained interfaces for each service capability
- Clients depend only on interfaces they use

### Dependency Inversion Principle (DIP)
- Services depend on abstractions, not concretions
- Dependency injection for loosely coupled components

## 🗄️ Database Schema

```prisma
// Core Models
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  company       String?
  logo          String?
  phone         String?
  address       String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  documents     Document[]
  templates     Template[]
}

model Template {
  id            String      @id @default(cuid())
  name          String
  description   String?
  category      TemplateCategory
  type          DocumentType
  content       String      // JSON structure
  preview       String?     // Preview image URL
  isPublic      Boolean     @default(false)
  isPremium     Boolean     @default(false)
  source        String?     // URL if from external source
  tags          String?     // Comma-separated tags
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  creatorId     String?
  creator       User?       @relation(fields: [creatorId], references: [id])
  documents     Document[]
}

model Document {
  id            String      @id @default(cuid())
  title         String
  type          DocumentType
  data          String      // JSON document data
  templateId    String?
  template      Template?   @relation(fields: [templateId], references: [id])
  ownerId       String
  owner         User        @relation(fields: [ownerId], references: [id])
  status        DocumentStatus @default(draft)
  pdfUrl        String?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}

enum TemplateCategory {
  EXPENSE
  TENDER
  PROPOSAL
  SALARY
  INVOICE
  RECEIPT
  CONTRACT
  REPORT
  LETTER
  CERTIFICATE
  CUSTOM
}

enum DocumentType {
  EXPENSE_REPORT
  EXPENSE_CLAIM
  TENDER_DOCUMENT
  TENDER_PROPOSAL
  BUSINESS_PROPOSAL
  PROJECT_PROPOSAL
  SALARY_SLIP
  SALARY_CERTIFICATE
  INVOICE
  RECEIPT
  CONTRACT
  AGREEMENT
  REPORT
  LETTER
  CERTIFICATE
  CUSTOM
}

enum DocumentStatus {
  draft
  pending
  approved
  rejected
  archived
}
```

## 📁 Project Structure

```
/home/z/my-project/
├── src/                          # Main Next.js Application
│   ├── app/                      # App Router pages
│   │   ├── page.tsx              # Dashboard
│   │   ├── documents/            # Document management
│   │   ├── templates/            # Template management
│   │   ├── builder/              # Template builder
│   │   └── api/                  # API routes
│   ├── components/               # React components
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── documents/            # Document-specific components
│   │   ├── templates/            # Template-specific components
│   │   └── builder/              # Template builder components
│   ├── lib/                      # Utility libraries
│   │   ├── services/             # Service clients
│   │   ├── utils.ts              # Utilities
│   │   └── db.ts                 # Database client
│   └── hooks/                    # Custom hooks
├── mini-services/                # Microservices
│   ├── pdf-generator/            # PDF Generation Service
│   │   ├── index.ts
│   │   ├── generators/           # PDF generators
│   │   ├── templates/            # Template renderers
│   │   └── package.json
│   └── template-manager/         # Template Management Service
│       ├── index.ts
│       ├── scrapers/             # Template scrapers
│       ├── processors/           # Template processors
│       └── package.json
├── prisma/                       # Database schema
│   └── schema.prisma
├── public/                       # Static assets
├── Caddyfile                     # Gateway configuration
└── README.md                     # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- SQLite (included)

### Installation

```bash
# Install dependencies
bun install

# Setup database
bun run db:push

# Start development
bun run dev
```

## 📝 Implementation Status

### ✅ Completed
- [x] Project initialization
- [x] Architecture design
- [x] Database schema design (Prisma)
- [x] README documentation
- [x] PDF Generator Microservice (Port: 3001)
  - [x] PDF document generation engine
  - [x] Template rendering system
  - [x] Support for all document types
  - [x] Validation endpoints
- [x] Template Manager Microservice (Port: 3002)
  - [x] Template CRUD operations
  - [x] Template categories and field types
  - [x] External template scraping capability
  - [x] Default templates initialization
- [x] Frontend Dashboard
  - [x] Main dashboard with quick stats
  - [x] Document creation form
  - [x] Template browser and selector
  - [x] Template builder interface
  - [x] Document history management
  - [x] Company settings management
- [x] Document Type Implementations
  - [x] Expense (Report, Claim, Travel)
  - [x] Tender (Document, Proposal, Bid)
  - [x] Proposal (Business, Project, Sales)
  - [x] Salary (Slip, Certificate, Payroll)
  - [x] Invoice (Standard, Proforma)
  - [x] Receipt, Contract, Letter, Certificate
- [x] Template Builder from scratch
- [x] External template scraping infrastructure
- [x] API Gateway integration

### 🆕 New: Visual Template Builder
- [x] Drag-and-drop canvas editor
- [x] 16 element types (Label, Text Field, Image, Table, Signature, etc.)
- [x] Element properties panel
- [x] Grid snapping and zoom controls
- [x] Undo/Redo support
- [x] Dynamic field mapping
- [x] **Color picker with presets for fonts, backgrounds, borders**
- [x] **Background color options for all applicable elements**
- [x] **Style options (opacity, rotation, shadow)**
- [x] **Template preview modal**
- [x] **PDF/JSON export functionality**
- [x] **Table header background color option**

### 🔄 Future Enhancements
- [ ] Real PDF generation with pdfmake integration
- [ ] PDF preview in browser
- [ ] User authentication with NextAuth
- [ ] Cloud storage for generated documents
- [ ] Email integration for sending documents
- [ ] Advanced template customization
- [ ] Multi-language support

## 🔌 API Endpoints

### PDF Generator Service (Port: 3001)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/generate` | POST | Generate PDF from template |
| `/api/preview` | POST | Preview PDF |
| `/api/templates` | GET | List available templates |

### Template Manager Service (Port: 3002)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/templates` | GET | List all templates |
| `/api/templates` | POST | Create template |
| `/api/templates/:id` | PUT | Update template |
| `/api/templates/:id` | DELETE | Delete template |
| `/api/scrape` | POST | Scrape external templates |

## 🎨 Document Types Supported

1. **Expenses**
   - Expense Report
   - Expense Claim Form
   - Travel Expense Sheet
   - Monthly Expense Summary

2. **Tender**
   - Tender Document
   - Tender Proposal
   - Bid Document
   - Tender Evaluation

3. **Proposal**
   - Business Proposal
   - Project Proposal
   - Sales Proposal
   - Partnership Proposal

4. **Salary**
   - Salary Slip
   - Salary Certificate
   - Payroll Report
   - Salary Increment Letter

5. **Others**
   - Invoice
   - Receipt
   - Contract
   - Agreement
   - Report
   - Letter
   - Certificate

## 🔧 Technologies Used

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui
- **Backend**: Bun, TypeScript
- **Database**: SQLite with Prisma ORM
- **PDF Generation**: Custom PDF rendering engine
- **Architecture**: Microservices with API Gateway

## 📄 License

MIT License
