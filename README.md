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

### Features to do:

- add/change Sidepane to include:
  - Raw / Rich information.
- Integrate the table view for node select maybe as a pop out maybe as a landing page.

- Integrate AiiDA explorer statistics page; (although this should probably be just a standalone hover)

- ?? Add breadcrumbs SearchParams? will people want to share the exact path they clicked (this seems messy and kinda hard.)

- Add pagination / better rendering for large datasets. Some nodes will hit the 400 limit...

## Installation

1. Clone the repository:

```bash
git clone <repo-url>
cd <repo-folder>
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser at the URL displayed in the terminal (usually `http://localhost:5173`).

## Usage

- Click on nodes to inspect their metadata in the **Side Pane**.
- Double click to refocus the graph on a node and fetch additional metadata.
- Use the **Breadcrumbs** at the bottom to navigate previously visited nodes.
- The **Debug Pane** shows raw node and edge data for advanced inspection.

## Configuration

- Ensure the **AiiDA REST API** endpoint is configured in `api.js` or your environment.
- Optional: Adjust the **max breadcrumbs** displayed by changing the `MAX_BREADCRUMBS` constant in `Explorer.jsx`.

## Tech Stack

- **React 18 + Vite**
- **React Flow** for graph visualization
- **Tailwind CSS** for styling
- **AiiDA REST API** for node data

---
