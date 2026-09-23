# Qfs-main-file

Tracks the Firebase Hosting static site for **qfsqfsqfs.web.app** (project `qfsqfsqfs`).

## Deploy

```bash
cd /path/to/Qfs-main-file
firebase use qfsqfsqfs
firebase deploy --only hosting --non-interactive
```

Site root is this directory (`firebase.json` → `"public": "."`). Clean URLs are enabled (`/login`, `/register`).

## Notes

- Do not commit secrets or `.env` files.
- Backend lives in a separate repo (`qfs-backend`); this repo is frontend/hosting only.
