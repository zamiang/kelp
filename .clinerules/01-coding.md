# Project Guidelines

## 🛠️ Development Environment

- **Language**: TypeScript (`^5.9.0`)
- **Framework**: Next.js (Pages Router)
- **Styling**: CSS + material-ui (`^5`)
- **Component Library**: `material-ui`
- **Testing**: non currently used
- **Linting**: ESLint with `@typescript-eslint`
- **Formatting**: Prettier
- **Package Manager**: `npm` (preferred)

## 📂 Recommended Project Structure

```
kelp/
├── @types/                          # Custom TypeScript definitions
│   ├── fonts.d.ts
│   ├── gif.d.ts
│   ├── google-api.ts               # Google API type definitions
│   ├── microsoft-api.ts            # Microsoft Graph API types
│   ├── react-autolink-text2.d.ts
│   └── svg.d.ts
├── .clinerules/                     # Cline AI assistant rules & guidelines
│   ├── 01-coding.md                # Development guidelines
│   ├── 02-documentation.md         # Documentation standards
│   └── memory-bank.md              # Memory bank structure
├── .github/                        # GitHub configuration
│   ├── dependabot.yml             # Dependency updates
│   └── workflows/
│       └── lint.yml                # CI/CD workflows
├── components/                      # Website React components
│   ├── homepage/                   # Landing page components
│   │   ├── footer.tsx
│   │   ├── header.tsx
│   │   ├── image-blocks.tsx
│   │   ├── install-ui-blocks.tsx
│   │   ├── login-button.tsx
│   │   └── ui-blocks.tsx
│   └── styles/                     # Styling utilities
│       └── create-emotion-cache.ts
├── constants/                       # Application constants
│   ├── config.ts                   # Main configuration
│   ├── homepage-theme.ts           # Homepage theming
│   └── theme.ts                    # Material-UI themes
├── extension/                       # Chrome Extension
│   ├── .babelrc                    # Babel configuration
│   ├── readme.md                   # Extension documentation
│   ├── tsconfig.json               # Extension TypeScript config
│   ├── webpack.config.js           # Production build config
│   ├── webpack.dev.js              # Development build config
│   └── webpack-safari.config.js    # Safari build config
│   ├── public/                     # Extension assets
│   │   ├── dashboard.html
│   │   ├── icon16.png
│   │   ├── icon48.png
│   │   ├── icon128.png
│   │   └── kelp.svg
│   ├── safari/                     # Safari extension (Xcode project)
│   │   ├── Assets.xcassets/
│   │   ├── extension/
│   │   └── extension.xcodeproj/
│   └── src/                        # Extension source code
│       ├── app.css                 # Main app styles
│       ├── app.tsx                 # Extension app
│       ├── background.ts           # Service worker
│       ├── background-color.ts     # Background color utilities
│       ├── content-script.ts       # Content script
│       ├── manifest.json           # Chrome manifest
│       ├── manifest-safari.json    # Safari manifest
│       ├── styles.js               # Style utilities
│       ├── components/             # Extension React components
│       │   ├── dashboard/          # Dashboard-specific components
│       │   │   ├── add-tag-dialog.tsx
│       │   │   ├── desktop-dashboard.tsx
│       │   │   ├── meetings.tsx
│       │   │   ├── search.tsx
│       │   │   ├── top-nav.tsx
│       │   │   └── top-tags.tsx
│       │   ├── documents/          # Document management components
│       │   │   ├── document-row.tsx
│       │   │   └── expand-document.tsx
│       │   ├── error-tracking/     # Error handling & tracking
│       │   │   ├── catch.tsx
│       │   │   ├── error-boundary.tsx
│       │   │   └── error-tracking.ts
│       │   ├── fetch/              # Data fetching logic
│       │   │   ├── fetch-all.ts
│       │   │   ├── chrome/         # Chrome-specific fetching
│       │   │   │   └── fetch-history.ts
│       │   │   ├── google/         # Google API integration
│       │   │   │   ├── fetch-calendar-events.ts
│       │   │   │   ├── fetch-contacts.ts
│       │   │   │   ├── fetch-drive-files.ts
│       │   │   │   ├── fetch-missing-google-docs.ts
│       │   │   │   ├── fetch-people.ts
│       │   │   │   └── fetch-self.ts
│       │   │   └── microsoft/      # Microsoft Graph integration
│       │   │       ├── auth-config.ts
│       │   │       ├── fetch-calendar.ts
│       │   │       ├── fetch-helper.ts
│       │   │       ├── fetch-self.ts
│       │   │       └── fetch-token.ts
│       │   ├── homepage/           # Landing page components (duplicated)
│       │   │   ├── footer.tsx
│       │   │   ├── header.tsx
│       │   │   ├── image-blocks.tsx
│       │   │   ├── install-ui-blocks.tsx
│       │   │   ├── login-button.tsx
│       │   │   └── ui-blocks.tsx
│       │   ├── meeting/            # Meeting-related components
│       │   │   ├── expand-meeting.tsx
│       │   │   ├── featured-meeting.tsx
│       │   │   ├── meeting-highlight.tsx
│       │   │   └── meeting-row-below.tsx
│       │   ├── nav/                # Navigation components
│       │   │   └── search-bar.tsx
│       │   ├── notifications/      # Notification components (empty)
│       │   ├── onboarding/         # User onboarding
│       │   │   └── onboarding.tsx
│       │   ├── person/             # People/contacts components
│       │   │   ├── expand-person.tsx
│       │   │   ├── person-row.tsx
│       │   │   └── top-people.tsx
│       │   ├── shared/             # Reusable components & utilities
│       │   │   ├── attendee-list.tsx
│       │   │   ├── calendar-helpers.ts
│       │   │   ├── cleanup-url.ts
│       │   │   ├── date-helpers.ts
│       │   │   ├── ensure-refresh.ts
│       │   │   ├── google-login.tsx
│       │   │   ├── loading-spinner.tsx
│       │   │   ├── loading.tsx
│       │   │   ├── meeting-list.tsx
│       │   │   ├── microsoft-login.tsx
│       │   │   ├── order-by-count.ts
│       │   │   ├── past-tense.ts
│       │   │   ├── row-styles.ts
│       │   │   ├── segment-document-list.tsx
│       │   │   ├── segment-meeting-list.tsx
│       │   │   ├── tfidf.ts
│       │   │   ├── tooltip-text.ts
│       │   │   └── website-tag.tsx
│       │   ├── store/              # State management & data models
│       │   │   ├── data-types.ts
│       │   │   ├── db.ts
│       │   │   ├── IMPROVEMENTS_SUMMARY.md
│       │   │   ├── README.md
│       │   │   ├── use-store.tsx
│       │   │   ├── examples/       # Store usage examples
│       │   │   │   └── enhanced-store-usage.ts
│       │   │   ├── helpers/        # Store helper functions
│       │   │   │   ├── use-store-no-fetching.ts
│       │   │   │   └── use-store-with-fetching.ts
│       │   │   ├── models/         # Data models
│       │   │   │   ├── attendee-model.ts
│       │   │   │   ├── base-store.ts
│       │   │   │   ├── document-model.ts
│       │   │   │   ├── domain-blocklist-model.ts
│       │   │   │   ├── domain-filter-model.ts
│       │   │   │   ├── enhanced-tfidf-store.ts
│       │   │   │   ├── enhanced-website-store.ts
│       │   │   │   ├── enhanced-website-visit-store.ts
│       │   │   │   ├── person-model.ts
│       │   │   │   ├── segment-document-model.ts
│       │   │   │   ├── segment-model.ts
│       │   │   │   ├── segment-tag-model.ts
│       │   │   │   ├── website-blocklist-model.ts
│       │   │   │   ├── website-image-model.ts
│       │   │   │   ├── website-pin-model.ts
│       │   │   │   └── website-tag-model.ts
│       │   │   ├── types/          # TypeScript type definitions
│       │   │   │   └── store-types.ts
│       │   │   └── utils/          # Store utilities
│       │   │       ├── enhanced-search-index.ts
│       │   │       └── error-handler.ts
│       │   ├── styles/             # Styling utilities
│       │   │   └── create-emotion-cache.ts
│       │   ├── summary/            # Summary components
│       │   │   └── summary.tsx
│       │   ├── user-profile/       # User profile management
│       │   │   └── settings.tsx
│       │   └── website/            # Website tracking components
│       │       ├── add-tag-to-meeting-dialog.tsx
│       │       ├── add-website-to-tag-dialog.tsx
│       │       ├── draggable-website-highlights.tsx
│       │       ├── expand-website.tsx
│       │       ├── get-featured-websites.ts
│       │       ├── large-website.tsx
│       │       ├── most-recent-tab.tsx
│       │       ├── tag-highlights.tsx
│       │       └── website-highlights.tsx
│       └── styles/                 # Extension-specific styles
├── memory-bank/                     # Project documentation & context
│   ├── activeContext.md            # Current work context
│   ├── css-modernization-plan.md   # CSS modernization plan
│   ├── modernization-roadmap.md    # Technical roadmap
│   ├── phase1-implementation.md    # Implementation details
│   ├── productContext.md           # Product requirements
│   ├── progress.md                 # Progress tracking
│   ├── projectbrief.md             # Project foundation document
│   ├── systemPatterns.md           # System architecture patterns
│   ├── techContext.md              # Technical context
│   └── testing.md                  # Testing documentation
├── pages/                          # Next.js pages (Pages Router)
│   ├── _app.tsx                    # App wrapper
│   ├── _document.tsx               # Document structure
│   ├── _error.tsx                  # Error page
│   ├── index.tsx                   # Homepage
│   ├── about.tsx                   # About page
│   ├── install.tsx                 # Installation guide
│   ├── privacy.tsx                 # Privacy policy
│   ├── terms.tsx                   # Terms of service
│   ├── 404.tsx                     # 404 error page
│   └── api/                        # API routes
│       ├── microsoft-auth.ts       # Microsoft authentication
│       └── sitemap.ts              # Sitemap generation
├── public/                         # Static assets
│   ├── favicon.ico                 # Favicons
│   ├── kelp.svg                    # Logo
│   ├── android-chrome-192x192.png  # Android favicons
│   ├── android-chrome-512x512.png
│   ├── apple-touch-icon.png        # Apple touch icon
│   ├── favicon-16x16.png           # Various favicon sizes
│   ├── favicon-24.svg
│   ├── favicon-32x32.png
│   ├── favicon.svg
│   ├── kelp-24.svg
│   ├── animations/                 # GIF animations
│   │   ├── meetings.gif
│   │   ├── pin.gif
│   │   ├── tag-group.gif
│   │   ├── tag-meeting.gif
│   │   ├── tag-nav.gif
│   │   └── tags.gif
│   ├── extension-page/             # Chrome Web Store assets
│   │   ├── ChromeWebStore_kelp_1.jpg
│   │   ├── ChromeWebStore_kelp_2.jpg
│   │   ├── ChromeWebStore_kelp_3.jpg
│   │   └── ChromeWebStore_kelp_4.jpg
│   ├── fonts/                      # Custom fonts
│   │   ├── basis-grotesque-italic-pro.woff2
│   │   ├── basis-grotesque-medium-pro.woff2
│   │   └── basis-grotesque-regular-pro.woff2
│   ├── google-permissions/         # Permission screenshots
│   │   ├── activity.png
│   │   ├── calendar.png
│   │   ├── contacts.png
│   │   ├── drive-kelp.png
│   │   └── drive.png
│   ├── icons/                      # Icon assets
│   └── images/                     # General images
│       ├── documents.svg
│       ├── google-g.svg
│       ├── meeting.svg
│       ├── meetings-large.svg
│       └── person.svg
├── scripts/                        # Utility scripts
│   └── type-audit.js              # TypeScript audit tool
├── test/                           # Test files
│   ├── background.test.ts          # Extension background tests
│   ├── fixes-validation.js         # Validation utilities
│   ├── integration.test.ts         # Integration tests
│   ├── README.md                   # Testing documentation
│   ├── setup.ts                    # Test setup
│   ├── simple-error-demo.js        # Error demonstration
│   ├── TEST_COVERAGE_PLAN.md       # Test coverage planning
│   ├── vitest-environment-jsdom.ts # Vitest JSDOM environment
│   ├── components/                 # Component tests
│   │   ├── dashboard/
│   │   ├── shared/
│   │   └── website/
│   └── store/                      # Store tests
│       ├── base-store.test.ts
│       ├── database-setup.test.ts
│       ├── enhanced-search-index.test.ts
│       ├── enhanced-tfidf-store.test.ts
│       ├── error-handler.test.ts
│       ├── index.test.ts
│       └── README.md
├── .gitignore                      # Git ignore rules
├── .nvmrc                          # Node version specification
├── .prettierignore                 # Prettier ignore rules
├── .prettierrc                     # Prettier configuration
├── dependabot.yml                  # Dependabot configuration
├── eslint.config.js                # ESLint configuration
├── LICENSE                         # Project license
├── next-env.d.ts                   # Next.js environment types
├── next.config.js                  # Next.js configuration
├── package-lock.json               # NPM lock file
├── package.json                    # Dependencies & scripts
├── README.md                       # Project documentation
├── SECURITY.md                     # Security policy
├── tsconfig-all.json               # Extended TypeScript config
├── tsconfig-all.tsbuildinfo        # TypeScript build info
├── tsconfig-website-and-extension.json # Specific TypeScript config
├── tsconfig.json                   # TypeScript configuration
└── vitest.config.ts                # Vitest test configuration
```

