# Identity Schema - .NET Entity Structure

## Schema

```txt id="1q2w3e"
identity
```

---

# identity.users

Purpose:

* authentication identity
* common display information
* system-level identity

---

## Fields

| Field          | .NET Type      | Nullable | Description               |
| -------------- | -------------- | -------- | ------------------------- |
| Id             | long           | No       | Internal primary key      |
| PublicId       | Guid           | No       | Public API identifier     |
| Email          | string         | No       | Login email               |
| PasswordHash   | string         | No       | Hashed password           |
| FullName       | string         | No       | Common display name       |
| PhoneNumber    | string         | Yes      | User phone                |
| AvatarUrl      | string         | Yes      | User avatar               |
| IsActive       | bool           | No       | Account status            |
| EmailConfirmed | bool           | No       | Email verification status |
| LastLoginAt    | DateTimeOffset | Yes      | Last login timestamp      |
| CreatedAt      | DateTimeOffset | No       | Created time              |
| CreatedBy      | long           | Yes      | Creator user id           |
| UpdatedAt      | DateTimeOffset | Yes      | Last updated time         |
| UpdatedBy      | long           | Yes      | Last updater user id      |
| DeletedAt      | DateTimeOffset | Yes      | Soft delete time          |
| DeletedBy      | long           | Yes      | Deleter user id           |
| IsDeleted      | bool           | No       | Soft delete flag          |

---

## Constraints

```txt id="4r5t6y"
Primary Key:
- Id

Unique:
- PublicId
- Email
```

---

# identity.roles

Purpose:

* role-based authorization

Examples:

* Admin
* Teacher
* Student

---

## Fields

| Field       | .NET Type      | Nullable |
| ----------- | -------------- | -------- |
| Id          | long           | No       |
| PublicId    | Guid           | No       |
| Name        | string         | No       |
| Description | string         | Yes      |
| CreatedAt   | DateTimeOffset | No       |
| CreatedBy   | long           | Yes      |
| UpdatedAt   | DateTimeOffset | Yes      |
| UpdatedBy   | long           | Yes      |
| DeletedAt   | DateTimeOffset | Yes      |
| DeletedBy   | long           | Yes      |
| IsDeleted   | bool           | No       |

---

## Constraints

```txt id="7u8i9o"
Primary Key:
- Id

Unique:
- PublicId
- Name
```

---

# identity.permissions

Purpose:

* fine-grained authorization

Examples:

* attendance.take
* finance.manage
* class.create

---

## Fields

| Field       | .NET Type      | Nullable |
| ----------- | -------------- | -------- |
| Id          | long           | No       |
| PublicId    | Guid           | No       |
| Name        | string         | No       |
| Description | string         | Yes      |
| CreatedAt   | DateTimeOffset | No       |
| CreatedBy   | long           | Yes      |
| UpdatedAt   | DateTimeOffset | Yes      |
| UpdatedBy   | long           | Yes      |
| DeletedAt   | DateTimeOffset | Yes      |
| DeletedBy   | long           | Yes      |
| IsDeleted   | bool           | No       |

---

## Constraints

```txt id="0p9o8i"
Primary Key:
- Id

Unique:
- PublicId
- Name
```

---

# identity.user_roles

Purpose:

* many-to-many mapping between users and roles

---

## Fields

| Field  | .NET Type |
| ------ | --------- |
| UserId | long      |
| RoleId | long      |

---

## Constraints

```txt id="1a2s3d"
Composite Primary Key:
- UserId
- RoleId
```

---

# identity.role_permissions

Purpose:

* many-to-many mapping between roles and permissions

---

## Fields

| Field        | .NET Type |
| ------------ | --------- |
| RoleId       | long      |
| PermissionId | long      |

---

## Constraints

```txt id="4f5g6h"
Composite Primary Key:
- RoleId
- PermissionId
```

---

# identity.refresh_tokens

Purpose:

* JWT refresh token management

---

## Fields

| Field      | .NET Type      | Nullable |
| ---------- | -------------- | -------- |
| Id         | long           | No       |
| PublicId   | Guid           | No       |
| UserId     | long           | No       |
| TokenHash  | string         | No       |
| ExpiresAt  | DateTimeOffset | No       |
| RevokedAt  | DateTimeOffset | Yes      |
| IpAddress  | string         | Yes      |
| DeviceInfo | string         | Yes      |
| CreatedAt  | DateTimeOffset | No       |
| CreatedBy  | long           | Yes      |
| UpdatedAt  | DateTimeOffset | Yes      |
| UpdatedBy  | long           | Yes      |
| DeletedAt  | DateTimeOffset | Yes      |
| DeletedBy  | long           | Yes      |
| IsDeleted  | bool           | No       |

---

## Constraints

```txt id="7j8k9l"
Primary Key:
- Id

Unique:
- PublicId

Foreign Key:
- UserId -> Users.Id
```

---

# Global Conventions

## Primary Keys

Use:

```txt id="0z1x2c"
long
```

Reason:

* better performance
* smaller indexes
* faster joins

---

## Public API IDs

Use:

```txt id="3v4b5n"
Guid
```

Reason:

* safe for external exposure
* avoid sequential ID enumeration

---

## Date & Time

Use:

```txt id="6m7q8w"
DateTimeOffset
```

everywhere instead of DateTime.

Reason:

* timezone-safe
* enterprise best practice
* future scalability

---

# Soft Delete Strategy

Use:

```txt id="9e0r1t"
IsDeleted
DeletedAt
DeletedBy
```

instead of physical deletion.

---

# Audit Strategy

Use:

```txt id="2y3u4i"
CreatedAt
CreatedBy
UpdatedAt
UpdatedBy
```

for:

* audit tracking
* reporting
* accountability
* history

# OAuth Future Scalability

Architecture supports future integration with:

Google Login
Facebook Login
Apple Login
Microsoft Login

Future table:

user_external_providers

# Business-specific data belongs to profile tables