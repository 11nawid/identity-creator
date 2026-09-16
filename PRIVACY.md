# Privacy Policy

**Last updated:** September 17, 2026

Identity Creator is an open-source tool built with privacy as a core principle. This policy explains how data is (and is not) handled.

---

## Data Collection

**We collect zero data.** Identity Creator is a client-side web application. There is no analytics, no tracking, no telemetry, and no server-side data storage.

- No user accounts or registration
- No cookies set by this application
- No third-party analytics (Google Analytics, Mixpanel, etc.)
- No advertising or tracking scripts
- No phone-home or beacon requests

---

## Generated Data

All synthetic identities are generated **locally in your browser** or on your self-hosted server. The data never leaves your machine unless you explicitly choose to export it.

### Local Storage

Identity Creator uses your browser's LocalStorage to:
- Remember your saved profiles
- Store your theme preference (dark/light)
- Persist temporary mailbox credentials

This data stays entirely on your device. Clearing your browser data will remove it.

---

## Third-Party Services

### Google Gemini API (Optional)

If you provide a `GEMINI_API_KEY`, Identity Creator will send prompts to Google's Gemini API to generate richer biographies and profile details.

- **Only triggered when:** You explicitly enable AI generation and provide your own API key
- **Data sent:** The generation prompt (includes name, age, country for context)
- **Data stored by Google:** Subject to [Google's AI Privacy Policy](https://policies.google.com/privacy)
- **Data stored by us:** Nothing. Your API key stays in your local `.env` file.

### Mail.tm (Temporary Email)

Identity Creator can create disposable email addresses via the [Mail.tm](https://mail.tm) public API.

- **Data sent:** A randomly generated email address and password
- **Purpose:** To provide a working temporary inbox for generated identities
- **Data stored by Mail.tm:** Subject to [Mail.tm's privacy policy](https://mail.tm/privacy)
- **Data stored by us:** Nothing. Mailbox credentials are stored only in your browser's LocalStorage.

### DiceBear (Avatars)

Identity avatars are generated via [DiceBear's](https://www.dicebear.com/) public API.

- **Data sent:** Style and seed parameters (no personal data)
- **Data stored:** Nothing

---

## Configuration Files

- `config.json` — Contains your local settings and optional API keys. Listed in `.gitignore` and **never committed** to the repository.
- `.env.local` — Contains environment variables. Also **never committed**.

---

## Your Data, Your Control

- All generated profiles are stored locally in your browser
- You can export data in JSON, CSV, TXT, or PDF at any time
- You can delete any profile at any time
- Clearing browser data removes all stored profiles
- No data survives a browser reset

---

## Changes to This Policy

If this privacy policy changes, the updated version will be posted in this file with a new "Last updated" date. Since the app has no backend, there are no push notifications or email updates.

---

## Contact

If you have questions about this privacy policy, please [open an issue](https://github.com/11nawid/identity-creator/issues) on GitHub.
