# 🚀 AI Interview Coach — 100 Days Build in Public

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green?style=for-the-badge&logo=fastapi)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT4-purple?style=for-the-badge&logo=openai)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?style=for-the-badge&logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-24-blue?style=for-the-badge&logo=docker)
![BuildInPublic](https://img.shields.io/badge/Build-In_Public-orange?style=for-the-badge)

**An AI-powered technical interview coach that adapts to your weaknesses in real-time**

[![Twitter Follow](https://img.shields.io/twitter/follow/rekib0023?style=social)](https://twitter.com/rekib0023)
[![GitHub Stars](https://img.shields.io/github/stars/rekib0023/ai-interview-coach?style=social)](https://github.com/rekib0023/ai-interview-coach)

</div>

---

## 📖 Table of Contents

- [🎯 What is this?](#-what-is-this)
- [🛠 Tech Stack](#-tech-stack)
- [📁 What's in this repo (so far)](#-whats-in-this-repo-so-far)
  <!-- [📸 Daily Progress Gallery](#-daily-progress-gallery) -->
  <!-- [🎯 Goals & Vision (MVP → Beyond)](#-goals--vision-mvp--beyond) -->
- [🚀 Getting Started (Local Setup)](#-getting-started-local-setup)
- [⚡ How to Use / Run](#-how-to-use--run)
- [🤝 How to Contribute](#-how-to-contribute)
- [📝 License](#-license)
- [📞 Contact / Feedback](#-contact--feedback)
  <!-- [📊 Daily Updates Archive](#-daily-updates-archive) -->

---

## 🎯 What is this?

I'm building an "AI Interview Coach" to address the limitations common in typical interview preparation: static problem sets, lack of adaptive difficulty, and absence of personalized feedback.
This tool will let users take mock coding interviews — with AI-generated questions — and receive real-time feedback on their code, track performance over time, and identify weak areas automatically.

I'm building this **in public** to share the full journey: from "first commit" to shipping a usable platform — flaws, challenges, learnings and all.

---

## 🛠 Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Monaco Editor (VS Code in browser)

**Backend:**
- FastAPI (Python)
- SQLAlchemy (ORM)
- Pydantic (Validation)
- Alembic (Migrations)

**AI/ML:**
- OpenAI GPT-4
- LangChain
- Sentence Transformers
- LanceDB (Vector storage)

**Infrastructure:**
- PostgreSQL
- Redis
- Docker & Docker Compose
- GitHub Actions (CI/CD)

---

## 📁 What's in this repo (so far)

```
ai-interview-coach/
├── frontend/          # Next.js application
├── backend/           # FastAPI application
├── docker-compose.yml # Local development setup
├── screenshots/       # Daily progress screenshots
└── README.md          # You're here!
```

**Current Status (Day 1):**
- ✅ Next.js scaffold created
- ✅ FastAPI backend initialized
- ✅ Docker Compose with PostgreSQL & Redis
- ✅ Basic "Hello World" running on both ends
- ✅ Project structure ready for feature development

---
<!--
## 📸 Daily Progress Gallery

### Week 1 (Days 1-7)
<div align="center">

| Day 1: Project Setup | Day 2: Coming Soon | Day 3: Coming Soon | Day 4: Coming Soon |
|----------------------|---------------------|---------------------|---------------------|
| <img src="screenshots/days/1.png" width="180" alt="Day 1 Screenshot"> | <img src="screenshots/placeholder.png" width="180" alt="Coming Soon"> | <img src="screenshots/placeholder.png" width="180" alt="Coming Soon"> | <img src="screenshots/placeholder.png" width="180" alt="Coming Soon"> |

*Updated daily at 6 PM EST. Follow [@rekib0023](https://twitter.com/rekib0023) for real-time updates.*

</div>

---

## 🎯 Goals & Vision (MVP → Beyond)

| **Phase** | **What to Ship** | **Timeline** |
|-----------|------------------|--------------|
| **Week 1: Foundation** | Basic interview flow: generate question → run code → get AI feedback | Days 1-7 |
| **Week 2: Core Features** | Conversation history, performance analytics, adaptive difficulty | Days 8-14 |
| **Week 3: Advanced** | Multi-language support, system design mode, behavioral interviews | Days 15-21 |
| **Week 4: Polish & Launch** | Testing, optimization, documentation, public launch | Days 22-30 |
| **Beyond MVP** | Voice interviews, company-specific modes, mobile app, community features | Days 31-100 |

---
-->
## 🚀 Getting Started (Local Setup)

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- Git

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/rekib0023/ai-interview-coach.git
cd ai-interview-coach

# 2. Start all services
docker-compose up -d

# 3. Set up frontend
cd frontend
npm install
npm run dev

# 4. Set up backend
cd ../backend
python -m venv venv
# On Mac/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

pip install -r requirements.txt
uvicorn main:app --reload
```

### Access Points
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

---

## ⚡ How to Use / Run

### Development Commands

```bash
# Frontend development
cd frontend
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # Code linting

# Backend development
cd backend
source venv/bin/activate
uvicorn main:app --reload  # Auto-reload on changes

# Docker management
docker-compose up -d       # Start all services
docker-compose down        # Stop all services
docker-compose logs -f     # View logs
```

### Environment Variables

Create `.env` files:

**Backend (backend/.env):**
```env
OPENAI_API_KEY=your_key_here
DATABASE_URL=postgresql://admin:secret@localhost:5432/interview_db
REDIS_URL=redis://localhost:6379
```

**Frontend (frontend/.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🤝 How to Contribute

I'm building this in public and welcome contributions! Here's how you can help:

### Ways to Contribute
1. **Bug Reports** - Found an issue? Open a GitHub Issue
2. **Feature Suggestions** - What would make this better for you?
3. **Code Improvements** - See something that could be optimized?
4. **Documentation** - Found something unclear? Fix it!

### Contribution Workflow
```bash
# 1. Fork the repository
# 2. Clone your fork
git clone https://github.com/rekib0023/ai-interview-coach.git

# 3. Create a feature branch
git checkout -b feature/amazing-feature

# 4. Make your changes
# 5. Commit with descriptive message
git commit -m "Add amazing feature"

# 6. Push to your fork
git push origin feature/amazing-feature

# 7. Open a Pull Request
```

### Before Contributing
- Follow existing code style/structure
- Add tests for new features (if applicable)
- Update documentation as needed
- Keep PRs focused on one change

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 📞 Contact / Feedback

**Follow the journey:**
- 🐦 **Twitter**: [@rekib0023](https://twitter.com/rekib0023) - Daily updates
- 💼 **LinkedIn**: [Rekib Ahmed](https://linkedin.com/in/rekib0023) - Weekly deep-dives
- 📧 **Email**: rkb.ra0025@gmail.com - Direct feedback

**Want to test or give feedback?**
- Join as a beta tester (starting Day 28)
- Share feature suggestions
- Report bugs
- Just chat about the project!
<!--
---

## 📊 Daily Updates Archive

### Day 1 (November 4, 2024)
**What I built:** Project setup & initial infrastructure
**Key Learning:** Docker networking for multi-service apps
**Screenshot:** [View](screenshots/days/1.png)
**Tomorrow:** OpenAI integration & first AI-generated question

### Day 2 (Coming Tomorrow)
**Planned:** OpenAI API integration, first AI interviewer prompt

---

<div align="center">

### ⭐ **Star this repo to follow the 100-day journey!**

**"The best way to learn is to build in public"**
Built with ❤️ during 100 days of #BuildInPublic

</div>

---

## 📈 Live Progress Tracker

| Day | Status | Feature | Screenshot |
|-----|--------|---------|------------|
| 1 | ✅ **Complete** | Project foundation | [View](screenshots/days/1.png) |
| 2 | 🔄 **In Progress** | OpenAI integration | Coming tomorrow |
| 3 | 📅 **Planned** | Chat UI polish | Coming soon |
| 4 | 📅 **Planned** | Code execution sandbox | Coming soon |

---

**Last Updated:** November 4, 2024
**Next Update:** Daily at 6 PM EST

---

## 🔄 Quick Links
- [View Project Board](https://github.com/users/rekib0023/projects/1)
- [Join Discord Community](https://discord.gg/your-link)
- [Watch Demo Video](https://youtube.com/your-link)
- [Read Blog Updates](https://your-blog.com)

-->
