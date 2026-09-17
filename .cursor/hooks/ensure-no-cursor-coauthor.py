#!/usr/bin/env python3
"""Cursor project hook: install the git commit-msg stripper and block --no-verify.

Real enforcement is .githooks/commit-msg (runs after Cursor's
prepare-commit-msg). This only copies that file into .git/hooks and
refuses git commit --no-verify / -n from Cursor sessions.
"""

import json
import os
import re
import shutil
import subprocess
import sys


def git(args, cwd=None):
    try:
        result = subprocess.run(
            ["git", *args],
            cwd=cwd,
            check=False,
            capture_output=True,
            text=True,
        )
    except OSError:
        return None
    if result.returncode != 0:
        return None
    return result.stdout.strip()


def install_commit_msg_hook() -> None:
    root = git(["rev-parse", "--show-toplevel"])
    if not root:
        return
    src = os.path.join(root, ".githooks", "commit-msg")
    if not os.path.isfile(src):
        return
    hooks_dir = git(["rev-parse", "--git-path", "hooks"], cwd=root)
    if not hooks_dir:
        return
    if not os.path.isabs(hooks_dir):
        hooks_dir = os.path.join(root, hooks_dir)
    os.makedirs(hooks_dir, exist_ok=True)
    dest = os.path.join(hooks_dir, "commit-msg")
    shutil.copy2(src, dest)
    os.chmod(dest, 0o755)


def strip_quoted(command: str) -> str:
    return re.sub(r"""("([^"\\]|\\.)*"|'([^'\\]|\\.)*')""", " ", command)


def is_git_commit(command: str) -> bool:
    return bool(
        re.search(
            r"(?:^|[\n;&|])\s*(?:\S*/)?git(?:\s+-C\s+\S+|\s+--git-dir=\S+|\s+--work-tree=\S+)*\s+commit(?:\s|$)",
            command,
        )
    )


def skips_hooks(command: str) -> bool:
    bare = strip_quoted(command)
    if re.search(r"(?:^|\s)--no-verify(?:\s|$)", bare):
        return True
    return bool(re.search(r"(?:^|\s)-[a-zA-Z]*n[a-zA-Z]*(?:\s|$)", bare))


def main() -> None:
    raw = sys.stdin.read()
    try:
        data = json.loads(raw) if raw.strip() else {}
    except json.JSONDecodeError:
        data = {}
    if not isinstance(data, dict):
        data = {}

    install_commit_msg_hook()
    command = data.get("command") or ""

    if command and is_git_commit(command) and skips_hooks(command):
        print(
            json.dumps(
                {
                    "permission": "deny",
                    "user_message": "git commit --no-verify/-n is blocked so the commit-msg hook can strip Cursor co-author trailers.",
                    "agent_message": "Do not skip git hooks. The commit-msg hook in .githooks/commit-msg strips Co-authored-by: Cursor after prepare-commit-msg. Retry without --no-verify or -n.",
                }
            )
        )
        return

    if command:
        print(json.dumps({"permission": "allow"}))
        return
    print("{}")


if __name__ == "__main__":
    main()
