# 🏗️ SiteSync — Agent Instruction File

> **Last Updated:** 2026-03-09
> **Purpose:** This document provides a complete, structured overview of the SiteSync project so that any human or AI agent can understand and work with the codebase effectively.
> **Rule:** This file MUST be reviewed and updated after every significant change to the codebase.

---

## 📌 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Repository Structure](#3-repository-structure)
4. [Backend (API) Architecture](#4-backend-api-architecture)
5. [Database Schema (PostgreSQL)](#5-database-schema-postgresql)
6. [API Endpoints](#6-api-endpoints)
7. [Frontend (Web) Architecture](#7-frontend-web-architecture)
8. [API ↔ Frontend Mapping](#8-api--frontend-mapping)
9. [Authentication & Authorization](#9-authentication--authorization)
10. [File Storage (Cloudflare R2)](#10-file-storage-cloudflare-r2)
11. [Environment Variables](#11-environment-variables)
12. [Deployment Plan](#12-deployment-plan)
13. [Seeded Data](#13-seeded-data)
14. [Conventions & Patterns](#14-conventions--patterns)

---

## 1. Project Overview

**SiteSync** is a construction site management application designed for civil engineering teams. It helps manage:

- **Construction sites** and their lifecycle
- **Phases** of construction (Piles, Plinth, RCC, Finishing, Parking)
- **Piles** — individual pile units with structural data, test statuses, and execution reports
- **Pile Execution Reports** — detailed reports per pile including boring logs, reinforcement details, and concrete data
- **File attachments** — drawings, test reports (cube tests, integrity, eccentricity), and other documents stored on Cloudflare R2
- **Role-based access** — Super Admin, Admin, and Engineer roles with varying permissions
- **Site-to-engineer assignments** — assigning engineers to specific sites

### What It Does Currently

| Feature                                           | Status         |
| ------------------------------------------------- | -------------- |
| User login (JWT)                                  | ✅ Working     |
| Role-based access (SUPER_ADMIN, ADMIN, ENGINEER)  | ✅ Working     |
| User management (create, edit, roles, activate)   | ✅ Working     |
| Profile management & changing passwords           | ✅ Working     |
| Password change enforcement on first login        | ✅ Working     |
| Site CRUD (create, soft/hard delete, restore)     | ✅ Working     |
| Engineer-to-site assignment                       | ✅ Working     |
| Phase management per site (5 phase types)         | ✅ Working     |
| Pile creation and status tracking per phase       | ✅ Working     |
| Pile Execution Report (create, auto-save, submit) | ✅ Working     |
| Boring Log entries per report                     | ✅ Working     |
| Reinforcement entries per report                  | ✅ Working     |
| File attachments (upload, view, soft/hard delete) | ✅ Working     |
| Integrity & eccentricity status tracking          | ✅ Working     |
| Cube 7-day and 28-day status tracking             | ✅ Working     |
| Plinth phase module                               | ❌ Not started |
| RCC phase module                                  | ❌ Not started |
| Finishing/Parking phase modules                   | ❌ Not started |

---

## 2. Tech Stack

### Backend (`apps/api`)

| Layer            | Technology                          | Version                              |
| ---------------- | ----------------------------------- | ------------------------------------ |
| Framework        | NestJS                              | ^11.0.1                              |
| Language         | TypeScript                          | ^5.7.3                               |
| ORM              | TypeORM                             | ^0.3.28                              |
| Database         | PostgreSQL                          | 15 (Docker)                          |
| Auth             | Passport + JWT                      | passport ^0.7.0, @nestjs/jwt ^11.0.2 |
| Validation       | class-validator + class-transformer | ^0.14.3, ^0.5.1                      |
| File Storage     | Cloudflare R2 (S3-compatible)       | @aws-sdk/client-s3 ^3.992.0          |
| File Upload      | Multer                              | ^2.0.2                               |
| Password Hashing | bcrypt                              | ^6.0.0                               |

### Frontend (`apps/web`)

| Layer       | Technology       | Version |
| ----------- | ---------------- | ------- |
| Framework   | React            | ^19.2.0 |
| Build Tool  | Vite             | ^7.3.1  |
| Language    | TypeScript       | ~5.9.3  |
| Routing     | React Router DOM | ^7.13.0 |
| HTTP Client | Axios            | ^1.13.5 |
| UI Library  | Radix UI Themes  | ^3.3.0  |
| Icons       | Radix UI Icons   | ^1.3.2  |
| Styling     | TailwindCSS      | ^3.4.19 |
| Forms       | React Hook Form  | ^7.71.1 |

### Infrastructure

| Component          | Technology                      |
| ------------------ | ------------------------------- |
| Database Container | Docker Compose (PostgreSQL 15)  |
| Object Storage     | Cloudflare R2                   |
| Monorepo           | npm workspaces                  |
| Frontend Hosting   | Vercel (SPA rewrite configured) |

---

## 3. Repository Structure

```
site_manager/                         ← Root (npm workspaces monorepo)
├── package.json                      ← Workspaces: apps/*, packages/*
├── docker-compose.yml                ← PostgreSQL 15 container
├── apps/
│   ├── api/                          ← NestJS backend
│   │   ├── src/
│   │   │   ├── main.ts               ← Entry point (port 3000, CORS, ValidationPipe)
│   │   │   ├── app.module.ts         ← Root module (TypeORM config, global guards, seeding)
│   │   │   ├── app.controller.ts     ← Health check (GET /)
│   │   │   ├── app.service.ts        ← Hello service
│   │   │   ├── auth/                 ← Authentication module
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── auth.controller.ts   ← POST /auth/login
│   │   │   │   ├── auth.service.ts      ← Login validation + JWT signing
│   │   │   │   ├── jwt.strategy.ts      ← Passport JWT strategy
│   │   │   │   ├── jwt-auth.guard.ts    ← Global JWT auth guard
│   │   │   │   ├── roles.guard.ts       ← Global roles guard
│   │   │   │   ├── roles.decorator.ts   ← @Roles() decorator
│   │   │   │   └── public.decorator.ts  ← @Public() decorator
│   │   │   ├── roles/               ← Roles module
│   │   │   │   ├── role.entity.ts
│   │   │   │   ├── roles.module.ts
│   │   │   │   ├── roles.controller.ts  ← (empty, no endpoints)
│   │   │   │   └── roles.service.ts
│   │   │   ├── users/               ← Users module
│   │   │   │   ├── user.entity.ts
│   │   │   │   ├── users.module.ts
│   │   │   │   ├── users.controller.ts  ← GET /users, /users/assignable, /users/me
│   │   │   │   └── users.service.ts
│   │   │   ├── sites/               ← Sites module
│   │   │   │   ├── site.entity.ts
│   │   │   │   ├── site-assignment.entity.ts
│   │   │   │   ├── sites.module.ts
│   │   │   │   ├── sites.controller.ts  ← CRUD + assign + soft/hard delete
│   │   │   │   └── sites.service.ts
│   │   │   ├── phases/              ← Phases module
│   │   │   │   ├── phase.entity.ts
│   │   │   │   ├── phases.module.ts
│   │   │   │   ├── phases.controller.ts ← Get phases, update, start-piles, repair
│   │   │   │   └── phases.service.ts
│   │   │   ├── piles/               ← Piles module
│   │   │   │   ├── pile.entity.ts
│   │   │   │   ├── piles.module.ts
│   │   │   │   ├── piles.controller.ts  ← Create, get, update number/status
│   │   │   │   └── piles.service.ts
│   │   │   ├── pile-report/         ← Pile Execution Report module
│   │   │   │   ├── pile-execution-report.entity.ts
│   │   │   │   ├── boring-log.entity.ts
│   │   │   │   ├── reinforcement-entry.entity.ts
│   │   │   │   ├── dto/
│   │   │   │   │   └── update-pile-report.dto.ts
│   │   │   │   ├── pile-report.module.ts
│   │   │   │   ├── pile-report.controller.ts ← GET/PATCH/POST submit
│   │   │   │   └── pile-report.service.ts
│   │   │   ├── attachments/         ← Attachments module
│   │   │   │   ├── attachment.entity.ts
│   │   │   │   ├── attachments.module.ts
│   │   │   │   ├── attachments.controller.ts ← Upload, get URL, delete, query
│   │   │   │   └── attachments.service.ts
│   │   │   └── storage/             ← R2 Storage module
│   │   │       ├── r2.service.ts       ← S3-compatible file ops (upload/delete/signedUrl)
│   │   │       ├── storage.controller.ts ← Direct R2 test endpoints
│   │   │       └── storage.module.ts
│   │   ├── .env / .env.example
│   │   ├── nest-cli.json
│   │   └── tsconfig.json
│   └── web/                          ← React + Vite frontend
│       ├── src/
│       │   ├── main.tsx              ← Entry (BrowserRouter + Radix Theme)
│       │   ├── App.tsx               ← Route definitions
│       │   ├── api/
│       │   │   └── axios.ts          ← Axios instance with JWT interceptor
│       │   ├── pages/
│       │   │   ├── Login.tsx         ← Login form
│       │   │   ├── Dashboard.tsx     ← Sites list + create/manage sites
│       │   │   ├── SiteDetails.tsx   ← Phases for a site
│       │   │   ├── PilesPage.tsx     ← Piles list for a phase
│       │   │   └── PileReportPage.tsx ← Pile execution report form
│       │   ├── components/
│       │   │   ├── ProtectedRoute.tsx     ← Auth guard (token check)
│       │   │   ├── common/
│       │   │   │   ├── BackButton.tsx     ← Navigation back button
│       │   │   │   └── UploadAttachmentsButton.tsx ← File upload UI
│       │   │   ├── piles/
│       │   │   │   └── PileRow.tsx        ← Individual pile row with status dropdowns
│       │   │   └── pile-report/
│       │   │       ├── HeaderSection.tsx       ← Report header (pile structural data)
│       │   │       ├── ConcreteSection.tsx     ← Concrete details section
│       │   │       ├── BoringTable.tsx         ← Boring log table
│       │   │       ├── ReinforcementTable.tsx  ← Reinforcement calculation table
│       │   │       └── StatusBar.tsx           ← Autosave status indicator
│       │   ├── hooks/
│       │   │   └── useAutoSave.ts     ← Debounced auto-save hook
│       │   └── utils/
│       │       ├── attachmentType.ts  ← AttachmentType const enum
│       │       ├── statusEnums.ts     ← IntegrityStatus, EccentricityStatus const enums
│       │       ├── dateFormatting.ts   ← Date/time conversion utilities
│       │       └── debounce.ts        ← Debounce utility function
│       ├── vercel.json               ← SPA rewrite for Vercel
│       ├── .env / .env.example
│       ├── tailwind.config.js
│       └── vite.config.ts
└── packages/                         ← (empty, reserved for shared packages)
```

---

## 4. Backend (API) Architecture

### Module Architecture

The API follows NestJS's modular architecture. Each feature has its own module containing:

- **Entity** (TypeORM): Database table definition
- **Controller**: HTTP route handlers
- **Service**: Business logic
- **DTO** (where needed): Request validation

### Global Configuration

| Feature     | Implementation                                                                |
| ----------- | ----------------------------------------------------------------------------- |
| Validation  | Global `ValidationPipe` with `whitelist`, `forbidNonWhitelisted`, `transform` |
| Auth Guard  | Global `JwtAuthGuard` (all routes require JWT by default)                     |
| Roles Guard | Global `RolesGuard` (checks `@Roles()` decorator)                             |
| CORS        | Enabled, origin from `CORS_ORIGIN` env var (default: `http://localhost:5173`) |
| DB Sync     | `synchronize: true` (auto-creates/updates tables from entities)               |
| Port        | 3000                                                                          |

### Module List

| Module              | Entity/Entities                                          | Purpose                                                 |
| ------------------- | -------------------------------------------------------- | ------------------------------------------------------- |
| `AuthModule`        | —                                                        | JWT login, Passport strategy, guards, decorators        |
| `RolesModule`       | `Role`                                                   | Role definitions (seeded: SUPER_ADMIN, ADMIN, ENGINEER) |
| `UsersModule`       | `User`                                                   | User management, assignable users, profile              |
| `SitesModule`       | `Site`, `SiteAssignment`                                 | Site CRUD, engineer assignment, soft/hard delete        |
| `PhasesModule`      | `Phase`                                                  | Phase lifecycle per site, start-piles action            |
| `PilesModule`       | `Pile`                                                   | Pile CRUD, pile number/status updates                   |
| `PileReportModule`  | `PileExecutionReport`, `BoringLog`, `ReinforcementEntry` | Execution report with sub-tables                        |
| `AttachmentsModule` | `Attachment`                                             | File metadata + upload/download via R2                  |
| `StorageModule`     | —                                                        | R2Service for direct S3 operations                      |

---

## 5. Database Schema (PostgreSQL)

> **ORM:** TypeORM with `synchronize: true` — tables are auto-created from entities.
> **Database:** PostgreSQL 15 running in Docker (`site_postgres` container).

### 5.1 `role` Table

| Column            | Type               | Constraints      | Description                                   |
| ----------------- | ------------------ | ---------------- | --------------------------------------------- |
| `id`              | serial (PK)        | PRIMARY KEY      | Auto-increment ID                             |
| `name`            | varchar            | UNIQUE, NOT NULL | Role name: `SUPER_ADMIN`, `ADMIN`, `ENGINEER` |
| `description`     | varchar            | NULLABLE         | Optional description                          |
| `isActive`        | boolean            | DEFAULT true     | Soft-active flag                              |
| `createdAt`       | timestamp          | AUTO             | Creation timestamp                            |
| `updatedAt`       | timestamp          | AUTO             | Last update timestamp                         |
| `createdByUserId` | int (FK → user.id) | NULLABLE         | Creator user                                  |
| `updatedByUserId` | int (FK → user.id) | NULLABLE         | Last updater user                             |

### 5.2 `user` Table

| Column            | Type               | Constraints               | Description                                               |
| ----------------- | ------------------ | ------------------------- | --------------------------------------------------------- |
| `id`              | serial (PK)        | PRIMARY KEY               | Auto-increment ID                                         |
| `fullName`        | varchar            | NOT NULL                  | User's full name                                          |
| `email`           | varchar            | UNIQUE, NOT NULL          | Login email                                               |
| `password`           | varchar            | NOT NULL, `select: false` | Bcrypt hashed password (excluded from queries by default) |
| `mustChangePassword` | boolean            | DEFAULT false             | Force user to change password on login                    |
| `isActive`           | boolean            | DEFAULT true              | Active flag                                               |
| `roleId`          | int (FK → role.id) | EAGER loaded              | User's role                                               |
| `createdByUserId` | int (FK → user.id) | NULLABLE                  | Creator                                                   |
| `updatedByUserId` | int (FK → user.id) | NULLABLE                  | Updater                                                   |
| `createdAt`       | timestamp          | AUTO                      | Creation timestamp                                        |
| `updatedAt`       | timestamp          | AUTO                      | Update timestamp                                          |

**Relations:** `user.role` → `Role` (ManyToOne, eager), `user.assignments` → `SiteAssignment[]` (OneToMany)

### 5.3 `site` Table

| Column            | Type               | Constraints  | Description       |
| ----------------- | ------------------ | ------------ | ----------------- |
| `id`              | serial (PK)        | PRIMARY KEY  | Auto-increment ID |
| `name`            | varchar            | NOT NULL     | Site name         |
| `location`        | varchar            | NULLABLE     | Site location     |
| `description`     | varchar            | NULLABLE     | Description       |
| `isActive`        | boolean            | DEFAULT true | Soft-delete flag  |
| `createdByUserId` | int (FK → user.id) | NULLABLE     | Creator           |
| `updatedByUserId` | int (FK → user.id) | NULLABLE     | Updater           |
| `createdAt`       | timestamp          | AUTO         | Created           |
| `updatedAt`       | timestamp          | AUTO         | Updated           |

**Relations:** `site.assignments` → `SiteAssignment[]`, `site.phases` → `Phase[]`, `site.piles` → `Pile[]`

### 5.4 `site_assignment` Table

| Column         | Type               | Constraints           | Description             |
| -------------- | ------------------ | --------------------- | ----------------------- |
| `id`           | serial (PK)        | PRIMARY KEY           | Auto-increment ID       |
| `siteId`       | int (FK → site.id) | CASCADE DELETE        | Assigned site           |
| `userId`       | int (FK → user.id) | CASCADE DELETE, EAGER | Assigned user           |
| `assignedAt`   | timestamp          | AUTO                  | Assignment timestamp    |
| `assignedById` | int (FK → user.id) | NULLABLE              | Who made the assignment |

### 5.5 `phase` Table

| Column            | Type               | Constraints    | Description                                              |
| ----------------- | ------------------ | -------------- | -------------------------------------------------------- |
| `id`              | serial (PK)        | PRIMARY KEY    | Auto-increment ID                                        |
| `type`            | enum               | NOT NULL       | One of: `PILES`, `PLINTH`, `RCC`, `FINISHING`, `PARKING` |
| `isActive`        | boolean            | DEFAULT true   | Active flag                                              |
| `isCompleted`     | boolean            | DEFAULT false  | Completion flag                                          |
| `startDate`       | timestamp          | NULLABLE       | Phase start date                                         |
| `endDate`         | timestamp          | NULLABLE       | Phase end date                                           |
| `siteId`          | int (FK → site.id) | CASCADE DELETE | Parent site                                              |
| `totalPileCount`  | int                | NULLABLE       | Total piles in this phase (only for PILES type)          |
| `createdAt`       | timestamp          | AUTO           | Created                                                  |
| `updatedAt`       | timestamp          | AUTO           | Updated                                                  |
| `createdByUserId` | int (FK → user.id) | NULLABLE       | Creator                                                  |
| `updatedByUserId` | int (FK → user.id) | NULLABLE       | Updater                                                  |

**Relations:** `phase.site` → `Site` (ManyToOne), `phase.piles` → `Pile[]` (OneToMany)

**PhaseType Enum Values:** `PILES`, `PLINTH`, `RCC`, `FINISHING`, `PARKING`

### 5.6 `pile` Table

| Column               | Type                | Constraints       | Description                                             |
| -------------------- | ------------------- | ----------------- | ------------------------------------------------------- |
| `id`                 | serial (PK)         | PRIMARY KEY       | Auto-increment ID                                       |
| `pileNumber`         | varchar             | NULLABLE          | Manual pile number (e.g., 1A, P2, 12B)                  |
| `diameter`           | decimal(10,2)       | NULLABLE          | Pile diameter                                           |
| `groundLevel`        | decimal(10,2)       | NULLABLE          | Ground level reading                                    |
| `cutOffLevel`        | decimal(10,2)       | NULLABLE          | Cut-off level                                           |
| `linerTopLevel`      | decimal(10,2)       | NULLABLE          | Liner top level                                         |
| `location`           | varchar             | NULLABLE          | Pile location on site                                   |
| `integrityStatus`    | enum                | NULLABLE          | One of: `OK`, `SOFT_TOE`, `OTHER`                       |
| `cube7DayStatus`     | text                | NULLABLE          | 7-day cube test result (free text)                      |
| `cube28DayStatus`    | text                | NULLABLE          | 28-day cube test result (free text)                     |
| `eccentricityStatus` | enum                | NULLABLE          | One of: `OK`, `0 - 50mm`, `50 - 100mm`, `100mm & Above` |
| `siteId`             | int (FK → site.id)  | CASCADE DELETE    | Parent site                                             |
| `phaseId`            | int (FK → phase.id) | CASCADE DELETE    | Parent phase                                            |
| `status`             | enum                | DEFAULT `PENDING` | One of: `PENDING`, `IN_PROGRESS`, `COMPLETED`           |
| `isActive`           | boolean             | DEFAULT true      | Active flag                                             |
| `createdAt`          | timestamp           | AUTO              | Created                                                 |
| `updatedAt`          | timestamp           | AUTO              | Updated                                                 |
| `createdByUserId`    | int (FK → user.id)  | NULLABLE          | Creator                                                 |
| `updatedByUserId`    | int (FK → user.id)  | NULLABLE          | Updater                                                 |

**Relations:** `pile.phase` → `Phase`, `pile.site` → `Site`, `pile.executionReport` → `PileExecutionReport` (OneToOne)

**Enums:**

- `PileStatus`: `PENDING`, `IN_PROGRESS`, `COMPLETED`
- `IntegrityStatus`: `OK`, `SOFT_TOE`, `OTHER`
- `EccentricityStatus`: `OK`, `0 - 50mm`, `50 - 100mm`, `100mm & Above`

### 5.7 `pile_execution_report` Table

| Column                | Type               | Constraints              | Description                     |
| --------------------- | ------------------ | ------------------------ | ------------------------------- |
| `id`                  | serial (PK)        | PRIMARY KEY              | Auto-increment ID               |
| `pileId`              | int (FK → pile.id) | UNIQUE, CASCADE DELETE   | 1:1 with Pile                   |
| `reportDate`          | date               | NULLABLE                 | Date of the report              |
| `concreteGrade`       | varchar            | NULLABLE                 | Concrete grade (e.g., M25)      |
| `theoreticalQuantity` | decimal(10,2)      | NULLABLE                 | Theoretical concrete qty        |
| `actualQuantity`      | decimal(10,2)      | NULLABLE                 | Actual concrete qty             |
| `tremieLength`        | decimal(10,2)      | NULLABLE                 | Tremie pipe length              |
| `pourStartTime`       | timestamp          | NULLABLE                 | Concrete pour start time        |
| `pourEndTime`         | timestamp          | NULLABLE                 | Concrete pour end time          |
| `rmcSupplierName`     | varchar            | NULLABLE                 | RMC supplier name               |
| `boringDate`          | date               | NULLABLE                 | Boring date                     |
| `totalCageWeight`     | decimal(12,2)      | NULLABLE                 | Total reinforcement cage weight |
| `msLinerLength`       | decimal(10,2)      | NULLABLE                 | MS liner length                 |
| `status`              | enum               | DEFAULT `DRAFT`, INDEXED | `DRAFT` or `SUBMITTED`          |
| `isLocked`            | boolean            | DEFAULT false            | Lock after submission           |
| `submittedAt`         | timestamp          | NULLABLE                 | Submission timestamp            |
| `submittedByUserId`   | int (FK → user.id) | NULLABLE                 | Submitter                       |
| `createdByUserId`     | int (FK → user.id) | NULLABLE                 | Creator                         |
| `updatedByUserId`     | int (FK → user.id) | NULLABLE                 | Updater                         |
| `createdAt`           | timestamp          | AUTO                     | Created                         |
| `updatedAt`           | timestamp          | AUTO                     | Updated                         |

**Relations:** `report.pile` → `Pile` (OneToOne), `report.boringLogs` → `BoringLog[]` (cascade, orphanedRowAction: delete), `report.reinforcementEntries` → `ReinforcementEntry[]` (cascade, orphanedRowAction: delete)

**ReportStatus Enum:** `DRAFT`, `SUBMITTED`

### 5.8 `boring_log` Table

| Column     | Type                                | Constraints    | Description          |
| ---------- | ----------------------------------- | -------------- | -------------------- |
| `id`       | serial (PK)                         | PRIMARY KEY    | Auto-increment ID    |
| `reportId` | int (FK → pile_execution_report.id) | CASCADE DELETE | Parent report        |
| `fromTime` | timestamp                           | NOT NULL       | Start time           |
| `toTime`   | timestamp                           | NOT NULL       | End time             |
| `depth`    | decimal(8,2)                        | NULLABLE       | Boring depth         |
| `toolType` | varchar                             | NULLABLE       | Tool used            |
| `activity` | varchar                             | NULLABLE       | Activity description |
| `strata`   | varchar                             | NULLABLE       | Soil strata type     |
| `remark`   | varchar                             | NULLABLE       | Remarks              |

### 5.9 `reinforcement_entry` Table

| Column           | Type                                | Constraints    | Description                |
| ---------------- | ----------------------------------- | -------------- | -------------------------- |
| `id`             | serial (PK)                         | PRIMARY KEY    | Auto-increment ID          |
| `reportId`       | int (FK → pile_execution_report.id) | CASCADE DELETE | Parent report              |
| `barShape`       | varchar                             | NOT NULL       | Shape of reinforcement bar |
| `barDiameter`    | decimal(6,2)                        | NOT NULL       | Bar diameter               |
| `numberOfBars`   | int                                 | NOT NULL       | Number of bars             |
| `length`         | decimal(8,2)                        | NOT NULL       | Length of each bar         |
| `totalLengthRmt` | decimal(10,2)                       | NOT NULL       | Total running meters       |
| `weightPerRmt`   | decimal(10,3)                       | NOT NULL       | Weight per running meter   |
| `totalWeight`    | decimal(12,2)                       | NOT NULL       | Total weight               |

### 5.10 `attachment` Table

| Column             | Type                | Constraints              | Description                 |
| ------------------ | ------------------- | ------------------------ | --------------------------- |
| `id`               | serial (PK)         | PRIMARY KEY              | Auto-increment ID           |
| `siteId`           | int (FK → site.id)  | NOT NULL, CASCADE DELETE | Parent site                 |
| `phaseId`          | int (FK → phase.id) | NULLABLE, CASCADE DELETE | Optional phase              |
| `pileId`           | int (FK → pile.id)  | NULLABLE, CASCADE DELETE | Optional pile               |
| `type`             | enum                | NOT NULL                 | Attachment type (see below) |
| `originalFileName` | varchar             | NOT NULL                 | Original file name          |
| `storageKey`       | varchar             | NOT NULL                 | R2 object key               |
| `mimeType`         | varchar             | NOT NULL                 | File MIME type              |
| `fileSize`         | int                 | NOT NULL                 | File size in bytes          |
| `version`          | int                 | DEFAULT 1                | File version                |
| `isPublic`         | boolean             | DEFAULT false            | Public access flag          |
| `isDeleted`        | boolean             | DEFAULT false            | Soft-delete flag            |
| `uploadedById`     | int (FK → user.id)  | —                        | Uploader                    |
| `deletedById`      | int (FK → user.id)  | NULLABLE                 | Who deleted                 |
| `deletedAt`        | date                | NULLABLE                 | Deletion timestamp          |
| `createdAt`        | timestamp           | AUTO                     | Created                     |
| `updatedAt`        | timestamp           | AUTO                     | Updated                     |

**AttachmentType Enum:** `DRAWING`, `CUBE_7_DAY`, `CUBE_28_DAY`, `INTEGRITY_TEST`, `ECCENTRICITY_CHECK`, `PILE_READING`, `OTHER`

---

## 6. API Endpoints

> **Base URL:** `http://localhost:3000`
> **Auth:** All endpoints require JWT `Authorization: Bearer <token>` unless marked 🔓 (public).

### 6.1 Auth (`/auth`)

| Method | Endpoint      | Auth      | Roles | Description                                            |
| ------ | ------------- | --------- | ----- | ------------------------------------------------------ |
| POST   | `/auth/login` | 🔓 Public | All   | Login with email/password → returns `{ access_token }` |

### 6.2 Users (`/users`)

| Method | Endpoint                    | Auth | Roles              | Description                                  | Frontend Usage              |
| ------ | --------------------------- | ---- | ------------------ | -------------------------------------------- | --------------------------- |
| GET    | `/users`                    | 🔒   | SUPER_ADMIN, ADMIN | Get all users                                | ✅ UsersManagement          |
| POST   | `/users`                    | 🔒   | SUPER_ADMIN        | Create new user                              | ✅ UsersManagement          |
| GET    | `/users/assignable`         | 🔒   | SUPER_ADMIN, ADMIN | Get users eligible for site assignment       | ✅ Dashboard (assign modal) |
| GET    | `/users/me`                 | 🔒   | All                | Get current user's profile details           | ✅ Dashboard (role display) |
| PATCH  | `/users/me/password`        | 🔒   | All                | Change user's own password                   | ✅ Profile, ChangePassword  |
| PATCH  | `/users/:id`                | 🔒   | SUPER_ADMIN, ADMIN | Update user name and email                   | ✅ UsersManagement          |
| PATCH  | `/users/:id/role`           | 🔒   | SUPER_ADMIN, ADMIN | Change user's role                           | ✅ UsersManagement          |
| PATCH  | `/users/:id/activate`       | 🔒   | SUPER_ADMIN, ADMIN | Activate user                                | ✅ UsersManagement          |
| PATCH  | `/users/:id/deactivate`     | 🔒   | SUPER_ADMIN, ADMIN | Deactivate user                              | ✅ UsersManagement          |
| PATCH  | `/users/:id/reset-password` | 🔒   | SUPER_ADMIN, ADMIN | Admin resets user's password                 | ✅ UsersManagement          |

### 6.3 Sites (`/sites`)

| Method | Endpoint                        | Auth | Roles              | Description                                | Frontend Usage              |
| ------ | ------------------------------- | ---- | ------------------ | ------------------------------------------ | --------------------------- |
| POST   | `/sites`                        | 🔒   | SUPER_ADMIN, ADMIN | Create a new site                          | ✅ Dashboard (create modal) |
| GET    | `/sites`                        | 🔒   | All                | Get active sites (filtered by role)        | ✅ Dashboard                |
| GET    | `/sites/:id`                    | 🔒   | All                | Get site details w/ phases                 | ✅ SiteDetail               |
| POST   | `/sites/:siteId/assign/:userId` | 🔒   | SUPER_ADMIN, ADMIN | Assign an engineer to a site               | ✅ Dashboard (assign modal) |
| DELETE | `/sites/:siteId/assign/:userId` | 🔒   | SUPER_ADMIN, ADMIN | Remove an engineer from a site             | ✅ Dashboard (unassign chip)|
| PATCH  | `/sites/:id/delete`             | 🔒   | SUPER_ADMIN, ADMIN | Soft delete site (isActive=false)          | ✅ Dashboard                |
| PATCH  | `/sites/:id/restore`            | 🔒   | SUPER_ADMIN, ADMIN | Restore soft-deleted site                  | ✅ Dashboard                |
| DELETE | `/sites/:id`                    | 🔒   | SUPER_ADMIN        | Hard delete site (permanent)               | ✅ Dashboard                |

### 6.4 Phases (`/phases`)

| Method | Endpoint                  | Auth | Roles       | Description                                       | Frontend Usage   |
| ------ | ------------------------- | ---- | ----------- | ------------------------------------------------- | ---------------- |
| GET    | `/phases/site/:siteId`    | 🔒   | All         | Get all phases for a site                         | ✅ SiteDetails   |
| PATCH  | `/phases/:id`             | 🔒   | All         | Update phase (action-based: e.g., start/complete) | ✅ SiteDetails   |
| POST   | `/phases/:id/start-piles` | 🔒   | All         | Start pile phase with totalPileCount              | ✅ SiteDetails   |
| POST   | `/phases/repair`          | 🔒   | SUPER_ADMIN | Repair/create missing phases for all sites        | ❌ Admin utility |

### 6.5 Piles (`/piles`)

| Method | Endpoint                  | Auth | Roles | Description                                               | Frontend Usage         |
| ------ | ------------------------- | ---- | ----- | --------------------------------------------------------- | ---------------------- |
| POST   | `/piles/by-site/:phaseId` | 🔒   | All   | Create new pile under a phase                             | ✅ PilesPage           |
| GET    | `/piles/by-site/:siteId`  | 🔒   | All   | Get all piles for a site                                  | ✅ PilesPage           |
| PATCH  | `/piles/number/:pileId`   | 🔒   | All   | Update pile number                                        | ✅ PilesPage (PileRow) |
| PATCH  | `/piles/:pileId/status`   | 🔒   | All   | Update pile test statuses (integrity, cube, eccentricity) | ✅ PilesPage (PileRow) |

### 6.6 Pile Report (`/piles/:pileId/report`)

| Method | Endpoint                       | Auth | Roles | Description                                           | Frontend Usage                |
| ------ | ------------------------------ | ---- | ----- | ----------------------------------------------------- | ----------------------------- |
| GET    | `/piles/:pileId/report`        | 🔒   | All   | Get or auto-create execution report for a pile        | ✅ PileReportPage             |
| PATCH  | `/piles/:pileId/report`        | 🔒   | All   | Update report (with pile, boring logs, reinforcement) | ✅ PileReportPage (auto-save) |
| POST   | `/piles/:pileId/report/submit` | 🔒   | All   | Submit and lock the report                            | ✅ PileReportPage             |

### 6.7 Attachments (`/attachments`)

| Method | Endpoint                                    | Auth | Roles       | Description                                                             | Frontend Usage             |
| ------ | ------------------------------------------- | ---- | ----------- | ----------------------------------------------------------------------- | -------------------------- |
| POST   | `/attachments/upload`                       | 🔒   | All         | Upload file (multipart: file + siteId + optional phaseId/pileId + type) | ✅ UploadAttachmentsButton |
| GET    | `/attachments/:id`                          | 🔒   | All         | Get signed URL for an attachment                                        | ✅ PilesPage               |
| DELETE | `/attachments/:id`                          | 🔒   | All         | Soft-delete an attachment                                               | ✅ PilesPage               |
| DELETE | `/attachments/permanent/:id`                | 🔒   | SUPER_ADMIN | Permanently delete from R2 + DB                                         | ❌ Not used in UI          |
| GET    | `/attachments/by-phase/:phaseId/type/:type` | 🔒   | All         | Get attachments by phase and type                                       | ✅ PilesPage (drawings)    |
| GET    | `/attachments/by-pile/:pileId`              | 🔒   | All         | Get all attachments for a pile                                          | ✅ PilesPage               |
| GET    | `/attachments/by-pile/:pileId/type/:type`   | 🔒   | All         | Get attachments for a pile filtered by type                             | ✅ PilesPage               |

### 6.8 Storage (`/storage`) — Low-level R2 Testing

| Method | Endpoint               | Auth      | Roles | Description               | Frontend Usage  |
| ------ | ---------------------- | --------- | ----- | ------------------------- | --------------- |
| POST   | `/storage/upload`      | 🔒        | All   | Direct file upload to R2  | ❌ Testing only |
| GET    | `/storage/view/:key`   | 🔓 Public | All   | Get signed URL for R2 key | ❌ Testing only |
| POST   | `/storage/delete/:key` | 🔒        | All   | Delete file from R2       | ❌ Testing only |

---

## 7. Frontend (Web) Architecture

### 7.1 Routing

| Route                                                        | Page Component   | Description                                             |
| ------------------------------------------------------------ | ---------------- | ------------------------------------------------------- |
| `/`                                                          | `Login`          | Email/password login form                               |
| `/change-password`                                           | `ChangePassword` | Forced password change overlay                          |
| `/profile`                                                   | `Profile`        | Personal info and self-serve password change            |
| `/users`                                                     | `UsersManagement`| Admins managing users (create, edit, status, roles)     |
| `/dashboard`                                                 | `Dashboard`      | Sites list, create site, assign engineers, manage sites |
| `/dashboard/site/:siteId/phase`                              | `SiteDetail`     | View phases for a site, start pile phase                |
| `/dashboard/site/:siteId/phase/:phaseId/piles`               | `PilesPage`      | View/manage piles, status updates, attachments          |
| `/dashboard/site/:siteId/phase/:phaseId/pile/:pileId/report` | `PileReportPage` | Pile execution report form                              |

All routes except `/` are wrapped in `<ProtectedRoute>` which checks for JWT token in `localStorage` and intercepts `mustChangePassword=true`.

### 7.2 Pages

| Page               | Key Features                                                                                                                                                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Login**          | Email + password form → calls `POST /auth/login` → stores token in `localStorage` → redirects to `/dashboard`                                                                                                                        |
| **ChangePassword** | Blocks dashboard access and forces password update.                                                                                                                                                                                  |
| **Profile**        | View personal details + update password voluntarily.                                                                                                                                                                                 |
| **UsersManagement**| Full user CRUD, role editing, activation/deactivation toggles, and admin password reset. Allowed for SUPER_ADMIN/ADMIN only.                                                                                                         |
| **Dashboard**      | Lists active/inactive sites, create site dialog, assign engineers modal, soft/hard delete actions. Shows user role from `/users/me`                                                                                                  |
| **SiteDetail**     | Shows all 5 phases for a site. Can start pile phase (with pile count). Navigate to piles page                                                                                                                                        |
| **PilesPage**      | Lists all piles, add pile, edit pile number, set integrity/eccentricity/cube statuses via dropdowns. Upload attachments per pile. View/download drawings per phase                                                                   |
| **PileReportPage** | Full execution report form with: Header (structural data), Concrete section, Boring log table (add/remove rows), Reinforcement table (add/remove rows with auto-calculated weights). Uses `useAutoSave` hook for debounced auto-save |

### 7.3 Components

| Component                 | Location                  | Purpose                                                                     |
| ------------------------- | ------------------------- | --------------------------------------------------------------------------- |
| `ProtectedRoute`          | `components/`             | Token-based route guard                                                     |
| `BackButton`              | `components/common/`      | Navigation back button                                                      |
| `UploadAttachmentsButton` | `components/common/`      | File upload button with type selector                                       |
| `PileRow`                 | `components/piles/`       | Individual pile row with editable fields and status dropdowns               |
| `HeaderSection`           | `components/pile-report/` | Report header — pile structural data (diameter, levels, location, statuses) |
| `ConcreteSection`         | `components/pile-report/` | Concrete grade, quantities, tremie length, pour times, RMC supplier         |
| `BoringTable`             | `components/pile-report/` | Dynamic boring log entries table (add/remove rows)                          |
| `ReinforcementTable`      | `components/pile-report/` | Dynamic reinforcement entries table with auto-calculated fields             |
| `StatusBar`               | `components/pile-report/` | Displays autosave status (idle/saving/saved/error)                          |

### 7.4 Hooks

| Hook          | Purpose                                                                                                                                  |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `useAutoSave` | Debounced auto-save that sends data to API after 1.5s of inactivity. Supports abort controller, duplicate detection, and status tracking |

### 7.5 Utilities

| Utility                   | Purpose                                                                         |
| ------------------------- | ------------------------------------------------------------------------------- |
| `api/axios.ts`            | Axios instance with `VITE_BACKEND_URL` baseURL and JWT bearer token interceptor |
| `utils/attachmentType.ts` | `AttachmentType` const enum mirroring backend enum                              |
| `utils/statusEnums.ts`    | `IntegrityStatus` and `EccentricityStatus` const enums mirroring backend enums  |
| `utils/dateFormatting.ts` | ISO ↔ datetime-local conversion, time extraction, date+time combining           |
| `utils/debounce.ts`       | Generic debounce function                                                       |

---

## 8. API ↔ Frontend Mapping

### APIs Currently Used by Frontend

| API Endpoint                                    | Frontend Location                        | When Called                        |
| ----------------------------------------------- | ---------------------------------------- | ---------------------------------- |
| `POST /auth/login`                              | `Login.tsx`                              | On form submit                     |
| `GET /users/me`                                 | `Dashboard.tsx`, `Profile.tsx`           | On mount (display user role/info)  |
| `GET /users/assignable`                         | `Dashboard.tsx`                          | When opening assign engineer modal |
| `GET /users`                                    | `UsersManagement.tsx`                    | On mount (list users)              |
| `POST /users`                                   | `UsersManagement.tsx`                    | Create user form                   |
| `PATCH /users/me/password`                      | `Profile.tsx`, `ChangePassword.tsx`      | Change password forms              |
| `PATCH /users/:id`                              | `UsersManagement.tsx`                    | Edit user name/email               |
| `PATCH /users/:id/role`                         | `UsersManagement.tsx`                    | Update user role                   |
| `PATCH /users/:id/activate`                     | `UsersManagement.tsx`                    | Activate user toggle               |
| `PATCH /users/:id/deactivate`                   | `UsersManagement.tsx`                    | Deactivate user toggle             |
| `PATCH /users/:id/reset-password`               | `UsersManagement.tsx`                    | Admin reset password form          |
| `POST /sites`                                   | `Dashboard.tsx`                          | Create site dialog                 |
| `GET /sites`                                    | `Dashboard.tsx`                          | On mount (list sites)              |
| `GET /sites/:id`                                | `SiteDetails.tsx`                        | On mount (site info)               |
| `POST /sites/:siteId/assign/:userId`            | `Dashboard.tsx`                          | Assinging user button              |
| `DELETE /sites/:siteId/assign/:userId`          | `Dashboard.tsx`                          | Unassign user chip button          |
| `PATCH /sites/:id/delete`                       | `Dashboard.tsx`                          | Trash icon (soft delete)           |
| `PATCH /sites/:id/restore`                      | `Dashboard.tsx`                          | Restore icon                       |
| `DELETE /sites/:id`                             | `Dashboard.tsx`                          | Trash icon (hard delete)           |
| `GET /phases/site/:siteId`                      | `SiteDetails.tsx`                        | On mount (list phases)             |
| `PATCH /phases/:id`                             | `SiteDetails.tsx`                        | Phase action buttons               |
| `POST /phases/:id/start-piles`                  | `SiteDetails.tsx`                        | Start pile phase                   |
| `POST /piles/by-site/:phaseId`                  | `PilesPage.tsx`                          | Add pile button                    |
| `GET /piles/by-site/:siteId`                    | `PilesPage.tsx`                          | On mount (list piles)              |
| `PATCH /piles/number/:pileId`                   | `PilesPage.tsx` → `PileRow.tsx`          | Edit pile number                   |
| `PATCH /piles/:pileId/status`                   | `PilesPage.tsx` → `PileRow.tsx`          | Update test statuses               |
| `GET /piles/:pileId/report`                     | `PileReportPage.tsx`                     | On mount (load/create report)      |
| `PATCH /piles/:pileId/report`                   | `PileReportPage.tsx` (via `useAutoSave`) | Auto-save (debounced 1.5s)         |
| `POST /piles/:pileId/report/submit`             | `PileReportPage.tsx`                     | Submit button                      |
| `POST /attachments/upload`                      | `UploadAttachmentsButton.tsx`            | File upload                        |
| `GET /attachments/:id`                          | `PilesPage.tsx`                          | View/download attachment           |
| `DELETE /attachments/:id`                       | `PilesPage.tsx`                          | Delete attachment                  |
| `GET /attachments/by-phase/:phaseId/type/:type` | `PilesPage.tsx`                          | Load phase drawings                |
| `GET /attachments/by-pile/:pileId`              | `PilesPage.tsx`                          | Load pile attachments              |
| `GET /attachments/by-pile/:pileId/type/:type`   | `PilesPage.tsx`                          | Load filtered pile attachments     |

### APIs NOT Used by Frontend

| API Endpoint                        | Reason                                      |
| ----------------------------------- | ------------------------------------------- |
| `GET /`                             | Health check endpoint only                  |
| `DELETE /attachments/permanent/:id` | Super Admin only, no UI exposed             |
| `POST /storage/upload`              | R2 testing endpoint, not for production use |
| `GET /storage/view/:key`            | R2 testing endpoint                         |
| `POST /storage/delete/:key`         | R2 testing endpoint                         |
| `POST /phases/repair`               | Admin utility for data repair, no UI        |

---

## 9. Authentication & Authorization

### Authentication Flow

1. User submits email + password to `POST /auth/login`
2. `AuthService` validates credentials using bcrypt comparison
3. JWT token signed with `SECRETKEY` containing: `{ sub: userId, email, role }`
4. Token returned as `{ access_token: "..." }`
5. Frontend stores token in `localStorage("token")`
6. Axios interceptor attaches `Authorization: Bearer <token>` to all API requests

### Authorization

- **JwtAuthGuard** (global): All routes require valid JWT unless decorated with `@Public()`
- **RolesGuard** (global): If route has `@Roles('SUPER_ADMIN', 'ADMIN')`, only those roles can access
- **No roles decorator** → any authenticated user can access

### Roles

| Role          | Permissions                                                                 |
| ------------- | --------------------------------------------------------------------------- |
| `SUPER_ADMIN` | Full access — create/delete sites, manage users, hard-delete, repair phases |
| `ADMIN`       | Create sites, assign engineers, soft-delete sites, manage phases            |
| `ENGINEER`    | View assigned sites, manage piles, fill reports, upload attachments         |

---

## 10. File Storage (Cloudflare R2)

- **Provider:** Cloudflare R2 (S3-compatible API)
- **SDK:** `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner`
- **File key format:** `{uuid}-{originalFilename}`
- **Access:** Signed URLs with configurable expiry (default: 1 hour)
- **Operations:** Upload (PutObject), Delete (DeleteObject), Signed URL (GetObject presigned)

### Upload Flow

1. Frontend sends multipart form data to `POST /attachments/upload`
2. `AttachmentsService` calls `R2Service.uploadFile()` to store file in R2
3. Metadata (key, filename, mime, size, type) saved to `attachment` table
4. Returns attachment record

---

## 11. Environment Variables

### Backend (`apps/api/.env`)

| Variable        | Description                      | Example                             |
| --------------- | -------------------------------- | ----------------------------------- |
| `DB_HOST`       | PostgreSQL host                  | `localhost`                         |
| `DB_PORT`       | PostgreSQL port                  | `5432`                              |
| `DB_USER`       | Database username                | `site_user`                         |
| `DB_PASS`       | Database password                | `site_pass`                         |
| `DB_NAME`       | Database name                    | `site_db`                           |
| `DATABASE_URL`  | Alternative: full connection URL | `postgres://user:pass@host:5432/db` |
| `SECRETKEY`     | JWT signing secret               | `your-secret-key`                   |
| `CORS_ORIGIN`   | Allowed CORS origin              | `http://localhost:5173`             |
| `R2_ACCOUNT_ID` | Cloudflare R2 account ID         | —                                   |
| `R2_ACCESS_KEY` | R2 access key                    | —                                   |
| `R2_SECRET_KEY` | R2 secret key                    | —                                   |
| `R2_BUCKET`     | R2 bucket name                   | —                                   |

### Frontend (`apps/web/.env`)

| Variable           | Description     | Example                 |
| ------------------ | --------------- | ----------------------- |
| `VITE_BACKEND_URL` | Backend API URL | `http://localhost:3000` |

---

## 12. Deployment Plan

| Aspect           | Plan                                                                              |
| ---------------- | --------------------------------------------------------------------------------- |
| **Purpose**      | Development / learning project                                                    |
| **Cost**         | Free tier services only                                                           |
| **Frontend**     | Vercel (free tier) with SPA rewrite                                               |
| **Backend**      | Not yet deployed (local dev only)                                                 |
| **Database**     | Local Docker (PostgreSQL 15), no cloud DB planned                                 |
| **File Storage** | Cloudflare R2 (free tier: 10 GB storage, 10M class A, 10M class B requests/month) |
| **Future Plans** | None — this is a development-only project                                         |

---

## 13. Seeded Data

On application startup (`AppModule.onModuleInit()`), the following data is auto-seeded if not present:

### Roles

- `SUPER_ADMIN`
- `ADMIN`
- `ENGINEER`

### Default Users

| Name          | Email                 | Password      | Role        | mustChangePassword |
| ------------- | --------------------- | ------------- | ----------- | ------------------ |
| Super Admin   | `superadmin@site.com` | `admin123`    | SUPER_ADMIN | `false`            |
| Test Engineer | `engineer@site.com`   | `engineer123` | ENGINEER    | `false`            |

---

## 14. Conventions & Patterns

### Backend Patterns

- **Soft-delete:** Uses `isActive` boolean (Sites, Users, Piles, Roles). Set to `false` on delete, filter by `isActive` on queries
- **Audit columns:** Most entities have `createdBy`, `updatedBy`, `createdAt`, `updatedAt`
- **CASCADE deletes:** Child records cascade-delete when parent is removed (Site → Phase → Pile → Report → BoringLog/Reinforcement)
- **DTO validation:** class-validator with whitelist mode (strips unknown properties, rejects non-whitelisted)
- **Orphaned row cleanup:** `orphanedRowAction: 'delete'` on BoringLog/ReinforcementEntry relations

### Frontend Patterns

- **Auto-save:** Reports use debounced auto-save (1.5s delay) via `useAutoSave` hook
- **Token auth:** JWT stored in `localStorage`, attached via Axios interceptor
- **Const enums:** Frontend mirrors backend enums using `as const` objects + type extraction
- **Date handling:** All date conversions between ISO ↔ input formats via `dateFormatting.ts`
- **UI framework:** Radix UI Themes for components + TailwindCSS for layout/styling

### How to Run Locally

```bash
# 1. Start PostgreSQL via Docker
cd site_manager
docker compose up -d

# 2. Start the API (NestJS) — runs on port 3000
cd apps/api
cp .env.example .env   # fill in values
npm run start:dev

# 3. Start the Frontend (Vite) — runs on port 5173
cd apps/web
cp .env.example .env   # set VITE_BACKEND_URL=http://localhost:3000
npm run dev
```

---

> ⚠️ **IMPORTANT:** This file must be updated whenever changes are made to the codebase, including:
>
> - Adding/modifying database entities or columns
> - Adding/modifying API endpoints
> - Adding/modifying frontend pages, components, or routes
> - Adding/modifying environment variables
> - Changing authentication or authorization logic
> - Modifying the tech stack or deployment configuration
