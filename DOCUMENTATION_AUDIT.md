# Documentation Audit & Reorganization Plan
**Date**: December 2, 2025  
**Status**: Planning  
**Purpose**: Align scattered documentation with AGENTS.md conventions

---

## 📋 Current State Analysis

### Root-Level Documents (/)

| File | Type | Status | Proposed Action |
|------|------|--------|----------------|
| `REFACTORING_SUMMARY.md` | Implementation summary | Misplaced | **MOVE** → `app/docs/migrations/phase-2-playscreen-refactor.md` |

**Issues**:
- ❌ `REFACTORING_SUMMARY.md` is app-specific but at repository root
- ❌ Should follow phase-based migration pattern in `app/docs/migrations/`

---

### app/ Root Documents

| File | Type | Status | Proposed Action |
|------|------|--------|----------------|
| `app/DLS.md` | Design system spec | Active/Primary | **RENAME** → `app/docs/design-language-system.md` |
| `app/README.md` | Service overview | Correct | ✅ Keep (update links) |

**Issues**:
- ❌ `DLS.md` should be in `app/docs/` per conventions
- ❌ Not following kebab-case naming for markdown files
- ✅ Large, comprehensive design system document (1854 lines)

---

### app/docs/ Documents

#### ✅ CORRECT LOCATION (Keep)
These follow conventions and are properly placed:

| File | Type | Purpose | Status |
|------|------|---------|--------|
| `AI_AGENT_QUICK_REFERENCE.md` | How-to | Agent guidance | ✅ Keep (rename to kebab-case) |
| `GETTING_STARTED.md` | How-to | Developer setup | ✅ Keep (rename to kebab-case) |
| `README.md` | Index | Service overview | ✅ Keep |
| `overview.md` | Architecture | App capabilities | ✅ Keep |
| `ARCHITECTURE.md` | Architecture | Technical design | ✅ Keep (rename to kebab-case) |
| `PRODUCTION_ARCHITECTURE.md` | Architecture | Production setup | ✅ Keep (rename to kebab-case) |
| `FOLDER_STRUCTURE_CONVENTION.md` | Standard | Structure rules | ✅ Keep (rename to kebab-case) |
| `api.md` | Architecture | API specification | ✅ Keep |
| `domain.md` | Architecture | Domain concepts | ✅ Keep |
| `operations.md` | Operations | Deployment/ops | ✅ Keep |

#### ⚠️ CONSOLIDATE/MERGE (Redundant)
Multiple overlapping documents need consolidation:

**DLS (Design Language System) Documents** - 5 files with overlapping content:
| File | Lines | Type | Proposed Action |
|------|-------|------|----------------|
| `DLS_FINAL_SUMMARY.md` | 438 | Summary | **MERGE** → consolidate into main DLS doc |
| `DLS_IMPLEMENTATION_COMPLETE.md` | 481 | Summary | **MERGE** → consolidate into main DLS doc |
| `DLS_VISUAL_REFERENCE.md` | ? | Reference | **MERGE** → consolidate into main DLS doc |
| `dls-implementation-guide.md` | ? | Guide | **MERGE** → consolidate into main DLS doc |
| `dls-migration-guide.md` | ? | Guide | **MERGE** → consolidate into main DLS doc |
| `../DLS.md` | 1854 | **PRIMARY** | **MOVE** → `app/docs/design-language-system.md` |

**Recommendation**: 
- Keep `/app/DLS.md` as the **single source of truth** (move to `app/docs/`)
- Extract completion summaries to `migrations/phase-X-dls.md`
- Delete or archive redundant summaries

**Migration Documents** - 4 files documenting iterative development:
| File | Type | Proposed Action |
|------|------|----------------|
| `MIGRATION_100_COMPLETE.md` | Summary | **MOVE** → `migrations/phase-2-migration-100.md` |
| `MIGRATION_COMPLETE.md` | Summary | **MOVE** → `migrations/phase-1-migration.md` |
| `MIGRATION_SUMMARY.md` | Summary | **MERGE** → consolidate with above |
| `IMPLEMENTATION_ITEMS_2-5.md` | Checklist | **MOVE** → `migrations/phase-3-implementation.md` |

