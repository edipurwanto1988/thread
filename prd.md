# PRODUCT REQUIREMENTS DOCUMENT (PRD)

# AI THREADS CONTENT GENERATOR & BUFFER SCHEDULER

## Version
1.0

## Project Overview

AI Threads Content Generator adalah aplikasi web yang memungkinkan pengguna menghasilkan konten Threads menggunakan berbagai model Large Language Model (LLM) melalui OpenRouter, mengelola draft konten, melakukan review/edit, serta menjadwalkan publikasi ke Threads melalui integrasi Buffer API.

Aplikasi ditujukan untuk content creator, digital marketer, social media specialist, personal branding consultant, UMKM, dan agency yang ingin mempercepat proses pembuatan konten media sosial berbasis AI.

---

# OBJECTIVES

## Business Goals

- Mempermudah pembuatan konten Threads menggunakan AI.
- Mendukung berbagai model LLM melalui OpenRouter.
- Menyediakan workflow Draft → Review → Approve → Schedule → Publish.
- Mendukung banyak akun Threads melalui Buffer.
- Mengurangi waktu produksi konten media sosial.

## Success Metrics

- Waktu pembuatan konten berkurang minimal 80%.
- Generate konten maksimal 30 detik.
- Tingkat keberhasilan publish > 99%.
- Mendukung minimal 10.000 draft konten.

---

# TARGET USERS

## Administrator

Dapat:

- Login
- Mengelola setting OpenRouter
- Mengelola setting Buffer
- Mengelola Prompt Template
- Generate konten
- Edit konten
- Approve konten
- Schedule konten
- Publish konten
- Melihat log aktivitas

---

# TECHNOLOGY STACK

## Frontend

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui

## Backend

- Next.js API Routes
- TypeScript

## Database

- Supabase PostgreSQL

## Authentication

- Supabase Auth

## Storage

- Supabase Storage

## AI Provider

- OpenRouter API

## Social Publishing

- Buffer API

## Deployment

- Docker
- VPS / CloudPanel
- Vercel (optional)

---

# SYSTEM FLOW

```text
User Login
      │
      ▼
Pilih Model LLM
      │
      ▼
Input Topik
      │
      ▼
Generate Konten via OpenRouter
      │
      ▼
Simpan Draft
      │
      ▼
Review / Edit
      │
      ▼
Approve
      │
      ▼
Schedule Publish
      │
      ▼
Send to Buffer
      │
      ▼
Publish to Threads
      │
      ▼
Update Status & Logs
```

# MODULES

## 1. Authentication Module

### Features

- Login
- Logout
- Reset Password
- Session Management

### Acceptance Criteria

- User dapat login menggunakan email dan password.
- Session tersimpan aman.
- User dapat logout kapan saja.
- Route dashboard dilindungi authentication.

---

## 2. OpenRouter Settings Module

### Purpose

Mengelola model AI yang digunakan untuk generate konten.

### Fields

| Field | Type |
|---------|---------|
| id | uuid |
| provider | string |
| model_name | string |
| api_key | encrypted text |
| max_tokens | integer |
| temperature | decimal |
| active | boolean |

### Example Models

- openai/gpt-5
- anthropic/claude-opus
- google/gemini-2.5-pro
- meta-llama/llama-4
- deepseek/deepseek-chat

### Features

- Add model
- Edit model
- Delete model
- Select default model
- Test connection

---

## 3. Buffer Integration Module

### Purpose

Menghubungkan akun Buffer dan akun Threads.

### Fields

| Field | Type |
|---------|---------|
| id | uuid |
| profile_id | string |
| profile_name | string |
| access_token | encrypted text |
| profile_type | string |
| active | boolean |

### Features

- Save access token
- Test connection
- Fetch connected social accounts
- Select Threads account
- Multi-account support

---

## 4. Prompt Template Module

### Purpose

Menyimpan prompt yang dapat digunakan berulang kali.

### Fields

| Field | Type |
|---------|---------|
| id | uuid |
| title | string |
| category | string |
| prompt | text |
| active | boolean |

### Features

- Create prompt
- Update prompt
- Delete prompt
- Duplicate prompt
- Set default prompt

### Example Categories

- Personal Branding
- Educational Content
- Marketing Content
- Product Promotion
- Technology News
- Business Tips

---

## 5. AI Content Generator Module

### Purpose

Menghasilkan draft konten Threads menggunakan OpenRouter.

### Inputs

| Field | Type |
|---------|---------|
| topic | text |
| target_audience | string |
| writing_style | string |
| language | string |
| prompt_template | uuid |
| total_posts | integer |
| selected_model | string |

### Outputs

Contoh:

Post #1

Post #2

Post #3

Post #4

Post #5

### Features

- Generate content
- Regenerate content
- Save draft
- Manual editing
- Multiple output generation

---

## 6. Draft Management Module

### Status

- Draft
- Approved
- Scheduled
- Published
- Failed

### Features

- View drafts
- Search drafts
- Filter by status
- Bulk delete
- Bulk approve
- Bulk schedule
- Duplicate draft

---

## 7. Schedule Management Module

### Purpose

Mengatur jadwal publikasi konten.

### Fields

| Field | Type |
|---------|---------|
| post_id | uuid |
| publish_at | timestamp |
| profile_id | string |

### Features

- Publish now
- Schedule post
- Cancel schedule
- Reschedule
- Queue management

