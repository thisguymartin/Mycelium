# Mycelium Documentation

Welcome to the comprehensive documentation for Mycelium, a decentralized peer-to-peer coordination platform for disaster response teams.

## 📚 Documentation Index

### Getting Started
- **[Project Overview](./PROJECT_OVERVIEW.md)** - Start here! Learn what Mycelium is, what problem it solves, and who it's for
- **[Quick Start Guide](../QUICKSTART.md)** - Get up and running in 5 minutes
- **[Run Guide](../RUN.md)** - All the ways to run Mycelium (npm, Docker, scripts, Make)

### Understanding Mycelium
- **[How It Works](./HOW_IT_WORKS.md)** - Detailed explanation of how Mycelium functions from connection to synchronization
- **[Architecture](./ARCHITECTURE.md)** - System architecture, design patterns, and component structure
- **[Features](./FEATURES.md)** - Complete list of current and planned features
- **[Technical Stack](./TECHNICAL_STACK.md)** - All technologies, libraries, and tools used

### Development
- **[Contributing Guide](../CONTRIBUTING.md)** - How to contribute to Mycelium
- **[Implementation Plan](../IMPLEMENTATION_PLAN.md)** - Detailed plan for upcoming features (PWA, SOS, Tasks, etc.)

## 🗺️ Documentation Map

```
Mycelium Documentation
│
├── 🎯 Start Here
│   ├── PROJECT_OVERVIEW.md       # What is Mycelium?
│   └── QUICKSTART.md              # 5-minute setup
│
├── 📖 Core Documentation
│   ├── HOW_IT_WORKS.md           # How everything works
│   ├── ARCHITECTURE.md            # System architecture
│   ├── FEATURES.md                # Current & planned features
│   └── TECHNICAL_STACK.md         # Technologies used
│
├── 💻 Development
│   ├── RUN.md                    # Running Mycelium
│   ├── CONTRIBUTING.md            # Contributing guide
│   └── IMPLEMENTATION_PLAN.md     # Future features plan
│
└── 📦 Reference
    └── README.md (Main)          # Project README
```

## 📖 Reading Guide

### For New Users
1. [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) - Understand what Mycelium does
2. [QUICKSTART.md](../QUICKSTART.md) - Get it running
3. [FEATURES.md](./FEATURES.md) - See what's possible

### For Developers
1. [ARCHITECTURE.md](./ARCHITECTURE.md) - Understand the system
2. [HOW_IT_WORKS.md](./HOW_IT_WORKS.md) - Learn the internals
3. [TECHNICAL_STACK.md](./TECHNICAL_STACK.md) - Know the tools
4. [RUN.md](../RUN.md) - Development workflow
5. [CONTRIBUTING.md](../CONTRIBUTING.md) - Start contributing

### For DevOps/Deployment
1. [RUN.md](../RUN.md) - Deployment options
2. [ARCHITECTURE.md](./ARCHITECTURE.md) - Infrastructure requirements
3. [TECHNICAL_STACK.md](./TECHNICAL_STACK.md) - Dependencies

