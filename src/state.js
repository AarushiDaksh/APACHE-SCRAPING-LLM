import fs from "fs-extra";
import { config } from "./config.js";

export function loadState() {
  return fs.readJsonSync(config.stateFile, { throws: false }) || {};
}

export function saveState(state) {
  fs.writeJsonSync(config.stateFile, state, { spaces: 2 });
}
