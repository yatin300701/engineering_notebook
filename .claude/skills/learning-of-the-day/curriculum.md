# Curriculum — the backlog to pick from

The target is **architectural judgement**, not vocabulary. Knowing what Kafka
is doesn't make anyone senior. The bar is:

> "Given these constraints, this architecture is appropriate. Here is the
> bottleneck, here is how it fails, here is how we scale it, and here is the
> trade-off we're accepting."

## The three levels

Every entry must carry the reader to **level 3** on its topic. An entry that
stops at level 1 is a Wikipedia summary and has failed.

| Level | Can do | Where it lives in the entry |
| --- | --- | --- |
| 1 — Explain | "What is a load balancer?" | `## The one idea`, `## The N kinds` |
| 2 — Choose | Given 10M users, read-heavy: pick the components and say why each exists | `decisionRule`, `## Picking one` |
| 3 — Defend | Answer "why not X?" and "when would this be the wrong call?" | `## Defend your choice` |

## Picking the next entry

1. Work down the phases in order — they're sequenced by dependency, not by interest.
2. Inside a phase, order is flexible; prefer whatever the reader is hitting in real work.
3. Mark `[x]` when written, with the entry's date-slug next to it.
4. Skipping ahead is allowed on request, but check the earlier phases for
   unwritten prerequisites and list them in the entry's `prerequisites`.
5. Roughly every fifth entry, take a `paper` instead of a component.

## Reader context

Five years' experience. JS full-stack — React, Angular, Next, Node. Learning
Kotlin/Android. Working with AWS, PostgreSQL, OpenSearch, on CRM and
file-management systems. Target deep areas: **frontend architecture,
distributed systems, PostgreSQL/data systems, AWS/cloud** — with working
knowledge everywhere else. Build sections default to Node; use Kotlin only
when the topic genuinely needs it, and say so in `prerequisites`.

---

## Phase 1 — Foundations

- [x] Load balancers — L4/L7/DNS/client-side (`2026-08-11-load-balancers`)
- [ ] TCP vs UDP, and what a connection actually costs
- [ ] The TCP handshake, retransmission, and why packet loss spikes latency
- [ ] HTTP/1.1 vs HTTP/2 vs HTTP/3 — head-of-line blocking at each layer
- [ ] HTTP caching — Cache-Control, ETag, revalidation, and who caches what
- [ ] DNS — the resolution path, TTL, and DNS-based failover
- [ ] CDNs — push vs pull, invalidation, and what must never be cached
- [ ] Reverse proxy vs load balancer vs API gateway — overlapping roles
- [ ] TLS and mTLS — handshake, termination, cert chains
- [ ] CORS and preflight — the model, not the copy-pasted header
- [ ] WebSockets vs SSE vs long polling
- [ ] Caching strategies — aside, through, behind, refresh-ahead
- [ ] Cache eviction and pathologies — LRU/LFU, stampede, penetration, hot keys
- [ ] Redis as a primitive — data types, TTL, atomicity, when it is not a database
- [ ] Rate limiting — fixed window, sliding window, token bucket, leaky bucket
- [ ] Distributed rate limiting — where to enforce it and why
- [ ] The JS event loop — macrotasks, microtasks, starvation, worker threads
- [ ] Concurrency in Node — race conditions, locks, worker pools
- [ ] Linux for engineers — file descriptors, signals, and "too many open files"
- [ ] Back-of-the-envelope estimation — QPS, storage, bandwidth, memory

## Phase 2 — Data

- [ ] Indexes and B-trees — why adding an index can make a query slower
- [ ] Reading a query plan — EXPLAIN ANALYZE end to end
- [ ] Composite and covering indexes — column order matters
- [ ] Transactions and isolation levels — the anomalies each one permits
- [ ] MVCC — how Postgres reads without blocking writers
- [ ] Locking and deadlocks — detection, ordering, and lock escalation
- [ ] Normalization vs denormalization — the read/write trade
- [ ] Connection pooling — why the database is usually the first bottleneck
- [ ] Replication — primary/replica, lag, and read-your-writes
- [ ] Partitioning vs sharding — picking a partition key, hot partitions
- [ ] Consistent hashing and rebalancing
- [ ] SQL vs NoSQL — a real decision between Postgres, DynamoDB, Mongo, Redis
- [ ] DynamoDB access-pattern modelling — single-table design
- [ ] Full-text search — inverted index, tokenization, TF-IDF, BM25
- [ ] Postgres FTS vs OpenSearch — the point where you should move
- [ ] Object vs block vs file storage — why a video does not go in Postgres

## Phase 3 — Distributed systems (highest-value gap)

