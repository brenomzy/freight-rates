# Development Guide

This guide will walk you through the complete development workflow from creating a feature to deploying it to production.

---

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Development Workflow](#development-workflow)
- [Webflow Integration](#webflow-integration)
- [Deployment Process](#deployment-process)
- [Cache Busting](#cache-busting)
- [Common Commands Reference](#common-commands-reference)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)
- [Quick Start Checklist](#quick-start-checklist)

**New to the project?** Start with [DEVELOPMENT_SETUP.md](DEVELOPMENT_SETUP.md) to set up your local environment.

For technical details about build configuration, see [SETUP.md](SETUP.md).
For deployment configuration, see [DEPLOYMENT.md](DEPLOYMENT.md).

---

## Prerequisites

Before you start, make sure you have:

- ✅ **GitHub Desktop** installed ([download here](https://desktop.github.com/))
- ✅ **Node.js** v18+ installed ([download here](https://nodejs.org/))
- ✅ **pnpm** installed
  - Open Terminal/Command Prompt and run: `npm install -g pnpm`
  - Verify with: `pnpm --version`
- ✅ **Code editor** (VS Code recommended, [download here](https://code.visualstudio.com/))
- ✅ **Access to the repository** on GitHub
- ✅ **Access to Webflow** project (if applicable)

### Recommended VS Code Extensions

Install these for the best development experience:

1. **Prettier - Code formatter** (`esbenp.prettier-vscode`)
2. **ESLint** (`dbaeumer.vscode-eslint`)

These extensions will automatically format and check your code as you work.

---

## Initial Setup

### 1. Clone the Repository

1. Open **GitHub Desktop**
2. Click **File → Clone Repository**
3. Select the repository from your GitHub account (or use the URL tab to enter the repository URL)
4. Choose where to save it on your computer
5. Click **Clone**

GitHub Desktop will download the repository to your computer.

### 2. Open in VS Code

1. In GitHub Desktop, click **Repository → Open in Visual Studio Code**
2. VS Code will open with your project

VS Code will automatically pick up the project settings which enable:

- Format code on save
- Auto-fix linting errors on save

### 3. Install Dependencies

Open the Terminal in VS Code (**View → Terminal** or `` Ctrl+` ``), then run:

```bash
pnpm install
```

This installs all required packages from `package.json`. It may take a minute.

### 4. Start Development Server

In the same Terminal, run:

```bash
pnpm dev
```

You should see output like:

```
┌─────────┬──────────────────────────────────┬────────────────────────────────────────────────────┐
│ (index) │ File Location                    │ Import Suggestion                                  │
├─────────┼──────────────────────────────────┼────────────────────────────────────────────────────┤
│ 0       │ 'http://localhost:3000/index.js' │ '<script defer src="http://localhost:3000/..."></script>' │
└─────────┴──────────────────────────────────┴────────────────────────────────────────────────────┘
```

Your code is now being served at `http://localhost:3000/index.js`

**Keep this Terminal window running while you develop.**

---

## Development Workflow

### Step 1: Create a Feature Branch

**Always work on a feature branch, never directly on `master` or `staging`.**

1. Open **GitHub Desktop**
2. Make sure you're on the `master` branch:
   - At the top, you should see "Current Branch: master"
   - If not, click the branch dropdown and select `master`
3. Click **Repository → Pull** to get the latest changes
4. Click the **Current Branch** dropdown at the top
5. Click **New Branch**
6. Name your branch using these conventions:
   - `feature/add-dark-mode` - New feature
   - `fix/login-bug` - Bug fix
   - `refactor/cleanup-utils` - Code refactoring
   - `docs/update-readme` - Documentation changes
7. Click **Create Branch**

Your new branch is now active and ready for changes.

### Step 2: Write Your Code

Edit files in the `src/` directory using VS Code:

```
src/
├── index.js          # Main entry point
└── utils/            # Helper functions
    └── yourfile.js
```

Make your changes in VS Code. The dev server (`pnpm dev`) will automatically rebuild when you save files.

### Step 3: Test Your Changes

With `pnpm dev` running, your changes are automatically rebuilt and served at `http://localhost:3000/index.js`.

**Test in Webflow:**

1. Go to your Webflow project
2. Add `?staging=true` to the URL
3. Your code will load from `localhost:3000`
4. Test your changes

**OR test in a standalone HTML file:**

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Test</title>
  </head>
  <body>
    <h1>Testing</h1>
    <script src="http://localhost:3000/index.js"></script>
  </body>
</html>
```

### Step 4: Check Code Quality

Before committing, always check your code in the Terminal:

```bash
# Check for linting errors
pnpm lint

# Fix auto-fixable issues
pnpm lint:fix

# Check TypeScript types (even for JS files)
pnpm check
```

Fix any errors that appear before proceeding.

### Step 5: Commit Your Changes

1. Open **GitHub Desktop**
2. You'll see all your changed files in the left panel
3. Review the changes - you can click on each file to see what changed
4. Check the boxes next to files you want to commit (or leave all checked to commit everything)
5. At the bottom, write a commit summary:
   - Use present tense: "Add feature" not "Added feature"
   - Be specific: "Fix login button alignment" not "Fix bug"
   - Keep it under 50 characters if possible
6. Optionally, add a longer description in the description field
7. Click **"Commit to [your-branch-name]"**

### Step 6: Push to GitHub

1. In GitHub Desktop, click the **"Push origin"** button at the top
2. This uploads your changes to GitHub

If this is your first push of a new branch, the button will say **"Publish branch"** instead.

---

## Testing on Staging

### Step 7: Merge to Staging Branch

If your project uses staging, test your changes there before production:

1. Open **GitHub Desktop**
2. Click the **Current Branch** dropdown
3. Select `staging` branch
4. Click **Repository → Pull** to get latest changes
5. Click **Branch → Merge into Current Branch**
6. Select your feature branch from the list
7. Click **Create a merge commit**
8. Click **Push origin** to deploy to staging

### Step 8: Test on Staging

After pushing to staging:

1. GitHub Actions will automatically deploy to staging S3/CloudFront
2. Wait ~2-3 minutes for deployment
3. Test on staging Webflow site (it will automatically load staging CDN)

**Check deployment status:**

- Go to GitHub → Actions tab
- Look for "Deploy to S3 + CloudFront" workflow
- Ensure it completed successfully (green checkmark)

---

## Deployment to Production

### Step 9: Create a Changeset

Before merging to production, document your changes:

1. Make sure you're on your feature branch in **GitHub Desktop**
2. Open the **Terminal** in VS Code and run:
   ```bash
   pnpm changeset
   ```

You'll be asked:

**1. What type of change?**

- `patch` (1.0.0 → 1.0.1) - Bug fixes, small changes
- `minor` (1.0.0 → 1.1.0) - New features, non-breaking
- `major` (1.0.0 → 2.0.0) - Breaking changes

Select using arrow keys and press Enter.

**2. Summary of changes:**
Write a brief description (will appear in CHANGELOG). For example:

```
Fix login button alignment issue
```

This creates a file in the `.changeset/` directory.

**Commit the changeset:**

1. Go back to **GitHub Desktop**
2. You'll see the new changeset file in your changes
3. Write a commit message: "Add changeset for [your feature]"
4. Click **Commit to [your-branch-name]**
5. Click **Push origin**

### Step 10: Create Pull Request

1. In **GitHub Desktop**, after pushing your branch, click **"Create Pull Request"** at the top
2. Your browser will open to GitHub.com
3. The pull request form will be pre-filled with your branch
4. Fill in the description. Example:

```markdown
## What Changed

- Fixed login button alignment on mobile devices
- Updated button styles to match design system

## How to Test

1. Open the site on mobile or narrow browser
2. Navigate to login page
3. Verify button is properly aligned

## Checklist

- [x] Code tested locally
- [x] Linting passed
- [x] Changeset created
```

5. Click **"Create pull request"**

### Step 11: Review and Merge

**If you have teammates:**

1. Wait for code review
2. Address any feedback
3. Wait for approval

**When ready to merge:**

1. Check that CI workflow passed (green checkmark)
2. Click "Merge pull request"
3. Click "Confirm merge"
4. Delete the feature branch (optional cleanup)

### Step 12: Version & Release

After merging your PR to `master`:

1. **Changesets bot** will automatically create a "Version Packages" PR
2. This PR contains:
   - Updated version in `package.json`
   - Updated `CHANGELOG.md`
   - Removed changeset files

**Review the Version PR:**

- Check version number is correct
- Review changelog entries
- Merge when ready

**After merging Version PR:**

- npm: Automatically publishes to npm (if enabled)
- S3: Automatically deploys to production S3/CloudFront (if enabled)

---

## Webflow Integration

### Add Code to Webflow

**Where to add the code:**

1. Open your Webflow project
2. Go to Project Settings (gear icon)
3. Click "Custom Code" tab
4. Paste code in "Head Code" or "Footer Code" section

### Loader Script (Recommended)

This script automatically handles staging vs production and cache busting:

```html
<!-- DIGITAL SPARKS CUSTOM CODE -->
<script>
  const PROD_CDN = 'https://YOUR-PRODUCTION-CDN.cloudfront.net';
  const STAGE_CDN = 'https://YOUR-STAGING-CDN.cloudfront.net';
  const LOCAL = 'http://localhost:3000';
  const VERSION = '1.0.0'; // Update this after each release!

  window.loadResource = function (file, type) {
    const params = new URLSearchParams(location.search);
    const useLocal = (params.get('staging') || localStorage.getItem('staging')) === 'true';

    // Store and sync staging preference
    localStorage.setItem('staging', useLocal ? 'true' : 'false');
    if (useLocal && !params.has('staging')) {
      params.set('staging', 'true');
      history.replaceState({}, '', `${location.pathname}?${params}`);
    }

    // Determine base URL
    const isStaging = location.hostname.includes('webflow.io');
    const base = useLocal ? LOCAL : isStaging ? STAGE_CDN : PROD_CDN;
    const url = `${base}/${file}?v=${VERSION}`;

    // Create and append element
    const el =
      type === 'script'
        ? Object.assign(document.createElement('script'), { async: true, src: url })
        : Object.assign(document.createElement('link'), { rel: 'stylesheet', href: url });

    document.head.appendChild(el);
  };
</script>
<!-- END DIGITAL SPARKS CUSTOM CODE -->
```

**Replace these values:**

- `PROD_CDN` - Your production CloudFront URL
- `STAGE_CDN` - Your staging CloudFront URL
- `VERSION` - Current version (update after each release!)

### Loading JavaScript and CSS Files

After adding the loader script above, you can load your files on specific pages:

**Load JavaScript files:**

```html
<script>
  // Load main JavaScript file
  loadResource('index.js', 'script');

  // Load page-specific JavaScript
  loadResource('home/index.js', 'script');
  loadResource('contact/form.js', 'script');
</script>
```

**Load CSS files:**

```html
<script>
  // Load main stylesheet
  loadResource('styles.css', 'style');

  // Load page-specific CSS
  loadResource('home/styles.css', 'style');
</script>
```

**Load multiple files:**

```html
<script>
  // Load both CSS and JavaScript
  loadResource('styles.css', 'style');
  loadResource('index.js', 'script');
</script>
```

**Where to add these:**

- **Site-wide files**: Add to Project Settings → Custom Code → Head Code
- **Page-specific files**: Add to Page Settings → Custom Code → Before `</body>` tag

### Alternative: Direct Script Tag (Simple)

If you don't need staging or version control:

```html
<script defer src="https://YOUR-CDN.cloudfront.net/index.js?v=1.0.0"></script>
```

Update the `?v=1.0.0` after each release.

### Testing Modes

**Production mode (live site):**

- URL: `https://yoursite.com`
- Loads from: Production CDN

**Staging mode (Webflow preview):**

- URL: `https://yourproject.webflow.io`
- Loads from: Staging CDN

**Local development mode:**

- URL: `https://yoursite.com?staging=true`
- Loads from: `http://localhost:3000`
- Requires `pnpm dev` running on your computer

---

## Cache Busting

### Why Cache Busting is Needed

Browsers and CDNs cache JavaScript files for performance. When you deploy new code, users might see the old cached version.

### How to Bust Cache

**After each production deployment:**

1. **Check the new version number** from the merged "Version Packages" PR

   - Example: `1.2.5`

2. **Update Webflow loader script:**

   - Go to Webflow → Project Settings → Custom Code
   - Find the line: `const VERSION = '1.0.0';`
   - Change to: `const VERSION = '1.2.5';`
   - Click "Save Changes"

3. **Publish Webflow site**

   - Click "Publish" button
   - Select domains to publish
   - Confirm publish

4. **Verify the update:**
   - Open your site in an incognito window
   - Open DevTools (F12) → Network tab
   - Look for: `index.js?v=1.2.5`
   - Verify the version number matches

### Alternative: Direct URL Method

If using direct script tag instead of loader:

```html
<!-- Old -->
<script src="https://cdn.example.com/index.js?v=1.0.0"></script>

<!-- New - update version number -->
<script src="https://cdn.example.com/index.js?v=1.2.5"></script>
```

### Hard Refresh (For Testing)

If you're testing and need to clear your browser cache:

- **Windows/Linux:** `Ctrl + Shift + R` or `Ctrl + F5`
- **Mac:** `Cmd + Shift + R`

---

## Common Commands Reference

### Terminal Commands

Run these in VS Code Terminal (**View → Terminal**):

```bash
pnpm install      # Install dependencies (first time setup)
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm lint         # Check code quality
pnpm lint:fix     # Auto-fix linting issues
pnpm check        # Type check
pnpm changeset    # Create a changeset for versioning
```

### GitHub Desktop Actions

All version control operations are done through GitHub Desktop:

- **Create branch**: Current Branch dropdown → New Branch
- **Switch branch**: Current Branch dropdown → Select branch
- **Pull changes**: Repository → Pull (or Fetch origin)
- **Commit changes**: Review changes → Write message → Commit button
- **Push changes**: Push origin button
- **Create PR**: Create Pull Request button
- **Merge branch**: Branch → Merge into Current Branch

---

## Troubleshooting

### Development Server Won't Start

**Error:** `Port 3000 is already in use`

**Solution:**

```bash
# Kill process on port 3000 (Mac/Linux)
lsof -ti:3000 | xargs kill -9

# Or use different port
# Edit bin/build.js, change SERVE_PORT = 3000 to 3001
```

### Linting Errors

**Error:** `'console' is not defined`

**Solution:** Already fixed in `eslint.config.js`, but if you see it:

```javascript
// Add at top of file
/* eslint-env browser */
```

### Code Not Updating in Browser

**Possible causes:**

1. **Forgot to update VERSION in Webflow**

   - Solution: Update VERSION constant, republish

2. **Browser cache**

   - Solution: Hard refresh (`Ctrl + Shift + R`)

3. **Not running pnpm dev**

   - Solution: Check terminal, restart `pnpm dev`

4. **Wrong URL in Webflow**
   - Solution: Verify CDN URLs match deployment

### Deployment Failed

**Check GitHub Actions:**

1. Go to repository → Actions tab
2. Click on failed workflow
3. Read error message
4. Common issues:
   - AWS credentials not set
   - S3 bucket doesn't exist
   - CloudFront distribution ID wrong

### Merge Conflicts

**When merging branches in GitHub Desktop:**

1. GitHub Desktop will show "Merge conflicts" warning
2. Click **"Open in Visual Studio Code"**
3. In VS Code, look for files with conflict markers:
   ```
   <<<<<<< HEAD
   Your changes
   =======
   Changes from other branch
   >>>>>>> feature/branch-name
   ```
4. Edit the files to keep the changes you want
5. Delete the conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`)
6. Save the files
7. Go back to **GitHub Desktop**
8. Click **"Commit merge"**
9. Click **"Push origin"**

---

## Best Practices

### Code Quality

✅ **DO:**

- Write clear variable names (`userName` not `x`)
- Add JSDoc comments to functions
- Test in both staging and production
- Keep functions small and focused
- Use `const` by default, `let` when needed

❌ **DON'T:**

- Commit directly to `master`
- Skip the changeset step
- Forget to update VERSION in Webflow
- Use `var` (use `const` or `let`)
- Leave `console.log` in production code

### Version Control

✅ **DO:**

- Pull latest changes before creating a new branch
- Write descriptive commit messages
- Create pull requests for review
- Review changes before committing
- Keep commits focused on one thing

❌ **DON'T:**

- Work directly on `master` or `staging` branches
- Commit large files or node_modules
- Make commits without testing first
- Push without pulling latest changes first

### Deployment

✅ **DO:**

- Test on staging before production
- Create changeset for every user-facing change
- Update VERSION in Webflow after deploy
- Verify deployment in incognito window

❌ **DON'T:**

- Skip testing on staging
- Deploy on Friday afternoon
- Forget to update cache-busting version

---

## Quick Start Checklist

**Starting a new feature:**

- [ ] Open GitHub Desktop and pull latest `master` branch
- [ ] Create new feature branch
- [ ] Open in VS Code
- [ ] Run `pnpm install` (if first time)
- [ ] Start `pnpm dev` in Terminal
- [ ] Write your code
- [ ] Test locally with `?staging=true` in Webflow
- [ ] Run `pnpm lint` and fix errors
- [ ] Commit changes in GitHub Desktop
- [ ] Create changeset with `pnpm changeset`
- [ ] Commit and push the changeset
- [ ] Create Pull Request from GitHub Desktop
- [ ] Wait for PR review and approval
- [ ] Merge PR on GitHub.com

**After PR is merged:**

- [ ] Wait for "Version Packages" PR to be created automatically
- [ ] Review and merge "Version Packages" PR
- [ ] Wait for deployment to complete (~2-3 minutes)
- [ ] Update VERSION in Webflow loader script
- [ ] Publish Webflow site
- [ ] Verify changes in incognito window
- [ ] ✅ Done!

---

## Getting Help

**Questions?**

1. Check this guide first
2. Check [DEVELOPMENT_SETUP.md](DEVELOPMENT_SETUP.md) if you need help setting up your local environment
3. Check [SETUP.md](SETUP.md) for technical details about build configuration
4. Check [DEPLOYMENT.md](DEPLOYMENT.md) for deployment configuration
5. Ask your team lead
6. Check GitHub Issues

**Found a bug in this guide?**
Open an issue or submit a pull request to improve it!

---

## Attribution

This development guide is part of the Digital Sparks Developer Starter, based on the [Finsweet Developer Starter](https://github.com/finsweet/developer-starter) template.
