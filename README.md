# Engagement Tools

A TypeScript monorepo foundation for sales, engagement, and marketing tools.

## Repository layout

```text
apps/
  dashboard/   Next.js dashboard for users and administrators
  worker/      Durable background-job process powered by pg-boss
packages/
  database/    Prisma schema, migrations, and shared database client
```

## 1. Product overview

Engagement Tools is a workspace for researching social media profiles and preparing relevant engagement. Administrators manage users, assign profiles, and can review all activity. Normal users maintain a list of social profiles, run profile analysis, inspect fetched posts, and generate relevant comment suggestions with AI.

The core workflow is:

1. An administrator assigns a social profile to a user, or the user adds one.
2. The system fetches the profile and its recent posts through the appropriate social-platform integration.
3. The system analyzes the profile and stores normalized profile and post data.
4. The user reviews the profile analysis and selects individual posts.
5. AI analyzes the selected post and generates relevant comment suggestions.
6. The user reviews, edits, and copies a suggestion.
7. Administrators can review the profiles, analyses, generated comments, and user activity.

The system assists users with research and drafting. Automatic publishing is a separate capability and is not part of the currently defined workflow.

## 2. Product principles

- **Human review:** AI-generated comments are drafts and must be reviewed by a user.
- **Traceability:** Important user, admin, ingestion, and AI actions are recorded.
- **Access control:** Users only access profiles assigned to or added by them. Administrators can access all application data.
- **Provider isolation:** Social platforms and AI providers are accessed through adapters so they can be replaced or extended independently.
- **Asynchronous processing:** Profile synchronization and AI analysis run as background jobs.
- **Structured outputs:** External data and AI responses are normalized and validated before storage.
- **Extensibility:** New social platforms, analysis types, and engagement tools can be added without redesigning authentication or core ownership rules.

## 3. User types and permissions

### Administrator

Administrators control access and have visibility across the system. More than one administrator account may exist.

### Normal user

Normal users work with profiles assigned to them or added by them. Their private analysis history and engagement activity are not visible to other normal users.

### Permission matrix

| Capability                              | Administrator  | Normal user                      |
| --------------------------------------- | -------------- | -------------------------------- |
| Sign in and sign out                    | Yes            | Yes                              |
| Create, enable, disable, or reset users | Yes            | No                               |
| View all users and activity             | Yes            | No                               |
| Add a social profile                    | Yes            | Yes                              |
| Assign a profile to users               | Yes            | No                               |
| View a social profile                   | Any profile    | Assigned or self-added profiles  |
| Edit profile metadata                   | Any profile    | Self-added profile metadata      |
| Remove an assignment                    | Any assignment | Self-created assignment only     |
| Synchronize profile data and posts      | Any profile    | Assigned or self-added profiles  |
| View fetched posts                      | Any profile    | Assigned or self-added profiles  |
| Run profile analysis                    | Any profile    | Assigned or self-added profiles  |
| Run individual post analysis            | Any post       | Posts from an accessible profile |
| Generate comment suggestions            | Any post       | Posts from an accessible profile |
| View analysis history                   | All users      | Own runs only                    |
| Review system audit activity            | Yes            | No                               |
| Publish comments automatically          | No             | No                               |

An administrator-created assignment cannot be removed by the assigned user. Removing an assignment does not delete shared profile or post data.

## 4. Feature tracking table

### Status values

- `Existing`: already present in the repository.
- `Partial`: some supporting behavior exists, but the feature is incomplete.
- `Planned`: required but not yet implemented.
- `Future`: intentionally deferred.

### Priority values

- `P0`: required for the core product workflow.
- `P1`: important enhancement after the core workflow is reliable.
- `P2`: future expansion.

