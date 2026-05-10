Architecture
EnglishCentral.API           → Controllers, Program.cs
EnglishCentral.Application   → CQRS, Interfaces, Validators
EnglishCentral.Domain        → Entities, Enums, Events
EnglishCentral.Infrastructure → Repositories, Services, Migrations
EnglishCentral.Contracts     → Requests, Responses
EnglishCentral.Shared        → Result<T>, Common

Database

✅ 2 schemas: identity + academic
✅ Migration InitialDB1 đã apply thành công
✅ Tables: users, roles, permissions, user_roles, role_permissions, refresh_tokens, students, teachers, courses, classes...
✅ Soft delete, Audit fields, Composite keys đúng hết


Packages đã cài
Application:
- MediatR
- FluentValidation
- FluentValidation.DependencyInjectionExtensions

Infrastructure:
- Npgsql.EntityFrameworkCore.PostgreSQL
- Microsoft.EntityFrameworkCore.Design
- BCrypt.Net-Next
- Microsoft.AspNetCore.Authentication.JwtBearer
- Microsoft.AspNetCore.Cryptography.KeyDerivation

API:
- Microsoft.EntityFrameworkCore.Design
- Microsoft.AspNetCore.Authentication.JwtBearer

Patterns đã implement

✅ Generic Repository IGenericRepository<T>
✅ Unit of Work IUnitOfWork
✅ Result pattern Result<T>
✅ CQRS — Feature-based folder structure
✅ Extension method DI (AddApplication(), AddInfrastructure())
✅ BaseController với [Route("api/[controller]")]


Identity Feature — DONE
Commands/
├── Register/
│   ├── RegisterCommand.cs
│   ├── RegisterCommandHandler.cs
│   └── RegisterCommandValidator.cs
└── Login/
    ├── LoginCommand.cs
    ├── LoginCommandHandler.cs
    └── LoginCommandValidator.cs
Services

✅ PasswordService — BCrypt workFactor 10, Task.Run
✅ JwtService — AccessToken (15 min) + RefreshToken (30 days)
✅ JwtSettings — đọc từ appsettings.json
✅ UserRepository — extend GenericRepository

Interfaces

✅ IUserRepository
✅ IJwtService
✅ IPasswordService
✅ IUnitOfWork

Contracts

✅ RegisterRequest
✅ LoginRequest
✅ AuthResponse


API Test Results

✅ POST /api/identity/register → 201 Created, ~166ms sau warm up
✅ POST /api/identity/login → chưa test
✅ RefreshToken lưu hash trong DB, trả raw token về client


Conventions

long cho Primary Key
Guid cho PublicId (external)
DateTimeOffset thay DateTime
Soft delete: IsDeleted, DeletedAt, DeletedBy
Audit: CreatedAt, CreatedBy, UpdatedAt, UpdatedBy
Navigation property thay vì raw FK khi Add entity
PostgreSQL: lowercase_snake_case
C#: PascalCase


Chưa làm — TODO

❌ ValidationBehavior Pipeline (FluentValidation tự chạy trước Handler)
❌ Login test + RefreshToken endpoint
❌ Role gán khi Register (auto gán Student)
❌ Internal endpoint tạo user (Admin, Teacher) — [Authorize]
❌ Academic module CQRS
❌ Exception handling middleware
❌ Logging
❌ Frontend