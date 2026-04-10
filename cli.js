#!/usr/bin/env node

import { spawn, spawnSync } from "child_process";
import { select } from "@inquirer/prompts";
import open from "open";
import net from "net";

const REST_PORT = await findFreePort(5000);
const FRONTEND_URL = "https://aiidateam.github.io/aiida-explorer/";

function fail(msg) {
  console.error(`\n${msg}\n`);
  process.exit(1);
}

/* ---------------------------
   CHECKS
---------------------------- */

function checkVerdi() {
  const res = spawnSync("verdi", ["--help"]);
  if (res.error) fail('"verdi" not found.');
}

function checkRestApiDeps() {
  const res = spawnSync("python", [
    "-c",
    "from aiida.restapi.run_api import run_api",
  ]);

  if (res.status !== 0) {
    fail("Missing AiiDA REST API dependencies.");
  }
}

function isPortFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", () => resolve(false));

    server.once("listening", () => {
      server.close();
      resolve(true);
    });

    server.listen(port, "127.0.0.1");
  });
}

async function findFreePort(start = 5000, max = 5100) {
  for (let p = start; p <= max; p++) {
    if (await isPortFree(p)) return p;
  }
  throw new Error("No free ports found");
}

/* ---------------------------
   PROFILES
---------------------------- */

function getProfiles() {
  const res = spawnSync("verdi", ["profile", "list"], {
    encoding: "utf-8",
  });

  if (res.status !== 0) fail("Failed to list profiles.");

  let active = null;

  const profiles = res.stdout
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      if (l.startsWith("*")) {
        active = l.replace(/^\*\s*/, "");
        return active;
      }
      return l;
    });

  return { profiles, active };
}

async function selectProfile(profiles, active) {
  return select({
    message: "Select AiiDA profile",
    choices: profiles.map((p) => ({
      name: p,
      value: p,
      description: p === active ? "active" : undefined,
    })),
    default: active,
  });
}

/* ---------------------------
   REST API
---------------------------- */

function startRestApi(profile) {
  console.log(`Starting REST API (${profile}) on ${REST_PORT}...`);

  return spawn("verdi", [
    "-p",
    profile,
    "restapi",
    "--port",
    REST_PORT,
    "--verbosity",
    "error",
  ]);
}

/* ---------------------------
   WAIT FOR API
---------------------------- */

async function waitForApi() {
  const url = `http://localhost:${REST_PORT}/api/v4`;

  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return url;
    } catch {}

    await new Promise((r) => setTimeout(r, 1000));
  }

  fail("REST API did not start in time.");
}

/* ---------------------------
   MAIN
---------------------------- */

async function main() {
  checkVerdi();
  checkRestApiDeps();

  const { profiles, active } = getProfiles();
  const selectedProfile = await selectProfile(profiles, active);

  const restProc = startRestApi(selectedProfile);

  const apiUrl = await waitForApi();

  const frontend = FRONTEND_URL + `?api_url=${encodeURIComponent(apiUrl)}`;

  console.log("\nOpening browser...");
  await open(frontend);

  function shutdown() {
    console.log("\nShutting down...");
    restProc.kill("SIGTERM");
    process.exit(0);
  }

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main();
