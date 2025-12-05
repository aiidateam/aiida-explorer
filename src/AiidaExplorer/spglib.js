import init, { analyze_cell } from "@spglib/moyo-wasm";
import wasmUrl from "@spglib/moyo-wasm/moyo_wasm_bg.wasm?url";

export async function analyzeCrystal(lattice, positions, numbers) {
  // Initialize WASM
  await init(wasmUrl);

  const basis = lattice.flat();

  const cell = {
    lattice: { basis },
    positions,
    numbers,
  };

  return analyze_cell(JSON.stringify(cell), 5e-3, "Standard");
}
