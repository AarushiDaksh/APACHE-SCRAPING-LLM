import fs from "fs-extra";
import { config } from "./config.js";
import { ensureDirs, writeJSONL } from "./utils.js";

export async function transformProject(project) {
  ensureDirs(config.llmDir);
  const inputPath = `${config.rawDir}/${project}.jsonl`;
  const outputPath = `${config.llmDir}/${project}.jsonl`;
  const lines = fs.readFileSync(inputPath, "utf8").trim().split("\n");

  for (const line of lines) {
    const raw = JSON.parse(line);

    // Summarization
    writeJSONL(outputPath, {
      task: "summarization",
      id: raw.key + "::summ",
      input: `${raw.summary}\n${raw.description}`,
      metadata: { project, priority: raw.priority, status: raw.status },
    });

    // Classification
    writeJSONL(outputPath, {
      task: "classification",
      id: raw.key + "::class",
      input: raw.description.slice(0, 500),
      label: { priority: raw.priority, status: raw.status },
    });

    // QnA
    const q = raw.summary;
    const ans =
      raw.comments?.[0]?.body ||
      raw.description.split(".")[0] ||
      "No answer found";
    writeJSONL(outputPath, {
      task: "qna",
      id: raw.key + "::qna",
      question: q,
      answer: ans,
    });
  }
}
