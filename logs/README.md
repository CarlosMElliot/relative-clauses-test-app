# Managing Student Result Logs

The live application appends attempts to `logs/results.jsonl` and regenerates `logs/RESULTS.md`.

## Delete all logs
To reset the log safely, edit `logs/results.jsonl` on GitHub, remove every line, and commit the change. Then replace `logs/RESULTS.md` with only the empty table header below.

## Delete one attempt
Delete the matching JSON line from `logs/results.jsonl` first. Then remove the matching row from `logs/RESULTS.md` and renumber the remaining display rows if desired.

> Important: `results.jsonl` is the source used to rebuild the readable table on the next submission. If you delete a row only from `RESULTS.md`, it will come back after the next student submits.

### Empty table
```md
# Student Test Results

Newest submissions appear at the bottom. Every attempt is retained.

| # | Student | Group | Score | Correct | Attempt | Status | Started (UTC) | Submitted (UTC) | Logged (UTC) |
|---:|---|---|---:|---:|---:|---|---|---|---|
```
