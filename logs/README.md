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


## Delete detailed student answer data

Detailed submissions are also stored in `logs/students/`, with one Markdown file per student.

### Delete one student's complete history
Delete that student's file from `logs/students/`. To fully remove the same student's stored result data, also remove every matching JSON entry from `logs/results.jsonl` and every matching row from `logs/RESULTS.md`.

### Delete one attempt only
1. Remove the matching attempt object/line from `logs/results.jsonl`.
2. Remove the matching row from `logs/RESULTS.md`.
3. Open the student's file in `logs/students/` and remove that attempt section.

### Delete all stored student data
1. Empty `logs/results.jsonl`.
2. Reset `logs/RESULTS.md` to its empty table.
3. Delete every student Markdown file under `logs/students/`.

> Important: the three locations must stay synchronized. Deleting only a student Markdown file does not delete the summary/raw record, and deleting only a summary row does not delete the detailed answers.
