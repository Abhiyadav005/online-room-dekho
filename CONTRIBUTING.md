# Contributing

Use short-lived branches such as `feature/search-filters`, `fix/otp-expiry`, or
`hotfix/security-header`. Open a pull request into `develop`; release changes
are merged from `develop` into `main` after review and verification.

Before opening a pull request, run:

```bash
npm run lint
npm run build
npm test
```

Do not commit `.env` files, API credentials, generated uploads, personal data,
or real owner/contact information. Seed data must remain fictional.
