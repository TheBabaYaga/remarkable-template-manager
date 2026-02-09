# Contributing to Remarkable Template Manager

Thanks for your interest in contributing! This project welcomes bug reports, feature requests, documentation improvements, and pull requests.

## Quick links

- Readme: see `README.md` for setup and usage
- Issues: use GitHub Issues for bugs, feature requests, and questions

## Ground rules

- Be respectful and constructive. Assume good intent.
- Keep changes small and focused when possible.
- Don’t include secrets in issues, PRs, logs, or screenshots (device passwords, private keys, IPs if sensitive).

## Before you open an issue

- Search existing issues (including closed ones).
- Make sure you’re on the latest commit/release you can reasonably test.
- Collect the key details below so maintainers can reproduce the problem.

## Issue types and what to include

### Bug report

Please include:

- **Summary**: what went wrong
- **Steps to reproduce**: numbered steps
- **Expected behavior** vs **actual behavior**
- **Screenshots / screen recording** (if UI-related)
- **App version**: shown in the app header (or how you built it)
- **Host OS**: macOS/Windows/Linux + version
- **Device**: reMarkable model (1/2/Pro) + whether Developer Mode is enabled (Pro requires it)
- **Connection details**: connection method, anything unusual about networking
- **Logs / errors**: paste relevant snippets (redact secrets)

If the bug is hard to reproduce, add notes about frequency and any patterns you’ve noticed.

### Feature request / enhancement

Please include:

- **Problem**: what you’re trying to accomplish (the “why”)
- **Proposed solution**: what you’d like to happen
- **Alternatives**: other approaches you considered
- **UX notes**: screenshots/mockups or a rough flow (especially for UI changes)
- **Scope**: what’s in/out of the first version

### Documentation request / clarification

Please include:

- **What’s unclear or missing**
- **Where**: link/section name or file path (e.g. `README.md#development`)
- **What you expected to find**

### Question / support

If you’re not sure it’s a bug, open an issue and label it as a question/support request. Please include the same environment details as a bug report when relevant.

## Security issues

If you believe you’ve found a security vulnerability, **please do not open a public issue**. Use GitHub’s “Report a vulnerability” / Security Advisories flow for the repository, or contact the maintainer privately.

## Development workflow

See `README.md` for prerequisites and the basic development commands. Common tasks:

### Backend (Go)

- **Format**:

```bash
gofmt -w .
```

- **Test**:

```bash
go test ./...
```

### Frontend (React)

```bash
cd frontend
npm install
npm run lint
npm run test
```

## Pull request guidelines

- **Link the issue** your PR addresses (or explain why one isn’t needed).
- **Keep PRs focused**: one feature/fix per PR when possible.
- **Include a clear description**: what changed and why.
- **Add screenshots/video** for UI changes.
- **Update docs** if behavior or setup changes.
- **Make sure tests/lint pass** (see commands above).

### PR checklist (recommended)

- [ ] I ran `go test ./...`
- [ ] I ran frontend lint/tests (`npm run lint`, `npm run test`) when applicable
- [ ] I updated `README.md` / docs if needed
- [ ] I added screenshots/video for UI changes (if applicable)

