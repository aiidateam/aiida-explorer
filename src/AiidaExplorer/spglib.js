import init, { analyze_cell } from "@spglib/moyo-wasm";
import wasmUrl from "@spglib/moyo-wasm/moyo_wasm_bg.wasm?url";

let initPromise = null;

function ensureInit() {
  if (!initPromise) initPromise = init(wasmUrl);
  return initPromise;
}

export async function analyzeCrystal(lattice, positions, numbers) {
  await ensureInit();

  const basis = lattice.flat();

  const cell = {
    lattice: { basis },
    positions,
    numbers,
  };

  return analyze_cell(JSON.stringify(cell), 5e-3, "Standard");
}
