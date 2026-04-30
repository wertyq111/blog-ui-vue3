# blog-ui-vue3 Remote Workflow

## Working Rule

`blog-ui-vue3` uses a remote-first verification loop. Local changes are only provisional until they are synced to `${REMOTE_BLOG_UI_VUE3_PATH}` on `${REMOTE_SSH_USER}@${REMOTE_HOST}` and checked there.

## Fixed Facts

- Local repo: `/Volumes/T7/Program/Personal/blog/blog-ui-vue3`
- Remote repo path: `${REMOTE_BLOG_UI_VUE3_PATH}`
- Remote host: `${REMOTE_SSH_USER}@${REMOTE_HOST}`
- Verification URL: `${BLOG_UI_VUE3_REMOTE_URL}`
- Old Vue2 frontend reference URL: `${BLOG_UI_VUE2_REMOTE_URL}`

## Pre-Sync Local Cleanup

Always remove AppleDouble junk files before syncing:

```bash
find /Volumes/T7/Program/Personal/blog/blog-ui-vue3 -name '._*' -delete
```

## Sync Command

Use `rsync` to mirror the local working tree into the remote project path while preserving the remote repo's `.git` directory:

```bash
rsync -az --delete \
  --exclude '.git' \
  --exclude 'node_modules' \
  --exclude '._*' \
  /Volumes/T7/Program/Personal/blog/blog-ui-vue3/ \
  ${REMOTE_SSH_USER}@${REMOTE_HOST}:${REMOTE_BLOG_UI_VUE3_PATH}/
```

## Remote Cleanup

After syncing, remove any `._*` files that may still exist on the remote host:

```bash
ssh ${REMOTE_SSH_USER}@${REMOTE_HOST} "find ${REMOTE_BLOG_UI_VUE3_PATH} -name '._*' -delete"
```

## Remote Static Verification

Before any runtime startup, verify the remote tree and compose configuration without starting containers:

```bash
ssh ${REMOTE_SSH_USER}@${REMOTE_HOST} "
  cd ${REMOTE_BLOG_UI_VUE3_PATH} &&
  git remote -v &&
  git branch --show-current &&
  find . -name '._*' | sed -n '1,40p' &&
  docker compose config >/tmp/blog-ui-vue3.compose.txt &&
  sed -n '1,120p' /tmp/blog-ui-vue3.compose.txt
"
```

## Runtime Verification Order

Follow this order exactly:

1. Connect to the remote host: `ssh ${REMOTE_SSH_USER}@${REMOTE_HOST}`
2. Switch to the project directory: `cd ${REMOTE_BLOG_UI_VUE3_PATH}`
3. Sync the updated local code to the remote project directory
4. Clean any remote `._*` files
5. Run the static verification command above
6. Ask the user for confirmation before any `docker compose up` command
7. Only after approval, run the required `docker compose up` command on the remote host
8. Verify the page on `${BLOG_UI_VUE3_REMOTE_URL}`

## Hard Constraints

- Never sync `._*` files.
- Never use the old `blog-ui` repo as the implementation target for Vue3 work.
- Never run `docker compose up` for this project without user confirmation first.
- Treat the remote result as the source of truth for page debugging and runtime acceptance.
