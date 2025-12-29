<p align="center">
  <img src="app/assets/icons/logo-icon.svg" alt="Loom Logo" width="80" height="80">
</p>

<h1 align="center">🧵 Loom</h1>

<p align="center">
  <strong>The Headless Product Roadmap & Changelog Tool</strong>
</p>

<p align="center">
  <em>Transform threaded discussions into beautiful, interactive timelines with AI-powered insights.</em>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-demo">Demo</a> •
  <a href="#%EF%B8%8F-tech-stack">Tech Stack</a> •
  <a href="#-hackathon-tracks">Hackathon Tracks</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-architecture">Architecture</a>
</p>

---

## 🎯 What is Loom?

**Loom** is a modern, AI-enhanced product roadmap platform built on top of [Foru.ms](https://foru.ms) headless backend. It proves that the flexible `Users → Threads → Posts` data structure can power far more than traditional forums — it can run a full-featured SaaS product roadmap tool with team collaboration, AI triage, and real-time messaging.

Perfect for:
- 🚀 **Indie Makers** building in public
- 🏢 **Startups** aligning teams and stakeholders  
- 🌐 **Open-Source Projects** offering transparent contribution paths

---

## 🏆 Hackathon Tracks

Loom is a **multi-track submission** that demonstrates excellence across several hackathon categories:

### 🚀 Un-Forum (Primary Track)
> *"Prove that our data structure is flexible enough to run things that aren't forums."*

Loom transforms Foru.ms into a **complete SaaS product roadmap tool**:
- **Threads** → Roadmaps with metadata (status, visibility, links)
- **Posts** → Features with voting, comments, and AI analysis
- **Users** → Team members with role-based permissions (Owner, Editor, Viewer)
- **extendedData** → Rich structured data for features, teams, and AI insights

### ⚡ AI & Intelligence Track
> *"Our API data is incredibly easy to pipe into LLMs."*

Loom features **three AI-powered capabilities**:

1. **🤖 Loom AI Chat** — Context-aware assistant that knows your roadmaps
2. **🎯 AI Triage System** — Automatic analysis of roadmaps & features
3. **✨ Magic Expand** — One-click PRD generation for features

### 🎨 Bring Your Own Head Track
> *"Build the wildest, fastest, or most beautiful front-end."*

A **premium Next.js 16 frontend** with:
- Beautiful, responsive design system
- Smooth animations and micro-interactions
- Confetti celebrations for shipped features 🎉
- Dark/light theme support ready

### 🔌 Embedded Community Track  
> *"Forums rarely exist in a vacuum."*

Loom includes a **built-in messaging system**:
- Real-time direct messaging between users
- User profile discovery
- Notification sounds for new messages
- Seamless integration with the roadmap workflow

---

## ✨ Features

### 📍 Roadmap Management
| Feature | Description |
|---------|-------------|
| **Create & Manage Roadmaps** | Full CRUD with title, description, status (planned/in-progress/shipped) |
| **Public/Private Visibility** | Control who can see your roadmaps |
| **Project Links** | Attach GitHub, live demo, docs, and website URLs |
| **Progress Tracking** | Visual timeline view with status indicators |
| **Feature Voting** | Upvote/downvote features (one vote per user) |
| **Threaded Comments** | Discuss features directly in the roadmap |
| **Mass Feature Import** | Bulk add features via JSON |

### 👥 Team Collaboration
| Feature | Description |
|---------|-------------|
| **Role-Based Access** | Owner, Editor, and Viewer roles |
| **Team Invitations** | Search and invite users to collaborate |
| **Permission Management** | Update or remove team member access |
| **Activity Tracking** | See who created features and when |

### 🤖 AI-Powered Intelligence

#### Loom AI Chat
A context-aware AI assistant that:
- Knows all your roadmaps and features
- Helps prioritize what to build next
- Drafts changelogs for shipped features
- Finds duplicate feature requests
- Suggests new feature ideas

```
Example prompts:
→ "Summarize my roadmaps"
→ "What features should I build next?"
→ "Draft a changelog for shipped features"
→ "Find duplicate feature requests"
```

#### AI Triage System
Automatic analysis via webhook when roadmaps/features are created:
- **Sentiment Analysis** — Angry, Excited, or Neutral
- **Type Classification** — Bug, Feature, or Enhancement
- **Impact Score** — 1-10 value assessment
- **Effort Score** — 1-10 complexity estimate
- **Quick Win Detection** — High impact + low effort highlights

#### Magic Expand (PRD Generator)
One-click product requirement documents:
- User Stories with roles and benefits
- Acceptance Criteria checklists
- Edge Cases and considerations
- Developer-ready markdown output

### 📢 Community Features
| Feature | Description |
|---------|-------------|
| **Public Feed** | Discover roadmaps from the community |
| **User Profiles** | Public pages with bio, avatar, and social links |
| **Direct Messaging** | Real-time chat with other users |
| **User Search** | Find and connect with team members |
| **Follow System** | Track roadmaps you're interested in |

### ⚙️ Settings & Privacy
| Feature | Description |
|---------|-------------|
| **Profile Customization** | Avatar upload, bio, display name |
| **Social Links** | GitHub, LinkedIn, Twitter, and more |
| **Password Management** | Secure password change flow |
| **Data Export** | Download all your data as JSON |
| **Account Deletion** | Full GDPR-compliant data removal |

---

## 🎬 Demo

### Dashboard Overview
The main dashboard shows your roadmaps at a glance with key statistics:
- Total roadmaps count
- Active features across all roadmaps
- Team members involved

### Roadmap Detail View
Each roadmap features:
- **Interactive Timeline** — Visual feature progression
- **Feature Cards** — Status badges, votes, comments
- **Team Panel** — Manage collaborators
- **AI Analysis** — Triage insights when available
- **Quick Actions** — Edit, publish, delete

### PM Dashboard
A specialized view for product managers:
- **Triage Cards** — AI-analyzed items needing attention
- **Quick Wins** — High impact, low effort features highlighted
- **Sentiment Overview** — Understand user feedback tone

### Loom AI
Full-screen chat interface:
- Streaming responses for natural conversation
- Context-aware suggestions based on your data
- Quick prompt buttons for common actions

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router |
| **React 19** | UI library with latest features |
| **TypeScript 5** | Type-safe development |
| **Tailwind CSS 4** | Utility-first styling |
| **Hugeicons** | Premium icon library |
| **Sonner** | Toast notifications |
| **Canvas Confetti** | Celebration animations |

### Backend & APIs
| Technology | Purpose |
|------------|---------|
| **Foru.ms API** | Headless forum backend for data storage |
| **Next.js API Routes** | Serverless API endpoints |
| **OpenAI / Azure OpenAI** | AI chat and analysis |
| **Vercel AI SDK** | Streaming chat responses |
| **Cloudinary** | Avatar storage + JSON data persistence |

### Data Architecture
| Foru.ms Entity | Loom Usage |
|----------------|------------|
| **Thread** | Roadmap container |
| **Post** | Feature within a roadmap |
| **User** | Account with profile data |
| **extendedData** | Rich metadata for all entities |
| **Thread Tags** | Public feed discovery |

---

## 🏗️ Architecture

### Data Model

```
┌─────────────────────────────────────────────────────────────┐
│                        CLOUDINARY                           │
│  ┌──────────────────┐    ┌──────────────────┐               │
│  │ user-threads.json│    │ feed-index.json  │               │
│  │ (userId→indexId) │    │ (published IDs)  │               │
│  └──────────────────┘    └──────────────────┘               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        FORU.MS API                          │
│                                                             │
│  ┌───────────────┐                                          │
│  │  Index Thread │ ← Per-user roadmap reference list        │
│  │  (loom-index) │                                          │
│  └───────────────┘                                          │
│          │                                                  │
│          ▼                                                  │
│  ┌───────────────┐                                          │
│  │ Roadmap Thread│                                          │
│  │ (type=roadmap)│                                          │
│  │               │                                          │
│  │ extendedData: │                                          │
│  │ - status      │                                          │
│  │ - visibility  │                                          │
│  │ - team[]      │                                          │
│  │ - features[]  │                                          │
│  │ - aiAnalysis  │                                          │
│  │ - links       │                                          │
│  └───────────────┘                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Create new account |
| `/api/auth/login` | POST | Authenticate user |
| `/api/auth/logout` | POST | Clear session |
| `/api/auth/me` | GET | Get current user |
| `/api/roadmaps` | GET/POST | List/Create roadmaps |
| `/api/roadmaps/[id]` | GET/PUT/DELETE | Manage single roadmap |
| `/api/roadmaps/[id]/features` | GET/POST | List/Create features |
| `/api/roadmaps/[id]/features/[featureId]` | PUT/DELETE | Manage feature |
| `/api/roadmaps/[id]/features/[featureId]/vote` | POST | Upvote feature |
| `/api/roadmaps/[id]/features/[featureId]/comments` | GET/POST | Feature comments |
| `/api/roadmaps/[id]/team` | GET/POST/DELETE | Team management |
| `/api/feed` | GET | Public roadmap feed |
| `/api/chat` | POST | AI chat with context |
| `/api/ai/expand` | POST | Generate PRD |
| `/api/webhooks/triage` | POST | AI analysis webhook |
| `/api/messages` | GET/POST | Direct messaging |
| `/api/user/search` | GET | Find users |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Foru.ms API account ([Get one here](https://foru.ms))
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- Cloudinary account (free tier works)

### Environment Variables

Create a `.env` file:

```env
# Foru.ms Configuration
FORUMS_API_KEY=your_forums_api_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_BASE_URL=https://api.openai.com/v1  # or Azure endpoint
OPENAI_MODEL=gpt-4o

# Cloudinary Configuration
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# Session Secret
SESSION_SECRET=your_random_secret_key
```

### Installation

```bash
# Clone the repository
git clone https://github.com/zaikaman/Loom.git
cd Loom

# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

---

## 📁 Project Structure

```
Loom/
├── app/
│   ├── (dashboard)/           # Authenticated routes
│   │   ├── ai/                # Loom AI chat page
│   │   ├── chat/              # Direct messaging
│   │   ├── dashboard/         # Main dashboard
│   │   ├── feed/              # Public discovery feed
│   │   ├── pm-dashboard/      # PM triage view
│   │   ├── profile/           # User profile editor
│   │   ├── roadmaps/          # Roadmap pages
│   │   ├── settings/          # Account settings
│   │   └── u/[username]/      # Public profiles
│   ├── api/                   # API routes
│   │   ├── ai/                # AI endpoints
│   │   ├── auth/              # Authentication
│   │   ├── chat/              # Chat API
│   │   ├── feed/              # Feed API
│   │   ├── messages/          # Messaging API
│   │   ├── roadmaps/          # Roadmap CRUD
│   │   ├── user/              # User management
│   │   └── webhooks/          # AI triage webhook
│   ├── assets/                # Images and icons
│   ├── components/            # Landing page components
│   ├── login/                 # Login page
│   └── register/              # Register page
├── components/                # Shared components
│   ├── ui/                    # Base UI components
│   └── pm-dashboard/          # PM-specific components
├── lib/                       # Utilities
│   ├── ai.ts                  # AI analysis functions
│   ├── cloudinary.ts          # Cloudinary helpers
│   ├── forums.ts              # Foru.ms API client
│   ├── roadmaps.ts            # Roadmap utilities
│   ├── session.ts             # Session management
│   ├── types.ts               # TypeScript types
│   └── utils.ts               # General utilities
└── public/                    # Static assets
```

---

## 🎨 Design System

### Colors
| Name | Hex | Usage |
|------|-----|-------|
| Primary | `#191a23` | Headers, buttons |
| Green | `#b9ff66` | Accents, success states |
| Slate | `#64748b` | Secondary text |
| Background | `#ffffff` | Page background |

### Status Badges
| Status | Color | Meaning |
|--------|-------|---------|
| 🔵 Planned | Blue | Feature is on the roadmap |
| 🟡 In Progress | Yellow | Currently being developed |
| 🟢 Shipped | Green | Released to users |

### AI Triage Colors
| Score | Color | Meaning |
|-------|-------|---------|
| Impact ≥ 8 | Green | High value feature |
| Effort ≤ 3 | Green | Quick to implement |
| Effort ≥ 8 | Red | Complex undertaking |
| Quick Win | Green badge | Impact ≥7 + Effort ≤5 |

---

## 🔒 Security

- **HTTP-only cookies** for session management
- **Role-based access control** for roadmaps
- **Input validation** on all API endpoints
- **Rate limiting ready** (configurable via middleware)
- **GDPR compliant** data export and deletion

---

## 📊 Judging Criteria Alignment

### Technical Excellence (40%)
- ✅ **Next.js 16 with App Router** — Latest framework features
- ✅ **Full TypeScript** — Type-safe across the codebase
- ✅ **Clean API design** — RESTful, consistent patterns
- ✅ **Foru.ms Integration** — Deep use of extendedData, threads, posts
- ✅ **AI/ML Integration** — OpenAI with streaming responses
- ✅ **Real-time features** — Polling-based message updates

### Real-World Impact (20%)
- ✅ **Solves a real problem** — Product roadmap management
- ✅ **Production-ready UI** — Professional, polished design
- ✅ **Team collaboration** — Multi-user support built-in
- ✅ **AI-powered prioritization** — Helps PMs make decisions
- ✅ **Data portability** — Export all data as JSON

### Innovation & Originality (30%)
- ✅ **Un-Forum concept** — Proves Foru.ms can be a SaaS backend
- ✅ **AI Triage system** — Novel approach to feature analysis
- ✅ **Magic Expand** — One-click PRD generation
- ✅ **Multi-track submission** — Demonstrates versatility
- ✅ **Premium design** — "Wow factor" aesthetic

### Project Write-up (10%)
- ✅ **Clear problem/solution** — Documented above
- ✅ **Tech stack detailed** — Full breakdown provided
- ✅ **Architecture diagrams** — Data model visualized
- ✅ **Screenshots ready** — Demo section available
- ✅ **Setup instructions** — Complete getting started guide

---

## 👨‍💻 Author

Built with ❤️ by zaikaman for the **Foru.ms + v0 by Vercel Hackathon**

---

## 📄 License

MIT License — feel free to use this as a starter for your own projects!

---

<p align="center">
  <strong>🧵 Loom — Where Threads Become Timelines</strong>
</p>
