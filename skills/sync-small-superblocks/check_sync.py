#!/usr/bin/env python3
"""
Detect blocks that exist in a v9 (structured) superblock module but are missing
from the standalone "small" superblock(s) derived from that module.

A small/flat superblock is a structure file shaped like {"blocks": [...]}.
A big/structured superblock is shaped like {"chapters": [{"modules": [...]}]}.

One module can be split across several small superblocks (e.g. the `git` module
feeds both introduction-to-nano and introduction-to-git-and-github), so a block
is only "missing" when it is absent from EVERY small superblock that maps to its
module.

Small superblocks may also legitimately contain EXTRA blocks that are not in the
module (cert-project / practice labs appended to the end). Those are preserved:
missing blocks are inserted into the existing list, never rebuilt from scratch.

Output: JSON to stdout, grouped by the small superblock that needs updating.

Paths are resolved relative to the freeCodeCamp repository root. By default that
is the current working directory; override it with the FCC_REPO env var.
"""

import json
import os

REPO = os.environ.get("FCC_REPO") or os.getcwd()
SB_DIR = os.path.join(REPO, "curriculum/structure/superblocks")
INTRO_PATH = os.path.join(REPO, "client/i18n/locales/english/intro.json")


def load():
    big = {}    # name -> [(module_dashedName, moduleType, [blocks]), ...]
    small = {}  # name -> [blocks]
    for fn in os.listdir(SB_DIR):
        if not fn.endswith(".json"):
            continue
        name = fn[:-5]
        data = json.load(open(os.path.join(SB_DIR, fn)))
        if "chapters" in data:
            mods = []
            for ch in data["chapters"]:
                for m in ch.get("modules", []):
                    mods.append(
                        (m.get("dashedName"), m.get("moduleType"), m.get("blocks", []))
                    )
            big[name] = mods
        elif "blocks" in data:
            small[name] = data["blocks"]
    intro = json.load(open(INTRO_PATH))
    return big, small, intro


def insert_after(lst, block, anchor):
    """Return a copy of lst with `block` inserted right after `anchor`
    (or at the front when anchor is None / not found)."""
    out = list(lst)
    if anchor is None or anchor not in out:
        out.insert(0, block)
    else:
        out.insert(out.index(anchor) + 1, block)
    return out


