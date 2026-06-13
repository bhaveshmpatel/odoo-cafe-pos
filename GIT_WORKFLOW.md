# Git & Branching Workflow

This repository strictly follows a structured branching and commit workflow. The `main` branch must remain in a fully deployable, bug-free state at all times. **Never commit directly to `main`.**

## 🌿 1. Branch Naming Conventions

All work must be done on a dedicated branch branched off from `main`. Use the following prefixes to categorize your work:

* `feat/` - For new features (e.g., `feat/discount-engine`, `feat/kds-websockets`)
* `fix/` - For bug fixes (e.g., `fix/cart-state-hydration`, `fix/socket-cors-error`)
* `ui/` - For frontend layout and styling (e.g., `ui/floor-plan-grid`, `ui/responsive-navbar`)
* `chore/` - For configuration, dependencies, or database updates (e.g., `chore/prisma-schema-update`)

## 📝 2. Commit Message Standards (Conventional Commits)

We use Conventional Commits. Since this is a **Turborepo**, include the scope of the app you are working on in parentheses `(web)`, `(api)`, `(db)`, or `(shared)`.

**Format:**
`<type>(<scope>): <short description>`

**Examples:**
* `feat(api): implement socket.io event for new kitchen orders`
* `fix(web): resolve zustand localstorage hydration mismatch`
* `ui(web): add dynamic green border to active tables in floor plan`
* `chore(db): add pos_x and pos_y to Table model for spatial layout`

## 🔄 3. The Pull Request (PR) Lifecycle

Follow this exact loop for every feature to guarantee a clean, conflict-free codebase.

1. **Update Local Main:** Always start with the latest code.
   ```bash
   git checkout main
   git pull origin main