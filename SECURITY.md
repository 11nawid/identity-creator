# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in Identity Creator, please report it responsibly.

**Do not open a public GitHub issue for security vulnerabilities.**

Instead, please email the maintainers directly or use [GitHub's private vulnerability reporting](https://github.com/11nawid/identity-creator/security/advisories/new).

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Timeline

- **Acknowledgment:** Within 48 hours
- **Initial assessment:** Within 1 week
- **Fix or mitigation:** Depends on severity, typically within 2 weeks

---

## Security Considerations

### By Design

- **No server-side data storage** — All data stays in the user's browser
- **No authentication system** — No passwords or sessions to compromise
- **No database** — No SQL injection or data breach vectors
- **Open source** — All code is auditable

### Optional Features with Security Implications

- **API Keys:** If you provide a `GEMINI_API_KEY`, it is stored in your local `.env` file and never committed to the repository. The key is sent directly to Google's API.
- **Mail.tm:** Temporary email credentials are stored in browser LocalStorage. They are not encrypted beyond what the browser provides.
- **Config File:** `config.json` may contain API keys and is excluded from version control via `.gitignore`.

### Best Practices

1. Never commit `config.json` or `.env` files
2. Use environment variables for API keys in production
3. Keep dependencies updated (`npm audit`)
4. Use HTTPS in production deployments

---

## Scope

This security policy applies to the Identity Creator application code in this repository. It does not apply to:

- Third-party services (Google Gemini, Mail.tm, DiceBear)
- Deployments managed by third parties
- Forks of this repository

---

## Updates

Security fixes will be released as patch versions and documented in the repository's [Releases](https://github.com/11nawid/identity-creator/releases).