| ID          | Area                  | Feature                                    | Users  | Priority | Status   | Completion criteria                                                                                           |
| ----------- | --------------------- | ------------------------------------------ | ------ | -------- | -------- | ------------------------------------------------------------------------------------------------------------- |
| AUTH-01     | Authentication        | Admin and user login                       | All    | P0       | Existing | Active accounts reach their role-specific dashboard.                                                          |
| AUTH-02     | Authentication        | Database-backed session lifecycle          | All    | P0       | Partial  | Login, logout, sliding expiry, password-reset invalidation, and disabled-user invalidation work consistently. |
| AUTH-03     | Authentication        | Login protection                           | All    | P0       | Planned  | Rate limiting and generic authentication errors are enforced.                                                 |
| USER-01     | User management       | Create and list users                      | Admin  | P0       | Existing | Admin can create and list administrator and normal user accounts.                                             |
| USER-02     | User management       | Enable or disable users                    | Admin  | P0       | Partial  | Admin can change status in the interface and active sessions are invalidated when disabled.                   |
| USER-03     | User management       | Reset user password                        | Admin  | P0       | Existing | Admin can set a new password and all target-user sessions are invalidated.                                    |
| PROFILE-01  | Profiles              | Add a social profile                       | All    | P0       | Planned  | Platform, handle, canonical URL, display name, and notes can be saved.                                        |
| PROFILE-02  | Profiles              | Profile directory                          | All    | P0       | Planned  | Users see accessible profiles; admins can filter and inspect all profiles.                                    |
| PROFILE-03  | Profiles              | Assign profiles to users                   | Admin  | P0       | Planned  | Admin can assign and unassign a profile for one or more users.                                                |
| PROFILE-04  | Profiles              | Archive a profile                          | Admin  | P1       | Planned  | Archived profiles stop scheduled synchronization without losing history.                                      |
| SYNC-01     | Data ingestion        | Social-platform adapter interface          | System | P0       | Planned  | A platform-neutral interface can fetch profile details and recent posts.                                      |
| SYNC-02     | Data ingestion        | Fetch and normalize profile details        | All    | P0       | Planned  | A profile analysis fetches current metadata and stores a normalized snapshot.                                 |
| SYNC-03     | Data ingestion        | Fetch and normalize recent posts           | All    | P0       | Planned  | A profile analysis retrieves recent posts, deduplicates them, and stores normalized records.                  |
| SYNC-04     | Data ingestion        | Manual profile synchronization             | All    | P0       | Planned  | An authorized user can request a refresh and see its progress and result.                                     |
| SYNC-05     | Data ingestion        | Scheduled synchronization                  | System | P1       | Planned  | Active profiles refresh on a configurable schedule without duplicate jobs.                                    |
| SYNC-06     | Data ingestion        | Pagination and incremental synchronization | System | P1       | Planned  | Adapters use cursors/external IDs and avoid repeatedly processing unchanged posts.                            |
| ANALYSIS-01 | Profile analysis      | Profile summary                            | All    | P0       | Planned  | AI summarizes the profile, positioning, themes, audience, and posting patterns.                               |
| ANALYSIS-02 | Profile analysis      | Profile-level engagement insights          | All    | P0       | Planned  | AI identifies useful engagement themes and notable recent posts.                                              |
| ANALYSIS-03 | Post analysis         | Individual post insights                   | All    | P0       | Planned  | AI returns summary, topics, tone, audience, and engagement angles for a selected post.                        |
| COMMENT-01  | Comments              | Generate comment suggestions               | All    | P0       | Planned  | AI returns multiple relevant, distinct, validated comment drafts.                                             |
| COMMENT-02  | Comments              | Select tone or instruction                 | All    | P1       | Planned  | User can request a supported tone or provide a short drafting instruction.                                    |
| COMMENT-03  | Comments              | Edit and copy a suggestion                 | All    | P0       | Planned  | User can edit/copy a draft and the interaction is recorded.                                                   |
| COMMENT-04  | Comments              | Automatically publish a comment            | All    | P2       | Future   | Publishing requires explicit confirmation and an approved platform integration.                               |
| HISTORY-01  | History               | User analysis history                      | User   | P0       | Planned  | User can review their profile analyses, post analyses, and generated comments.                                |
| ADMIN-01    | Administration        | Global profile and assignment view         | Admin  | P0       | Planned  | Admin can see every profile, its assignments, sync state, and last analysis.                                  |
| ADMIN-02    | Administration        | User activity view                         | Admin  | P0       | Planned  | Admin can filter activity by user, action, entity, status, and date.                                          |
| ADMIN-03    | Administration        | Analysis inspection                        | Admin  | P0       | Planned  | Admin can open any profile or post analysis and inspect inputs, outputs, and metadata.                        |
| AUDIT-01    | Audit                 | Security event logging                     | Admin  | P0       | Partial  | Login, logout, user changes, and authorization-sensitive actions are logged.                                  |
| AUDIT-02    | Audit                 | Product event logging                      | Admin  | P0       | Planned  | Assignments, syncs, analyses, and comment interactions are logged.                                            |
| OPS-01      | Operations            | Dashboard health and readiness             | System | P0       | Partial  | Health reflects application and database readiness.                                                           |
| OPS-02      | Operations            | Worker health and readiness                | System | P0       | Partial  | Health reflects worker, database, and queue readiness.                                                        |
| OPS-03      | Operations            | Usage limits                               | System | P0       | Planned  | Per-user/provider limits and input-size limits are enforced server-side.                                      |
| OPS-04      | Operations            | Observability                              | Admin  | P1       | Planned  | Structured logs and metrics expose sync failures, AI failures, latency, and usage.                            |
| QUALITY-01  | Quality               | Automated test suite                       | System | P0       | Planned  | Critical authorization, synchronization, API, job, and AI-validation paths are covered.                       |
| PLATFORM-01 | Platform integrations | First supported social platform            | System | P0       | Planned  | Profile metadata and recent posts are fetched through an approved API or data provider.                       |
| PLATFORM-02 | Platform integrations | Additional social platforms                | System | P1       | Future   | Each new integration implements the common adapter contract.                                                  |
| ORG-01      | Organization          | Multiple workspaces                        | All    | P2       | Future   | Data and permissions are isolated by organization/workspace.                                                  |
| CAMPAIGN-01 | Engagement            | Lists, tags, and campaigns                 | All    | P2       | Future   | Profiles can be grouped into reusable engagement workflows.                                                   |
| VOICE-01    | Intelligence          | Brand or personal voice settings           | All    | P2       | Future   | Comment generation can use approved reusable writing guidance.                                                |

