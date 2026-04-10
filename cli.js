#!/usr/bin/env node

import { spawn, spawnSync } from "child_process";
import open from "open";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { select } from "@inquirer/prompts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const FRONTEND_PORT = 4173;
const REST_PORT = 5000;

/* ---------------------------
   PRE-FLIGHT CHECKS
---------------------------- */

function fail(msg) {
  console.error(`\n${msg}\n`);
  process.exit(1);
}

function checkVerdi() {
  const res = spawnSync("verdi", ["--help"], { encoding: "utf-8" });

  if (res.error) {
    fail('"verdi" not found. Is AiiDA installed and activated?');
  }
}

function checkRestApiDeps() {
  const res = spawnSync(
    "python",
    ["-c", "from aiida.restapi.run_api import run_api"],
    { encoding: "utf-8" },
  );

  if (res.status !== 0) {
    fail(
      "Missing AiiDA REST API dependencies.\n\nFix:\n pip install aiida-core[rest-api]",
    );
  }
}

function checkFrontend() {
  const distPath = path.join(__dirname, "dist");

  if (!fs.existsSync(distPath)) {
    fail('Frontend build missing. Expected "dist/" in package.');
  }
}

/* ---------------------------
   PROFILE SELECTION
---------------------------- */

function getProfiles() {
  const res = spawnSync("verdi", ["profile", "list"], {
    encoding: "utf-8",
  });

  if (res.status !== 0) {
    fail("Failed to fetch AiiDA profiles");
  }

  const lines = res.stdout.split("\n");

  let active = null;

  const profiles = lines
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("Report"))
    .map((l) => {
      if (l.startsWith("*")) {
        active = l.replace(/^\*\s*/, "");
        return active;
      }
      return l.replace(/^\*\s*/, "");
    })
    .filter(Boolean);

  return { profiles, active };
}

async function selectProfile(profiles, active) {
  return await select({
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
   STARTUP
---------------------------- */

let restProc = null;
let frontendProc = null;

function startRestApi(profile) {
  console.log(`Starting AiiDA REST API (profile: ${profile})...`);

  const proc = spawn("verdi", ["-p", profile, "restapi", "--port", REST_PORT], {
    stdio: "inherit",
  });

  proc.on("exit", (code) => {
    console.log(`\nREST API exited with code ${code}`);
  });

  return proc;
}

function startFrontend() {
  console.log("🌐 Starting frontend (Vite preview)...");

  const viteBin = path.join(__dirname, "node_modules", ".bin", "vite");

  const proc = spawn(viteBin, ["preview", "--port", FRONTEND_PORT], {
    cwd: __dirname,
    stdio: "inherit",
  });

  proc.on("exit", (code) => {
    console.log(`\nFrontend exited with code ${code}`);
  });

  return proc;
}

/* ---------------------------
   MAIN
---------------------------- */

async function main() {
  checkVerdi();
  checkRestApiDeps();
  checkFrontend();

  const { profiles, active } = getProfiles();
  const selectedProfile = await selectProfile(profiles, active);

  restProc = startRestApi(selectedProfile);
  frontendProc = startFrontend();

  setTimeout(() => {
    const apiUrl = `http://localhost:${REST_PORT}/api/v4`;

    const url =
      `http://localhost:${FRONTEND_PORT}/` +
      `?api_url=${encodeURIComponent(apiUrl)}`;

    console.log("\nOpening browser...\n");
    open(url);
  }, 5000);

  function shutdown() {
    console.log("\nShutting down...");

    if (restProc) restProc.kill("SIGTERM");
    if (frontendProc) frontendProc.kill("SIGTERM");

    process.exit(0);
  }

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main();
