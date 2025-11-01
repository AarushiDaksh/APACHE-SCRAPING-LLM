import { getIssues, getComments } from "./jiraClient.js";
import { htmlToText, ensureDirs, writeJSONL } from "./utils.js";
import { config } from "./config.js";
import { loadState, saveState } from "./state.js";

export async function scrapeProject(project) {
  const state = loadState();
  let startAt = 0;
  let written = 0;

  if (!config.noRaw) ensureDirs(config.rawDir);
  const outPath = `${config.rawDir}/${project}.jsonl`;

  if (!config.quiet) console.log(`\n▶ Scraping ${project}...`);

  while (true) {
    const data = await getIssues(project, startAt);
    const issues = data.issues || [];
    if (!issues.length) break;

    for (const issue of issues) {
      if (config.maxIssues && written >= config.maxIssues) break;

      const f = issue.fields || {};
      const desc = htmlToText(f.description || "");
      let comments = [];
      try {
        const c = await getComments(issue.key);
        comments = (c.comments || []).map((c) => ({
          author: c.author?.displayName,
          body: htmlToText(c.body || ""),
        }));
      } catch {
        comments = [];
      }

      const doc = {
        key: issue.key,
        summary: f.summary,
        description: desc,
        status: f.status?.name,
        priority: f.priority?.name,
        reporter: f.reporter?.displayName,
        assignee: f.assignee?.displayName,
        labels: f.labels,
        project: f.project?.key,
        created: f.created,
        updated: f.updated,
        comments,
      };

      if (!config.noRaw) writeJSONL(outPath, doc);
      state[project] = f.updated; // checkpoint
      written++;
    }

    saveState(state);

    if (config.maxIssues && written >= config.maxIssues) break;
    if (startAt + issues.length >= data.total) break;
    startAt += config.pageSize;
  }

  if (!config.quiet) console.log(`✅ Done ${project}. Collected: ${written}`);
  return written;
}