**Folder Structure Documents** - 3 overlapping files:
| File | Proposed Action |
|------|----------------|
| `FOLDER_STRUCTURE.md` | **MERGE** into `FOLDER_STRUCTURE_CONVENTION.md` |
| `FOLDER_STRUCTURE_VISUAL.md` | **MERGE** into `FOLDER_STRUCTURE_CONVENTION.md` |
| `FOLDER_STRUCTURE_CONVENTION.md` | ✅ Keep as primary |

**Component Documentation** - Multiple component guides:
| File | Proposed Action |
|------|----------------|
| `COMPONENT_INDEX.md` | ✅ Keep (rename to `component-index.md`) |
| `tab-screen-pattern-components.md` | ✅ Keep (move to `how-to/`) |
| `sidebar-navigation.md` | ✅ Keep (move to `how-to/`) |

**Hook Documentation**:
| File | Proposed Action |
|------|----------------|
| `HOOKS.md` | ✅ Keep (rename to `hooks.md`) |
| `HOOKS_COMPLETION_REPORT.md` | **MOVE** → `migrations/phase-X-hooks.md` |

**UI/UX Documentation**:
| File | Proposed Action |
|------|----------------|
| `UI_UX_IMPROVEMENTS.md` | **MOVE** → `migrations/phase-X-ui-ux.md` |
| `UI_UX_QUICK_START.md` | **MERGE** → consolidate into main guides |

#### 📦 MOVE TO migrations/ (Implementation History)
These are completion reports, not active docs:

- `DLS_FINAL_SUMMARY.md` → `migrations/phase-4-dls-complete.md`
- `DLS_IMPLEMENTATION_COMPLETE.md` → `migrations/phase-4-dls-87-percent.md`
- `MIGRATION_100_COMPLETE.md` → `migrations/phase-2-migration-100.md`
- `MIGRATION_COMPLETE.md` → `migrations/phase-1-migration-complete.md`
- `HOOKS_COMPLETION_REPORT.md` → `migrations/phase-3-hooks-complete.md`
- `UI_UX_IMPROVEMENTS.md` → `migrations/phase-5-ui-ux.md`
- `IMPLEMENTATION_ITEMS_2-5.md` → `migrations/phase-3-implementation.md`

#### 🔄 RENAME (Kebab-case Convention)
Per AGENTS.md, all markdown files use lowercase kebab-case:

- `AI_AGENT_QUICK_REFERENCE.md` → `ai-agent-quick-reference.md`
- `GETTING_STARTED.md` → `getting-started.md`
- `ARCHITECTURE.md` → `architecture.md`
- `PRODUCTION_ARCHITECTURE.md` → `production-architecture.md`
- `FOLDER_STRUCTURE_CONVENTION.md` → `folder-structure-convention.md`
- `COMPONENT_INDEX.md` → `component-index.md`
- `HOOKS.md` → `hooks.md`
- `UI_UX_QUICK_START.md` → `ui-ux-quick-start.md`
- `I18N.md` → `i18n.md`
- `API_LAYER.md` → `api-layer.md`

#### 🗑️ ARCHIVE/DELETE (Obsolete)
These are old backups or superseded documents:

- `overview-old-backup.md` → **DELETE** (backup, no longer needed)

---

### docs/ Documents (Cross-Service)

| File | Type | Status | Proposed Action |
|------|------|--------|----------------|
| `API_CONTEXT_REFACTORING.md` | Implementation | Misplaced | **MOVE** → `app/docs/migrations/phase-X-api-context.md` |
| `MESSAGE_28_CHECKMATE_IMPLEMENTATION.md` | Implementation | Misplaced | **MOVE** → `app/docs/migrations/phase-X-checkmate.md` |
| `play-puzzle-audit.md` | Audit | Misplaced | **MOVE** → `app/docs/migrations/phase-X-audit.md` |

**Issues**:
- ❌ These are **app-specific** implementation docs in cross-service `/docs`
- ❌ Should be in `app/docs/migrations/` as phase documentation
- ❌ `/docs` is for **platform-wide** documentation only

