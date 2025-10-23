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
    <div className="ae:p-2 ae:w-full ae:h-full ae:overflow-y-auto ae:bg-white">
      {/* Overview */}
      <section className="ae:mb-4">
        <div className="ae:text-lg  ae:mb-3 ae:flex ae:items-center ae:gap-2">
          Overview
        </div>
        <p className="ae:text-gray-700 ae:leading-relaxed">
          Aiida Explorer is an interactive tool for visualizing AiiDA workflows
          and calculations. You can navigate nodes, inspect their details, and
          explore relationships between workflows, calculations, and data nodes.
          This tool leverages the{" "}
          <a
            href="https://aiida.readthedocs.io/projects/aiida-core/en/stable/internals/rest_api.html"
            className="ae:text-blue-400 ae:hover:underline ae:hover:text-blue-700"
            target="_blank"
          >
            AiiDA REST API
          </a>{" "}
          and presents data retrieved from it in a curated manner.
        </p>
      </section>

      {/* Provenance */}
      <section className="ae:mb-4">
        <div className="ae:text-lg  ae:mb-3 ae:flex ae:items-center ae:gap-2">
          <GraphIcon size={24} /> Provenance
        </div>
        <p className="ae:text-gray-700 ae:leading-relaxed">
          Using AiiDA for high-throughput workflows comes with the benefit of
          AiiDA provenence. This provenence stores how calculations were
          performed and the results from them. Every node is part of a directed
          acyclic graph (DAG) that records the inputs, outputs, and intermediate
          steps. Understanding provenance helps reproducability and facilitates
          sharing. Learn more in the{" "}
          <a
            href="https://aiida.readthedocs.io/projects/aiida-core/en/latest/"
            className="ae:text-blue-400 ae:hover:underline ae:hover:text-blue-700"
            target="_blank"
          >
            official docs.
          </a>{" "}
          This tool uses the the 'API endpoint /links' to build up a local view
          of each node.
        </p>
      </section>

      {/* Inspecting Nodes */}
      <section className="ae:mb-4">
        <div className="ae:text-lg ae:mb-3 ae:flex ae:items-center ae:gap-2">
          <ClickIcon size={24} /> Inspecting Nodes
        </div>
        <ul className="ae:pl-4 ae:list-inside ae:text-gray-700 ae:space-y-1">
          <li className="ae:flex ae:items-center ae:gap-2">
            <span className="ae:flex ae:items-center ae:gap-1 ae:font-medium">
              <ClickIcon2 size={22} /> Click a node:
            </span>
            <span className="ae:text-gray-700">
              Highlights the node and displays detailed information in the side
              panel.
            </span>
          </li>
          <li className="ae:flex ae:items-center ae:gap-2">
            <span className="ae:flex ae:items-center ae:gap-1 ae:font-medium">
              <DoubleClickIcon size={22} /> Double-click a node:
            </span>
            <span className="ae:text-gray-700">
              Sets the node as the central focus, building the links and
              centering the graph.
            </span>
          </li>
          <li className="ae:flex ae:items-center ae:gap-2">
            <span className="ae:flex ae:items-center ae:gap-1 ae:font-medium">
              <BreadcrumbsIcon size={22} /> Breadcrumbs:
            </span>
            <span className="ae:text-gray-700">
              Quickly navigate back to previously explored nodes. A history of
              the last 10 visited nodes is retained.
            </span>
          </li>
        </ul>
      </section>

      {/* Buttons & Controls */}
      <section className="ae:mb-4">
        <div className="ae:text-lg ae:mb-3 ae:flex ae:items-center ae:gap-2">
          <GraphIcon size={26} /> Buttons & Controls
        </div>
        <ul className="ae:pl-4 ae:list-inside ae:text-gray-700 ae:space-y-1">
          <li className="ae:flex ae:items-center ae:gap-2">
            <span className="ae:flex ae:items-center ae:gap-1 ae:font-medium">
              <GroupIcon size={22} /> Find node:
            </span>
            <span className="ae:text-gray-700">
              Provides a graphical interface for simple AiiDA queries using the
              querybuilder endpoint.
            </span>
          </li>
          <li className="ae:flex ae:items-center ae:gap-2">
            <span className="ae:flex ae:items-center ae:gap-1 ae:font-medium">
              <LinksIcon size={20} /> Get Counts:
            </span>
            <span className="ae:text-gray-700">
              Fetches the parent/child counts for all nodes currently visible in
              the graph.
            </span>
          </li>
          <li className="ae:flex ae:items-center ae:gap-2">
            <span className="ae:flex ae:items-center ae:gap-1 ae:font-medium">
              <QuestionIcon size={20} /> Help:
            </span>
            <span className="ae:text-gray-700">Opens this help overlay.</span>
          </li>
        </ul>
      </section>

      {/* Graph Interaction */}
      <p className="ae:text-gray-500 ae:text-sm ae:mt-6">
        This tool is currently in beta testing stage. Report unexpected
        behaviour, bugs or general suggestions on{" "}
        <a
          href="https://github.com/aiidateam/aiida-explorer/issues/new"
          className="ae:group ae:inline-flex ae:items-center ae:gap-0.5 ae:text-blue-400"
          target="_blank"
        >
          <span className="ae:transition-colors ae:group-hover:ae:text-blue-700">
            GitHub.
          </span>
          <span className="ae:inline-flex ae:items-center ae:justify-center ae:w-5 ae:h-5 ae:rounded-full ae:bg-blue-400 ae:group-hover:bg-blue-700 ae:transition-colors">
            <GithubIcon className="ae:w-[18px] ae:h-[18px] ae:text-white" />
          </span>
        </a>
      </p>
    </div>
  );
}
