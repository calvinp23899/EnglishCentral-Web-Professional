# Academic Schema - .NET Entity Structure

## Schema

```txt
academic
```

---

# academic.students

Purpose:

* student business profile
* attendance tracking
* enrollment management
* LMS integration

---

## Fields

| Field             | .NET Type      | Nullable | Description                  |
| ----------------- | -------------- | -------- | ---------------------------- |
| Id                | long           | No       | Internal primary key         |
| PublicId          | Guid           | No       | Public API identifier        |
| UserId            | long           | Yes      | Linked identity.users record |
| StudentCode       | string         | No       | Business student code        |
| FullName          | string         | No       | Student full name            |
| DateOfBirth       | DateOnly       | Yes      | Birth date                   |
| Gender            | enum           | No       | Gender                       |
| Email             | string         | Yes      | Contact email                |
| PhoneNumber       | string         | Yes      | Contact phone                |
| Address           | string         | Yes      | Home address                 |
| ParentName        | string         | Yes      | Parent full name             |
| ParentPhoneNumber | string         | Yes      | Parent phone                 |
| EnrollmentDate    | DateOnly       | No       | Initial enrollment date      |
| Status            | enum           | No       | Student status               |
| Notes             | string         | Yes      | Internal notes               |
| CreatedAt         | DateTimeOffset | No       | Created time                 |
| CreatedBy         | long           | Yes      | Creator user id              |
| UpdatedAt         | DateTimeOffset | Yes      | Last updated time            |
| UpdatedBy         | long           | Yes      | Last updater user id         |
| DeletedAt         | DateTimeOffset | Yes      | Soft delete time             |
| DeletedBy         | long           | Yes      | Deleter user id              |
| IsDeleted         | bool           | No       | Soft delete flag             |

---

## Constraints

```txt
Primary Key:
- Id

Unique:
- PublicId
- StudentCode
- UserId

Indexes:
- Email
```

---

# academic.teachers

Purpose:

* teacher business profile
* scheduling
* payroll support
* analytics

---

## Fields

| Field          | .NET Type      | Nullable |
| -------------- | -------------- | -------- |
| Id             | long           | No       |
| PublicId       | Guid           | No       |
| UserId         | long           | No       |
| TeacherCode    | string         | No       |
| FullName       | string         | No       |
| Email          | string         | Yes      |
| PhoneNumber    | string         | Yes      |
| Specialization | string         | Yes      |
| Bio            | string         | Yes      |
| HireDate       | DateOnly       | No       |
| Status         | enum           | No       |
| CreatedAt      | DateTimeOffset | No       |
| CreatedBy      | long           | Yes      |
| UpdatedAt      | DateTimeOffset | Yes      |
| UpdatedBy      | long           | Yes      |
| DeletedAt      | DateTimeOffset | Yes      |
| DeletedBy      | long           | Yes      |
| IsDeleted      | bool           | No       |

---

## Constraints

```txt
Primary Key:
- Id

Unique:
- PublicId
- TeacherCode
- UserId

Indexes:
- Email

Foreign Key:
- UserId -> identity.users.Id
```

---

# academic.course_categories

Purpose:

* logical grouping of courses
* reporting
* analytics
* LMS organization

Examples:

* IELTS
* TOEIC
* Communication
* Kids English

---

## Fields

| Field       | .NET Type      | Nullable |
| ----------- | -------------- | -------- |
| Id          | long           | No       |
| PublicId    | Guid           | No       |
| Code        | string         | No       |
| Name        | string         | No       |
| Description | string         | Yes      |
| IsActive    | bool           | No       |
| CreatedAt   | DateTimeOffset | No       |
| CreatedBy   | long           | Yes      |
| UpdatedAt   | DateTimeOffset | Yes      |
| UpdatedBy   | long           | Yes      |
| DeletedAt   | DateTimeOffset | Yes      |
| DeletedBy   | long           | Yes      |
| IsDeleted   | bool           | No       |

---

## Constraints

```txt
Primary Key:
- Id

Unique:
- PublicId
- Code

Indexes:
- Name
```

---

# academic.courses

Purpose:

* reusable academic template
* curriculum management
* pricing template

Examples:

* IELTS Foundation
* TOEIC 650
* Business Speaking

---

## Fields

