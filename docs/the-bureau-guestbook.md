# The Bureau — public guestbook

**Status:** deployed in the existing `roger-orlando` Vercel project at [The Bureau](https://www.rogerorlando.nl/bureau).

**Storage:** private Vercel Blob store `the-bureau-guestbook` attached to the existing project. No traditional database or GitHub personal-access token is required.

- The interactive notebook in `public/bureau/index.html` reads and writes to the same-origin endpoint `/api/guestbook`.
- The guestbook API lives in `app/api/guestbook/route.ts`, and the shared list is also shown on the standalone `/bureau/guestbook` page.
- Vercel securely provisions `BLOB_READ_WRITE_TOKEN` through the connected Blob store; do **not** expose the token in client code or Git.
- Each valid name (2–32 characters, one line) is stored in its own private object.
- A duplicate name is rejected. The browser also remembers whether it signed and the API sets a signed cookie. This is **not identity verification**; visitors can bypass browser restrictions.
- Public entries are visible to all visitors. A name may be removed by deleting its corresponding object in Blob storage.
- Production signature endpoint should gain a stricter spam/rate-limit control before advertising the site heavily.

**Previous prototype:** GitHub Issue #44 was an earlier draft storage option. It is no longer used by the live API.

**Do not commit secret values.**
