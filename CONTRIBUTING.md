# 🤝 Contributing to Flores Victoria

First off, **thank you** for considering contributing to Flores Victoria! 🌸 

This open source project aims to create the **world's most advanced floristry e-commerce platform**, and we need amazing people like you to make it happen.

## 🌟 Why Contribute?

- 🚀 **Impact**: Help florists worldwide compete with enterprise-level technology
- 🧠 **Learning**: Work with cutting-edge tech (AI, WebAssembly, Kubernetes, etc.)
- 🌍 **Community**: Join a passionate community of developers and florists
- 📈 **Career**: Build an impressive portfolio with real-world impact
- 🏆 **Recognition**: Get credited in our contributors hall of fame

## 🎯 Ways to Contribute

### 👨‍💻 For Developers

- **🐛 Bug Fixes**: Fix issues and improve stability
- **✨ New Features**: Implement AI recommendations, AR visualization, etc.
- **⚡ Performance**: Optimize loading times and resource usage
- **🧪 Testing**: Write unit, integration, and E2E tests
- **📚 Documentation**: Improve guides and API docs
- **🔧 DevOps**: Enhance CI/CD, monitoring, and deployment

### 🎨 For Designers

- **🖼️ UI/UX**: Design beautiful and intuitive interfaces
- **📱 Mobile**: Create amazing mobile experiences
- **🎭 Branding**: Develop brand guidelines and visual identity
- **🌐 Accessibility**: Ensure the platform is accessible to everyone

### 🌸 For Florists

- **💡 Ideas**: Share insights about floristry business needs
- **🧪 Testing**: Test new features and provide feedback
- **📝 Content**: Write flower care guides and seasonal tips
- **🗣️ Community**: Help other florists in discussions

### 📖 For Technical Writers

- **📚 Documentation**: Write clear installation and usage guides
- **🎓 Tutorials**: Create step-by-step tutorials
- **🌐 Translation**: Translate docs to other languages

## 🚀 Getting Started

### 1. 📋 Prerequisites

```bash
# Required tools
- Node.js >= 22.0.0
- Docker & Docker Compose
- Git

# Optional but recommended
- VS Code with recommended extensions
- Kubernetes (for production deployment)
```

### 2. 🔧 Development Setup

```bash
# 1. Fork the repository on GitHub
# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/Flores-Victoria-.git
cd Flores-Victoria-

# 3. Install dependencies
npm run install:all

# 4. Start development environment
npm run dev:stack

# 5. Verify everything is working
./check-detailed-status.sh
```

### 3. 🌐 Access Points

After successful setup, you can access:

- **Frontend**: http://localhost:5173
- **Admin Panel**: http://localhost:3010
- **API Gateway**: http://localhost:3000
- **Grafana Monitoring**: http://localhost:3011 (admin/admin)
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)

## 📋 Development Workflow

### 1. 🎯 Choose an Issue

- Browse [open issues](../../issues)
- Look for `good first issue` or `help wanted` labels
- Comment on the issue to let others know you're working on it

### 2. 🌿 Create a Branch

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/issue-description
```

### 3. 🔨 Make Changes

```bash
# Make your changes
# Test locally
npm run test
npm run lint

# Validate everything works
npm run validate:all
```

### 4. ✅ Testing Guidelines

```bash
# Run unit tests
npm run test:unit

# Run integration tests  
npm run test:integration

# Run E2E tests
npm run test:e2e

# Check test coverage
npm run test:coverage
```

### 5. 📝 Commit Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format: type(scope): description

# Examples:
git commit -m "feat(ai): implement product recommendations engine"
git commit -m "fix(payments): resolve Stripe webhook validation"
git commit -m "docs(api): add OpenAPI specification"
git commit -m "perf(frontend): optimize image loading with WebP"
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `perf`: Performance improvement
- `refactor`: Code refactoring
- `test`: Adding tests
- `ci`: CI/CD changes

### 6. 🚀 Submit Pull Request

```bash
# Push your branch
git push origin feature/your-feature-name

