# Submission checklist

- Name: Naga Chaitanya — confirm your official spelling.
- Student ID: **fill your real identifier**.
- Project: Coin Toss, a small stateless application operated on local Kubernetes.
- Repository URL: **fill after push**.
- Exact baseline: `6006ea7e8022fa8b8bb4d57e0bc0be1432e227fd`.
- Improvement branch: `devorps`.
- One PR URL: **fill after creating it**.
- Exact final SHA: get with `git rev-parse HEAD` after your last change.
- Hosted CI run URL: **add the genuine run after push**.

The user had no previous code. A tiny working coin-toss app was created and committed before DevOps improvements. Baseline features: a button and random Heads/Tails response. Existing DevOps features: none. Main and the baseline tag preserve it. No external baseline form has been submitted by this agent.

The supplied guide says final submission is due 18 October 2026, 11:59 PM; it does not state a timezone. Confirm course timing. The student's later message says the viva is tomorrow; use VIVA.md for rehearsal.

## Push later

Create an empty GitHub repository, then from this project:

```bash
git remote add origin <your-repository-url>
git push -u origin main
git push origin baseline
git push -u origin devorps
```

Open one PR from devorps into main. Do not move main to the finished version first; the PR should compare the baseline with all improvements. Multiple improvement commits are fine. Preserve history and grant reviewer access. GitHub work is intentionally not done yet.

Suggested PR summary: “Add a container, repeatable local Kubernetes deployment, health probes, rolling releases and rollback, CI tests/scans/deployment, simple metrics/logs/request traces, and actual operating evidence to the original Coin Toss app.”

Run the hosted workflow, keep its real run link, review/download the artifact and retain evidence beyond its 14-day expiry. A local run is not proof that GitHub Actions ran. Fill required course forms, exact baseline/final commit, repo and single PR link. Never fabricate evidence or change captured SHAs to match a later commit.

If the last commit only adds evidence/docs, say which source version the captured runtime tested. For a final live demo, deploy the final commit and capture a fresh ignored evidence/runs bundle. Read README limitations and rehearse the six-file walkthrough yourself. Full marks also depend on correct demonstration and viva understanding.