### For Decision Makers
1. [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) - Business case
2. [FEATURES.md](./FEATURES.md) - Capabilities
3. [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical approach

## 📋 Document Summaries

### PROJECT_OVERVIEW.md
**What you'll learn**: Complete overview of Mycelium
- What Mycelium is and the problem it solves
- Key characteristics and what makes it different
- Use cases and real-world scenarios
- Project status and future vision
- How to get started

**Read time**: 10 minutes

---

### HOW_IT_WORKS.md
**What you'll learn**: Detailed explanation of Mycelium's operation
- Connection lifecycle (joining to syncing)
- State synchronization with CRDTs
- Location tracking workflow
- Message broadcasting
- Peer discovery
- Error handling
- What happens in various scenarios

**Read time**: 20 minutes

---

### ARCHITECTURE.md
**What you'll learn**: System architecture and design
- Architectural layers (UI, state, CRDT, P2P, signaling)
- Design patterns used
- Component structure
- Network topology
- Data flow architecture
- Security measures
- Performance characteristics
- Technology decisions and rationale

**Read time**: 30 minutes

---

### FEATURES.md
**What you'll learn**: All features current and planned
- Current features (complete list)
- Planned features by phase
- Feature priorities
- Roadmap timeline
- Feature comparison table
- Technical capabilities

**Read time**: 15 minutes

---

### TECHNICAL_STACK.md
**What you'll learn**: Technologies powering Mycelium
- Frontend stack (React, TypeScript, Vite, etc.)
- State synchronization (Yjs, WebRTC)
- Backend stack (Node.js, Express, Socket.IO)
- Common libraries and utilities
- Development tools
- Deployment stack
- Complete dependency list
- Technology decision rationale

**Read time**: 25 minutes

---

### QUICKSTART.md
**What you'll learn**: Getting Mycelium running quickly
- Prerequisites
- Docker setup (easiest)
- Manual setup
- First time setup
- Testing with multiple users
- Common issues

**Read time**: 5 minutes

---

### RUN.md
**What you'll learn**: All ways to run Mycelium
- npm scripts
- Shell scripts
- Makefile commands
- Docker commands
- Development workflows
- Troubleshooting
- Environment variables
- Quick reference table

**Read time**: 15 minutes

---

### CONTRIBUTING.md
**What you'll learn**: How to contribute
- Code of conduct
- Bug reporting
- Feature requests
- Pull request process
- Development setup
- Code style
- Commit conventions

**Read time**: 10 minutes

---

### IMPLEMENTATION_PLAN.md
**What you'll learn**: Detailed plan for upcoming features
- 7 major feature implementations:
  1. Offline-first PWA
  2. SOS/Panic button
  3. Task assignment system
  4. QR code peer discovery
  5. Check-in system
  6. Dark mode
  7. SQLite + Turso integration
- Database schema
- Code examples
- Implementation timeline
- Testing plan

**Read time**: 45 minutes

---

## 🔍 Quick Answers

### What is Mycelium?
A decentralized P2P platform for disaster response teams. See [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)

### How do I run it?
Use Docker: `docker-compose up`. See [QUICKSTART.md](../QUICKSTART.md)

### What technologies does it use?
React, WebRTC, Yjs CRDTs, Node.js. See [TECHNICAL_STACK.md](./TECHNICAL_STACK.md)

### How does P2P work?
WebRTC for direct connections, Yjs for state sync. See [HOW_IT_WORKS.md](./HOW_IT_WORKS.md)

### What features are planned?
PWA, offline support, SOS button, tasks. See [FEATURES.md](./FEATURES.md)

### Can I contribute?
Yes! See [CONTRIBUTING.md](../CONTRIBUTING.md)

### What's the architecture?
Hybrid P2P with CRDT synchronization. See [ARCHITECTURE.md](./ARCHITECTURE.md)

### Is there a mobile app?
Not yet, but React Native apps are planned. See [FEATURES.md](./FEATURES.md)

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/mycelium/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/mycelium/discussions)
- **Documentation Issues**: Report in Issues with `documentation` label

## 🔄 Keeping Documentation Updated

Documentation is a living resource. If you find:
- Outdated information
- Missing details
- Unclear explanations
- Broken links

Please:
1. Open an issue with the `documentation` label
2. Or submit a PR with fixes
3. Mention the specific document and section

## 📝 Documentation Standards

Our documentation follows these principles:
- **Clear**: Easy to understand for all skill levels
- **Comprehensive**: Covers all aspects thoroughly
- **Accurate**: Kept up-to-date with code changes
- **Organized**: Logical structure with clear navigation
- **Examples**: Real code examples where applicable

## 🗂️ Project Structure Reference

```
Mycelium/
├── client/                 # React web application
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── services/      # WebRTC & CRDT services
│   │   ├── store.ts       # State management
│   │   └── App.tsx        # Main app
│   └── Dockerfile
│
├── server/                # Node.js signaling server
│   ├── src/
│   │   └── index.ts      # Express + Socket.IO
│   └── Dockerfile
│
├── common/                # Shared types & utilities
│   └── src/
│       ├── types.ts      # TypeScript interfaces
│       └── utils.ts      # Utility functions
│
├── documentation/         # This documentation
│   ├── PROJECT_OVERVIEW.md
│   ├── HOW_IT_WORKS.md
│   ├── ARCHITECTURE.md
│   ├── FEATURES.md
│   ├── TECHNICAL_STACK.md
│   └── README.md (this file)
│
├── scripts/              # Automation scripts
├── docker-compose.yml    # Docker orchestration
├── Makefile             # Build automation
├── README.md            # Main project README
├── QUICKSTART.md        # Quick start guide
├── RUN.md               # Run guide
├── CONTRIBUTING.md      # Contributing guide
└── IMPLEMENTATION_PLAN.md  # Feature implementation plan
```

---

**Happy reading! If you have questions, open an issue or discussion on GitHub.**

*Last updated: 2024 - This documentation is maintained alongside the codebase.*
