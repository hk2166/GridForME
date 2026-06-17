
# ─────────────────────────────────────────────────────────────────────────────
# Commit 2 — Rules modal + mobile responsiveness (18:30)
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "Commit 2 — rules modal and mobile responsiveness..."

git add frontend/src/components/RulesModal.tsx
git add frontend/src/components/GridCanvas.tsx
git add frontend/src/app/grid/page.tsx
git add frontend/src/app/page.tsx

guard_env
echo "Staged:"; git diff --cached --name-only

GIT_AUTHOR_DATE="2026-06-17 18:30:00 +0530" \
GIT_COMMITTER_DATE="2026-06-17 18:30:00 +0530" \
git commit -m "feat(frontend): add rules modal and mobile responsiveness"

# ─────────────────────────────────────────────────────────────────────────────
# Commit 3 — Backend grid reset + phase 6 completion (18:55)
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "Commit 3 — grid reset endpoint and phase 6 completion..."

git add backend/src/index.ts
git add backend/src/services/gridService.ts
git add backend/src/config/env.ts
git add backend/.env.example


guard_env
echo "Staged:"; git diff --cached --name-only

GIT_AUTHOR_DATE="2026-06-17 18:55:00 +0530" \
GIT_COMMITTER_DATE="2026-06-17 18:55:00 +0530" \
git commit -m "feat(backend): add grid reset endpoint and phase 6 completion"

# ─────────────────────────────────────────────────────────────────────────────
# Push
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "Pushing to remote..."
git push

echo ""
echo "✓ Phase 6 pushed — 3 commits with timestamps:"
echo "  18:00  feat(frontend): add toast notifications"
echo "  18:30  feat(frontend): add rules modal and mobile responsiveness"
echo "  18:55  feat(backend): add grid reset endpoint and phase 6 completion"
