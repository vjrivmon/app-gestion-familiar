# {{PROJECT_NAME}}

{{PROJECT_DESCRIPTION}}

## Features

- {{FEATURE_1}}
- {{FEATURE_2}}
- {{FEATURE_3}}

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | {{FRONTEND_STACK}} |
| Backend | {{BACKEND_STACK}} |
| Database | {{DATABASE}} |
| Hosting | {{HOSTING}} |

## Quick Start

### Prerequisites

- Node.js >= 20.x
- npm >= 10.x
- {{ADDITIONAL_PREREQUISITES}}

### Installation

```bash
# Clone the repository
git clone https://github.com/vjrivmon/{{PROJECT_NAME}}.git
cd {{PROJECT_NAME}}

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_SECRET` | Auth secret (min 32 chars) | Yes |
| `NEXTAUTH_URL` | Application URL | Yes |
| {{ADDITIONAL_ENV_VARS}} |

## Development

### Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run test      # Run tests
npm run lint      # Lint code
npm run typecheck # Check TypeScript types
```

### Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # React components
│   ├── ui/          # Reusable UI components
│   └── features/    # Feature-specific components
├── lib/             # Utilities and helpers
├── hooks/           # Custom React hooks
├── services/        # External service integrations
└── types/           # TypeScript type definitions
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run E2E tests
npm run test:e2e

# Generate coverage report
npm run test:coverage
```

### Test Coverage

| Type | Coverage |
|------|----------|
| Unit | {{UNIT_COVERAGE}}% |
| Integration | {{INTEGRATION_COVERAGE}}% |
| E2E | {{E2E_COVERAGE}}% |

## Deployment

### Production (Vercel)

The main branch automatically deploys to production via Vercel.

```bash
# Manual deployment
vercel --prod
```

### Preview Deployments

Every PR gets a preview deployment automatically.

## API Documentation

API documentation is available at `/api/docs` when running the development server.

{{#if HAS_OPENAPI}}
OpenAPI specification: `/api/openapi.json`
{{/if}}

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `refactor:` Code refactoring
- `test:` Tests
- `chore:` Maintenance

## License

{{LICENSE_TYPE}} - see [LICENSE](LICENSE) for details.

## Author

**Vicente Rivas Monferrer** - [@vjrivmon](https://github.com/vjrivmon)

---

Built with Claude Code
