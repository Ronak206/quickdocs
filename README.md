# QuickDocs

<div align="center">

![QuickDocs Logo](public/favicon.svg)

**Professional PDF Document Builder**

A powerful drag-and-drop document template builder for creating professional PDF documents with ease.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

[Demo](#) · [Report Bug](https://github.com/Ronak206/quickdocs/issues) · [Request Feature](https://github.com/Ronak206/quickdocs/issues)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Database Models](#database-models)
- [API Reference](#api-reference)
- [Subscription Plans](#subscription-plans)
- [Payment Integration](#payment-integration)
- [What's Done & Remaining](#whats-done--remaining)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

QuickDocs is a modern, full-stack document generation platform that enables users to create professional PDF documents through an intuitive drag-and-drop interface. Built with Next.js 16, MongoDB, and a microservices-ready architecture following SOLID principles.

### Key Highlights

- 🔐 **Secure Authentication** - Email/password login with NextAuth.js
- 💳 **Payment Integration** - NOWPayments cryptocurrency payments
- 📊 **Subscription Plans** - Free, Starter, Pro, Enterprise tiers with PDF limits
- 📄 **50+ Element Types** - Comprehensive library for document building
- 🎨 **Text Formatting** - Bold, italic, underline support for all text elements
- 🗜️ **Data Compression** - Document data compressed before storage
- 📈 **Usage Tracking** - Monthly PDF generation limits per plan
- 🎨 **Visual Editor** - Drag-and-drop canvas with real-time preview
- 📱 **Responsive Design** - Works seamlessly on desktop and tablet

---

## 🏗️ Architecture

### Microservices Architecture

QuickDocs follows a **microservices-ready architecture** designed for scalability and maintainability:

```
┌─────────────────────────────────────────────────────────────┐
│                      QuickDocs System                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Frontend   │  │   Template   │  │    Export    │       │
│  │   Service    │  │   Service    │  │   Service    │       │
│  │  (Next.js)   │  │  (Builder)   │  │   (PDF/HTML) │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │    Data      │  │    Auth      │  │  Compression │       │
│  │   Service    │  │   Service    │  │   Service    │       │
│  │  (Prisma)    │  │  (NextAuth)  │  │   (Pako)     │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Subscription │  │    Usage     │  │   Payment    │       │
│  │   Service    │  │  Tracking    │  │   Service    │       │
│  │  (Plans)     │  │  (Monthly)   │  │ (NOWPayments)│       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### SOLID Principles

| Principle | Implementation |
|-----------|----------------|
| **S**ingle Responsibility | Each service handles one concern (CompressionService, StatsAPI, DocumentsAPI) |
| **O**pen/Closed | Element types and plans are extensible without modifying core logic |
| **L**iskov Substitution | All element types follow the same `TemplateElement` interface |
| **I**nterface Segregation | Separate interfaces for different element categories |
| **D**ependency Institution | Components depend on abstractions (Zustand store, API contracts) |

---

## ✨ Features

### Completed Features ✅

| Category | Feature | Description |
|----------|---------|-------------|
| 🔐 **Auth** | User Registration | Sign up with name, email, password, company |
| 🔐 **Auth** | User Login | Secure credentials-based authentication |
| 🔐 **Auth** | Session Management | JWT-based sessions with NextAuth.js |
| 🔐 **Auth** | Protected Routes | Dashboard requires authentication |
| 💾 **Database** | MongoDB Integration | Persistent data storage with Prisma ORM |
| 💾 **Database** | User Profiles | Store user info, company details |
| 💾 **Database** | Document Storage | Compressed JSON storage with hash deduplication |
| 💰 **Subscription** | Plan System | Free (10 PDFs), Starter (50), Pro (200), Enterprise (Unlimited) |
| 💳 **Payments** | NOWPayments Integration | Cryptocurrency payment processing |
| 💳 **Payments** | Payment Webhooks | Real-time payment confirmation |
| 💳 **Payments** | Plan Upgrades | Upgrade subscription after payment |
| 📊 **Usage** | Monthly Tracking | Track PDF generation per month |
| 📊 **Usage** | PDF Limits | Enforce limits based on subscription plan |
| 🗜️ **Compression** | Data Compression | Gzip compression for document data |
| 🗜️ **Compression** | Hash Deduplication | Content hash for deduplication |
| 🎨 **Editor** | Drag & Drop | Intuitive canvas-based template building |
| 🎨 **Editor** | 50+ Elements | Comprehensive element library |
| 🎨 **Editor** | Real-time Preview | Live preview while building |
| 🎨 **Editor** | Text Formatting | Bold, italic, underline for text elements |
| 🎨 **Editor** | New Line Support | Enter for new lines, Tab for indentation |
| 🎨 **Editor** | PDF Preview | Preview PDF output before export |
| 📄 **API** | Stats API | Fetch dashboard statistics |
| 📄 **API** | Documents API | CRUD operations for documents |
| 📄 **API** | Templates API | Template management |
| 📄 **API** | Payments API | Payment creation and management |
| 📄 **API** | Seed API | Initialize plans and templates |
| 📱 **UI** | Responsive Design | Desktop and tablet support |
| 📱 **UI** | Dark Mode Ready | Theme provider configured |

### Upcoming Features 🚧

| Priority | Feature | Description |
|----------|---------|-------------|
| 🔴 High | PDF Generation | Server-side PDF generation from templates |
| 🔴 High | Element Functionality | Full implementation of all 50+ elements |
| 🟡 Medium | Template Persistence | Save custom templates to database |
| 🟡 Medium | Image Upload | File upload service for logos, images |
| 🟡 Medium | Email Verification | Verify user email on signup |
| 🟡 Medium | Password Reset | Forgot password functionality |
| 🟢 Low | OAuth Integration | Google, GitHub providers |
| 🟢 Low | Collaboration | Real-time collaborative editing |
| 🟢 Low | Version History | Template versioning |
| 🟢 Low | Audit Logs | Detailed activity logs |

---

## 🛠️ Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| **Framework** | Next.js | 16.x |
| **Language** | TypeScript | 5.x |
| **Styling** | Tailwind CSS | 4.x |
| **UI Components** | shadcn/ui | Latest |
| **State Management** | Zustand | 5.x |
| **Drag & Drop** | @dnd-kit | Latest |
| **Database** | MongoDB | Atlas |
| **ORM** | Prisma | 6.x |
| **Authentication** | NextAuth.js | 4.x |
| **Payments** | NOWPayments | API v3 |
| **Compression** | pako | 2.x |
| **Icons** | Lucide React | Latest |
| **Charts** | Recharts | 2.x |
| **Password Hashing** | bcryptjs | Latest |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ or **Bun**
- **MongoDB** database (Atlas or local)
- npm, yarn, or bun package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ronak206/quickdocs.git
   cd quickdocs
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # MongoDB Connection
   # IMPORTANT: Include database name and URL-encode special characters in password
   DATABASE_URL="mongodb+srv://<username>:<password>@cluster.mongodb.net/quickdocs?retryWrites=true&w=majority"
   
   # NextAuth.js Configuration
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   
   # NOWPayments Configuration
   NOWPAYMENTS_API_KEY="your-api-key"
   NOWPAYMENTS_IPN_SECRET="your-ipn-secret"
   ```
   
   Generate a secret key:
   ```bash
   openssl rand -base64 32
   ```

4. **Initialize the database**
   ```bash
   bun run db:generate
   bun run db:push
   ```

5. **Seed initial data** (plans & templates)
   ```bash
   curl -X POST http://localhost:3000/api/seed
   ```

6. **Start the development server**
   ```bash
   bun dev
   # or
   npm run dev
   ```

7. **Open in browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
bun run build
bun start
```

---

## 📁 Project Structure

```
quickdocs/
├── 📂 src/
│   ├── 📂 app/                      # Next.js App Router
│   │   ├── 📂 (auth)/               # Authentication pages
│   │   │   ├── 📂 login/            # Login page
│   │   │   └── 📂 signup/           # Signup page
│   │   ├── 📂 api/                  # API routes
│   │   │   ├── 📂 auth/             # Auth endpoints
│   │   │   │   ├── 📂 [...nextauth]/ # NextAuth handler
│   │   │   │   └── 📂 register/     # Registration API
│   │   │   ├── 📂 stats/            # Dashboard statistics
│   │   │   ├── 📂 documents/        # Document CRUD
│   │   │   ├── 📂 templates/        # Template CRUD
│   │   │   ├── 📂 payments/         # Payment endpoints
│   │   │   ├── 📂 webhooks/         # Webhook handlers
│   │   │   │   └── 📂 nowpayments/  # NOWPayments IPN
│   │   │   ├── 📂 seed/             # Database seeding
│   │   │   └── 📂 health/           # Health check
│   │   ├── 📂 payment/              # Payment page
│   │   ├── 📄 page.tsx              # Dashboard (protected)
│   │   ├── 📄 layout.tsx            # Root layout
│   │   └── 📄 globals.css           # Global styles
│   │
│   ├── 📂 components/
│   │   ├── 📂 builder/              # Template builder
│   │   │   ├── 📄 TemplateBuilder.tsx
│   │   │   ├── 📄 types.ts          # Element types
│   │   │   ├── 📄 store.ts          # Zustand store
│   │   │   ├── 📄 PDFDocument.tsx   # PDF rendering
│   │   │   └── 📄 PDFPreviewModal.tsx
│   │   ├── 📂 providers/            # React providers
│   │   │   └── 📄 Providers.tsx
│   │   └── 📂 ui/                   # shadcn/ui components
│   │
│   ├── 📂 lib/                      # Utilities
│   │   ├── 📄 auth.ts               # NextAuth config
│   │   ├── 📄 db.ts                 # Prisma client
│   │   ├── 📄 session.ts            # Session helpers
│   │   ├── 📄 nowpayments.ts        # Payment integration
│   │   ├── 📄 utils.ts              # Utility functions
│   │   └── 📂 services/             # Business services
│   │       └── 📄 compression.ts    # Data compression
│   │
│   ├── 📂 hooks/                    # Custom React hooks
│   └── 📂 store/                    # Global state stores
│
├── 📂 prisma/
│   └── 📄 schema.prisma             # Database schema
│
├── 📂 public/                       # Static assets
│   ├── 🖼️ favicon.png
│   ├── 🖼️ favicon.svg
│   └── 📄 robots.txt
│
├── 📄 .env.example                  # Environment template
├── 📄 package.json
├── 📄 tailwind.config.ts
├── 📄 tsconfig.json
└── 📄 README.md
```

---

## 💾 Database Models

### User Model
```prisma
model User {
  id            String     @id @default(auto())
  email         String     @unique
  name          String?
  password      String     // Hashed
  company       String?
  avatar        String?
  subscription  Subscription?
  documents     Document[]
  templates     Template[]
  usage         Usage[]
  payments      Payment[]
}
```

### Subscription Model
```prisma
model Subscription {
  id              String   @id @default(auto())
  userId          String   @unique
  planId          String
  status          SubscriptionStatus @default(active)
  startDate       DateTime @default(now())
  endDate         DateTime?
  user            User     @relation(...)
  plan            Plan     @relation(...)
}
```

### Plan Model
```prisma
model Plan {
  id                String   @id @default(auto())
  name              String   @unique // FREE, STARTER, PRO, ENTERPRISE
  displayName       String
  price             Float    @default(0)
  pdfLimit          Int      @default(10) // PDFs per month
  templateLimit     Int      @default(5)
  storageLimit      Int      @default(10) // MB
  features          String   // JSON array
  subscriptions     Subscription[]
}
```

### Payment Model
```prisma
model Payment {
  id              String   @id @default(auto())
  userId          String
  planId          String
  amount          Float
  currency        String
  paymentId       String   @unique // NOWPayments ID
  paymentStatus   String
  payAddress      String?
  payAmount       Float?
  user            User     @relation(...)
  plan            Plan     @relation(...)
  createdAt       DateTime @default(now())
}
```

### Usage Model
```prisma
model Usage {
  id              String   @id @default(auto())
  userId          String
  month           Int      // 1-12
  year            Int      // 2024, 2025, etc.
  pdfCount        Int      @default(0)
  storageUsed     Int      @default(0)
  user            User     @relation(...)
  
  @@unique([userId, month, year])
}
```

### Document Model
```prisma
model Document {
  id             String          @id @default(auto())
  title          String
  type           DocumentType
  data           String          // JSON (compressed)
  dataHash       String?         // For deduplication
  compressedSize Int?
  status         DocumentStatus  @default(draft)
  pdfData        String?         // Base64 encoded compressed PDF
  pdfSize        Int?
  owner          User            @relation(...)
  items          DocumentItem[]
}
```

---

## 🔌 API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/[...nextauth]` | NextAuth handler |

### Statistics

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/stats` | Get dashboard stats (documents, templates, usage) |

**Response:**
```json
{
  "stats": { "documents": 5, "templates": 6, "categories": 6 },
  "usage": { "pdfsUsed": 3, "pdfLimit": 10, "pdfsRemaining": 7 },
  "plan": { "name": "FREE", "displayName": "Free", "price": 0 }
}
```

### Documents

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/documents` | List user's documents |
| `POST` | `/api/documents` | Create new document (checks PDF limit) |
| `GET` | `/api/documents/[id]` | Get document by ID |
| `DELETE` | `/api/documents/[id]` | Delete document |

**Create Document Request:**
```json
{
  "title": "Invoice #001",
  "type": "INVOICE",
  "documentNumber": "INV-001",
  "data": { ... },
  "items": [{ "name": "Item 1", "quantity": 1, "unitPrice": 100 }],
  "totalAmount": 100
}
```

### Templates

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/templates` | List all templates |
| `GET` | `/api/templates/[id]` | Get template by ID |

### Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/payments` | Create payment request |
| `GET` | `/api/payments` | Get payment status |

**Create Payment Request:**
```json
{
  "planId": "plan_id_here",
  "successUrl": "http://localhost:3000?payment=success"
}
```

### Webhooks

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/webhooks/nowpayments` | NOWPayments IPN callback |

### Seed

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/seed` | Seed plans and default templates |
| `POST` | `/api/seed-plans` | Seed subscription plans |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Check database connectivity |

---

## 💰 Subscription Plans

| Plan | Price | PDFs/Month | Templates | Storage |
|------|-------|------------|-----------|---------|
| **Free** | $0 | 10 | 5 | 10 MB |
| **Starter** | $9.99 | 50 | 20 | 100 MB |
| **Pro** | $29.99 | 200 | 100 | 500 MB |
| **Enterprise** | $99.99 | Unlimited | Unlimited | 10 GB |

---

## 💳 Payment Integration

QuickDocs uses **NOWPayments** for cryptocurrency payment processing:

### Supported Cryptocurrencies
- Bitcoin (BTC)
- Ethereum (ETH)
- USDT (TRC20/ERC20)
- And 50+ other cryptocurrencies

### Payment Flow
1. User selects a plan
2. Payment request created via NOWPayments API
3. User redirected to payment page with crypto address
4. Webhook receives payment confirmation
5. User's subscription is automatically upgraded

### Environment Variables
```env
NOWPAYMENTS_API_KEY=your_api_key
NOWPAYMENTS_IPN_SECRET=your_ipn_secret
```

---

## 📋 What's Done & Remaining

### ✅ Completed

1. **Authentication System**
   - User registration with validation
   - Login with credentials
   - JWT session management
   - Protected routes

2. **Database Schema**
   - User, Account, Session models
   - Subscription & Plan models
   - Document & DocumentItem models
   - Template & TemplateField models
   - Usage tracking model
   - Payment model
   - Activity logging model

3. **Subscription & Plans**
   - Plan seeding (Free, Starter, Pro, Enterprise)
   - Subscription management
   - PDF limit enforcement

4. **Payment Integration**
   - NOWPayments API integration
   - Payment creation flow
   - Webhook handling
   - Plan upgrades

5. **Usage Tracking**
   - Monthly PDF count tracking
   - Storage usage tracking
   - Per-user, per-month records

6. **Document Management**
   - Create documents with compression
   - PDF limit checking before creation
   - Activity logging

7. **Data Compression**
   - Gzip compression service
   - Hash deduplication
   - Size tracking

8. **Template Builder**
   - Drag-and-drop interface
   - 50+ element types
   - Text formatting (bold, italic, underline)
   - New line and tab support
   - Real-time preview
   - PDF preview modal

9. **API Endpoints**
   - `/api/stats` - Dashboard statistics
   - `/api/documents` - Document CRUD
   - `/api/templates` - Template management
   - `/api/payments` - Payment processing
   - `/api/webhooks/nowpayments` - Payment webhooks
   - `/api/seed` - Database initialization
   - `/api/health` - System health check

10. **Dashboard UI**
    - Stats cards with real data
    - Usage progress bar
    - Plan indicator
    - Recent documents list
    - Template browser

### 🚧 Remaining

1. **High Priority**
   - PDF generation from templates
   - Email verification
   - Password reset

2. **Medium Priority**
   - Template saving/loading
   - Image upload service
   - Custom template builder improvements
   - Export to different formats

3. **Low Priority**
   - OAuth providers (Google, GitHub)
   - Real-time collaboration
   - Version history
   - Audit logs dashboard

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow SOLID principles
- Write meaningful commit messages
- Update documentation for new features
- Test your changes before submitting

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support

Having issues? Here's how to get help:

1. Check the [Issues](https://github.com/Ronak206/quickdocs/issues) page
2. Create a new issue with:
   - Description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots (if applicable)

---

<div align="center">

**Built with ❤️ by [Ronak](https://github.com/Ronak206)**

[⬆ Back to Top](#quickdocs)

</div>
