# AiiDA Node Explorer

A React application for traversing and visualizing AiiDA nodes via the AiiDA REST API. The tool allows you to explore the graph of nodes, view detailed metadata, and track node visits with interactive breadcrumbs.

## Features

- Interactive **graph view** of nodes and their relationships.
- **Single click** selects a node to show details in a sidebar.
- **Double click** refocuses the graph on a node, fetching additional metadata (attributes, comments, extras).
- **Breadcrumb trail** tracks visited nodes, clickable for quick navigation.
- **Debug pane** to inspect nodes and edges.
- Nodes styled by type (process, data, etc.) with clear selection highlighting.
- **Caching of extra node data** to reduce redundant API calls.
- URL updates for easy sharing of specific nodes (e.g., `?rootNode=<id>`).

### Features to do (TODO):

- add/change Sidepane to include:
  - Raw / Rich information.
- Integrate the table view for node select maybe as a pop out maybe as a landing page.

- Integrate AiiDA explorer statistics page; (although this should probably be just a standalone hover)

- Add pagination / better rendering for large datasets. Some nodes will hit the 400 limit, the old grid view seems to use pagination to get nodes fast.

- Fix flaky bug of central nodes rendering their linklabel after visiting a two nodal graph.

## Installation

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Ensure the desired **AiiDA REST API** endpoint is configured in `App.jsx` and goto `http://localhost:5173`.

## Development

IMPORTANT TODOS:

- TODO: figure out if there is a nice way to handle Upfdata Getcounts + getDownload ... these are currently the only laggy parts of the code. I think actually most of the overhead is hilariously tring to format it into the "Download" Raw view - it might be worth just not having 'download' be hit at all for upf data

- TODO: there is a bug with caching and positions - this is making duplicate labels appear - we should handle this clevely somehow - although attempts at fixing this are not too easy lol.

- TODO: currently overlays dont always have the same "X close" styling / header stying. We should unify these.

- TODO: it might be nice to have basically every color, styling etc.

- TODO: refactor raw views to have 'download_format'

- TODO: pathing through browser buttons doesnt seem to work at all - this is difficult to fix.

### Notes and warnings;

The ReactFlow builtin nodes are a little difficult to style/rotate etc; we have built a custom "HorizontalNode" component that controls default colors, label positions etc. This is a little inconvenient since control of shape is quite hard.

### Modularity and control;

When making additional, isolation is important. The Explore react component should act as a controller and wrapper for modular components that in principle function by themself. File/Module scope is regularly used to define only things a component should be aware of.

Currently this is upheld; some components share context to update their internal state but this is managed externally by the Explorer controller, which effectively tracks global state.

For common/simple components (layout managers, tables/Dropdowns etc), these should be placed in the /components directory, with the expectation that this may eventually fall into a fully fledged library.

### Styling

Most of the styling is handled largely by Tailwind and a little further control is through inline css. Exposing "componentStyle" as a prop gives control on the appearance of individual components without having to hack the styling with css overrides. These can defined such to only append to the baseStyle (since tailwind is right-to-left priority) so that the basestyle is not overwritten.