## 5. User journeys

### Normal user: add and analyze a profile

1. The user signs in and opens **My Profiles**.
2. The user adds a social profile using a profile URL, or opens one assigned by an administrator.
3. The user selects **Analyze Profile**.
4. The system creates a background synchronization job for the appropriate social platform.
5. The integration fetches profile information and recent posts, then normalizes and stores them.
6. AI generates a profile summary, main themes, likely audience, posting patterns, and engagement insights.
7. The user sees the completed profile analysis and the fetched posts.

### Normal user: analyze a post and prepare a comment

1. The user opens an analyzed profile and reviews its fetched posts.
2. The user selects a post.
3. The system analyzes the post and displays its summary, topics, tone, audience, and engagement angles.
4. The system generates multiple relevant comment suggestions.
5. The user reviews or edits a suggestion and copies it for use on the social platform.
6. The analysis and copy activity remain available in the user's history.

### Administrator: assign and monitor profiles

1. The administrator signs in and opens **Users**.
2. The administrator creates or selects a user.
3. The administrator searches for or adds a social profile and assigns it to the user.
4. The administrator can request profile synchronization or allow the user to initiate it.
5. The administrator opens **Activity** to review profiles added, synchronization runs, analyses, failures, and copied comments.
6. The administrator can inspect the stored profile/post snapshots and AI output for any user.

### System: synchronize a profile

1. An authorized request or schedule creates a unique profile-sync run.
2. The worker selects the adapter for the profile's platform.
3. The adapter retrieves profile metadata and recent posts using stored integration credentials.
4. The worker validates and converts provider-specific responses into the internal data model.
5. The database upserts the profile snapshot and posts using platform external IDs.
6. The worker analyzes new or changed data and stores a versioned profile analysis.
7. The run is marked successful or failed, and the initiating user can see its state.

## 6. System architecture

