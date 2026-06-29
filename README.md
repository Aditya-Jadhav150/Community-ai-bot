# Community Hero AI 🦸‍♂️🦸‍♀️

Community Hero AI is an intelligent, Agentic AI-powered civic engagement platform designed to modernize local infrastructure management. By allowing citizens to simply snap a photo of a hyperlocal issue (like a pothole, water leak, or broken streetlight), the platform leverages the multimodal capabilities of **Google Gemini AI** to autonomously classify the problem, estimate its severity, extract contextual descriptions, and route it to the appropriate municipal department.

## 🌟 Key Features
- **AI-Powered Image Analysis:** Powered by Gemini 2.5 Flash, the app automatically extracts issue type and severity from photos.
- **Autonomous Routing:** Intelligently determines the correct municipal department responsible for the fix.
- **Live Interactive Map:** A dynamic, hyperlocal Google Map displaying issue clustering and real-time community heatmaps.
- **Community Validation:** Citizens can upvote and verify existing reports to crowd-source validation and eliminate duplicate tickets.
- **Predictive AI Insights:** Identifies recurring issue hotspots to enable proactive, preventative maintenance.
- **Citizen Gamification:** Users earn XP and community ranks for reporting and validating issues.
- **Dedicated Dashboards:** Real-time tracking for citizens, and prioritized incident lifecycle management for municipal admins.

## 🛠️ Technology Stack
- **Frontend:** Next.js (App Router), React, Tailwind CSS, shadcn/ui
- **AI Integration:** Google Gemini 2.5 Flash API
- **Mapping:** Google Maps Platform
- **Deployment & Infrastructure:** Docker, Google Cloud Run, Google Artifact Registry

## 🚀 Getting Started Locally

First, clone the repository and install the dependencies:
```bash
git clone https://github.com/Aditya-Jadhav150/Community-ai-bot.git
cd Community-ai-bot
npm install
```

Next, create a `.env` file in the root directory and add your API keys:
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your_google_maps_api_key_here"
GEMINI_API_KEY="your_gemini_api_key_here"
```

Finally, run the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## ☁️ Deployment (Google Cloud Run)
This repository is optimized for deployment to **Google Cloud Run** using Next.js Standalone mode.

To deploy to your GCP project, run the provided deployment script:
```bash
# Windows PowerShell
.\deploy.ps1
```
*Note: Make sure you have the Google Cloud SDK (`gcloud`) installed and configured before deploying.*
