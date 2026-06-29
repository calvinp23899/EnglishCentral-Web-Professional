HTTP Request
    │
    ▼
Controller
    │  map request → Command/Query
    ▼
MediatR.Send()
    │
    ▼
ValidationBehavior (Pipeline)      ← FluentValidation tự chạy trước Handler
    │  nếu invalid → return 400 ngay
    ▼
CommandHandler / QueryHandler
    │  business logic
    │  gọi Repository / Service
    ▼
Repository                          ← data access
    │  EF Core
    ▼
Database (PostgreSQL)
    │
    ▼
Handler return Result<T>
    │
    ▼
Controller
    │  map Result → IActionResult
    ▼
HTTP Response