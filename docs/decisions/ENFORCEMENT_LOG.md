---
title: Documentation Cleanup and Standardization Log
service: global
status: active
last_reviewed: 2025-11-15
type: decision
---

# Documentation Standardization Enforcement

## Objective
Enforce AGENTS.md documentation structure conventions across the entire monorepo.

## Non-Canonical Files Identified

### Category 1: Duplicate Files (Root vs Canonical Location)

These files exist at the service root but should only exist in `docs/` structure:

| File | Location | Canonical Location | Action |
|------|----------|-------------------|--------|
| GETTING_STARTED.md | account-api/ | account-api/docs/how-to/local-dev.md | ARCHIVE to docs/migrations/ |
| GETTING_STARTED.md | live-game-api/ | live-game-api/docs/how-to/local-dev.md | ARCHIVE to docs/migrations/ |
| RUNBOOK.md | account-api/ | account-api/docs/operations.md | Merge content, ARCHIVE |

### Category 2: Project-Specific Temporary Files

These were created during project phases and should be archived:

**matchmaking-api/:**
- COMPLETION_REPORT.md (duplicate in docs/)
- docs/COMPLETION_REPORT.md
- docs/FORMAT_IMPROVEMENTS.md
- docs/IMPLEMENTATION.md
- docs/QUICKREF.md
- docs/PROJECT_SUMMARY.txt
- docs/service-spec.md (duplicate with service-spec-formatted.md)
- docs/service-spec-formatted.md

**live-game-api/:**
- SCAFFOLD_SUMMARY.md

**Root:**
- COMPLETION_SUMMARY.md

### Category 3: Feature-Specific Documentation

**chess-app (PLAYSCREEN_* files):**
- Should be archived or consolidated into:
  - docs/architecture.md (design decisions)
  - docs/how-to/common-tasks.md (tasks)
  - docs/decisions/ADR-XXXX (specific architectural choices)

**chess-app (THEMING_I18N_* files):**
- Should be consolidated into:
  - docs/how-to/theming-and-i18n.md (how-to guide)
  - docs/decisions/ADR-XXXX (design decisions)

### Category 4: Duplicate Documentation Locations

**chess-app/docs/project/:**
- IMPLEMENTATION_SUMMARY.md
- TASKS.md

These should be archived or consolidated into the canonical structure.

## Standardization Actions

### Phase 1: Add Front-Matter (COMPLETED)
✓ account-api/README.md
✓ live-game-api/README.md
✓ matchmaking-api/README.md
✓ chess-app/README.md

### Phase 2: Archive Non-Canonical Files

Create `/docs/archive/` with subdirectories:
- `/docs/archive/temporary-reports/` - project completion/status reports
- `/docs/archive/phase-documentation/` - phase-specific docs
- `/docs/archive/feature-specs/` - feature-specific documentation

### Phase 3: Consolidate Feature Documentation

1. **PLAYSCREEN documentation:**
   - Extract architectural decisions → ADR files
   - Extract implementation details → architecture.md update
   - Extract tasks → how-to/common-tasks.md

2. **THEMING_I18N documentation:**
   - Create how-to guide: `/chess-app/docs/how-to/theming-and-i18n.md`
   - Create ADR for theming/i18n architecture decision
   - Archive originals

3. **Project documentation:**
   - Consolidate into service timeline/migrations documentation
   - Archive originals

### Phase 4: Enforce Front-Matter

Add YAML front-matter to remaining files missing it:
- docs/python-guideline.md (global standard)
- All other previously unmarked files

### Phase 5: Update Global Indexes

- SYSTEM_GUIDE.md (links to archived docs if needed)
- docs/architecture/service-catalog.md (reference canonical locations only)
- docs/decisions/README.md (link to all ADRs)

## Naming Convention Enforcement

### Canonical Service Doc Names
✓ overview.md
✓ architecture.md
✓ api.md
✓ domain.md
✓ operations.md
✓ local-dev.md
✓ troubleshooting.md
✓ common-tasks.md

### Non-Canonical Names to Retire
✗ GETTING_STARTED.md → local-dev.md (in docs/how-to/)
✗ RUNBOOK.md → operations.md (in docs/)
✗ SCAFFOLD_SUMMARY.md → archive
✗ COMPLETION_REPORT.md → archive
✗ PROJECT_SUMMARY.txt → archive
✗ service-spec.md (duplicate) → consolidate
✗ PLAYSCREEN_*.md → consolidate
✗ THEMING_I18N_*.md → consolidate

## Directory Structure After Standardization

```
chessmate/
├── AGENTS.md                    # ✓ Compliance guide
├── ARCHITECTURE.md              # ✓ Global architecture
├── SYSTEM_GUIDE.md              # ✓ Navigation hub
│
├── docs/
│   ├── archive/                 # New: Historical & temporary docs
│   │   ├── temporary-reports/
│   │   ├── phase-documentation/
│   │   └── feature-specs/
│   ├── standards/               # ✓ Platform standards
│   ├── architecture/            # ✓ System design
│   ├── operations/              # ✓ Operational guides
│   ├── business/                # ✓ Business docs
│   └── decisions/               # ✓ ADRs
│
├── services/
│   ├── account-api/
│   │   ├── README.md            # ✓ With front-matter
│   │   └── docs/                # ✓ Canonical structure only
│   ├── live-game-api/
│   │   ├── README.md            # ✓ With front-matter
│   │   └── docs/                # ✓ Canonical structure only
│   ├── matchmaking-api/
│   │   ├── README.md            # ✓ With front-matter
│   │   └── docs/                # ✓ Canonical structure only
│   └── chess-app/
│       ├── README.md            # ✓ With front-matter
│       └── docs/                # ✓ Canonical structure only
```

## Enforcement Rules Going Forward

Per AGENTS.md section 5:

1. **No docs outside /docs or services/<service>/docs**
2. **All docs must have YAML front-matter**
3. **Use canonical naming only**
4. **Service READMEs only link to docs/ structure**
5. **Update existing docs, don't create variants**
6. **Archive old files, don't delete**

## Success Criteria

- [ ] All .md files have YAML front-matter
- [ ] No files named: GETTING_STARTED, RUNBOOK, PROJECT_SUMMARY, etc at root
- [ ] All service docs live only in services/<service>/docs/
- [ ] All cross-service docs live only in /docs/
- [ ] /docs/archive/ contains all historical files
- [ ] SYSTEM_GUIDE.md and service-catalog.md only reference canonical locations
- [ ] All relative links work correctly

---

*Standardization tracking document*  
*Last updated: 2025-11-15*