## 📦 Installation Notes

- `npm install`

## ⚙️ Dev Commands

- **Dev server**: `npm run dev`
- **Build**: `npm build`
- **Start**: `npm start`
- **Lint**: `npm lint`
- **Format**: `npm prettier`
- **Test**: `npm test`

## 🧪 Testing Practices

- none right now

## 🧱 Component Guidelines

- Use `material-ui` components by default for form elements, cards, dialogs, etc.
- Style components with Tailwind utility classes
- Co-locate CSS modules or component-specific styling in the same directory
- Use environment variables for configuration
- Use server components by default
- Implement client components only when necessary

## 📝 Code Style Standards

- Prefer arrow functions
- Annotate return types
- Always destructure props
- Avoid `any` type, use `unknown` or strict generics
- Use TypeScript for type safety
- Implement proper metadata for SEO
- Utilize Next.js Image component for optimized images
- Use CSS Modules or Tailwind CSS for styling
- Implement proper error boundaries
- Follow Next.js naming conventions for special files

## 🔍 Documentation & Onboarding

- Each component and hook should include a short comment on usage
- Document top-level files (like `app/layout.tsx`) and configs
- Keep `README.md` up to date with getting started, design tokens, and component usage notes

## 🔐 Security

- Validate all server-side inputs (API routes)
- Use HTTPS-only cookies and CSRF tokens when applicable
- Protect sensitive routes with middleware or session logic
