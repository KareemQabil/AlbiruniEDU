# البيروني - Al-Biruni EDU

<div align="center">

**منصة تعليمية ذكية بالذكاء الاصطناعي**

**AI-Powered Educational Platform for Arabic Speakers**

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)

</div>

---

## 🌟 Overview

Al-Biruni is a revolutionary multi-agent educational AI platform designed specifically for the 400+ million Arabic speakers worldwide. Named after the legendary polymath Abu Rayhan al-Biruni (973-1048 CE), the platform combines cutting-edge AI technology with deep cultural understanding to deliver personalized, engaging, and effective learning experiences.

### Key Features

- 🤖 **18 Specialized AI Agents** - From visualization to Socratic guidance
- 🌍 **Arabic-First Design** - Native RTL support with dialect detection
- 🎨 **Premium Workspace UI** - Glass morphism with Quantum Academy theme
- 📊 **Interactive Visualizations** - Math, physics, chemistry simulations
- 🔄 **Spaced Repetition** - FSRS algorithm for optimal retention
- 🎯 **Adaptive Learning** - Bayesian Knowledge Tracing
- 💬 **Multimodal Input** - Text, voice, images, and handwriting
- 📱 **Offline-First PWA** - Works without internet

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ and npm 10+
- Git
- Supabase account (free tier works)
- Google Gemini API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/KareemQabil/AlbiruniEDU.git
cd AlbiruniEDU
```

2. **Install dependencies**
```bash
npm install --legacy-peer-deps
```

3. **Setup environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your credentials:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Google Gemini
GEMINI_API_KEY=your-gemini-api-key
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📚 Documentation

- **[CLAUDE.md](./CLAUDE.md)** - Complete development guide
- **[IMPLEMENTATION_PLAN.md](./docs/IMPLEMENTATION_PLAN.md)** - 5-phase roadmap

---

## 🎨 Design System

### Quantum Academy Theme

**Colors:**
- **Primary (Quantum Gold):** `#f59e0b`
- **Secondary (Cyber Cyan):** `#06b6d4`
- **Void Black:** `#0a0a0a`
- **Pure White:** `#fafafa`

**Typography:**
- **Body:** IBM Plex Sans Arabic (16px+, line-height 1.8)
- **Headings:** Almarai (bold weights)

**Glass Morphism:**
```css
background: rgba(255, 255, 255, 0.05);
backdrop-filter: blur(20px) saturate(180%);
border: 1px solid rgba(255, 255, 255, 0.1);
```

---

## 🗺️ Roadmap

### Phase 1: Foundation (Weeks 1-2) ✅ COMPLETED
- [x] Next.js setup with TypeScript
- [x] Design system (Quantum Academy theme)
- [x] Arabic fonts (IBM Plex + Almarai)
- [x] RTL support
- [x] Landing page
- [x] Glass morphism utilities

### Phase 2: Core Agents (Weeks 3-6) 🔄 NEXT
- [ ] Supabase integration
- [ ] Gemini API wrapper
- [ ] Maestro orchestration agent
- [ ] First 3 agents (Visualizer, Socratic, Problem Decomposer)

### Phase 3: Workspace UI (Weeks 7-10)
- [ ] Workspace layout
- [ ] Chat interface
- [ ] Interactive visualizations
- [ ] Progress tracking

### Phase 4: Advanced Agents (Weeks 11-14)
- [ ] Learning Science agents
- [ ] Dialect detection
- [ ] Support agents
- [ ] Multimodal features

### Phase 5: Polish & Launch (Weeks 15-16)
- [ ] Testing
- [ ] Optimization
- [ ] Documentation
- [ ] Deployment

---

## 🤝 Contributing

We welcome contributions! Areas we need help:
- Arabic content creation
- Dialect-specific examples
- Accessibility improvements
- Performance optimization
- Documentation (Arabic/English)

---

## 📄 License

MIT License

---

## 🙏 Acknowledgments

**Named After:** Abu Rayhan al-Biruni (973-1048 CE) - Persian polymath who pioneered the scientific method during the Islamic Golden Age.

**Built With:**
- Google Gemini 2.5
- Next.js 15
- Vercel
- Supabase
- IBM Plex Sans Arabic + Almarai

---

<div align="center">

**Built with ❤️ for the Arabic-speaking world**

**صُنع بـ ❤️ للعالم الناطق بالعربية**

</div>
