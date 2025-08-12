# Project Guidelines

## 🛠️ Development Environment

- **Language**: TypeScript (`^5.9.0`)
- **Framework**: Next.js (Pages Router)
- **Styling**: CSS + material-ui (`^5`)
- **Component Library**: `radix-ui`
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
├── components/                      # React components (feature-organized)
│   ├── dashboard/                   # Dashboard-specific components
│   │   ├── add-tag-dialog.tsx
│   │   ├── desktop-dashboard.tsx
│   │   ├── meetings.tsx
│   │   ├── search.tsx
│   │   ├── top-nav.tsx
│   │   └── top-tags.tsx
│   ├── documents/                   # Document management components
│   │   ├── document-row.tsx
│   │   └── expand-document.tsx
│   ├── error-tracking/              # Error handling & tracking
│   │   ├── catch.tsx
│   │   ├── error-boundary.tsx
│   │   └── error-tracking.ts
│   ├── fetch/                       # Data fetching logic
│   │   ├── fetch-all.ts
│   │   ├── chrome/                  # Chrome-specific fetching
│   │   ├── google/                  # Google API integration
│   │   └── microsoft/               # Microsoft Graph integration
│   ├── homepage/                    # Landing page components
│   │   ├── footer.tsx
│   │   ├── header.tsx
│   │   ├── image-blocks.tsx
│   │   ├── install-ui-blocks.tsx
│   │   ├── login-button.tsx
│   │   └── ui-blocks.tsx
│   ├── meeting/                     # Meeting-related components
│   │   ├── expand-meeting.tsx
│   │   ├── featured-meeting.tsx
│   │   ├── line-calendar.tsx
│   │   ├── meeting-highlight.tsx
│   │   └── meeting-row-below.tsx
│   ├── nav/                         # Navigation components
│   │   └── search-bar.tsx
│   ├── notifications/               # Notification components
│   ├── onboarding/                  # User onboarding
│   │   └── onboarding.tsx
│   ├── person/                      # People/contacts components
│   │   ├── expand-person.tsx
│   │   ├── person-row.tsx
│   │   └── top-people.tsx
│   ├── shared/                      # Reusable components & utilities
│   │   ├── attendee-list.tsx
│   │   ├── calendar-helpers.ts
│   │   ├── cleanup-url.ts
│   │   ├── date-helpers.ts
│   │   ├── google-login.tsx
│   │   ├── loading-spinner.tsx
│   │   ├── microsoft-login.tsx
│   │   ├── bar-chart/               # Chart components
│   │   └── ...
│   ├── store/                       # State management & data models
│   │   ├── data-types.ts
│   │   ├── db.ts
│   │   ├── search-index.ts
│   │   ├── use-store.tsx
│   │   ├── helpers/                 # Store helper functions
│   │   └── models/                  # Data models
│   ├── styles/                      # Styling utilities
│   │   └── create-emotion-cache.ts
│   ├── summary/                     # Summary components
│   │   └── summary.tsx
│   ├── user-profile/                # User profile management
│   │   └── settings.tsx
│   └── website/                     # Website tracking components
│       ├── add-tag-to-meeting-dialog.tsx
│       ├── expand-website.tsx
│       ├── website-highlights.tsx
│       └── ...
├── constants/                       # Application constants
│   ├── config.ts                   # Main configuration
│   ├── homepage-theme.ts           # Homepage theming
│   └── theme.ts                    # Material-UI themes
├── extension/                       # Chrome Extension
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
│   ├── src/                        # Extension source code
│   │   ├── background.ts           # Service worker
│   │   ├── app.tsx               # Extension app
│   │   ├── calendar.ts             # Calendar integration
│   │   ├── manifest.json           # Chrome manifest
│   │   └── manifest-safari.json    # Safari manifest
│   ├── webpack.config.js           # Production build config
│   ├── webpack.dev.js              # Development build config
│   ├── webpack-safari.config.js    # Safari build config
│   └── tsconfig.json               # Extension TypeScript config
├── memory-bank/                     # Project documentation & context
│   ├── activeContext.md            # Current work context
│   ├── modernization-roadmap.md    # Technical roadmap
│   ├── phase1-implementation.md    # Implementation details
│   ├── productContext.md           # Product requirements
│   ├── progress.md                 # Progress tracking
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
│   ├── animations/                 # GIF animations
│   ├── extension-page/             # Chrome Web Store assets
│   ├── fonts/                      # Custom fonts
│   ├── google-permissions/         # Permission screenshots
│   ├── icons/                      # Icon assets
│   └── images/                     # General images
├── scripts/                        # Utility scripts
│   └── type-audit.js              # TypeScript audit tool
├── test/                           # Test files
│   ├── background.test.ts          # Extension background tests
│   ├── integration.test.ts         # Integration tests
│   ├── app.test.tsx              # Extension app tests
│   ├── setup.ts                    # Test setup
│   └── README.md                   # Testing documentation
├── calendar-add-on/                # Google Calendar Add-on
│   └── appsscript.json
├── .github/                        # GitHub configuration
│   ├── dependabot.yml             # Dependency updates
│   └── workflows/
│       └── lint.yml                # CI/CD workflows
├── package.json                    # Dependencies & scripts
├── tsconfig.json                   # TypeScript configuration
├── tsconfig-all.json               # Extended TypeScript config
├── next.config.js                  # Next.js configuration
├── eslint.config.js                # ESLint configuration
├── vitest.config.ts                # Vitest test configuration
├── .prettierrc                     # Prettier configuration
└── README.md                       # Project documentation
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
