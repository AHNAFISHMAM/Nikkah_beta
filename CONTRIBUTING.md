# Contributing to NikahPrep

Thank you for your interest in contributing to NikahPrep! This document provides guidelines and instructions for contributing.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- Git installed
- A Supabase account (for local development)

### Setup
1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Nikkah_beta.git
   cd Nikkah_beta
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up environment variables (see README.md)
5. Run the development server:
   ```bash
   npm run dev
   ```

## 📝 Making Changes

### Branch Naming
Use descriptive branch names:
- `feature/your-feature-name` - New features
- `fix/your-bug-fix` - Bug fixes
- `docs/your-docs-update` - Documentation
- `refactor/your-refactor` - Code refactoring

### Code Style
- Follow TypeScript best practices
- Use ESLint and Prettier (configured in project)
- Run `npm run lint` before committing
- Run `npm run typecheck` to verify types

### Commit Messages
Use clear, descriptive commit messages:
```
feat: Add budget calculator export feature
fix: Resolve authentication redirect issue
docs: Update README with deployment instructions
refactor: Simplify financial components
```

### Testing
- Write tests for new features
- Run `npm test` before pushing
- Ensure all tests pass

## 🔄 Pull Request Process

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** and commit:
   ```bash
   git add .
   git commit -m "feat: Add your feature"
   ```

3. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Create a Pull Request**:
   - Go to the original repository
   - Click "New Pull Request"
   - Select your branch
   - Fill out the PR template
   - Wait for CI checks to pass
   - Address any review comments

5. **Get approval** and merge!

## 📋 PR Checklist

Before submitting a PR, ensure:
- [ ] Code follows project style guidelines
- [ ] All tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Type checking passes (`npm run typecheck`)
- [ ] Build succeeds (`npm run build`)
- [ ] Documentation updated (if needed)
- [ ] Commit messages are clear

## 🐛 Reporting Issues

When reporting bugs:
1. Check if the issue already exists
2. Use the bug report template
3. Include:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Screenshots (if applicable)
   - Environment details

## 💡 Feature Requests

For feature requests:
1. Check if it's already requested
2. Use the feature request template
3. Explain:
   - The problem it solves
   - Proposed solution
   - Alternatives considered

## 📚 Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Help others learn and grow

## 🙏 Thank You!

Your contributions make this project better for everyone. Thank you for taking the time to contribute!

---

**Questions?** Open an issue or start a discussion!