def main():
    big, small, intro = load()

    # Flatten modules: list of (big_name, module_dashedName, moduleType, blocks).
    # Skip module types whose single block is never surfaced as a small superblock.
    modules = []
    for big_name, mods in big.items():
        for mname, mtype, mblocks in mods:
            if mtype in ("review", "exam"):
                continue
            modules.append((big_name, mname, mtype, mblocks))

    # Map each small superblock to the SINGLE module it overlaps most.
    # A block can appear in more than one module, so "shares any block" is too
    # loose; the true source module is the one with the largest overlap.
    # Tie-break toward the smaller (more specific) module.
    best_of = {}  # small_name -> (big_name, mname, mblocks)
    for sname, sblocks in small.items():
        sset = set(sblocks)
        ranked = []
        for big_name, mname, mtype, mblocks in modules:
            ov = len(sset & set(mblocks))
            if ov >= 2:  # ignore single-block coincidences
                ranked.append((ov, -len(mblocks), big_name, mname, mblocks))
        if not ranked:
            continue
        ranked.sort(reverse=True)
        _, _, big_name, mname, mblocks = ranked[0]
        best_of[sname] = (big_name, mname, mblocks)

    # Group small superblocks by their best module (a module can feed several,
    # e.g. the `git` module feeds both nano and git-and-github).
    groups = {}  # (big_name, mname) -> {"mblocks":[...], "smalls":[...]}
    for sname, (big_name, mname, mblocks) in best_of.items():
        g = groups.setdefault((big_name, mname), {"mblocks": mblocks, "smalls": []})
        g["smalls"].append(sname)

    # findings[small_name] = {source, modules:set, ambiguous, missing:[...]}
    findings = {}

    for (big_name, mname), g in groups.items():
        mblocks = g["mblocks"]
        mset = set(mblocks)
        smalls = sorted(g["smalls"])
        covered = set()
        for s in smalls:
            covered |= set(small[s]) & mset
        missing = [b for b in mblocks if b not in covered]
        if not missing:
            continue

        ambiguous = len(smalls) > 1
        # Process missing blocks in module order. The anchor is the immediately
        # preceding module block, which is either already in a small superblock or
        # an earlier missing block we just placed; chaining this way preserves
        # module order even when several missing blocks are adjacent.
        assigned = {}  # block -> target small superblock
        for b in missing:
            idx = mblocks.index(b)
            anchor = mblocks[idx - 1] if idx > 0 else None
            if anchor is None:
                target = smalls[0]
            elif anchor in assigned:
                target = assigned[anchor]
            else:
                holders = [s for s in smalls if anchor in small[s]]
                target = holders[0] if holders else smalls[0]
            assigned[b] = target
            f = findings.setdefault(
                target,
                {
                    "source_superblock": big_name,
                    "modules": set(),
                    "ambiguous": False,
                    "missing": [],
                },
            )
            f["modules"].add(mname)
            f["ambiguous"] = f["ambiguous"] or ambiguous
            f["missing"].append(
                {
                    "block": b,
                    "after": anchor,
                    "module": mname,
                }
            )

    # Stale direction: a block in the small superblock that is NOT in its source
    # module. If that block lives in another non-cert module of the SAME big
    # superblock it was MOVED (e.g. PR #67811 moved lab-prime-number-sum-calculator
    # from higher-order-functions to dynamic-programming). If it is in a
    # cert-project module it is a legitimately appended lab and is ignored. If it
    # is nowhere in the big superblock it was REMOVED.
    for sname, (big_name, mname, mblocks) in best_of.items():
        mset = set(mblocks)
        stale = []
        for b in small[sname]:
            if b in mset:
                continue
            locs = [(m2, t2) for (m2, t2, bl2) in big[big_name] if b in bl2]
            if any(t2 == "cert-project" for _, t2 in locs):
                continue  # appended cert-project lab, expected
            if locs:
                stale.append(
                    {
                        "block": b,
                        "status": "moved",
                        "now_in_modules": sorted({m2 for m2, _ in locs}),
                    }
                )
            else:
                stale.append({"block": b, "status": "removed", "now_in_modules": []})
        if stale:
            f = findings.setdefault(
                sname,
                {
                    "source_superblock": big_name,
                    "modules": set(),
                    "ambiguous": False,
                    "missing": [],
                },
            )
            f["modules"].add(mname)
            f["stale"] = stale

    # Enrich each finding with intro content / presence and the proposed block list.
    results = []
    for sname, f in sorted(findings.items()):
        big_name = f["source_superblock"]
        big_intro_blocks = intro.get(big_name, {}).get("blocks", {})
        small_intro_blocks = intro.get(sname, {}).get("blocks", {})
        stale = f.get("stale", [])
        stale_blocks = {s["block"] for s in stale}

        proposed = [b for b in small[sname] if b not in stale_blocks]
        for m in f["missing"]:
            proposed = insert_after(proposed, m["block"], m["after"])
            m["intro_content"] = big_intro_blocks.get(m["block"])
            m["intro_already_present"] = m["block"] in small_intro_blocks
        for s in stale:
            s["intro_present_in_small"] = s["block"] in small_intro_blocks

        results.append(
            {
                "small_superblock": sname,
                "source_superblock": big_name,
                "modules": sorted(f["modules"]),
                "ambiguous_mapping": f["ambiguous"],
                "current_blocks": small[sname],
                "proposed_blocks": proposed,
                "missing": f["missing"],
                "stale": stale,
                "structure_file": f"curriculum/structure/superblocks/{sname}.json",
                "intro_file": "client/i18n/locales/english/intro.json",
            }
        )

    print(json.dumps({"findings": results}, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
