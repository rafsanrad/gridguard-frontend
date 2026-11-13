# ⚡ GridGuard — Load Shedding & Power Management System

A modern, full-stack electricity outage and load shedding management platform designed to help power distribution authorities manage outages, schedule load shedding, organize distribution zones, and keep customers informed.

GridGuard provides role-based dashboards for administrators, operators, and customers, along with public access to outage information and load shedding schedules.

## 🌟 Key Features

### 🌐 Public Features

- View reported and ongoing power outages
- Browse load shedding schedules
- Search outage reports and schedules
- Filter schedules by feeder
- Responsive design for mobile, tablet, and desktop
- Public access without requiring authentication

### 👨‍💼 Admin Dashboard

- Dashboard overview and analytics
- Manage registered users
- Search and filter users by role
- Update user details and roles
- Activate, block, or delete user accounts
- Create, update, and deactivate distribution zones
- Manage feeders and distribution infrastructure
- Manage outage reports and load shedding schedules
- Access administrative management tools

### 🛠️ Operator Dashboard

- Monitor and manage power outages
- Update outage progress and restoration status
- Manage load shedding schedules
- Access operational tools based on assigned permissions

### 👤 Customer Features

- User registration and login
- Access a personalized dashboard
- View outage and load shedding information
- Report power outages
- Access account-related features

## 🧰 Tech Stack

| Category        | Technologies                |
| --------------- | --------------------------- |
| Framework       | Next.js 16 (App Router)     |
| Language        | TypeScript                  |
| UI              | React 19                    |
| Styling         | Tailwind CSS                |
| Components      | shadcn/ui, Base UI          |
| Data Fetching   | TanStack React Query        |
| Icons           | Lucide React                |
| Backend         | Node.js, Express.js         |
| Database        | PostgreSQL                  |
| ORM             | Prisma                      |
| Authentication  | Cookie-based authentication |
| Package Manager | pnpm                        |

## 🏗️ Project Architecture

GridGuard follows a modular architecture separating pages, UI components, API services, React Query hooks, and TypeScript types.

```text
src/
├── app/
│   ├── (public)/
│   │   ├── page.tsx
│   │   ├── outages/
│   │   └── schedules/
│   │
│   └── (dashboard)/
│       ├── admin/
│       │   ├── users/
│       │   └── zones/
│       ├── operator/
│       └── customer/
│
├── components/
│   ├── dashboard/
│   ├── public/
│   └── ui/
│
├── hooks/
│   ├── use-users.ts
│   ├── use-zones.ts
│   ├── use-outages.ts
│   └── use-load-shedding.ts
│
├── services/
│   ├── user.service.ts
│   ├── zone.service.ts
│   ├── outage.service.ts
│   └── load-shedding.service.ts
│
├── types/
│   ├── user.ts
│   └── zone.ts
│
└── lib/
    └── api-client.ts
```

_The structure above highlights the main application modules rather than every file._

## 🚀 Getting Started

### Prerequisites

Make sure the following are installed:

- Node.js (a version compatible with Next.js 16)
- pnpm
- Git
- A running GridGuard backend API

### 1. Clone the Repository

```bash
git clone <your-frontend-repository-url>
cd <your-frontend-directory>
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root.

```env
NEXT_PUBLIC_API_URL=https://grid-guard-backend.vercel.app/api/v1
```

Replace the URL with your actual backend API base URL and port.

**Important:** The backend must allow credentialed requests from your frontend origin because the API client uses `credentials: "include"`.

### 4. Start the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production

```bash
pnpm build
pnpm start
```

## 🔐 Role-Based Access Control

GridGuard supports three application roles:

| Role           | Access                                                        |
| -------------- | ------------------------------------------------------------- |
| ADMIN          | Administrative dashboard and management features              |
| OPERATOR       | Operational dashboard and permitted outage/schedule workflows |
| CUSTOMER       | Customer dashboard and customer-specific features             |
| Public Visitor | Public outage reports and load shedding schedules             |

Protected operations are authorized by the backend. Frontend route protection improves navigation but does not replace server-side authorization.

## 🔌 API Integration

The frontend communicates with the Express backend through a centralized API client.

```typescript
const response = await fetch(`${API_URL}${endpoint}`, {
  ...options,
  headers,
  credentials: "include",
});
```

### Main API Modules

| Module        | Endpoint         |
| ------------- | ---------------- |
| Users         | `/users`         |
| Zones         | `/zones`         |
| Feeders       | `/feeders`       |
| Outages       | `/outages`       |
| Load Shedding | `/load-shedding` |

Some endpoints require authentication and specific roles.

### Data Fetching

TanStack React Query handles:

- Server-state caching
- Loading and error states
- Query invalidation after mutations
- Data refetching
- Pagination and filtering integration

## 📱 User Experience

GridGuard emphasizes a clean, responsive interface with:

- Dashboard navigation
- Search and filter controls
- Paginated data views
- Status indicators
- Loading skeletons
- Form validation
- Confirmation prompts for sensitive operations
- Dark-mode-compatible components

## 🧪 Quality Checks

Run the following commands before committing or deploying:

```bash
pnpm exec tsc --noEmit
pnpm lint
pnpm build
```

## 🚢 Deployment

The frontend can be deployed on Vercel or another Next.js-compatible hosting platform.

For deployment:

1. Push the frontend repository to GitHub.
2. Import the repository into your hosting platform.
3. Configure `NEXT_PUBLIC_API_URL` with your deployed backend API URL.
4. Deploy the application.
5. Verify authentication, CORS, protected dashboards, and public pages.

## 🗺️ Future Improvements

- Real-time outage status updates
- Interactive geographical outage maps
- More detailed analytics and reporting
- Improved notification workflows
- Enhanced accessibility and performance

## 📄 License

No license has been specified for this project.

---

**GridGuard** — Smarter power management, clearer outage information.
