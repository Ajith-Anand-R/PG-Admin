# Graph Report - PG Admin  (2026-06-24)

## Corpus Check
- 14 files · ~21,477 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 112 nodes · 102 edges · 16 communities (11 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1386e66c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `tailwind` - 6 edges
3. `aliases` - 6 edges
4. `scripts` - 5 edges
5. `supabase` - 2 edges
6. `cn()` - 2 edges
7. `paths` - 2 edges
8. `$schema` - 1 edges
9. `style` - 1 edges
10. `rsc` - 1 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (16 total, 5 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 1 - "Community 1"
Cohesion: 0.15
Nodes (13): dependencies, @base-ui/react, class-variance-authority, clsx, framer-motion, lucide-react, next, react (+5 more)

### Community 2 - "Community 2"
Cohesion: 0.17
Nodes (11): background_color, description, display, icons, id, name, orientation, scope (+3 more)

### Community 3 - "Community 3"
Cohesion: 0.20
Nodes (9): iconLibrary, menuAccent, menuColor, registries, rsc, rtl, $schema, style (+1 more)

### Community 4 - "Community 4"
Cohesion: 0.25
Nodes (4): DashboardCardProps, SidebarTabProps, TabType, supabase

### Community 5 - "Community 5"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, lint, start, version

### Community 6 - "Community 6"
Cohesion: 0.22
Nodes (9): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node, @types/react, @types/react-dom (+1 more)

### Community 7 - "Community 7"
Cohesion: 0.33
Nodes (4): geistMono, metadata, outfit, viewport

### Community 8 - "Community 8"
Cohesion: 0.33
Nodes (6): aliases, components, hooks, lib, ui, utils

### Community 9 - "Community 9"
Cohesion: 0.33
Nodes (6): tailwind, baseColor, config, css, cssVariables, prefix

## Knowledge Gaps
- **85 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+80 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Community 1` to `Community 5`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Community 6` to `Community 5`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _85 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._