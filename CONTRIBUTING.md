# Contributing to Identity Creator

Thank you for your interest in contributing! This guide will help you get started.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [npm](https://www.npmjs.com/), [yarn](https://yarnpkg.com/), or [pnpm](https://pnpm.io/)
- [Git](https://git-scm.com/)

### Setup

```bash
# Fork and clone the repository
git clone https://github.com/your-username/identity-creator.git
cd identity-creator

# Install dependencies
npm install

# Copy example config
cp config.example.json config.json

# Start the dev server
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

---

## Development Workflow

### Branch Naming

- `feature/description` — New features
- `fix/description` — Bug fixes
- `docs/description` — Documentation changes
- `refactor/description` — Code refactoring

### Code Style

- Use TypeScript for all new code
- Follow the existing code patterns in the project
- Use Tailwind CSS for styling (no CSS modules or styled-components)
- Components go in `src/components/`
- Utility functions go in `src/lib/`
- API routes go in `src/app/api/`

### Commit Messages

Use clear, descriptive commit messages:

```
feat: add batch export to PDF
fix: resolve avatar loading race condition
docs: update README with new screenshots
refactor: simplify identity generation logic
```

---

## Pull Request Process

1. **Create a branch** from `main` for your changes
2. **Make your changes** following the code style guidelines
3. **Test locally** — Run `npm run lint` and `npm run build` to verify
4. **Write a clear PR description** explaining what changed and why
5. **Submit the PR** and wait for review

### PR Checklist

- [ ] Code compiles without errors (`npm run build`)
- [ ] No lint errors (`npm run lint`)
- [ ] New features include appropriate documentation
- [ ] No sensitive data (API keys, cookies) is committed
- [ ] `config.json` and `.env.local` are not included

---

## Reporting Issues

### Bug Reports

When filing a bug report, please include:

- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Browser and OS information
- Screenshots if applicable

### Feature Requests

When suggesting features, please include:

- A clear description of the feature
- The use case (why it's needed)
- Any implementation ideas

---

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## Questions?

If you have questions about contributing, feel free to [open a discussion](https://github.com/11nawid/identity-creator/discussions) on GitHub.
