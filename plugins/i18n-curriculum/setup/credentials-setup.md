# Credentials Setup Guide

This guide must be completed by every team member before using Carmen or Marcos.
It takes about 10 minutes the first time.

---

## Part 1 — Google Sheets access (Admin only, done once for the whole team)

One person on the team creates the service account and shares the credentials with everyone else. This is a one-time setup.

### Step 1 — Create a Google Cloud project (or use an existing one)

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click the project dropdown at the top → **New Project**
3. Name it `i18n-curriculum` → **Create**

### Step 2 — Enable the Google Sheets API

1. In the project, go to **APIs & Services → Library**
2. Search for **Google Sheets API** → click it → **Enable**

### Step 3 — Create a service account

1. Go to **IAM & Admin → Service Accounts**
2. Click **Create Service Account**
3. Name: `curriculum-pipeline` → click **Create and Continue** → **Done**
4. Click on the new service account → **Keys** tab
5. **Add Key → Create new key → JSON** → download the file
6. Rename the downloaded file to `curriculum-credentials.json`

### Step 4 — Share the Google Sheet with the service account

1. Open the JSON file and copy the `client_email` value
   (it looks like `curriculum-pipeline@your-project.iam.gserviceaccount.com`)
2. Open the planning Google Sheet → click **Share**
3. Paste the service account email → set to **Editor** → **Send**

### Step 5 — Share credentials securely with the team

Send the `curriculum-credentials.json` file to each team member via a secure
channel (Slack DM, encrypted email, 1Password shared vault, etc.).

**Never commit this file to Git.**

---

## Part 2 — Each team member setup

Every team member does this after receiving the credentials JSON from the admin.

### Step 1 — Store the credentials as an environment variable

Open the JSON file in a text editor and copy its entire contents.

**Mac / Linux (zsh):**

```bash
# Open your shell config
nano ~/.zshrc

# Add this line at the bottom (replace the {...} with the actual JSON content):
export GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}'

# Save and reload
source ~/.zshrc
```

**Mac / Linux (bash):**

```bash
nano ~/.bashrc
# Same line as above
source ~/.bashrc
```

**Windows (PowerShell):**

```powershell
# Add to your PowerShell profile (run to find the path):
echo $PROFILE

# Open it and add:
$env:GOOGLE_SERVICE_ACCOUNT_JSON = '{"type":"service_account",...}'
```

### Step 2 — Verify it works

```bash
python3 -c "
import gspread, json, os
creds = json.loads(os.environ['GOOGLE_SERVICE_ACCOUNT_JSON'])
gc = gspread.service_account_from_dict(creds)
print('✅ Google Sheets connection works')
"
```

If you see `✅ Google Sheets connection works`, you're done.

If you get an error:

- `KeyError: 'GOOGLE_SERVICE_ACCOUNT_JSON'` → the env variable wasn't saved. Restart your terminal and try again.
- `ValueError: No JSON object could be decoded` → check that the JSON is complete and not truncated.
- `gspread not found` → run `pip install gspread --break-system-packages` first.

---

## Part 3 — Git repo setup (each team member)

Marcos writes task files directly into a cloned Git repository. Each team member needs their own clone.

### Step 1 — Clone the curriculum repo

```bash
git clone https://github.com/YOUR_ORG/YOUR_CURRICULUM_REPO.git
cd YOUR_CURRICULUM_REPO
```

### Step 2 — Set up the GitHub CLI (for PR creation)

Marcos instructs you to open PRs using the GitHub CLI (`gh`). Make sure it is
installed and authenticated before your first session:

```bash
# Install (if not already installed)
# Mac:   brew install gh
# Linux: https://github.com/cli/cli/blob/trunk/docs/install_linux.md

# Authenticate
gh auth login
```

Marcos will provide the exact `gh pr create` command at the end of each session.
You run it yourself — no token or plugin configuration is required.

---

## Quick reference — what each agent needs

| Agent  | Needs                                 | Where                         |
| ------ | ------------------------------------- | ----------------------------- |
| Carmen | `GOOGLE_SERVICE_ACCOUNT_JSON` env var | Set in shell profile          |
| Marcos | `GOOGLE_SERVICE_ACCOUNT_JSON` env var | Set in shell profile          |
| Marcos | Cloned repo path                      | Told by user each session     |
| Marcos | Feature branch                        | User creates; Marcos checks   |
| Both   | Sheet URL                             | Provided by user each session |
