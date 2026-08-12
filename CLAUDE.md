# Repo notes

## Story-based editing workflow

Default: best-guess fix, then ask user to check. Don't loop Storybook
server + Playwright screenshots unless user explicitly says "don't stop
until fixed."

Prefer small tests that fail on the reported bug, then use test to confirm
fix — over manual screenshot loops.