- [ ] CAP, honestly — what you actually give up during a partition
- [ ] Consistency models — strong, eventual, causal, read-your-writes
- [ ] Idempotency and the Idempotency-Key pattern
- [ ] Retries, exponential backoff, jitter, and retry budgets
- [ ] Timeouts — how to pick one, and how they cascade
- [ ] Circuit breakers, bulkheads, and load shedding
- [ ] Queue vs log vs pub/sub — SQS, RabbitMQ, Kafka
- [ ] Delivery semantics — at-most-once, at-least-once, exactly-once
- [ ] Kafka — partitions, consumer groups, offsets, rebalance, ordering
- [ ] Dead-letter queues and poison messages
- [ ] The transactional outbox pattern
- [ ] Sagas and compensating transactions — and why 2PC is avoided
- [ ] Change Data Capture
- [ ] Distributed locks — leases, fencing tokens, the Redlock argument
- [ ] Leader election and quorum
- [ ] Consensus — Raft, conceptually
- [ ] Logical clocks — Lamport timestamps and vector clocks
- [ ] Service discovery and gossip-based membership
- [ ] Split brain — how it happens and how it's prevented

## Phase 4 — Production engineering

- [ ] The three pillars — logs, metrics, traces, and what each answers
- [ ] Structured logging and correlation IDs
- [ ] RED and USE — choosing what to measure and what to alert on
- [ ] Distributed tracing — spans and context propagation
- [ ] SLI, SLO, SLA and error budgets
- [ ] Availability math — what 99.9% actually buys you
- [ ] Incident response and blameless postmortems
- [ ] Deployment strategies — rolling, blue/green, canary, feature flags
- [ ] Docker — images, layers, and what a container really is
- [ ] Kubernetes concepts — pod, service, deployment, and why it exists
- [ ] Capacity planning from a target RPS
- [ ] Disaster recovery — RPO, RTO, and testing the restore
- [ ] Multi-region — active-active vs active-passive, conflict resolution
- [ ] Cost engineering — "do we actually need this?"
- [ ] Production debugging — one latency investigation, top to bottom
- [ ] Load, stress, soak, and chaos testing

## Phase 5 — Architecture

- [ ] Monolith, modular monolith, microservices — the organizational question
- [ ] Layered, clean, and hexagonal architecture
- [ ] CQRS
- [ ] Event sourcing
- [ ] Event-driven architecture — choreography vs orchestration
- [ ] REST API design — resource modelling, pagination, versioning, error contracts
- [ ] GraphQL — N+1, caching difficulty, when it costs more than it gives
- [ ] gRPC and protobuf — service-to-service communication
- [ ] API gateway and backend-for-frontend
- [ ] Service mesh and the sidecar pattern
- [ ] Domain-driven design — bounded contexts, aggregates, ubiquitous language
- [ ] The strangler fig migration
- [ ] Architecture Decision Records — writing one properly
- [ ] Design patterns that survive contact with real code
- [ ] SOLID — and knowing when not to apply it

## Phase 6 — Frontend architecture (the specialization)

- [ ] The browser rendering pipeline — DOM, CSSOM, layout, paint, composite
- [ ] Reflow vs repaint and layout thrashing
- [ ] Core Web Vitals — LCP, INP, CLS, and diagnosing each
- [ ] CSR vs SSR vs SSG vs ISR — the Next.js rendering decision
- [ ] Hydration — why it costs so much and how to avoid it
- [ ] Bundle size — code splitting, tree shaking, lazy loading, prefetch
- [ ] Browser storage — cookies, localStorage, IndexedDB, service workers
- [ ] Server state vs client state — the real state-management question
- [ ] Offline-first and sync conflict resolution
- [ ] Frontend auth — sessions vs JWT, refresh rotation, cookie flags

## Phase 7 — Security

- [ ] Authentication vs authorization — OAuth 2.0 and OIDC flows
- [ ] JWTs — signing, expiry, and the revocation problem
- [ ] RBAC vs ABAC
- [ ] XSS, CSRF, SSRF, clickjacking, and CSP
- [ ] SQL injection and parameterized queries
- [ ] Secrets management, key rotation, encryption at rest
- [ ] Password hashing — why bcrypt/argon2 and not SHA-256

## Capstone track — systems to design

Take one after finishing a phase. Design it **before** reading any reference
solution, following: requirements → estimation → API → data model → high-level
architecture → bottlenecks → scaling → failure modes → observability →
security → cost. Then compare against a real published architecture and write
down where you differed and why.

**Starter:** URL shortener · Pastebin · Rate limiter · File upload service ·
Notification service · API gateway

**Intermediate:** Chat / WhatsApp · News feed · Twitter timeline · Instagram ·
YouTube · Dropbox / Google Drive · Web crawler · Search engine

**Advanced:** Payment system · Ride sharing · Food delivery · Ticket booking ·
Distributed job scheduler · Distributed cache · Distributed queue ·
Kafka-like log · Distributed file system · Logging system · Metrics system ·
Real-time analytics · Video streaming · Multi-region SaaS

## Standing reference sources

Reuse these across entries where they genuinely apply — don't cite them by
reflex.

- System Design Primer — <https://github.com/donnemartin/system-design-primer>
- *Designing Data-Intensive Applications*, Martin Kleppmann
- AWS Well-Architected Framework — <https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html>
- Google SRE Book — <https://sre.google/sre-book/table-of-contents/>
- Engineering blogs: Netflix, Cloudflare, Uber, Stripe, Discord, Slack, LinkedIn

When citing an engineering blog post, the entry should say what problem the
company had, what they changed, and what it cost them — not just link it.
