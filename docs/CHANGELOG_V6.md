[RULE]

# Antigravity Project Starter Pack: V5 → V6 Changelog

## 1. Summary
V5 was a well-structured governance pack, but it relied entirely on the AI voluntarily following soft instructions, with no defined evidence standard and a real technical gap in how Antigravity auto-discovers skills. V6 keeps the same lifecycle and file layout (nothing moved, nothing renamed, no risk of breaking an existing setup) and fixes the concrete gaps found by inspecting every file against Antigravity's documented behavior.

## 2. What was verified before changing anything
- **How Antigravity auto-loads project instructions:** Root `AGENTS.md`, read automatically every session.
- **How Antigravity auto-discovers skills:** A `skills/` folder where each `SKILL.md` needs YAML frontmatter with `name` and `description` fields, used for progressive disclosure.
- **Agents and Docs scanning:** `agents/` and `docs/` are not scanned automatically — they only get used if `AGENTS.md` explicitly points to them.
- *Key insight:* The single highest-value fix was adding frontmatter to every `SKILL.md` — without it, none of the 23 skills could be auto-triggered by Antigravity based on context, only by being opened by name.

## 3. Fixes Made

| Issue found in V5 | Fix in V6 |
|---|---|
| `skills/*/SKILL.md` had no YAML frontmatter, so Antigravity's skill auto-discovery could not register them. | Every `SKILL.md` now has a `name` + `description` frontmatter block, matching Antigravity's documented skill format. |
| "Evidence" was required everywhere (gates, self-check, audits) but never defined. | New `docs/EVIDENCE_STANDARDS.md` defines exactly what proof is required per claim type (tests, browser checks, route audits, security checks, etc.). |
| `AGENTS.md` had no explicit anti-hallucination rules beyond "don't fake verification." | `AGENTS.md` V6 adds explicit rules: never assert unverified facts, never invent APIs/paths, label assumptions, evidence beats confident tone. |
| `docs/` vs `docs/memory/` file-purpose distinction was implicit and easy to confuse. | Every file now opens with a `[RULE]` / `[TEMPLATE]` / `[STATE]` / `[AGENT]` / `[SKILL]` tag, and `AGENTS.md` documents what each tag means. |
| Agent role files (`agents/*.md`) were a single sentence each — no clear trigger or output. | Each agent file now states when it's invoked, what it must never do, and what evidence it must produce. |
| No safeguard against the agent editing its own governance files mid-task. | `AGENTS.md` now explicitly instructs: do not edit `AGENTS.md` / `docs/` / `agents/` / `skills/` during normal feature work; log any real rule change in `DECISION_LOG.md`. |

## 4. What was intentionally left alone
- **The empty template files** (`PRD.md`, `TRD.md`, `UI_UX_DESIGN.md`, etc.) — these are meant to be filled in with real project content during discovery, not pre-filled with generic text.
- **The lifecycle itself** (Intake → Discovery → Freeze → Task Graph → Build → Verify → Audit → Record → Resume) — it was already sound and did not need restructuring.
- **File paths and folder structure** — unchanged, so this drops into a project seamlessly.

## 5. What this does and does not guarantee
This pack meaningfully reduces two failure modes: coding before requirements are understood, and an agent declaring work "done" without checking it. It does this by making evidence explicit and mandatory rather than optional. It cannot force compliance the way a test suite or CI pipeline can — it is a set of instructions that depends on Antigravity's model actually following them. For a stronger backstop, pair this pack with real automated tests, CI, and code review; the pack raises the floor, it doesn't replace verification infrastructure.

## 6. Recommended first use
Place the V6 pack in the project root (`AGENTS.md` at top level) and reconcile stored state against repository before making changes.
