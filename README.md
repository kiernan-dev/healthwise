# HealthWise

A React-based natural health assistant that helps users track symptoms, discover natural remedies, and gain insights into their wellness journey. Features an AI-powered chat interface, comprehensive symptom tracking, and personalized health insights.

## Features

### 🤖 AI-Powered Chat Interface

- **Smart Conversations**: Describe symptoms in natural language
- **Streaming Responses**: Real-time AI responses with OpenRouter integration
- **Contextual Awareness**: Considers your symptom history for personalized recommendations
- **Markdown Support**: Rich formatting including tables, lists, and emphasis
- **File Upload**: Analyze images and documents for health insights

### 📊 Symptom Tracking

- **Easy Logging**: Quick symptom entry with severity ratings (1-10)
- **Trigger Identification**: Track potential triggers and patterns
- **Historical Data**: Persistent storage in browser localStorage
- **Pattern Analysis**: AI analyzes your symptom history for insights
- **Export Capability**: Generate summaries for healthcare providers

### 📈 Health Insights & Analytics

- **Visual Trends**: Charts and graphs of symptom patterns
- **Pattern Recognition**: Identify correlations and triggers
- **Progress Monitoring**: Track improvement over time
- **Personalized Reports**: AI-generated health insights

### 🌿 Natural Remedies Database

- **Evidence-Based**: Scientifically-backed natural treatments
- **Safety Information**: Detailed precautions and contraindications
- **Usage Guidelines**: Proper dosing and administration instructions
- **Effectiveness Ratings**: Evidence levels for each recommendation
- **Interactive Cards**: Expandable remedy information

### 🚨 Safety Features

- **Emergency Detection**: Recognizes serious symptoms requiring immediate care
- **Medical Disclaimers**: Clear guidance on when to seek professional help
- **Safety Alerts**: Warnings for potentially dangerous symptoms
- **Professional Care Emphasis**: Encourages appropriate medical consultation

## Technology Stack

### Frontend Framework

- **React 18** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **React Router v7** for client-side routing

### UI & Styling

- **shadcn/ui** component library with Radix UI primitives
- **Tailwind CSS** for utility-first styling
- **Lucide React** for consistent iconography
- **Responsive Design** optimized for mobile and desktop

### State Management & Data

- **TanStack Query** for server state management
- **React Hooks** for local component state
- **localStorage** for persistent data storage
- **Zod** schemas for data validation

### AI Integration

- **OpenRouter API** for AI chat completions
- **Streaming Support** for real-time responses
- **Multiple Models** support (GPT-4o, GPT-OSS-120B)
- **Vision Capabilities** for image analysis

## Project Structure

```text
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui base components
│   ├── ChatInterface.tsx    # Main chat container
│   ├── ChatTab.tsx         # Chat functionality
│   ├── TrackerTab.tsx      # Symptom tracking
│   └── InsightsTab.tsx     # Health analytics
├── pages/              # Route components
│   ├── Index.tsx       # Main application page
│   └── NotFound.tsx    # 404 error page
├── services/           # Business logic
│   ├── nlpService.ts       # Natural language processing
│   ├── remedyService.ts    # Remedy recommendations
│   ├── responseService.ts  # AI response generation
│   ├── openRouterService.ts # AI API integration
│   └── *StorageService.ts   # Data persistence
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
└── utils/              # Helper utilities
```

## Development Setup

### Prerequisites

- **Node.js** 18+
- **pnpm** package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd HealthWise
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Environment Configuration**

   ```bash
   cp .env.example .env
   ```

   Configure environment variables:

   ```env
   # Required for AI functionality
   VITE_OPENROUTER_API_KEY=your_openrouter_api_key
   
   # Optional: Enable AI-only mode (disables mock responses)
   VITE_AI_ONLY_MODE=false
   ```

4. **Start development server**

   ```bash
   pnpm dev
   ```

   Application will be available at `http://localhost:8080`

### Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm build:dev    # Build in development mode
pnpm preview      # Preview production build
pnpm lint         # Run ESLint code quality checks
```

## Configuration

### AI Setup (Optional but Recommended)

1. **Get an OpenRouter API key** at [openrouter.ai](https://openrouter.ai)
2. **Add to environment**: Set `VITE_OPENROUTER_API_KEY` in your `.env` file
3. **Connection Status**: The app shows real-time connection status with validation

Without an API key, the app runs in **Mock Mode** with pre-built natural remedy responses.

### Deployment

The app is configured for deployment to GitHub Pages:

- **Base path**: `/healthwise` (configured in `vite.config.ts`)
- **Static deployment**: Fully client-side, no server required
- **Build output**: `dist/` directory contains deployable files

## Mobile Optimization

HealthWise is fully optimized for mobile devices:

- **Responsive Design**: Adapts to all screen sizes
- **Touch-Friendly**: Large tap targets and gesture support
- **Collapsed Sidebar**: Automatic mobile layout with icon-only navigation
- **Viewport Optimization**: Proper handling of mobile browsers and iOS Safari
- **Performance**: Optimized loading and rendering for mobile networks

## Data Privacy

- **Local Storage**: All data stored in browser localStorage
- **No Cloud Sync**: Personal health data never leaves your device
- **Privacy First**: No user accounts or data collection
- **Export Control**: You own and control all your health data

## Safety & Disclaimers

⚠️ **Important Medical Disclaimer**

This application is for **educational purposes only** and should not replace professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare providers for:

- Serious or persistent symptoms
- Before starting new treatments
- Medical emergencies
- Chronic health conditions

The app includes built-in safety features but cannot replace professional medical judgment.
