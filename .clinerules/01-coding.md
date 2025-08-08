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

```warp-runnable-command
todo
```

## 📦 Installation Notes

- `npm install --legacy-peer-deps`

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