### Workflow

```text
Draft
 ↓
Approved
 ↓
Scheduled
 ↓
Send to Buffer
 ↓
Published
```

## 8. Publishing Service Module

### Endpoint

```http
POST /api/publish
```

### Process

```text
Validate Post
      │
      ▼
Validate Buffer Account
      │
      ▼
Send to Buffer API
      │
      ▼
Receive Response
      │
      ▼
Update Status
      │
      ▼
Save Activity Log
```

### Error Handling

- Invalid Access Token
- Buffer API Error
- Rate Limit Error
- Network Error
- Content Too Long
- Unknown Error

---

## 9. Activity Log Module

### Purpose

Mencatat seluruh aktivitas sistem.

### Activities

- Login
- Logout
- Generate Content
- Edit Content
- Approve Content
- Schedule Content
- Publish Content
- Delete Content

### Fields

| Field | Type |
|---------|---------|
| id | uuid |
| action | string |
| user_id | uuid |
| detail | text |
| created_at | timestamp |

---

# DASHBOARD

## Statistics Cards

- Total Draft
- Total Approved
- Total Scheduled
- Total Published
- Total Failed

## Charts

- Generated Content Per Day
- Published Content Per Day
- Most Used AI Models
- Publish Success Rate

---

# DATABASE SCHEMA

## users

```sql
create table users (
    id uuid primary key,
    email varchar(255),
    name varchar(255),
    created_at timestamp default now()
);
```

## llm_settings

```sql
create table llm_settings (
    id uuid primary key,
    provider varchar(100),
    model_name varchar(255),
    api_key text,
    temperature numeric,
    max_tokens integer,
    active boolean default true,
    created_at timestamp default now()
);
```

## buffer_accounts

```sql
create table buffer_accounts (
    id uuid primary key,
    profile_id varchar(255),
    profile_name varchar(255),
    access_token text,
    active boolean default true,
    created_at timestamp default now()
);
```

## prompt_templates

```sql
create table prompt_templates (
    id uuid primary key,
    title varchar(255),
    category varchar(100),
    prompt text,
    active boolean default true,
    created_at timestamp default now()
);
```

## posts

```sql
create table posts (
    id uuid primary key,
    title varchar(255),
    topic text,
    content text,
    status varchar(50),
    model_name varchar(255),
    created_at timestamp default now(),
    updated_at timestamp default now()
);
```

## schedules

```sql
create table schedules (
    id uuid primary key,
    post_id uuid references posts(id),
    publish_at timestamp,
    status varchar(50),
    created_at timestamp default now()
);
```

## activity_logs

```sql
create table activity_logs (
    id uuid primary key,
    action varchar(255),
    detail text,
    created_at timestamp default now()
);
```

---

# INTERNAL API ENDPOINTS

## Generate Content

```http
POST /api/content/generate
```

Request:

```json
{
  "topic": "AI untuk mahasiswa",
  "language": "id",
  "style": "casual",
  "total_posts": 5,
  "model": "anthropic/claude-opus"
}
```

## Save Draft

```http
POST /api/content/save
```

## Approve Draft

```http
POST /api/content/approve
```

## Schedule Content

```http
POST /api/content/schedule
```

## Publish Now

```http
POST /api/content/publish
```

## Get Dashboard Stats

```http
GET /api/dashboard/stats
```

## Get Activity Logs

```http
GET /api/logs
```

---

# SECURITY REQUIREMENTS

- API key wajib dienkripsi.
- Gunakan environment variables.
- HTTPS only.
- Server-side validation.
- Rate limiting.
- Authentication middleware.
- Audit logging.
- CSRF protection.
- Secure cookies.

---

# PERFORMANCE REQUIREMENTS

- Dashboard load ≤ 3 detik.
- Generate content ≤ 30 detik.
- API response ≤ 2 detik (kecuali AI generation).
- Pagination pada seluruh tabel.
- Lazy loading pada dashboard.

---

# RESPONSIVE REQUIREMENTS

Harus mendukung:

- Desktop
- Tablet
- Mobile

---

# FUTURE ROADMAP (V2)

- Multi User
- Role Permission
- Content Calendar
- Team Collaboration
- AI Rewrite Content
- AI Hashtag Generator
- AI Reply Generator
- Instagram Integration
- Facebook Integration
- X (Twitter) Integration
- LinkedIn Integration
- Analytics Dashboard
- Content Performance Tracking
- Media Upload Support
- AI Image Generation

---

# DELIVERABLES FOR CODE AGENT

Code Agent wajib menghasilkan:

1. Next.js 15 App Router Project
2. TypeScript Strict Mode
3. Supabase Integration
4. Supabase Auth
5. OpenRouter Integration
6. Buffer API Integration
7. Dashboard UI
8. Authentication Module
9. Prompt Template CRUD
10. Content Generator Module
11. Draft Management Module
12. Schedule Management Module
13. Publishing Service Module
14. Activity Log Module
15. Responsive UI
16. SQL Migration Files
17. API Documentation
18. Docker Configuration
19. ESLint Configuration
20. Prettier Configuration
21. Environment Example (.env.example)
22. Production Ready Folder Structure
23. Error Handling Middleware
24. Unit Testing Setup
25. Clean Architecture Pattern
26. Repository Pattern
27. Service Layer Pattern
28. Dark Mode Support
29. Loading & Skeleton States
30. Toast Notification System