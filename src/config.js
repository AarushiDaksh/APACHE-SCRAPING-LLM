import dotenv from "dotenv";
dotenv.config();

function sinceFromEnv() {
  if (process.env.UPDATED_SINCE) return process.env.UPDATED_SINCE; // yyyy-mm-dd
  const days = Number(process.env.SINCE_DAYS || "0");
  if (!days) return null;
  const dt = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  return dt.toISOString().slice(0, 10);
}

export const config = {
  baseUrl: process.env.JIRA_BASE_URL || "https://issues.apache.org/jira",
  pageSize: Number(process.env.PAGE_SIZE || "100"),
  projects: (process.env.PROJECTS || "HADOOP,SPARK,KAFKA").split(","),
  dataDir: "data",
  rawDir: "data/raw",
  llmDir: "data/llm",
  stateFile: "state.json",

  maxIssues: Number(process.env.MAX_ISSUES || "0"), // 0 = no cap
  updatedSince: sinceFromEnv(),                   
  noRaw: String(process.env.NO_RAW || "false").toLowerCase() === "true",
  quiet: String(process.env.QUIET || "false").toLowerCase() === "true",
};
