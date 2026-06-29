# EnglishCentral.Web.Project

Professional English Center Management System built with:

* .NET 8 Web API
* ReactJS
* PostgreSQL
* Clean Architecture
* JWT Authentication
* RBAC Authorization

---

# Project Vision

EnglishCentral is a modern English center management platform designed for:

* student management
* class management
* IELTS CBT exams
* LMS learning system
* attendance tracking
* finance & reporting
* HRM management

The goal is to build an enterprise-ready, scalable, and maintainable system.

---

# Tech Stack

## Backend

* .NET 8
* ASP.NET Core Web API
* Entity Framework Core
* PostgreSQL
* JWT Authentication

---

## Frontend

* ReactJS
* TypeScript
* Vite
* TailwindCSS

---

## Infrastructure

* Docker
* GitHub Actions (future)
* Redis (future)
* RabbitMQ (future)

---

# Architecture

The backend follows:

* Clean Architecture
* Domain-driven modular design
* Repository pattern
* Service layer pattern

---

# Solution Structure

```txt id="4r5t6y"
EnglishCentral.Web.Project
│
├── backend/
│   ├── EnglishCentral.Web.API
│   ├── EnglishCentral.Application
│   ├── EnglishCentral.Domain
│   ├── EnglishCentral.Infrastructure
│   └── EnglishCentral.Tests
│
├── frontend/
│   └── englishcentral-web-app
│
└── docs/
```

---

# Database Design

The system uses PostgreSQL schemas for modular separation.

## Schemas

```txt id="7u8i9o"
identity
academic
lms
exam
finance
hrm
notification
reporting
```

---

# Authentication & Authorization

The system uses:

* JWT Authentication
* Refresh Tokens
* RBAC (Role-Based Access Control)
* Permission-based authorization

---

# Permission Naming Convention

```txt id="0p9o8i"
resource.action
```

Examples:

```txt id="1a2s3d"
student.create
student.update
attendance.take
finance.manage
```

---

# Current Modules

## Completed

* Identity/Auth module

---

## In Progress

* Academic module

---

## Planned

* LMS module
* IELTS CBT Exam module
* Finance module
* HRM module
* Reporting module

---

# Global Conventions

## Backend Naming

### C#

* PascalCase

Examples:

```txt id="4f5g6h"
User
RefreshToken
Student
```

---

## PostgreSQL

* lowercase
* snake_case

Examples:

```txt id="7j8k9l"
users
refresh_tokens
created_at
```

---

# Development Setup

## Backend

```bash id="0z1x2c"
cd backend

dotnet restore

dotnet ef database update

dotnet run
```

```
for migration set up infrastructure is default project
Add-Migration <MigrationName> -Project EnglishCentral.Infrastructure -StartupProject EnglishCentral.API
```
---

## Frontend

```bash id="3v4b5n"
cd frontend/englishcentral-web-app

npm install

npm run dev
```

---

# Future Goals

* IELTS computer-based testing
* AI speaking evaluation
* AI writing scoring
* Online learning platform
* Real-time classroom management
* Advanced analytics & reporting

---

# Author

Da Nang - EnglishCentral Team
