// src/main.js
import { config } from "./config.js";
import { scrapeProject } from "./scraper.js";
import { transformProject } from "./transform.js";

(async () => {
  for (const project of config.projects) {
    await scrapeProject(project);
    await transformProject(project);
  }
  console.log("All done. Check data/llm/");
})();
