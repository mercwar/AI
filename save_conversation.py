#!/usr/bin/env python3
"""
save_conversation.py

Usage:
  - Set environment variable GITHUB_TOKEN to a personal access token with 'repo' scope.
  - Run:
      python save_conversation.py --owner mercwar --repo AI --filename "session-2025-12-05" --content-file ./message.txt

This script will create a file under conversations/<timestamp>_<filename>.txt in the repository,
or update it if it already exists.
"""
import os
import sys
import argparse
import base64
import json
import time
import requests
from datetime import datetime

GITHUB_API = "https://api.github.com"

def get_file_sha(owner, repo, path, token):
    url = f"{GITHUB_API}/repos/{owner}/{repo}/contents/{path}"
    headers = {"Authorization": f"token {token}", "Accept": "application/vnd.github.v3+json"}
    r = requests.get(url, headers=headers)
    if r.status_code == 200:
        return r.json().get("sha")
    return None

def put_file(owner, repo, path, content_bytes, message, committer_name, committer_email, token, sha=None):
    url = f"{GITHUB_API}/repos/{owner}/{repo}/contents/{path}"
    headers = {"Authorization": f"token {token}", "Accept": "application/vnd.github.v3+json"}
    payload = {
        "message": message,
        "content": base64.b64encode(content_bytes).decode("utf-8"),
        "committer": {"name": committer_name or "auto-save", "email": committer_email or "noreply@example.com"}
    }
    if sha:
        payload["sha"] = sha
    r = requests.put(url, headers=headers, data=json.dumps(payload))
    if r.status_code in (200, 201):
        return r.json()
    else:
        raise RuntimeError(f"GitHub API error ({r.status_code}): {r.text}")

def main():
    parser = argparse.ArgumentParser(description="Save conversation content into a GitHub repo file.")
    parser.add_argument("--owner", required=True)
    parser.add_argument("--repo", required=True)
    parser.add_argument("--filename", required=True, help="Base filename (no path).")
    parser.add_argument("--content-file", help="Path to local file containing content. If omitted, reads stdin.")
    parser.add_argument("--committer-name", default="Conversation Saver")
    parser.add_argument("--committer-email", default="noreply@example.com")
    parser.add_argument("--commit-message", default=None)
    args = parser.parse_args()

    token = os.getenv("GITHUB_TOKEN")
    if not token:
        print("Error: GITHUB_TOKEN environment variable is required.", file=sys.stderr)
        sys.exit(1)

    if args.content_file:
        with open(args.content_file, "rb") as fh:
            content_bytes = fh.read()
    else:
        content_bytes = sys.stdin.buffer.read()

    timestamp = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
    safe_filename = args.filename.replace(" ", "_")
    path = f"conversations/{timestamp}_{safe_filename}.txt"

    sha = get_file_sha(args.owner, args.repo, path, token)
    message = args.commit_message or f"Save conversation {safe_filename} @ {timestamp}"
    resp = put_file(args.owner, args.repo, path, content_bytes, message, args.committer_name, args.committer_email, token, sha)
    print("File saved:", resp.get("content", {}).get("html_url"))

if __name__ == "__main__":
    main()