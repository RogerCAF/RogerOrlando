# The Bureau — shared guestbook (no separate database)

**Storage:** GitHub Issue [#44](https://github.com/RogerCAF/RogerOrlando/issues/44) in `RogerCAF/RogerOrlando`.  
**API:** `app/api/guestbook/route.ts` on the existing Next.js site.  
**Status:** API source is committed; a Vercel server-side token must be configured before it can accept signatures.

## Enable the API in the existing Vercel project

1. Create a GitHub **fine-grained personal access token** at https://github.com/settings/personal-access-tokens/new.
2. Select **Only select repositories** → `RogerOrlando`. Set repository permissions **Issues: Read and write** (metadata read-only is automatic). Use an expiration date.
3. In the Vercel project connected to `RogerCAF/RogerOrlando`, go to **Settings → Environment Variables** and add **`GITHUB_TOKEN`** with the token as its value, scoped to Production (and Preview if desired).
4. Redeploy the project. The API defaults to `GITHUB_REPO=RogerCAF/RogerOrlando` and `GITHUB_ISSUE_NUMBER=44`; no other variables are needed.
5. Test `https://YOUR-DOMAIN/api/guestbook`. A successful response contains `"mode":"shared"` and an `entries` array.
6. The Bureau V3 web client submits to `/api/guestbook` and shows the shared entries. It must be hosted on the same domain as the API or explicitly updated to use an absolute API URL.

## Safety notes

- The token must **never** be added to this repository, HTML, screenshots, or chat messages. Only put it in Vercel environment variables.
- GitHub Issues is public. Names posted to the guestbook are visible in issue comments; communicate this to visitors.
- Exact duplicate names are rejected; the web client limits a browser to one signature. It is not possible to enforce *one name per human* without verification.
- Protect public launch against automated spam (e.g. CAPTCHA / rate limiting); the simple API is a prototype.
- Delete inappropriate comments under Issue #44 for moderation.