```text
Browser
  |
  v
Next.js Dashboard and API
  |-- authentication and authorization
  |-- user/admin interfaces
  |-- profile, analysis, and activity APIs
  |
  +---------------------> PostgreSQL / Prisma
  |                         |-- users and sessions
  |                         |-- profiles and assignments
  |                         |-- posts and snapshots
  |                         |-- sync and analysis runs
  |                         `-- audit and interactions
  |
  `---- enqueue jobs ----> pg-boss Worker
                            |-- profile synchronization
                            |-- profile analysis
                            `-- post/comment analysis
                                  |              |
                                  v              v
                         Social adapters     AI provider adapter
```

### Dashboard responsibilities

- Render role-specific user interfaces.
- Authenticate requests and authorize access to individual resources.
- Validate request payloads.
- Create synchronization and analysis runs.
- Enqueue long-running work.
- Expose run status and stored results.
- Record user and admin activity.

### Worker responsibilities

- Execute profile synchronization and AI jobs.
- Validate every job payload.
- Make handlers idempotent so retries are safe.
- Update run state consistently.
- Retry transient external-service failures with backoff.
- Store provider/model metadata and safe error details.
- Avoid logging credentials, tokens, or sensitive response data.

### Database responsibilities

- Store application users, sessions, permissions, and audit history.
- Preserve normalized social profile and post data.
- Preserve immutable snapshots used by historical analyses.
- Track synchronization and analysis state.
- Enforce uniqueness and ownership constraints.

### External integrations

Each social platform implements the same internal contract:

```ts
interface SocialPlatformAdapter {
  fetchProfile(input: ProfileLocator): Promise<NormalizedProfile>;
  fetchPosts(input: FetchPostsInput): Promise<FetchPostsResult>;
}
```

The exact API or data provider for each platform must be chosen after confirming authentication requirements, supported data, rate limits, cost, and platform terms. Scraping should not be treated as an interchangeable fallback without a legal and reliability review.

The AI provider should also sit behind an internal interface so model selection and fallback behavior do not leak into product routes or job handlers.

## 7. Proposed domain model

Keep the existing `User`, `Session`, and `AuditLog` models and add the following concepts.

### SocialProfile

- Platform, external profile ID, handle, canonical URL, display name, biography, avatar URL, and optional notes.
- Status, creator, latest synchronization timestamp, and timestamps.
- The canonical URL and platform external ID support duplicate detection.

### ProfileAssignment

- Profile, assigned user, assigning administrator/user, assignment source, and timestamp.
- A unique constraint prevents duplicate assignments for the same profile and user.

### ProfileSnapshot

- Profile, provider payload version, normalized metadata, raw-response reference if retained, and capture timestamp.
- Historical snapshots make changes in profile data traceable.

### SocialPost

- Profile, platform external ID, canonical post URL, author information, content, media metadata, engagement counters, published timestamp, and latest fetched timestamp.
- A unique constraint on platform and external ID makes synchronization idempotent.

### ProfileSyncRun

- Profile, requester, trigger (`MANUAL` or `SCHEDULED`), status, cursor, posts discovered/updated, safe error details, and timing data.

### AnalysisRun

- Analysis type (`PROFILE` or `POST`), target ID, requester, status, immutable input snapshot, structured output, provider, model, prompt version, token/cost metadata, safe error details, and timestamps.

### CommentInteraction

- Analysis run, user, suggestion index, action such as `COPIED`, optional edited text, and timestamp.
- Copying a draft does not imply that it was published.

### IntegrationCredential

- Platform/provider, encrypted credential reference, status, expiry, scopes, and timestamps.
- Prefer a managed secret store and keep raw credentials out of normal application queries and logs.

## 8. Processing and state models

### Profile synchronization

```text
QUEUED -> RUNNING -> SUCCEEDED
                  -> PARTIAL
                  -> FAILED
```

`PARTIAL` means usable profile data was stored but one or more pages/posts could not be fetched. A retry must upsert data rather than create duplicates.

### AI analysis

```text
QUEUED -> RUNNING -> SUCCEEDED
                  -> FAILED
