## PROJECT ARCHITECTURE
EnglishCentral.Web.Project/
│
├── .github/
│   └── workflows/
│
├── backend/
│   │
│   ├── src/
│   │   │
│   │   ├── EnglishCentral.API/
│   │   │   │
│   │   │   ├── Controllers/
│   │   │   ├── Middlewares/
│   │   │   ├── Extensions/
│   │   │   ├── Configurations/
│   │   │   ├── Filters/
│   │   │   ├── appsettings.json
│   │   │   ├── appsettings.Development.json
│   │   │   └── Program.cs
│   │   │
│   │   ├── EnglishCentral.Application/
│   │   │   │
│   │   │   ├── Features/
│   │   │   │   │
│   │   │   │   ├── Auth/
│   │   │   │   │   ├── Commands/
│   │   │   │   │   ├── Queries/
│   │   │   │   │   ├── DTOs/
│   │   │   │   │   ├── Validators/
│   │   │   │   │   └── Handlers/
│   │   │   │   │
│   │   │   │   ├── Courses/
│   │   │   │   ├── Lessons/
│   │   │   │   ├── Users/
│   │   │   │   ├── Payments/
│   │   │   │   └── AI/
│   │   │   │
│   │   │   ├── Interfaces/
│   │   │   ├── Behaviors/
│   │   │   ├── Exceptions/
│   │   │   ├── Mappings/
│   │   │   └── DependencyInjection.cs
│   │   │
│   │   ├── EnglishCentral.Domain/
│   │   │   │
│   │   │   ├── Entities/
│   │   │   ├── Enums/
│   │   │   ├── Events/
│   │   │   ├── ValueObjects/
│   │   │   ├── Constants/
│   │   │   └── Common/
│   │   │
│   │   ├── EnglishCentral.Infrastructure/
│   │   │   │
│   │   │   ├── Persistence/
│   │   │   │   ├── Context/
│   │   │   │   ├── Configurations/
│   │   │   │   ├── Repositories/
│   │   │   │   └── Migrations/
│   │   │   │
│   │   │   ├── Identity/
│   │   │   ├── Services/
│   │   │   ├── Messaging/
│   │   │   ├── Caching/
│   │   │   ├── Files/
│   │   │   ├── AI/
│   │   │   └── DependencyInjection.cs
│   │   │
│   │   ├── EnglishCentral.Contracts/
│   │   │   │
│   │   │   ├── Requests/
│   │   │   ├── Responses/
│   │   │   └── Events/
│   │   │
│   │   └── EnglishCentral.Shared/
│   │       │
│   │       ├── Common/
│   │       ├── Constants/
│   │       ├── Exceptions/
│   │       ├── Extensions/
│   │       ├── Results/
│   │       └── Helpers/
│   │
│   └── tests/
│       │
│       ├── EnglishCentral.UnitTests/
│       └── EnglishCentral.IntegrationTests/
│
├── frontend/
│   │
│   └── englishcentral-web/
│       │
│       ├── public/
│       │
│       ├── src/
│       │   │
│       │   ├── api/
│       │   ├── app/
│       │   ├── assets/
│       │   ├── components/
│       │   ├── features/
│       │   │   ├── auth/
│       │   │   ├── courses/
│       │   │   ├── lessons/
│       │   │   ├── users/
│       │   │   └── ai/
│       │   │
│       │   ├── hooks/
│       │   ├── layouts/
│       │   ├── pages/
│       │   ├── routes/
│       │   ├── services/
│       │   ├── stores/
│       │   ├── styles/
│       │   ├── types/
│       │   ├── utils/
│       │   ├── App.tsx
│       │   └── main.tsx
│       │
│       ├── package.json
│       ├── vite.config.ts
│       └── tsconfig.json
│
├── infrastructure/
│   │
│   ├── docker/
│   │   ├── postgres/
│   │   ├── redis/
│   │   ├── rabbitmq/
│   │   └── keycloak/
│   │
│   ├── nginx/
│   └── scripts/
│
├── database/
│   │
│   ├── scripts/
│   ├── seed/
│   └── backups/
│
├── docs/
│   ├── architecture/
│   ├── api/
│   └── diagrams/
│
├── .gitignore
├── docker-compose.yml
├── README.md
└── EnglishCentral.Web.Project.sln