---

## 🎯 Reorganization Plan

### Phase 1: Consolidate DLS Documentation ✅

**Primary Action**: Make `/app/DLS.md` the single source of truth

```bash
# 1. Move primary DLS doc
mv app/DLS.md app/docs/design-language-system.md

# 2. Extract completion summaries to migrations
# - DLS_FINAL_SUMMARY.md → migrations/phase-4-dls-complete.md
# - DLS_IMPLEMENTATION_COMPLETE.md → migrations/phase-4-dls-87-percent.md

# 3. Delete redundant guides (content already in main DLS doc)
rm app/docs/DLS_VISUAL_REFERENCE.md
rm app/docs/dls-implementation-guide.md
rm app/docs/dls-migration-guide.md
```

**Result**: Single `design-language-system.md` with historical snapshots in `migrations/`

---

### Phase 2: Organize Migration Documentation ✅

**Action**: Move all implementation summaries to `app/docs/migrations/`

```bash
# Create migrations README if not exists
touch app/docs/migrations/README.md

# Move implementation reports
mv app/docs/MIGRATION_COMPLETE.md app/docs/migrations/phase-1-folder-structure.md
mv app/docs/MIGRATION_100_COMPLETE.md app/docs/migrations/phase-2-migration-100.md
mv app/docs/MIGRATION_SUMMARY.md app/docs/migrations/phase-1-summary.md
mv app/docs/IMPLEMENTATION_ITEMS_2-5.md app/docs/migrations/phase-3-implementation.md
mv app/docs/HOOKS_COMPLETION_REPORT.md app/docs/migrations/phase-3-hooks-complete.md
mv app/docs/UI_UX_IMPROVEMENTS.md app/docs/migrations/phase-5-ui-ux.md

# Move root-level app docs
mv REFACTORING_SUMMARY.md app/docs/migrations/phase-2-playscreen-refactor.md

# Move misplaced docs from /docs
mv docs/API_CONTEXT_REFACTORING.md app/docs/migrations/phase-6-api-context.md
mv docs/MESSAGE_28_CHECKMATE_IMPLEMENTATION.md app/docs/migrations/phase-7-checkmate.md
mv docs/play-puzzle-audit.md app/docs/migrations/phase-0-audit.md
```

---

### Phase 3: Rename to Kebab-Case ✅

**Action**: Follow AGENTS.md lowercase kebab-case convention

```bash
cd app/docs

# Rename all UPPERCASE files to kebab-case
mv AI_AGENT_QUICK_REFERENCE.md ai-agent-quick-reference.md
mv GETTING_STARTED.md getting-started.md
mv ARCHITECTURE.md architecture.md
mv PRODUCTION_ARCHITECTURE.md production-architecture.md
mv FOLDER_STRUCTURE_CONVENTION.md folder-structure-convention.md
mv FOLDER_STRUCTURE.md folder-structure-backup.md  # temporary
mv FOLDER_STRUCTURE_VISUAL.md folder-structure-visual.md  # temporary
mv COMPONENT_INDEX.md component-index.md
mv HOOKS.md hooks.md
mv UI_UX_QUICK_START.md ui-ux-quick-start.md
mv I18N.md i18n.md
mv API_LAYER.md api-layer.md
```

---

### Phase 4: Merge Redundant Documentation ✅

**Action**: Consolidate overlapping documents

**Folder Structure**:
```bash
# Merge visual and backup into main convention doc
# Then delete redundant files
rm app/docs/folder-structure-backup.md
rm app/docs/folder-structure-visual.md
# Keep: folder-structure-convention.md
```

**UI/UX**:
```bash
# Merge UI_UX_QUICK_START into getting-started.md or delete if redundant
rm app/docs/ui-ux-quick-start.md  # if merged
```

---

### Phase 5: Update Index Files ✅

**Action**: Update README.md and other indexes

**Files to Update**:
- `app/README.md` - Update links to moved/renamed docs
- `app/docs/README.md` - Update service overview with new structure
- `app/docs/migrations/README.md` - Create phase index
- Root `AGENTS.md` - Verify app/ references are correct

