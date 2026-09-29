[STATE]

# Decision Log

Record every non-trivial architectural, product, UX, security, dependency, and
scope decision. This is how future developers (including you in 6 months)
understand why the project is built the way it is, not just what was built.

---

## Decision Log Template

Use this template for each significant decision:

```markdown
## DECISION-XXX: [Short Title]

**Date:** YYYY-MM-DD
**Owner:** [Who made this decision]
**Status:** APPROVED / DEFERRED / REJECTED

### Question/Problem
[What choice needed to be made? Why did it matter?]

Example: "Do we use Express or Fastify for the API server?"

### Options Considered
1. **Express.js**
   - Pros: Mature, huge ecosystem, easy to learn, fits existing team expertise
   - Cons: Lower performance than alternatives, not built for modern async patterns
   - Effort: Immediate (team knows it)

2. **Fastify**
   - Pros: Fast, built for async, lower memory footprint
   - Cons: Smaller ecosystem, learning curve for team, newer (less battle-tested)
   - Effort: 1-2 weeks for team to ramp up

3. **NestJS**
   - Pros: Full framework, opinionated structure, great TypeScript support
   - Cons: Large overhead for small projects, complex DI system, slower to start
   - Effort: 3+ weeks for team to fully adopt
   - Decision: Rejected—overly complex for this project scope

### Decision
**We chose: Express.js**

### Rationale
- Team expertise is a multiplier; everyone already knows Express
- Performance is not a bottleneck for our current traffic projections
- Quick start is more valuable than micro-optimizations at this stage
- If performance becomes an issue later, Fastify migration is possible

### Trade-offs Accepted
- Accepting slightly lower performance for faster time-to-market
- Accepting that we may regret this if traffic grows 10x faster than expected
- Accepting that Express middleware chain can become tangled in larger codebases

### Follow-up (if needed)
- Revisit if traffic > 10k req/sec or P95 latency > 500ms
- Set a reminder: Q1 2027 performance review

---
```

## How to use this log

1. **Add a decision** whenever you choose between real alternatives (tech, architecture, product direction, scope)
2. **Don't log trivial decisions** (if there's only one reasonable option, no log needed)
3. **Log it before you start**, so the next session knows why things are the way they are
4. **Include the trade-offs**, not just the happy side
5. **Be honest about uncertainty** — it's OK to write "We're not sure if this will scale; if it doesn't, we'll refactor"

---

## Recent Decisions

(Decisions will be added here as the project progresses)

### Example decisions (not real for this project):

## DECISION-001: Database: PostgreSQL vs. MongoDB

**Date:** 2026-09-01
**Owner:** Technical Architect
**Status:** APPROVED

### Question/Problem
Our app needs to store user profiles, relationships, and activity logs. Do we use a relational database (PostgreSQL) or document store (MongoDB)?

### Options Considered

1. **PostgreSQL**
   - Pros: Strong schema enforcement, ACID transactions, proven at scale, easy to query relationships, strong type safety
   - Cons: Schema migrations required, less flexible for evolving data
   - Effort: Team experienced with SQL

2. **MongoDB**
   - Pros: Flexible schema, fast writes, horizontal scaling, JSON-native
   - Cons: No transactions (until recently), weaker schema validation, harder to query complex relationships, can encourage sloppy data design
   - Effort: Team has less MongoDB experience

### Decision
**We chose: PostgreSQL**

### Rationale
- User relationships and permissions require strong consistency (ACID transactions)
- Our data model is well-defined upfront (schema is a feature, not a bug)
- Team expertise: everyone knows SQL better than MongoDB
- Relationships (user → friends → friend groups) are easier to query in PostgreSQL

### Trade-offs Accepted
- Schema migrations add a deployment step
- If we need massive horizontal write scaling, we may regret this (but it's years away, if ever)
- Document-style flexibility is sacrificed for data integrity

### Follow-up
- If horizontal writes become a bottleneck, consider PostgreSQL sharding or move to a document store for activity logs only (hybrid approach)
- Revisit Q2 2027 if replication lag becomes an issue

---

## DECISION-002: Session Storage: HTTP-only Cookies vs. JWT

**Date:** 2026-09-05
**Owner:** Backend Engineer
**Status:** APPROVED

### Question/Problem
How do we persist user sessions across requests? Cookie-based sessions or JWT tokens?

### Options Considered

1. **HTTP-only Cookies (Express-session)**
   - Pros: Automatic CSRF protection, revocation is instant (no need to wait for token expiry), simpler logout
   - Cons: Server-side session storage required, doesn't scale as easily to multiple servers
   - Effort: Low (standard approach)

2. **JWT Tokens**
   - Pros: Stateless, scales to multiple servers, microservices-friendly
   - Cons: Cannot revoke mid-flight (must wait for expiry), CSRF protection needed, logout is slower (tokens stay valid until expiry)
   - Effort: Medium (need refresh token logic, CSRF handling)

3. **Hybrid (HTTP-only cookie + stateless verification)**
   - Pros: Best of both worlds
   - Cons: Most complex, hardest to get right
   - Effort: High

### Decision
**We chose: HTTP-only Cookies with Express-session**

### Rationale
- Simplicity is worth the trade-off (we're small, one server is fine for now)
- Instant revocation on logout is important for security (user clicks "logout", they're out immediately)
- Team is most comfortable with this approach
- CSRF protection is automatic

### Trade-offs Accepted
- If we grow to multiple servers, we'll need to implement session replication or move to JWT
- Some microservices patterns are harder with cookie-based sessions
- No plans to switch to JWT in the next 12 months unless scaling demands it

### Follow-up
- Revisit if we add more servers or microservices
- Q4 2026: assess whether JWT is needed based on architectural changes

