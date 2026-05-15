# QuickDocs

**Professional PDF Document Builder**

QuickDocs is a powerful drag-and-drop document template builder that allows you to create professional PDF documents with ease. Build invoices, receipts, contracts, salary slips, and more with our intuitive visual editor.

## Features

- **Drag & Drop Editor** - Intuitive canvas-based template building
- **50+ Element Types** - Text, inputs, shapes, charts, media, and more
- **Real-time Preview** - See your documents as you build them
- **Data Binding** - Fill template variables dynamically
- **Multiple Export Formats** - Export to PDF, HTML, or JSON
- **Template Library** - Pre-built templates for common document types
- **Responsive Design** - Works on desktop and tablet devices

## Document Types Supported

- Invoices
- Receipts
- Expense Reports
- Salary Slips
- Business Proposals
- Contracts
- Custom Templates

## Tech Stack

- **Framework**: Next.js 16
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **Drag & Drop**: @dnd-kit
- **Icons**: Lucide React

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

# Start development server
npm run dev
# or
bun dev
```

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
quickdocs/
├── src/
│   ├── app/                 # Next.js app router pages
│   ├── components/
│   │   ├── builder/         # Template builder components
│   │   └── ui/              # shadcn/ui components
│   ├── lib/                 # Utility functions
│   ├── hooks/               # React hooks
│   └── store/               # Zustand stores
├── public/                  # Static assets
└── package.json
```

## Element Categories

The template builder includes the following element categories:

1. **Text Elements** - Heading, Paragraph, Rich Text, Label
2. **Input Elements** - Text Field, Textarea, Checkbox, Radio, Select, Toggle, Slider, Rating, etc.
3. **Media Elements** - Image, Video, Audio
4. **Shape Elements** - Rectangle, Ellipse, Line, Polygon, Rounded Box
5. **Data Elements** - Table, List, Chart, Progress Bar
6. **Navigation Elements** - Button, Hyperlink
7. **Decorative Elements** - Badge, Tooltip, Divider, Icon
8. **Layout Elements** - Container, Columns

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For support, please open an issue on GitHub.
