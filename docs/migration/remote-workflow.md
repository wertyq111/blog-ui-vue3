# blog-ui-vue3 Remote Workflow

## Working Rule

`blog-ui-vue3` uses a remote-first verification loop. Local changes are only provisional until they are synced to `/data/personal/projects/blog-ui-vue3` on `ubuntu@10.10.9.184` and checked there.

## Fixed Facts

- Local repo: `/Volumes/T7/Program/Personal/blog/blog-ui-vue3`
- Remote repo path: `/data/personal/projects/blog-ui-vue3`
- Remote host: `ubuntu@10.10.9.184`
- Verification URL: `http://10.10.9.184:8083/`
- Old Vue2 frontend reference URL: `http://10.10.9.184:8082/`

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
  ubuntu@10.10.9.184:/data/personal/projects/blog-ui-vue3/
```

## Remote Cleanup

After syncing, remove any `._*` files that may still exist on the remote host:

```bash
ssh ubuntu@10.10.9.184 "find /data/personal/projects/blog-ui-vue3 -name '._*' -delete"
```

## Remote Static Verification

Before any runtime startup, verify the remote tree and compose configuration without starting containers:

```bash
ssh ubuntu@10.10.9.184 '
  cd /data/personal/projects/blog-ui-vue3 &&
  git remote -v &&
  git branch --show-current &&
  find . -name "._*" | sed -n "1,40p" &&
  docker compose config >/tmp/blog-ui-vue3.compose.txt &&
  sed -n "1,120p" /tmp/blog-ui-vue3.compose.txt
'
```

## Runtime Verification Order

Follow this order exactly:

1. Connect to the remote host: `ssh ubuntu@10.10.9.184`
2. Switch to the project directory: `cd /data/personal/projects/blog-ui-vue3`
3. Sync the updated local code to the remote project directory
4. Clean any remote `._*` files
5. Run the static verification command above
6. Ask the user for confirmation before any `docker compose up` command
7. Only after approval, run the required `docker compose up` command on the remote host
8. Verify the page on `http://10.10.9.184:8083/`

## Hard Constraints

- Never sync `._*` files.
- Never use the old `blog-ui` repo as the implementation target for Vue3 work.
- Never run `docker compose up` for this project without user confirmation first.
- Treat the remote result as the source of truth for page debugging and runtime acceptance.