| Field            | .NET Type      | Nullable |
| ---------------- | -------------- | -------- |
| Id               | long           | No       |
| PublicId         | Guid           | No       |
| CourseCategoryId | long           | No       |
| Code             | string         | No       |
| Name             | string         | No       |
| Description      | string         | Yes      |
| Level            | string         | Yes      |
| DurationWeeks    | int            | No       |
| TuitionFee       | decimal        | No       |
| MaxStudents      | int            | No       |
| IsPublished      | bool           | No       |
| IsActive         | bool           | No       |
| CreatedAt        | DateTimeOffset | No       |
| CreatedBy        | long           | Yes      |
| UpdatedAt        | DateTimeOffset | Yes      |
| UpdatedBy        | long           | Yes      |
| DeletedAt        | DateTimeOffset | Yes      |
| DeletedBy        | long           | Yes      |
| IsDeleted        | bool           | No       |

---

## Constraints

```txt
Primary Key:
- Id

Unique:
- PublicId
- Code

Indexes:
- CourseCategoryId
- Level

Foreign Key:
- CourseCategoryId -> academic.course_categories.Id
```

---

# academic.academic_terms

Purpose:

* academic operating period
* reporting period
* payroll period

Examples:

* Summer 2026
* Fall 2026

---

## Fields

| Field     | .NET Type      | Nullable |
| --------- | -------------- | -------- |
| Id        | long           | No       |
| PublicId  | Guid           | No       |
| Name      | string         | No       |
| StartDate | DateOnly       | No       |
| EndDate   | DateOnly       | No       |
| IsActive  | bool           | No       |
| CreatedAt | DateTimeOffset | No       |
| CreatedBy | long           | Yes      |
| UpdatedAt | DateTimeOffset | Yes      |
| UpdatedBy | long           | Yes      |
| DeletedAt | DateTimeOffset | Yes      |
| DeletedBy | long           | Yes      |
| IsDeleted | bool           | No       |

---

## Constraints

```txt
Primary Key:
- Id

Unique:
- PublicId
- Name
```

---

# academic.rooms

Purpose:

* classroom management
* scheduling
* conflict checking

---

## Fields

| Field     | .NET Type      | Nullable |
| --------- | -------------- | -------- |
| Id        | long           | No       |
| PublicId  | Guid           | No       |
| Code      | string         | No       |
| Name      | string         | No       |
| Capacity  | int            | No       |
| Building  | string         | Yes      |
| Floor     | int            | Yes      |
| IsActive  | bool           | No       |
| CreatedAt | DateTimeOffset | No       |
| CreatedBy | long           | Yes      |
| UpdatedAt | DateTimeOffset | Yes      |
| UpdatedBy | long           | Yes      |
| DeletedAt | DateTimeOffset | Yes      |
| DeletedBy | long           | Yes      |
| IsDeleted | bool           | No       |

---

## Constraints

```txt
Primary Key:
- Id

Unique:
- PublicId
- Code
```

---

# academic.classes

Purpose:

* runtime teaching operations
* scheduling
* attendance management

Examples:

* IELTS65-MWF-01
* TOEIC650-TTS-02

---

## Fields

| Field          | .NET Type      | Nullable |
| -------------- | -------------- | -------- |
| Id             | long           | No       |
| PublicId       | Guid           | No       |
| CourseId       | long           | No       |
| TeacherId      | long           | No       |
| AcademicTermId | long           | No       |
| Code           | string         | No       |
| Name           | string         | No       |
| StartDate      | DateOnly       | No       |
| EndDate        | DateOnly       | No       |
| Capacity       | int            | No       |
| Status         | enum           | No       |
| Notes          | string         | Yes      |
| CreatedAt      | DateTimeOffset | No       |
| CreatedBy      | long           | Yes      |
| UpdatedAt      | DateTimeOffset | Yes      |
| UpdatedBy      | long           | Yes      |
| DeletedAt      | DateTimeOffset | Yes      |
| DeletedBy      | long           | Yes      |
| IsDeleted      | bool           | No       |

---

## Constraints

```txt
Primary Key:
- Id

Unique:
- PublicId
- Code

Indexes:
- CourseId
- TeacherId
- AcademicTermId
- Status

Foreign Key:
- CourseId -> academic.courses.Id
- TeacherId -> academic.teachers.Id
- AcademicTermId -> academic.academic_terms.Id
```
