# SocialOps - Project Documentation

SocialOps is a comprehensive social media management platform designed to help individuals and teams plan, create, publish, and measure content across multiple social platforms (like Instagram, Twitter, and LinkedIn) from a single unified workspace.

## Tech Stack Overview

- **Frontend:** React 19 built with Vite, utilizing TypeScript (`Tsx`), TailwindCSS for styling, Framer Motion for smooth animations, and Lucide React for iconography.
- **Backend:** Node.js, Express, and MongoDB (with Mongoose) for the RESTful API and datastore.
- **AI Integrations:** Google Generative AI is securely integrated from the backend to deliver automated "Smart Insights" suggestions for the user.

---

## Complete Project Structure

Here is the exact layout of the codebase to help you navigate:

```text
C:.
├── backend/                      # Node.js + Express Backend Engine
│   ├── controllers/              # Core business logic processing incoming requests
│   │   ├── analyticsController.js # Handles analytics/insights data fetching
│   │   ├── authController.js      # User registration and login flow logic
│   │   ├── dashboardController.js # Serves aggregated stats for the home dashboard
│   │   ├── integrationsController.js# Manages connection with 3rd-party social accounts
│   │   ├── postController.js      # Handles creating, saving (drafts), and publishing posts
│   │   └── schedulerController.js # Evaluates and serves users' content scheduling queues
│   ├── middleware/               
│   │   └── authMiddleware.js      # Validates JSON Web Tokens (JWT) for protected routes
│   ├── models/                   # Mongoose Database Schemas
│   │   ├── AnalyticsData.js
│   │   ├── ConnectedAccount.js
│   │   ├── DashboardStats.js
│   │   ├── Post.js
│   │   └── User.js
│   ├── routes/                   # Maps API URL endpoints to the relevant controllers
│   │   ├── analytics.js
│   │   ├── authRoutes.js
│   │   ├── dashboard.js
│   │   ├── integrations.js
│   │   ├── posts.js
│   │   └── scheduler.js
│   ├── services/                 # External service wrappers
│   │   └── geminiService.js       # Wrapper to securely communicate with Google Gemini API 
│   ├── uploads/                  # Static file storage for user media uploads (images/videos)
│   ├── seed.js                   # Script to populate the database with dummy/initial data
│   └── server.js                 # The main entrypoint that initializes the Express app
│
├── src/                          # React Frontend Application
│   ├── components/               # Reusable UI pieces
│   │   ├── Footer.tsx             # Global application footer
│   │   ├── Navbar.tsx             # Top navigation bar (Search, Profiles, Notifications)
│   │   ├── Toast.tsx              # Component for transient popup notifications
│   │   └── ui-base.tsx            # Foundation UI components (buttons, inputs, cards)
│   ├── constants/
│   │   └── index.ts               # Global constants (e.g. API Base URLs, Token helpers)
│   ├── lib/
│   │   └── utils.ts               # Shared utility functions
│   ├── types/
│   │   └── index.ts               # TypeScript types and interfaces
│   ├── views/                    # Primary Application Pages
│   │   ├── AnalyticsView.tsx      # Huge dashboard rendering graphs and performance metrics
│   │   ├── CreatePostModal.tsx    # A full-screen overlay to author, preview, and schedule posts
│   │   ├── DashboardView.tsx      # Main landing point post-login with high-level summaries
│   │   ├── IntegrationsView.tsx   # Page tracking connected platforms (YouTube, Twitter, etc.)
│   │   ├── LoginView.tsx          # Login screen
│   │   ├── RegisterView.tsx       # Sign-up screen
│   │   └── SchedulerView.tsx      # Timeline map of drafted and scheduled posts
│   ├── App.tsx                   # Main React component tracking route state & user sessions
│   ├── index.css                 # Global application styling injected by TailwindCSS
│   └── main.tsx                  # Connects the React App to the index.html DOM
│
├── .env.example                  # Template showing needed environment variables
├── package.json                  # Tracks all NPM dependencies and scripts (dev, build, lint)
├── refactor.cjs                  # Custom utility Node script for refactoring processes
├── Requirements.md               # Extensive spec detailing all expected user flow semantics
├── tsconfig.json                 # TypeScript compiler compilation strategy
└── vite.config.ts                # Vite configuration settings
```

---

## Detailed Application Flow: What is happening?

### 1. **Authentication Flow (`LoginView.tsx`, `RegisterView.tsx`, `authRoutes.js`)**
When a user launches the app, they start at the `Login` or `Register` view. When they log in, the front-end requests `/api/auth/login`. The Express server (`authController.js`) validates the credentials against `User.js` in MongoDB. Upon success, an authentication token (JWT) is returned and securely saved by the front-end. 

Every subsequent secure request sends this token back, where it is intercepted and validated by backend's `authMiddleware.js`.

### 2. **Home Dashboard & Insight Generation (`DashboardView.tsx`, `dashboardController.js`, `geminiService.js`)**
After login, `App.tsx` shifts the view to the Dashboard. The frontend calls `/api/dashboard` which returns followers, layout stats, and importantly—Smart AI Insights. The backend utilizes Google Gemini through `geminiService.js` to dynamically generate text providing actionable social media advice based on the user's generated `DashboardStats`.

### 3. **Drafting and Creating Posts (`CreatePostModal.tsx`, `postController.js`)**
Across all screens, users can push a "Create Post". This spawns a dynamic, highly interactive React modal (`CreatePostModal.tsx`) that lets users draft content and attach photos. A live layout simulates what it would look like on a chosen network. Upon pressing "Publish" or "Schedule", a payload goes to `/api/posts`, routing to `postController.js` and inserting it carefully into the database using `Post.js`. Files are directed into the local `backend/uploads` dir.

### 4. **Scheduling Contents (`SchedulerView.tsx`, `schedulerController.js`)**
Users can plan campaigns by placing posts securely aligned at different interval ticks on the Scheduler timeline diagram. Its corresponding controller manages these timings, organizing data effectively so that future integrations can automatically post on their behalf using "CRON" node cron timing events.

### 5. **In-Depth Analytics (`AnalyticsView.tsx`, `analyticsController.js`)**
This massive page is composed of visual data tools showing user geographic distributions, follower milestones, and engagement percentage conversions mapped out seamlessly into graphs dynamically fetching data processed by the complex analytical aggregations within `analyticsController.js`.

### 6. **Database Seeding (`seed.js`)**
The application includes a comprehensive seeding script (`backend/seed.js`) to quickly provision a development environment. It connects to the configured MongoDB instance, wipes out existing document collections to ensure a clean slate, and safely populates realistically structured mockup data. 
- It creates 5 distinct, robust mock user profiles.
- Each user is seeded with drafted, scheduled, and published mock `Post` documents, realistically mapped to multiple platforms (Instagram, Twitter, LinkedIn, etc).
- It injects simulated `DashboardStats` including AI Smart Insight responses and custom-generated activity density heatmaps tailored to their posting behaviors.
- Extensive `AnalyticsData` tracking metrics like 4-week engagement growth, audience region arrays, and KPI breakdowns are pushed to the database.
- Easily runnable locally by executing `node backend/seed.js`, this provides a fully operational dashboard brimming with metrics upon your first login.
