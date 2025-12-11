# VibeQuorum Monorepo

This is a monorepo containing all packages for the VibeQuorum Web3 Q&A Platform.

## Structure

```
vibequorum-monorepo/
├── backend/              # Express.js API backend
├── VibeQuorum-frontend/ # Next.js frontend application
├── contracts/           # Hardhat smart contracts
└── package.json         # Root workspace configuration
```

## Workspaces

- `@vibequorum/backend` - Backend API server (Express + TypeScript)
- `@vibequorum/frontend` - Frontend application (Next.js + React)
- `@vibequorum/contracts` - Smart contracts (Hardhat + Solidity)

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

Install all dependencies for all workspaces:

```bash
npm install
```

This will install dependencies for the root and all workspace packages.

### Development

Run all development servers:

```bash
npm run dev
```

Run specific workspace in development mode:

```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend

# Contracts (Hardhat node)
npm run dev:contracts
```

### Building

Build all workspaces:

```bash
npm run build
```

Build specific workspace:

```bash
npm run build:backend
npm run build:frontend
npm run build:contracts
```

### Testing

Run all tests:

```bash
npm run test
```

Run tests for specific workspace:

```bash
npm run test:backend
npm run test:contracts
```

### Linting

Lint all workspaces:

```bash
npm run lint
```

Fix linting issues (backend only):

```bash
npm run lint:fix
```

### Clean

Remove all node_modules and build artifacts:

```bash
npm run clean
```

## Workspace-Specific Commands

### Backend (`@vibequorum/backend`)

```bash
cd backend
npm run dev          # Start development server
npm run build        # Build TypeScript
npm run start        # Start production server
npm run test         # Run tests
npm run lint         # Lint code
```

### Frontend (`@vibequorum/frontend`)

```bash
cd VibeQuorum-frontend
npm run dev          # Start Next.js dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Lint code
```

### Contracts (`@vibequorum/contracts`)

```bash
cd contracts
npm run compile      # Compile contracts
npm run test         # Run tests
npm run deploy:sepolia  # Deploy to Sepolia
npm run node         # Start local Hardhat node
```

## Adding Dependencies

### To a specific workspace:

```bash
npm install <package> --workspace=backend
npm install <package> --workspace=VibeQuorum-frontend
npm install <package> --workspace=contracts
```

### To root (dev dependencies):

```bash
npm install -D <package> -w .
```

## Benefits of Monorepo

1. **Shared Dependencies**: Common dependencies are hoisted to the root, reducing duplication
2. **Cross-Package Development**: Easy to work across packages without publishing
3. **Unified Versioning**: Manage versions across packages more easily
4. **Single CI/CD**: One repository for all related code
5. **Code Sharing**: Easier to share utilities and types between packages

## Workspace Linking

Packages can reference each other using workspace protocol:

```json
{
  "dependencies": {
    "@vibequorum/contracts": "workspace:*"
  }
}
```

## Notes

- All workspace packages use scoped naming (`@vibequorum/*`)
- Dependencies are hoisted to root `node_modules` when possible
- Each workspace maintains its own `package.json` and can be run independently
- Root `package.json` provides convenience scripts for common operations
