# Contributing to HenryMo AI

Thank you for your interest in contributing to HenryMo AI! This document provides guidelines and instructions for contributing.

---

## 🎯 Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Follow the project's coding standards
- Test your changes thoroughly

---

## 🚀 Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/your-username/henrymo-ai.git
cd henrymo-ai
```

### 2. Set Up Development Environment

Follow the [Development Setup Guide](./DEVELOPMENT_SETUP.md) to set up your local environment.

### 3. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

---

## 📝 Development Workflow

### Code Style

- **JavaScript/TypeScript:** Follow ESLint configuration
- **Formatting:** Use Prettier (configured in `.prettierrc`)
- **Indentation:** 2 spaces
- **Quotes:** Single quotes for JavaScript
- **Semicolons:** Yes

### Commit Messages

Follow conventional commits:

```
feat: Add new authentication feature
fix: Resolve database connection issue
docs: Update API documentation
refactor: Improve code structure
test: Add unit tests for auth service
```

### Testing

- Write tests for new features
- Ensure all tests pass: `pnpm test`
- Maintain test coverage

---

## 🏗️ Project Structure

```
henrymo-ai/
├── apps/
│   ├── api/          # Backend API
│   ├── hub/          # Frontend Dashboard
│   └── web/          # Public Website
├── packages/
│   ├── database/     # Database schema
│   ├── shared/       # Shared utilities
│   └── ai-core/      # AI functionality
└── scripts/          # Utility scripts
```

---

## 🔍 Code Review Process

1. **Create Pull Request**
   - Provide clear description
   - Reference related issues
   - Include screenshots if UI changes

2. **Review Checklist**
   - [ ] Code follows style guidelines
   - [ ] Tests are included and passing
   - [ ] Documentation is updated
   - [ ] No breaking changes (or documented)

3. **Address Feedback**
   - Respond to review comments
   - Make requested changes
   - Update PR as needed

---

## 🐛 Reporting Issues

### Bug Reports

Include:
- Description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, etc.)
- Error messages/logs

### Feature Requests

Include:
- Clear description
- Use case/benefit
- Proposed implementation (if any)

---

## 📚 Documentation

- Update relevant documentation when adding features
- Follow existing documentation style
- Include code examples where helpful

---

## ✅ Checklist Before Submitting

- [ ] Code follows style guidelines
- [ ] Tests are written and passing
- [ ] Documentation is updated
- [ ] No console.logs or debug code
- [ ] Environment variables documented
- [ ] No sensitive data in code

---

## 🎉 Thank You!

Your contributions make HenryMo AI better for everyone!

---

**Maintainer:** Henry Maobughichi Ugochukwu (Super Admin)

