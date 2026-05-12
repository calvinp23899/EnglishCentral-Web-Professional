# Frontend Stack

- React 19
- TypeScript
- Vite
- React Router
- Zustand
- React Query
- Axios
- Ant Design
- React Hook Form
- Zod

# Frontend Architecture

The frontend follows:

- feature-based architecture
- domain-driven frontend modules
- centralized API layer
- reusable UI component strategy
- scalable enterprise dashboard structure

# Folder Structure

```txt
src/
│
├── api/
├── app/
│   ├── layouts/
│   ├── providers/
│   └── router/
│
├── assets/
│
├── components/
│   ├── common/
│   ├── forms/
│   └── ui/
│
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── students/
│   ├── teachers/
│   ├── courses/
│   └── ielts/
│
├── hooks/
│
├── pages/
│   ├── admin/
│   ├── public/
│   └── student/
│
├── routes/
│
├── services/
│
├── stores/
│
├── styles/
│
├── types/
│
├── utils/
│
├── App.tsx
└── main.tsx
```

# Layouts

Separate layouts are used for:

- AdminLayout
- StudentLayout
- TeacherLayout
- PublicLayout

# API Layer

The frontend uses centralized Axios instances.

Structure:

src/api/
├── axios.ts
└── endpoints.ts

# Authentication

Authentication uses:

- JWT access token
- Refresh token
- Axios interceptors
- Protected routes
- Zustand auth store

# UI Strategy

The application uses:

- Ant Design for enterprise UI
- reusable shared UI components
- feature-isolated business components

# Naming Conventions

## Components

PascalCase

Example:
- StudentTable.tsx
- LoginForm.tsx

## Hooks

camelCase with use prefix

Example:
- useAuth.ts
- useStudents.ts

# Future Scalability

The architecture is designed to support future modules:

- LMS
- IELTS CBT
- AI speaking evaluation
- AI writing scoring
- Real-time classroom management
- Reporting dashboard