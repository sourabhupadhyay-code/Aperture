# Aperture Coffee Roasters — static site starter

A responsive, dependency-free HTML/CSS/JS website, ready to deploy to an
AWS Academy EC2 instance and auto-deploy on every push via GitHub Actions.

## Project structure

```
aperture-roasters/
├── .github/
│   └── workflows/
│       └── deploy.yml        # CI/CD: rsyncs src/ to EC2 on push to main
├── nginx/
│   └── website.conf          # Nginx server block for the site
├── src/
│   ├── index.html
│   ├── css/style.css
│   └── js/script.js
├── .gitignore
└── README.md
```

Everything the browser needs lives under `src/` — that's the folder that
gets copied to the server. Nothing to build or compile.

---

## Part 1 — Launch the EC2 instance on AWS Academy

AWS Academy's Learner Lab is more restricted than a normal AWS account
(no IAM user creation, credentials rotate every session, and Elastic IPs
are sometimes blocked), so the steps below are written for that environment.

1. **Start the lab.** In AWS Academy → your course → **Learner Lab**, click
   **Start Lab** and wait for the AWS icon to turn green (~1–3 min).
2. **Open the AWS console.** Click **AWS Details** → the **AWS** link (this
   logs you into the console with the lab's temporary credentials — you
   don't need a separate AWS login).
3. **Go to EC2 → Launch instance.**
   - **Name:** `aperture-web`
   - **AMI:** Ubuntu Server 22.04 LTS (or Amazon Linux 2023 — commands
     below are Ubuntu; Amazon Linux notes are in parentheses)
   - **Instance type:** `t2.micro` or `t3.micro` (cheapest, plenty for a
     static site; keeps you well inside the $50 credit)
   - **Key pair:** create a new one, e.g. `aperture-key`, download the
     `.pem` file — you cannot re-download it later
   - **Network settings → Edit:** create/select a security group allowing:
     - SSH (22) from **My IP**
     - HTTP (80) from **Anywhere (0.0.0.0/0)**
     - (HTTPS/443 too, if you plan to add a certificate later)
   - Leave storage at the default 8 GB gp3
   - Click **Launch instance**
4. **Note the Public IPv4 address** on the instance's detail page once it's
   running — that's the address you'll open in a browser and use in the
   GitHub secret below.

   > AWS Academy Learner Lab labs often don't allow allocating a separate
   > Elastic IP. That's fine for this project, but remember: **if you stop
   > and restart the instance, the public IP will change**, and you'll need
   > to update the `EC2_HOST` secret and revisit that new IP. Leaving the
   > instance *running* (not stopped) keeps the same IP for the session.

5. **Lock down the `.pem` file and connect:**

   ```bash
   chmod 400 aperture-key.pem
   ssh -i aperture-key.pem ubuntu@<PUBLIC_IP>
   ```

   (Amazon Linux AMIs use `ec2-user@<PUBLIC_IP>` instead of `ubuntu@`.)

---

## Part 2 — Install and configure Nginx on the instance

Run this once, over SSH, on the EC2 instance:

```bash
sudo apt update && sudo apt install -y nginx rsync
sudo mkdir -p /var/www/aperture-roasters
sudo chown -R ubuntu:ubuntu /var/www/aperture-roasters

# Remove the default site so it doesn't conflict
sudo rm -f /etc/nginx/sites-enabled/default
```

Copy `nginx/website.conf` from this repo onto the server (easiest: paste
its contents with `sudo nano /etc/nginx/sites-available/website.conf`),
then enable it:

```bash
sudo ln -s /etc/nginx/sites-available/website.conf /etc/nginx/sites-enabled/website.conf
sudo nginx -t          # should say "syntax is ok" / "test is successful"
sudo systemctl enable nginx
sudo systemctl restart nginx
```

For a first manual deploy (before wiring up CI), just copy the `src/`
folder over directly:

```bash
# from your local machine, in the project root
scp -i aperture-key.pem -r src/* ubuntu@<PUBLIC_IP>:/var/www/aperture-roasters/
```

Open `http://<PUBLIC_IP>` in a browser — the site should load.

---

## Part 3 — Wire up automatic deploys with GitHub Actions

The workflow in `.github/workflows/deploy.yml` rsyncs `src/` to the server
and reloads Nginx every time you push to `main`.

1. **Push this project to a GitHub repo** (if you haven't already):

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<you>/aperture-roasters.git
   git push -u origin main
   ```

2. **Let the EC2 user run `systemctl reload nginx` without a password**
   (needed because the workflow's last step calls `sudo systemctl reload
   nginx` over SSH non-interactively):

   ```bash
   # on the EC2 instance
   echo "ubuntu ALL=(ALL) NOPASSWD: /usr/bin/systemctl reload nginx" | sudo tee /etc/sudoers.d/nginx-reload
   ```

3. **Add repository secrets** — GitHub repo → **Settings → Secrets and
   variables → Actions → New repository secret**:

   | Secret name    | Value                                              |
   |----------------|-----------------------------------------------------|
   | `EC2_HOST`     | the instance's public IP (e.g. `54.210.12.34`)      |
   | `EC2_USER`     | `ubuntu` (or `ec2-user` for Amazon Linux)           |
   | `EC2_SSH_KEY`  | the **full contents** of `aperture-key.pem`         |

4. **Push a change** to `src/` on `main` — check the **Actions** tab in
   GitHub to watch the deploy run. Refresh `http://<PUBLIC_IP>` afterward.

Because the Learner Lab public IP can change if the instance is stopped
and restarted, update the `EC2_HOST` secret whenever that happens.

---

## Managing the $50 credit

- A `t2.micro`/`t3.micro` costs roughly $0.008–0.010/hr — left running
  24/7 it's on the order of $6–7/month, well inside a $50 budget for a
  semester, but the Learner Lab itself also has its own time/budget cap
  set by your instructor, separate from the EC2 hourly cost.
- **Stop (don't terminate) the instance** from the EC2 console when
  you're done for the day if you want to conserve the lab's own session
  budget — just remember the public IP will change on restart.
- Check spend anytime via **AWS Details → Budget** in the Learner Lab page.

---

## Local preview (before deploying)

No build step is required — open `src/index.html` directly in a browser,
or serve it locally:

```bash
cd src
python3 -m http.server 8000
# visit http://localhost:8000
```
