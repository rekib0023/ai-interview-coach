# AI Interview Coach

> 🚀 Day 1/100 of Building in Public - An AI-powered technical interview preparation platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Twitter Follow](https://img.shields.io/twitter/follow/YourHandle?style=social)](https://twitter.com/YourHandle)

## 🎯 Project Overview

An intelligent interview preparation platform that adapts to your skill level and provides real-time feedback. Built with modern AI to help developers ace technical interviews.

**Live Demo:** [Coming Soon]  
**Build Progress:** Follow my [100 Days journey](https://twitter.com/rekib0023)

## ✨ Features (Building in Public)

- [x] Day 1: AI-powered interview question generation
- [ ] Day 1: Basic chat interface
- [ ] Day 2: Multi-turn conversation with context
- [ ] Day 3: Socratic questioning mode
- [ ] Day 4: Code execution sandbox
- [ ] Day 5: Conversation memory system
- [ ] Week 2: System design mode
- [ ] Week 2: Real-time code feedback
- [ ] Week 2: Performance analytics

See [ROADMAP.md](./ROADMAP.md) for full feature timeline.

## 🛠️ Tech Stack

**Frontend**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components

**Backend**
- FastAPI
- Python 3.11+
- LangChain
- PostgreSQL
- Redis

**AI/ML**
- OpenAI GPT-4
- LanceDB (Vector Database)
- Text Embeddings

**Infrastructure**
- Docker & Docker Compose
- AWS (planned)
- GitHub Actions CI/CD

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- OpenAI API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/rekib0023/ai-interview-coach.git
cd ai-interview-coach
```

2. **Set up environment variables**
```bash
# Copy example env files
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env

# Add your OpenAI API key to backend/.env
OPENAI_API_KEY=your_key_here
```

3. **Start with Docker Compose**
```bash
docker-compose up -d
```

4. **Or run locally**

Frontend:
```bash
cd frontend
npm install
npm run dev
```

Backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Visit `http://localhost:3000` to see the app!

## 📁 Project Structure

```
ai-interview-coach/
├── frontend/                 # Next.js frontend
│   ├── app/
│   │   ├── (auth)/          # Authentication pages
│   │   ├── (dashboard)/     # Main app pages
│   │   └── api/             # API routes
│   ├── components/          # React components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── chat/            # Chat interface
│   │   └── editor/          # Code editor
│   └── lib/                 # Utilities
│
├── backend/                  # FastAPI backend
│   ├── app/
│   │   ├── api/             # API endpoints
│   │   │   ├── chat.py
│   │   │   ├── interview.py
│   │   │   └── analytics.py
│   │   ├── core/            # Core functionality
│   │   │   ├── ai/          # AI/LLM integration
│   │   │   ├── security.py
│   │   │   └── config.py
│   │   ├── models/          # Database models
│   │   ├── services/        # Business logic
│   │   └── main.py
│   ├── tests/
│   └── requirements.txt
│
├── docker/                   # Docker configurations
│   ├── frontend.Dockerfile
│   ├── backend.Dockerfile
│   └── nginx.conf
│
├── docs/                     # Documentation
│   ├── architecture.md
│   ├── api.md
│   └── daily-logs/          # Daily build logs
│       ├── day-01.md
│       └── day-02.md
│
└── docker-compose.yml
```

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

## 📊 Build Metrics

Current stats (Day 1):
- Lines of Code: ~500
- API Response Time: ~2s
- Test Coverage: 0% (starting tomorrow!)
- Commits: 5

## 🤝 Contributing

This is a learning project built in public! Contributions, issues, and feature requests are welcome.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## 📝 Daily Build Logs

I'm documenting everything I build, every decision I make, and every bug I encounter:

- [Day 1: Initial Setup & GPT-4 Integration](./docs/daily-logs/day-01.md)
- [Day 2: Architecture & Memory System](./docs/daily-logs/day-02.md)
- [More coming...](./docs/daily-logs/)

## 🗺️ Roadmap

### Phase 1: Foundation (Days 1-7)
- [x] Basic chat interface
- [x] AI question generation
- [ ] Conversation memory
- [ ] Code execution sandbox

### Phase 2: Core Features (Days 8-14)
- [ ] System design mode
- [ ] Real-time feedback
- [ ] Performance analytics
- [ ] Voice interviews

### Phase 3: Advanced (Days 15-21)
- [ ] Behavioral interviews
- [ ] Adaptive difficulty
- [ ] Company-specific modes
- [ ] Interview replay

### Phase 4: Polish (Days 22-30)
- [ ] UI/UX refinement
- [ ] Performance optimization
- [ ] Documentation
- [ ] Public launch

See [ROADMAP.md](./ROADMAP.md) for detailed timeline.

## 💡 Technical Decisions

Key architectural choices explained:

**Why FastAPI over Django?**
- Async support for real-time features
- Better performance for AI workloads
- Modern, clean API design

**Why LangChain?**
- Simplifies LLM integration
- Built-in memory management
- Easy to swap AI providers

**Why LanceDB over Pinecone?**
- Local-first development
- No vendor lock-in
- Cost-effective for MVP

See [docs/architecture.md](./docs/architecture.md) for more.

## 📈 Performance Goals

Target metrics by Day 30:
- API Response Time: < 500ms
- AI Accuracy: > 85%
- User Satisfaction: > 4/5
- Monthly API Cost: < $100

## 🐛 Known Issues

Track issues and bugs [here](https://github.com/rekib0023/ai-interview-coach/issues).

Current bugs:
- AI sometimes repeats questions (Day 1)
- No error handling for API failures (Day 1)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built during my #100DaysOfBuilding challenge
- Inspired by the #BuildInPublic community
- Using OpenAI's incredible GPT-4 API

## 📬 Contact

Rekib Ahmed - [@rekib0023](https://twitter.com/rekib0023) - rkb.ra0025@gmail.com

Project Link: [https://github.com/rekib0023/ai-interview-coach](https://github.com/rekib0023/ai-interview-coach)

---

**⭐ If you find this project interesting, give it a star!**

Built with ❤️ during #100DaysOfBuilding | [Follow the journey](https://twitter.com/YourHandle)
