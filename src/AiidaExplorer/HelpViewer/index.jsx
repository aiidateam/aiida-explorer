import React from "react";

import {
  GroupIcon,
  LinksIcon,
  QuestionIcon,
  GraphIcon,
  ClickIcon,
  ClickIcon2,
  DoubleClickIcon,
  BreadcrumbsIcon,
  GithubIcon,
} from "../components/Icons";

export default function HelpViewer() {
  return (
    <div className="p-2 w-full h-full overflow-y-auto bg-white">
      {/* Overview */}
      <section className="mb-4">
        <h3 className="text-lg  mb-3 flex items-center gap-2">Overview</h3>
        <p className="text-gray-700 leading-relaxed">
          Aiida Explorer is an interactive tool for visualizing AiiDA workflows
          and calculations. You can navigate nodes, inspect their details, and
          explore relationships between workflows, calculations, and data nodes.
          This tool leverages the{" "}
          <a
            href="https://aiida.readthedocs.io/projects/aiida-core/en/stable/internals/rest_api.html"
            className="text-blue-400 hover:underline hover:text-blue-700"
            target="_blank"
          >
            AiiDA REST API
          </a>{" "}
          and presents data retrieved from it in a curated manner.
        </p>
      </section>

      {/* Provenance */}
      <section className="mb-4">
        <h3 className="text-lg  mb-3 flex items-center gap-2">
          <GraphIcon size={24} /> Provenance
        </h3>
        <p className="text-gray-700 leading-relaxed">
          Using AiiDA for high-throughput workflows comes with the benefit of
          AiiDA provenence. This provenence stores how calculations were
          performed and the results from them. Every node is part of a directed
          acyclic graph (DAG) that records the inputs, outputs, and intermediate
          steps. Understanding provenance helps reproducability and facilitates
          sharing. Learn more in the{" "}
          <a
            href="https://aiida.readthedocs.io/projects/aiida-core/en/latest/"
            className="text-blue-400 hover:underline hover:text-blue-700"
            target="_blank"
          >
            official docs.
          </a>{" "}
          This tool uses the the 'API endpoint /links' to build up a local view
          of each node.
        </p>
      </section>

      {/* Inspecting Nodes */}
      <section className="mb-4">
        <h3 className="text-lg  mb-3 flex items-center gap-2">
          <ClickIcon size={24} /> Inspecting Nodes
        </h3>
        <ul className="pl-4 list-inside text-gray-700 space-y-1">
          <li className="flex items-center gap-2">
            <strong className="flex items-center gap-1">
              <ClickIcon2 size={22} /> Click a node:
            </strong>
            <span className="text-gray-700">
              Highlights the node and displays detailed information in the side
              panel.
            </span>
          </li>
          <li className="flex items-center gap-2">
            <strong className="flex items-center gap-1">
              <DoubleClickIcon size={22} /> Double-click a node:
            </strong>
            <span className="text-gray-700">
              <li>
                Sets the node as the central focus, building the links and
                centering the graph.
              </li>
            </span>
          </li>
          <li className="flex items-center gap-2">
            <strong className="flex items-center gap-1">
              <BreadcrumbsIcon size={22} /> Breadcrumbs:
            </strong>
            <span className="text-gray-700">
              <li>
                Quickly navigate back to previously explored nodes. A history of
                the last 10 visited nodes is retained.
              </li>
            </span>
          </li>
        </ul>
      </section>

      {/* Buttons & Controls */}
      <section className="mb-4">
        <h3 className="text-lg  mb-3 flex items-center gap-2">
          <GraphIcon size={26} /> Buttons & Controls
        </h3>
        <ul className="pl-4 list-inside text-gray-700 space-y-1 ">
          <li className="flex items-center gap-2">
            <strong className="flex items-center gap-1">
              <GroupIcon size={22} /> Find node:
            </strong>
            <span className="text-gray-700">
              Provides a graphical interface for simple AiiDA queries using the
              querybuilder endpoint.
            </span>
          </li>
          <li className="flex items-center gap-2">
            <strong className="flex items-center gap-1">
              <LinksIcon size={20} /> Get Counts:
            </strong>
            <span className="text-gray-700">
              Fetches the parent/child counts for all nodes currently visible in
              the graph.
            </span>
          </li>
          <li className="flex items-center gap-2">
            <strong className="flex items-center gap-1">
              <QuestionIcon size={20} /> Help:
            </strong>
            <span className="text-gray-700">Opens this help overlay.</span>
          </li>
          <li></li>
        </ul>
      </section>

      {/* Graph Interaction */}

      <p className="text-gray-500 text-sm mt-6">
        This tool is currently in beta testing stage. Report unexpected
        behaviour, bugs or general suggestions on{" "}
        <a
          href="https://github.com/Bud-Macaulay/aiida-explorer/issues/new"
          className="group inline-flex items-center gap-0.5 text-blue-400"
          target="_blank"
        >
          <span className="transition-colors group-hover:text-blue-700">
            GitHub.
          </span>

          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-400 group-hover:bg-blue-700 transition-colors">
            <GithubIcon className="w-[18-px] h-[18px] text-white" />
          </span>
        </a>
      </p>
    </div>
  );
}
