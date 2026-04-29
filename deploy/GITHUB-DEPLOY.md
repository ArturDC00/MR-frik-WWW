# GitHub → serwer (automatyczny deploy WWW)

**HTTP/2 i HTTP/3 (Lighthouse, wydajność):** krok po kroku weryfikacja i typowe błędy — [`deploy/HTTP2-VERIFICATION.md`](./HTTP2-VERIFICATION.md).  
**Instrukcja pod admina VPS OVH (nginx):** [`deploy/OVH-admin-HTTP2-HTTP3.md`](./OVH-admin-HTTP2-HTTP3.md).  
**Mobile: fonty Monument, analiza bundla, logo:** [`deploy/PERF-MOBILE-FONTS-BUNDLE-IMAGES.md`](./PERF-MOBILE-FONTS-BUNDLE-IMAGES.md) · `npm run analyze` · `npm run resize-hero-logo` · `npm run subset-fonts`.

Po konfiguracji: **push na `main`** uruchamia workflow, który na VPS robi `git pull`, `npm ci`, `npm run build`, `pm2 restart mrfrik-www`.

Potrzebujesz **dwóch różnych rzeczy**:

| Co | Po co |
|----|--------|
| **Deploy key** (tylko odczyt) | Serwer robi `git fetch` / `pull` z GitHuba |
| **Klucz SSH + sekrety Actions** | GitHub Actions łączy się po SSH z kontem `ubuntu` i odpala deploy |

---

## 1. Deploy key — serwer ↔ GitHub (tylko repo)

Na **serwerze**:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/github_mrfrik_www_deploy -N "" -C "mrfrik-www read-only"
chmod 600 ~/.ssh/github_mrfrik_www_deploy
cat ~/.ssh/github_mrfrik_www_deploy.pub
```

W **GitHub**: repozytorium **MR-frik-WWW** → **Settings** → **Deploy keys** → **Add deploy key** → wklej zawartość `.pub`, włącz **Allow read access**.

Dodaj **SSH config** (żeby `git` używał tego klucza do `github.com`):

```bash
nano ~/.ssh/config
```

Fragment:

```
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/github_mrfrik_www_deploy
  IdentitiesOnly yes
```

```bash
chmod 600 ~/.ssh/config
ssh -T git@github.com
```

Powinno być potwierdzenie dostępu do repo (bez błędu `Permission denied`).

---

## 2. Katalog `~/mrfrik-www` musi być klonem gita

Jeśli masz tylko skopiowane pliki (bez `.git`):

```bash
cd ~
mv mrfrik-www mrfrik-www.backup-$(date +%Y%m%d)
git clone git@github.com:ArturDC00/MR-frik-WWW.git mrfrik-www
cp mrfrik-www.backup-*/.env.production mrfrik-www/   # dopasuj nazwę backupu
cp mrfrik-www.backup-*/.env.local mrfrik-www/        # jeśli używasz na produkcji
```

W **`mrfrik-www/.env.production`** ustaw m.in. `PORT=3005` (zgodnie z nginx).

```bash
cd ~/mrfrik-www && npm ci && npm run build
PORT=3005 pm2 delete mrfrik-www 2>/dev/null
PORT=3005 pm2 start npm --name mrfrik-www --cwd /home/ubuntu/mrfrik-www -- start
pm2 save
```

**Nie commituj** sekretów — `.env.production` zostaje tylko na serwerze (nie wypychaj go do GitHuba).

---

## 3. Klucz dla GitHub Actions → SSH na VPS

Na **laptopie** (lub raz na serwerze, tylko do wygenerowania pary):

```bash
ssh-keygen -t ed25519 -f ./gha_mrfrik_deploy -N "" -C "github-actions-deploy-www"
```

- **`gha_mrfrik_deploy.pub`** — wklej na **serwerze** do `~/.ssh/authorized_keys` u użytkownika `ubuntu` (jedna linia).

- **`gha_mrfrik_deploy`** (prywatny) — cała zawartość pliku jako sekret **`DEPLOY_SSH_KEY`** w GitHubie.

W **GitHub**: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:

| Nazwa | Wartość |
|--------|---------|
| `DEPLOY_HOST` | IP lub hostname VPS (np. z panelu OVH) |
| `DEPLOY_USER` | `ubuntu` |
| `DEPLOY_SSH_KEY` | cały prywatny plik `gha_mrfrik_deploy` |

---

## 4. Wypchnij workflow i branch `main`

Domyślny branch w workflow to **`main`**. Jeśli używasz **`master`**, zmień w `.github/workflows/deploy-www.yml` oba wystąpienia `main` albo ustaw domyślny branch na GitHubie na `main`.

```bash
git add .github/workflows/deploy-www.yml deploy/GITHUB-DEPLOY.md
git commit -m "CI: deploy WWW via SSH on push to main"
git push origin main
```

W **Actions** sprawdź pierwszy run — przy błędzie SSH lub `Brak .git` wróć do kroków 1–2.

---

## 5. Ręczny test deployu na serwerze (bez Actions)

```bash
cd ~/mrfrik-www && git pull origin main && npm ci && npm run build && pm2 restart mrfrik-www && pm2 save
```