```

Only validated structured output can enter `SUCCEEDED`. Failed runs retain the immutable input snapshot and a safe, user-facing error.

## 9. Suggested application routes

### User pages

- `/user` — overview, recent profiles, and recent activity.
- `/user/profiles` — assigned and self-added profiles.
- `/user/profiles/[id]` — profile analysis, synchronization state, and fetched posts.
- `/user/posts/[id]` — post analysis and comment suggestions.
- `/user/history` — profile and post analysis history.

### Administrator pages

- `/admin/users` — user management.
- `/admin/profiles` — all profiles, assignments, and synchronization states.
- `/admin/activity` — filterable all-user activity.
- `/admin/analyses/[id]` — analysis inputs, outputs, model metadata, and errors.

## 10. Suggested API surface

| Method and route                                     | Purpose                                                 |
| ---------------------------------------------------- | ------------------------------------------------------- |
| `GET /api/profiles`                                  | List profiles accessible to the caller.                 |
| `POST /api/profiles`                                 | Add a profile and create the caller's assignment.       |
| `GET /api/profiles/:id`                              | Read an authorized profile, analysis, and recent posts. |
| `PATCH /api/profiles/:id`                            | Edit allowed profile metadata.                          |
| `POST /api/profiles/:id/sync`                        | Create an idempotent profile synchronization run.       |
| `GET /api/profile-sync-runs/:id`                     | Read synchronization progress and results.              |
| `GET /api/posts/:id`                                 | Read an authorized fetched post.                        |
| `POST /api/posts/:id/analyses`                       | Create a post-analysis run.                             |
| `GET /api/analyses/:id`                              | Read an authorized profile or post analysis.            |
| `POST /api/analyses/:id/copy`                        | Record a copied or edited suggestion.                   |
| `GET /api/history`                                   | List the caller's analysis history.                     |
| `GET /api/admin/profiles`                            | List all profiles, owners, and assignments.             |
| `POST /api/admin/profiles/:id/assignments`           | Assign a profile to users.                              |
| `DELETE /api/admin/profiles/:id/assignments/:userId` | Remove an assignment.                                   |
| `GET /api/admin/activity`                            | Filter activity across all users.                       |

All list endpoints should use pagination. Request bodies, job payloads, adapter responses, and AI output should use shared validation schemas.

## 11. Analysis outputs

### Profile analysis output

```json
{
  "summary": "string",
  "positioning": "string",
  "topics": ["string"],
  "audience": ["string"],
  "tone": "string",
  "postingPatterns": ["string"],
  "engagementInsights": ["string"],
  "notablePostIds": ["string"]
}
```

### Post analysis and comment output

```json
{
  "summary": "string",
  "topics": ["string"],
  "tone": "string",
  "audience": "string",
  "engagementAngles": ["string"],
  "commentSuggestions": [
    { "style": "thoughtful", "text": "string" },
    { "style": "concise", "text": "string" },
    { "style": "question", "text": "string" }
  ]
}
```

AI must treat fetched social content as untrusted data rather than instructions. Outputs must remain grounded in stored source content, avoid invented personal facts or endorsements, and be clearly presented as drafts for human review.

## 12. Audit and visibility

Record at least the following events:

- Authentication success/failure and logout.
- User creation, updates, password resets, and status changes.
- Profile creation, updates, archival, and assignment changes.
- Profile synchronization requested, started, partially completed, succeeded, or failed.
- Profile and post analysis requested, succeeded, or failed.
- Comment suggestion copied or edited.

Each audit record should capture the actor, target entity, timestamp, IP address, user agent, and non-sensitive metadata. Passwords, session tokens, integration credentials, and provider secrets must never be recorded.

Administrators should be able to filter activity by user, action, entity, platform, run status, and date, then open the related profile, post, or analysis.

## 13. Security and reliability requirements

- Enforce authorization on every resource in server-side routes and jobs.
- Invalidate sessions when a user is disabled or their password is reset.
- Rate-limit authentication, synchronization, and AI endpoints.
- Encrypt or externally manage social-platform credentials.
- Use HTTPS-only secure cookies in production.
- Use idempotency keys for synchronization and analysis requests.
- Limit concurrent jobs, fetched pages, AI input size, and user/provider usage.
- Retry transient failures with backoff and classify permanent failures.
- Preserve source snapshots used for analysis.
- Provide database and queue-aware readiness checks.
- Use structured logs with correlation IDs across API requests and jobs.
- Define retention rules for raw external payloads, analyses, audit logs, and expired sessions.

## 14. Testing requirements

### Unit tests

- Profile URL normalization and platform detection.
- External response normalization.
- Request, job payload, and AI output validation.
- Resource authorization decisions.
- Prompt construction and unsafe-input boundaries.
- Usage-limit and retry decisions.

### Integration tests

- Login, session expiry, logout, disable, and password reset.
- Profile creation and assignment access rules.
- Synchronization state transitions and idempotent post upserts.
- Cross-user profile, post, and analysis isolation.
- Analysis state transitions and validated output storage.
- Administrator visibility and audit creation.

### Browser tests

- Administrator creates a user, adds a profile, and assigns it.
- User signs in, synchronizes a profile, reviews fetched posts, analyzes a post, and copies a suggestion.
- Administrator sees the complete activity trail.

Social-platform and AI providers should be mocked in automated tests. Separate opt-in integration tests can verify real provider credentials and response compatibility.

## 15. Future extensions

- Additional social-platform adapters.
- Scheduled profile monitoring and new-post notifications.
- Advanced search, tags, profile lists, and campaigns.
- Brand and personal voice configurations.
- Comment performance tracking where platform APIs permit it.
- Explicitly confirmed comment publishing.
- CRM and sales-platform integrations.
- Team reporting, approval workflows, and reusable templates.
- Multiple organizations/workspaces with isolated data and roles.
- Additional sales and engagement tools built on the same user, job, audit, and integration infrastructure.

The dashboard and worker are independently deployable. PostgreSQL stores product
data, audit history, and the pg-boss job queue. Prisma owns only the product tables;
pg-boss manages its own schema.

## Prerequisites

- Node.js 22 (see `.nvmrc`)
- Corepack-enabled pnpm
- Docker with Docker Compose

## Local development

```bash
corepack enable
pnpm install
cp .env.example .env
docker compose up -d postgres
pnpm db:migrate:deploy
pnpm dev
```

The dashboard runs on <http://localhost:3000>. The worker exposes a health endpoint
on <http://localhost:3001>. `pnpm dev` starts both processes; use
`pnpm dev:dashboard` or `pnpm dev:worker` to run one.

To build and run the entire stack in containers:

```bash
docker compose up --build
```

After the containers are running, make sure the database is migrated and seeded so an initial administrator account exists:

```bash
pnpm db:migrate:deploy
pnpm db:seed
```

The seed script will create the initial admin user. You can override the defaults with the `SEED_ADMIN_USERNAME` and `SEED_ADMIN_PASSWORD` environment variables when running the seed step.

## Common commands

| Command                  | Purpose                                             |
| ------------------------ | --------------------------------------------------- |
| `pnpm dev`               | Start all applications in watch mode                |
| `pnpm build`             | Build packages and applications in dependency order |
| `pnpm lint`              | Run repository-wide lint checks                     |
| `pnpm typecheck`         | Type-check every workspace                          |
| `pnpm format`            | Format repository files                             |
| `pnpm db:generate`       | Generate the Prisma client                          |
| `pnpm db:migrate`        | Create and apply a development migration            |
| `pnpm db:migrate:deploy` | Apply checked-in migrations                         |
| `pnpm db:studio`         | Open Prisma Studio                                  |

## Architectural guardrails

- There is no public registration or password-reset flow. Accounts are created and
  credentials are reset by administrators.
- Store only strong password hashes; never store or log plaintext passwords.
- Record security-sensitive and user-visible operations in `AuditLog`.
- Put each worker job in its own module, validate its payload at the boundary, make
  it idempotent, and configure retries/timeouts appropriate to that job.
- The initial schema is a starting point. Extend it through Prisma migrations rather
  than editing a deployed database manually.

## Environment variables

Copy `.env.example` to `.env`. Production secrets must come from the deployment
platform; do not commit `.env` files. `DATABASE_URL` is required at runtime by both
applications.
