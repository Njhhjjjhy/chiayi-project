# Audit: GitHub account isolation

Paste this prompt into Claude Code in any project to confirm the project is fully tied to my personal GitHub account (Njhhjjjhy) and that my work account (RiaanMOHA) has zero access.

---

I'm a designer, not a developer — answer in plain language.

Confirm the following about this project's GitHub repo:

1. The repo is owned by my personal account (Njhhjjjhy), not the work account (RiaanMOHA).
2. RiaanMOHA is NOT a collaborator on the repo.
3. There are NO pending collaborator invites to RiaanMOHA.
4. There are NO shared organizations between the two accounts that could give RiaanMOHA backdoor access.

To check, run these commands:

- `git remote -v` (see which account owns the repo)
- `gh auth switch --user Njhhjjjhy` then
  `gh api repos/Njhhjjjhy/<repo-name>/collaborators --jq '.[].login'`
- `gh api repos/Njhhjjjhy/<repo-name>/invitations --jq '.[].invitee.login'`
- Switch back to the previously active account when done.

If everything checks out, report back exactly in this format:

> Confirmed — RiaanMOHA has zero access to this project.
> - Repo owner: Njhhjjjhy
> - Collaborators: only me
> - Pending invites: none
> - Shared orgs: none

If anything is wrong, flag it clearly and tell me what to do — but do NOT make any changes yourself. This is an audit only.