# Create a Pull Request on GitHub with:
# - Clear title and description
# - Link to related issues
# - Screenshots for UI changes
# - Test coverage report
```

## 🏗️ Project Architecture

### 📁 Directory Structure

```
flores-victoria/
├── 🎨 frontend/              # Vue.js/Vanilla JS frontend
├── ⚙️ backend/               # Node.js microservices
├── 🎛️ admin-panel/           # Administrative interface
├── 🔌 api-gateway/           # API Gateway with rate limiting
├── ☸️ k8s/                   # Kubernetes manifests
├── 🐳 docker/                # Docker configurations
├── 📊 monitoring/            # Grafana dashboards
├── 🧪 tests/                 # Test suites
├── 📚 docs/                  # Documentation
└── 🤖 scripts/               # Automation scripts
```

### 🏗️ Microservices Architecture

```
┌─────────────────┐    ┌──────────────────┐
│   🌐 Frontend    │────│  🔌 API Gateway   │
│                 │    │                  │
└─────────────────┘    └─────────┬────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
              ┌─────▼─────┐ ┌───▼────┐ ┌────▼─────┐
              │🔐 Auth     │ │👤 User  │ │🛒 Order │
              │Service     │ │Service │ │Service  │
              └───────────┘ └────────┘ └─────────┘
```

### 🧪 Testing Strategy

- **Unit Tests**: Individual function/component testing
- **Integration Tests**: Service interaction testing
- **E2E Tests**: Full user workflow testing
- **Performance Tests**: Load and stress testing
- **Security Tests**: Vulnerability scanning

## 🎨 Code Style Guidelines

### 🔧 JavaScript/Node.js

```javascript
// ✅ Good
class RecommendationEngine {
  constructor(options = {}) {
    this.modelPath = options.modelPath || './models/default';
    this.threshold = options.threshold || 0.7;
  }

  async generateRecommendations(userId, context) {
    try {
      const userProfile = await this.getUserProfile(userId);
      const recommendations = await this.predict(userProfile, context);
      
      return recommendations.filter(item => item.confidence > this.threshold);
    } catch (error) {
      this.logger.error('Recommendation generation failed', { userId, error });
      throw new RecommendationError('Failed to generate recommendations');
    }
  }
}
```

### 🎨 CSS/SCSS

```scss
// ✅ Good - Use BEM methodology
.flower-card {
  @apply rounded-lg shadow-md transition-transform;
  
  &__image {
    @apply w-full h-48 object-cover rounded-t-lg;
  }
  
  &__content {
    @apply p-4;
  }
  
  &__title {
    @apply text-xl font-semibold text-gray-800;
  }
  
  &--featured {
    @apply border-2 border-accent-500;
  }
}
```

### 🐳 Docker

```dockerfile
# ✅ Good - Multi-stage build
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:22-alpine AS runtime
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
WORKDIR /app
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --chown=nextjs:nodejs . .
USER nextjs
EXPOSE 3000
CMD ["npm", "start"]
```

## 🏷️ Issue Labels

- 🟢 `good first issue`: Perfect for newcomers
- 🔵 `help wanted`: We need community help
- 🔴 `priority: high`: Critical issues
- 🟡 `priority: medium`: Important but not critical
- ⚫ `priority: low`: Nice to have
- 🟣 `feature`: New functionality
- 🟠 `bug`: Something isn't working
- 🔵 `enhancement`: Improvement to existing feature
- 🟤 `documentation`: Documentation improvements
- 🔵 `question`: General questions

## 🎁 Recognition

Contributors will be recognized in:

- 📜 **README Contributors Section**
- 🏆 **Release Notes**
- 🌟 **GitHub Contributor Graph**
- 🎉 **Social Media Shoutouts**
- 📧 **Annual Contributor Report**

### 🏆 Contributor Levels

- 🌱 **Seedling**: First contribution
- 🌿 **Sprout**: 5+ contributions
- 🌺 **Bloomer**: 20+ contributions
- 🌳 **Tree**: 50+ contributions  
- 🏆 **Guardian**: Core team member

## 🤔 Questions?

- 💬 **Discord**: [Join our community](https://discord.gg/flores-victoria)
- 📧 **Email**: contributors@flores-victoria.org
- 🐛 **Issues**: [GitHub Issues](../../issues)
- 📖 **Docs**: [Documentation](docs/)

## 📜 Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold this code.

## 📄 License

By contributing to Flores Victoria, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

**🌸 Happy Contributing! Let's build something amazing together! 🌸**