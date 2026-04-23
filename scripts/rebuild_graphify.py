from __future__ import annotations

import argparse
import json
import shutil
from pathlib import Path

from graphify.analyze import god_nodes, surprising_connections, suggest_questions
from graphify.build import build_from_json
from graphify.cluster import cluster, score_all
from graphify.detect import detect
from graphify.export import to_html, to_json
import graphify.extract as gextract
import graphify.detect as gdetect
from graphify.report import generate
from graphify.wiki import to_wiki

gdetect.CODE_EXTENSIONS.update({".mjs", ".cjs"})


def _cleanup_cache(cache_dir: Path) -> None:
    for path in cache_dir.glob("*.tmp"):
        try:
            path.unlink(missing_ok=True)
        except PermissionError:
            pass
    try:
        if cache_dir.exists() and not any(cache_dir.iterdir()):
            cache_dir.rmdir()
    except PermissionError:
        pass


def _write_readme(out_dir: Path) -> None:
    content = """# Graphify Snapshot

This folder stores the checked-in Graphify bundle for this repo.

Read in this order:
- `GRAPH_REPORT.md` for the high-level architecture summary
- `wiki/index.md` for community-by-community navigation
- `graph.html` for a visual map
- `graph.json` for machine-readable structure

Current scope:
- `code-structural` snapshot generated from detected code files
- documents remain useful source material, but they are not semantically extracted into this baseline graph

Refresh:
- run `python scripts/rebuild_graphify.py`
"""
    (out_dir / "README.md").write_text(content, encoding="utf-8")


def _prepare_extraction_paths(root: Path, code_files: list[Path]) -> tuple[list[Path], dict[str, str], Path]:
    converted_dir = root / ".tmp" / "graphify-mjs-as-js"
    shutil.rmtree(converted_dir, ignore_errors=True)

    extraction_paths: list[Path] = []
    source_map: dict[str, str] = {}
    for path in code_files:
        if path.suffix.lower() not in {".mjs", ".cjs"}:
            extraction_paths.append(path)
            continue

        try:
            rel_path = path.resolve().relative_to(root)
        except ValueError:
            rel_path = Path(path.name)

        mirror_path = (converted_dir / rel_path).with_suffix(".js")
        mirror_path.parent.mkdir(parents=True, exist_ok=True)
        mirror_path.write_text(path.read_text(encoding="utf-8"), encoding="utf-8")
        extraction_paths.append(mirror_path)
        source_map[str(mirror_path.resolve())] = str(path.resolve())

    return extraction_paths, source_map, converted_dir


def _restore_mirrored_sources(value, source_map: dict[str, str]):
    if isinstance(value, list):
        for item in value:
            _restore_mirrored_sources(item, source_map)
        return

    if not isinstance(value, dict):
        return

    source_file = value.get("source_file")
    if source_file in source_map:
        original = source_map[source_file]
        value["source_file"] = original
        if str(value.get("label", "")).endswith(".js"):
            value["label"] = Path(original).name

    for item in value.values():
        _restore_mirrored_sources(item, source_map)


def rebuild(root: Path) -> dict[str, int]:
    root = root.resolve()
    out_dir = root / "graphify-out"
    out_dir.mkdir(exist_ok=True)

    detection = detect(root)
    (out_dir / "detect.json").write_text(json.dumps(detection, indent=2), encoding="utf-8")

    code_files = [Path(path) for path in detection.get("files", {}).get("code", [])]
    if not code_files:
        raise SystemExit("No code files found for Graphify rebuild")

    # Graphify's per-file cache currently trips on Windows temp-file replacement
    # in this repo, so we bypass cache writes and keep the graph outputs checked in.
    gextract.load_cached = lambda *args, **kwargs: None
    gextract.save_cached = lambda *args, **kwargs: None
    extraction_paths, source_map, converted_dir = _prepare_extraction_paths(root, code_files)
    extraction = gextract.extract(extraction_paths)
    _restore_mirrored_sources(extraction, source_map)
    shutil.rmtree(converted_dir, ignore_errors=True)
    (out_dir / "ast-extraction.json").write_text(json.dumps(extraction, indent=2), encoding="utf-8")

    graph = build_from_json(extraction)
    communities = cluster(graph)
    cohesion = score_all(graph, communities)
    labels = {cid: f"Community {cid}" for cid in communities}
    gods = god_nodes(graph)
    surprises = surprising_connections(graph, communities)
    questions = suggest_questions(graph, communities, labels)

    report = generate(
        graph,
        communities,
        cohesion,
        labels,
        gods,
        surprises,
        detection,
        {"input": extraction.get("input_tokens", 0), "output": extraction.get("output_tokens", 0)},
        str(root),
        suggested_questions=questions,
    )
    (out_dir / "GRAPH_REPORT.md").write_text(report, encoding="utf-8")

    to_json(graph, communities, str(out_dir / "graph.json"))
    to_html(graph, communities, str(out_dir / "graph.html"), community_labels=labels)
    wiki_articles = to_wiki(
        graph,
        communities,
        out_dir / "wiki",
        community_labels=labels,
        cohesion=cohesion,
        god_nodes_data=gods,
    )
    _write_readme(out_dir)

    build_info = {
        "graphify_mode": "code-structural",
        "nodes": graph.number_of_nodes(),
        "edges": graph.number_of_edges(),
        "communities": len(communities),
        "code_files": len(code_files),
        "wiki_articles": wiki_articles,
    }
    (out_dir / "BUILD_INFO.json").write_text(json.dumps(build_info, indent=2), encoding="utf-8")

    cache_dir = out_dir / "cache"
    if cache_dir.exists():
        _cleanup_cache(cache_dir)

    return build_info


def main() -> None:
    parser = argparse.ArgumentParser(description="Rebuild the checked-in Graphify bundle for this repo.")
    parser.add_argument("path", nargs="?", default=".", help="Repo root to scan (default: current directory)")
    args = parser.parse_args()

    summary = rebuild(Path(args.path))
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