---

### Phase 6: Clean Up Obsolete Files ✅

**Action**: Remove backups and superseded documents

```bash
cd app/docs
rm overview-old-backup.md  # Old backup, no longer needed
```

---

## 📊 Final Structure

### app/docs/ (After Reorganization)

```
app/docs/
├── README.md                          # Service overview (updated)
├── getting-started.md                 # Developer setup (renamed)
├── overview.md                        # App capabilities ✅
├── architecture.md                    # Technical design (renamed)
├── production-architecture.md         # Production setup (renamed)
├── api.md                            # API specification ✅
├── domain.md                         # Domain concepts ✅
├── operations.md                     # Deployment/ops ✅
│
├── design-language-system.md         # PRIMARY DLS doc (moved from app/DLS.md)
├── folder-structure-convention.md    # Structure rules (merged, renamed)
├── component-index.md                # Component reference (renamed)
├── hooks.md                          # Hook reference (renamed)
├── i18n.md                           # Internationalization (renamed)
├── api-layer.md                      # API client conventions (renamed)
├── ai-agent-quick-reference.md       # Agent guidance (renamed)
│
├── how-to/                           # Practical guides
│   ├── local-dev.md
│   ├── troubleshooting.md
│   ├── common-tasks.md
│   ├── tab-screen-pattern-components.md
│   └── sidebar-navigation.md
│
├── decisions/                        # ADRs
│   └── README.md
│
├── migrations/                       # Phase-based development history
│   ├── README.md                     # Phase versioning guide
│   ├── phase-0-audit.md              # Initial audit
│   ├── phase-1-folder-structure.md   # Folder restructure
│   ├── phase-1-summary.md            # Phase 1 summary
│   ├── phase-2-migration-100.md      # 100% migration
│   ├── phase-2-playscreen-refactor.md # PlayScreen refactor
│   ├── phase-3-implementation.md     # Items 2-5
│   ├── phase-3-hooks-complete.md     # Hooks completion
│   ├── phase-4-dls-87-percent.md     # DLS 87% done
│   ├── phase-4-dls-complete.md       # DLS 100% done
│   ├── phase-5-ui-ux.md              # UI/UX improvements
│   ├── phase-6-api-context.md        # API context refactor
│   └── phase-7-checkmate.md          # Checkmate implementation
│
├── accessibility-guide.md            # WCAG compliance ✅
├── api-client-conventions.md         # API patterns ✅
└── dls-implementation-guide.md       # (evaluate if needed)
```

---

## ✅ Success Criteria

After reorganization, verify:

1. ✅ **No app-specific docs in `/docs`** (cross-service only)
2. ✅ **No root-level implementation docs** (REFACTORING_SUMMARY.md moved)
3. ✅ **Single DLS source of truth** (design-language-system.md)
4. ✅ **Migration history preserved** (all phases documented)
5. ✅ **Kebab-case naming** (all markdown files lowercase)
6. ✅ **Clear structure** (overview, architecture, how-to, decisions, migrations)
7. ✅ **Updated indexes** (README.md files point to correct locations)
8. ✅ **No duplicate content** (merged overlapping docs)

---

## 🚀 Execution Order

1. **Create migrations/README.md** (phase versioning guide)
2. **Move app/DLS.md** → `app/docs/design-language-system.md`
3. **Move implementation docs** → `app/docs/migrations/phase-X-*.md`
4. **Move misplaced /docs files** → `app/docs/migrations/`
5. **Rename UPPERCASE files** → kebab-case
6. **Merge redundant docs** (folder structure, UI/UX)
7. **Update all README.md indexes**
8. **Delete obsolete files** (backups)
9. **Verify all links** (no broken references)

---

## 📝 Notes

- **Preserve all content** (move to migrations/, don't delete history)
- **Update git history** (use `git mv` for proper tracking)
- **Test all links** after reorganization
- **Update AGENTS.md** if new patterns emerge
- **Document in changelog** (CHANGELOG.md or release notes)

---

**Status**: Ready for execution  
**Estimated Time**: 30-45 minutes  
**Risk**: Low (moving files, preserving content)
