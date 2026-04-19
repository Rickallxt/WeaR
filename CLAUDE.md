## graphify

This repo keeps a checked-in Graphify snapshot in `graphify-out/`.

Before answering codebase or architecture questions:
- read `graphify-out/GRAPH_REPORT.md` first
- use `graphify-out/wiki/index.md` to navigate communities before opening raw files
- treat `graphify-out/graph.json` as the machine-readable structure and `graphify-out/graph.html` as the visual map
- check `graphify-out/BUILD_INFO.json` for the current snapshot scope and counts
- note that the current snapshot is `code-structural`: it covers detected code files, not full semantic extraction of docs/images
- read `docs/CODEX_CHANGE_NOTE_2026-04-13.md` for the latest mobile redesign and handoff context

After code changes:
- run `python scripts/rebuild_graphify.py`
- commit the updated `graphify-out/` files with the code change when the graph meaningfully changed
