# AiiDA provenance explorer

[![NPM Version](https://img.shields.io/npm/v/aiida-explorer)](https://www.npmjs.com/package/aiida-explorer)

A React component to explore AiiDA provenance built on top of the AiiDA REST API.

The tool allows you to explore the graph of nodes, view detailed metadata, and track node visits with interactive breadcrumbs.

This repository contains

1. the `AiidaExplorer` component (library), which is also published to `npm`; and
2. a demo page illustrating the usage, which is deployed to github pages (https://aiidateam.github.io/aiida-explorer/).

Main features include:

- Interactive **graph view** of nodes and their relationships.
- **Single click** selects a node to show details in a sidebar.
- **Double click** refocuses the graph on a node, fetching additional metadata (attributes, comments, extras).
- **Breadcrumb trail** tracks visited nodes, clickable for quick navigation.
- Nodes styled by type (process, data, etc.) with clear selection highlighting.

## Development

### Using the demo page

For development, start the demo page by

```bash
npm install
npm run dev
```

## Notes

- An initial prototype of this tool was created by Sharan Poojari during Google Summer of Code 2024 (see [the final report](https://github.com/aiidateam/aiida-explorer/blob/gsoc/gsoc/README.md)).
