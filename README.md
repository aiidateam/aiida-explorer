# AiiDA provenance explorer

[![NPM Version](https://img.shields.io/npm/v/aiida-explorer)](https://www.npmjs.com/package/aiida-explorer)

A React component to explore AiiDA provenance built on top of the AiiDA REST API.

The tool allows you to explore the graph of nodes, view detailed metadata, and track node visits with interactive breadcrumbs.

This repository contains

1. the `AiidaExplorer` component (library), which is also published to `npm`; and
2. a demo page illustrating the usage, which is deployed to github pages (https://aiidateam.github.io/aiida-explorer/). This also allows to directly explore your local AiiDA database (using `verdi restapi`), but might depend on the browser security settings (confirmed working with Firefox).

Main features include:

- Interactive **graph view** of nodes and their relationships.
- **Single click** selects a node to show details in a sidebar.
- **Double click** refocuses the graph on a node, fetching additional metadata (attributes, comments, extras).
- **Breadcrumb trail** tracks visited nodes, clickable for quick navigation.
- Nodes styled by type (process, data, etc.) with clear selection highlighting.

## Installation and usage

Install via

```bash
npm install aiida-explorer
```

And use with the following:

```javascript
import { AiidaExplorer } from "aiida-explorer";

...
<AiidaExplorer restApiUrl={AIIDA_REST_URL} />
...
```

where `restApiUrl` is the base url of the [AiiDA REST API](https://aiida.readthedocs.io/projects/aiida-core/en/v2.6.2/reference/rest_api.html), e.g. `http://localhost:5000/api/v4` if started locally via `verdi restapi`. For more details see the source code of the demo page.

One can also manage the `rootNode` state outside the component (e.g. to sync with URL parameters), then one should use

```javascript
<AiidaExplorer
  restApiUrl={AIIDA_REST_URL}
  rootNode={rootNode}
  onRootNodeChange={onRootNodeChange}
/>
```

## Development

We use the prefix ae to isolate tailwind classes (ae:bg-slate-50).

### Using the demo page

For development, start the demo page by

```bash
npm install
npm run dev
```

### Building the library and testing locally

To build the component library and test locally in an external application (e.g. before publishing to `npm`), use

```bash
npm run build:lib
npm pack
```

which will create a `.tgz` file that can then be installed by the external application via

```bash
npm install /path/to/aiida-explorer-x.y.z.tgz
```

### Publishing a new version of the library on npm

To make a new version and publish to npm via GitHub Actions:

```bash
npm version [major|minor|patch]
git push --follow-tags
```

(Note: no need to write the version number manually!)

### Deploying the demo page to github-pages

The demo page is deployed to Github pages automatically from the `main` branch.

Additionally, any pull request gets deployed in it's own subpath as well.

Manual deployment to Github pages should not be done, as that might break any PR previews.

## Notes

- An initial prototype of this tool was created by Sharan Poojari during Google Summer of Code 2024 (see [the final report](https://github.com/aiidateam/aiida-explorer/blob/gsoc/gsoc/README.md)).
