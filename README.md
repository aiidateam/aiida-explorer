# Next-gen AiiDA provenance explorer

React component to explore AiiDA provenance.

This is a new version under development with the goal to replace https://github.com/materialscloud-org/aiida-explorer

Install via

```bash
npm install aiida-explorer
```

And use with

```javascript
import AiidaExplorer from "./AiidaExplorer";

<AiidaExplorer apiUrl={aiidaRestApiUrl} />;
```

where `aiidaRestApiUrl` is the base url of the [AiiDA REST API](https://aiida.readthedocs.io/projects/aiida-core/en/v2.6.2/reference/rest_api.html).

## Development

### Using the demo page

For development, start the demo page (in `src/App.jsx`) by

```
npm install
npm run dev
```

### Building and testing locally

To build and test locally in an external application (e.g. before publishing to npm), use

```
npm run build
npm pack
```

which will create a `.tgz` file that can then be installed by the external application via

```
npm install /path/to/aiida-explorer-x.y.z.tgz
```

### Publishing a new version

To make a new version and publish to npm via GitHub Actions:

```bash
npm version <major/minor/patch>
git push --follow-tags
```
