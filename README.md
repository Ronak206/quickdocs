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
- [Authentication](#authentication)
- [Database Models](#database-models)
- [API Reference](#api-reference)
- [Element Categories](#element-categories)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

QuickDocs is a modern, full-stack document generation platform that enables users to create professional PDF documents through an intuitive drag-and-drop interface. Built with Next.js 16, MongoDB, and a microservices-ready architecture, it supports invoices, receipts, contracts, salary slips, and custom templates.

### Key Highlights

- 🔐 **Secure Authentication** - Email/password login with NextAuth.js
- 📄 **50+ Element Types** - Comprehensive library for document building
- 🎨 **Visual Editor** - Drag-and-drop canvas with real-time preview
- 📊 **MongoDB Database** - Scalable data storage with Prisma ORM
- 📱 **Responsive Design** - Works seamlessly on desktop and tablet
- 🚀 **Modern Stack** - Next.js 16, TypeScript, Tailwind CSS 4

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
│  │    Data      │  │    Auth      │  │   Storage    │       │
│  │   Service    │  │   Service    │  │   Service    │       │
│  │  (Prisma)    │  │  (NextAuth)  │  │  (File/CDN)  │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### SOLID Principles

| Principle | Implementation |
|-----------|----------------|
| **S**ingle Responsibility | Each component handles one concern (TemplateBuilder, PropertiesPanel, DataFormPanel) |
| **O**pen/Closed | Element types are extensible without modifying core rendering logic |
| **L**iskov Substitution | All element types follow the same `TemplateElement` interface |
| **I**nterface Segregation | Separate interfaces for different element categories |
| **D**ependency Inversion | Components depend on abstractions (Zustand store) not concrete implementations |

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
| 🎨 **Editor** | Drag & Drop | Intuitive canvas-based template building |
| 🎨 **Editor** | 50+ Elements | Comprehensive element library |
| 🎨 **Editor** | Real-time Preview | Live preview while building |
| 🎨 **Editor** | Properties Panel | Configure fonts, colors, sizes |
| 🎨 **Editor** | Data Form Panel | Fill template variables |
| 📄 **Export** | Multiple Formats | Export to PDF, HTML, or JSON |
| 📄 **Export** | Template Import | Load templates from JSON |
| 📱 **UI** | Responsive Design | Desktop and tablet support |
| 📱 **UI** | Dark Mode Ready | Theme provider configured |

### Upcoming Features 🚧

| Priority | Feature | Description |
|----------|---------|-------------|
| 🔴 High | Element Functionality | Full implementation of all 50+ elements |
| 🔴 High | PDF Export Service | Server-side PDF generation |
| 🔴 High | Form Data Binding | Connect input elements to form state |
| 🟡 Medium | Template Persistence | Save templates to database |
| 🟡 Medium | Image Upload | File upload service |
| 🟡 Medium | Document Storage | Save generated documents |
| 🟢 Low | OAuth Integration | Google, GitHub providers |
| 🟢 Low | Collaboration | Real-time collaborative editing |
| 🟢 Low | Version History | Template versioning |

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
   DATABASE_URL="mongodb+srv://<username>:<password>@cluster.mongodb.net/quickdocs?retryWrites=true&w=majority"
   
   # NextAuth.js Configuration
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
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

5. **Start the development server**
   ```bash
   bun dev
   # or
   npm run dev
   ```

6. **Open in browser**
   
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
│   │   │   └── 📂 [...path]/        # Dynamic API routes
│   │   ├── 📄 page.tsx              # Dashboard (protected)
│   │   ├── 📄 layout.tsx            # Root layout
│   │   └── 📄 globals.css           # Global styles
│   │
│   ├── 📂 components/
│   │   ├── 📂 builder/              # Template builder
│   │   │   ├── 📄 TemplateBuilder.tsx
│   │   │   ├── 📄 types.ts          # Element types
│   │   │   └── 📄 store.ts          # Zustand store
│   │   ├── 📂 providers/            # React providers
│   │   │   └── 📄 Providers.tsx
│   │   └── 📂 ui/                   # shadcn/ui components
│   │
│   ├── 📂 lib/                      # Utilities
│   │   ├── 📄 auth.ts               # NextAuth config
│   │   ├── 📄 db.ts                 # Prisma client
│   │   ├── 📄 session.ts            # Session helpers
│   │   └── 📄 utils.ts              # Utility functions
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

## 🔐 Authentication

### User Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Signup    │────▶│    Login    │────▶│  Dashboard  │
│  /signup    │     │   /login    │     │     /       │
└─────────────┘     └─────────────┘     └─────────────┘
      │                   │                    │
      ▼                   ▼                    ▼
  Create User       Verify Credentials    Protected Route
  in MongoDB        + Create Session      + User Session
```

### Protected Routes

The dashboard (`/`) is protected. Unauthenticated users are redirected to `/login`.

```typescript
// Example: Protecting a page
const { status } = useSession();

useEffect(() => {
  if (status === 'unauthenticated') {
    router.push('/login');
  }
}, [status]);
```

### Session Management

- **Strategy**: JWT-based sessions
- **Provider**: Credentials (Email/Password)
- **Password Security**: bcryptjs with 12 rounds

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
  emailVerified DateTime?
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  
  accounts      Account[]
  sessions      Session[]
  documents     Document[]
  templates     Template[]
}
```

### Document Model

```prisma
model Document {
  id            String          @id @default(auto())
  title         String
  documentNumber String?
  type          DocumentType
  data          String          // JSON
  status        DocumentStatus  @default(draft)
  pdfUrl        String?
  totalAmount   Float?
  currency      String?
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  
  owner         User            @relation(...)
  template      Template?       @relation(...)
  items         DocumentItem[]
}
```

### Template Model

```prisma
model Template {
  id            String           @id @default(auto())
  name          String
  description   String?
  category      TemplateCategory
  type          DocumentType
  schema        String           // JSON
  layout        String           // JSON
  isPublic      Boolean          @default(false)
  isPremium     Boolean          @default(false)
  downloads     Int              @default(0)
  rating        Float?
  createdAt     DateTime         @default(now())
  
  creator       User?            @relation(...)
  documents     Document[]
  fields        TemplateField[]
}
```

---

## 🔌 API Reference

### Authentication

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| `POST` | `/api/auth/register` | Register new user | `{ name, email, password, company? }` |
| `POST` | `/api/auth/[...nextauth]` | NextAuth handler | - |

### Registration Request/Response

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "company": "Acme Inc"
}
```

**Response (201):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "...",
    "email": "john@example.com",
    "name": "John Doe",
    "company": "Acme Inc"
  }
}
```

### Templates (Planned)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/templates` | List all templates |
| `POST` | `/api/templates` | Create new template |
| `GET` | `/api/templates/:id` | Get template by ID |
| `PUT` | `/api/templates/:id` | Update template |
| `DELETE` | `/api/templates/:id` | Delete template |

### Export (Planned)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/export/pdf` | Export template as PDF |
| `POST` | `/api/export/html` | Export template as HTML |

---

## 🧩 Element Categories

The template builder includes **50+ element types** across 8 categories:

### Summary Table

| Category | Elements | Working |
|----------|----------|---------|
| **Text** | Heading, Paragraph, Rich Text, Label | 3/4 |
| **Input** | Text Field, Textarea, Checkbox, Radio, Select, Toggle, Slider, Rating, Date Picker, etc. | 4/12 |
| **Media** | Image, Video, Audio | 0/3 |
| **Shapes** | Rectangle, Ellipse, Line, Polygon, Rounded Box | 4/5 |
| **Data** | Table, List, Chart, Progress Bar | 1/4 |
| **Navigation** | Button, Hyperlink | 0/2 |
| **Decorative** | Badge, Tooltip, Divider, Icon | 3/4 |
| **Layout** | Container, Columns | 0/2 |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow the existing code style
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
