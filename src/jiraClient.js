import axios from "axios";
import pRetry from "p-retry";
import { config } from "./config.js";

const client = axios.create({
  baseURL: config.baseUrl,
  timeout: 20000,
  headers: { Accept: "application/json" },
});

async function request(url, params = {}) {
  return pRetry(
    async () => {
      const res = await client.get(url, { params });
      if (res.status >= 500) throw new Error("Server error " + res.status);
      return res.data;
    },
    {
      retries: 5,
      onFailedAttempt: (err) => {
        const status = err.response?.status;
        if (status === 429) {
          const wait = Number(err.response.headers?.["retry-after"] || 5) * 1000;
          return new Promise((r) => setTimeout(r, wait));
        }
      },
    }
  );
}

export async function getIssues(project, startAt = 0) {
  // Build JQL with optional updatedSince
  const since = config.updatedSince ? ` AND updated >= "${config.updatedSince}"` : "";
  const jql = `project=${project}${since} ORDER BY updated ASC`;

  return request("/rest/api/2/search", {
    jql,
    startAt,
    maxResults: config.pageSize,
    fields:
      "summary,description,reporter,assignee,labels,priority,status,project,created,updated",
  });
}

export async function getComments(key) {
  return request(`/rest/api/2/issue/${key}/comment`, {
    startAt: 0,
    maxResults: 1000,
  });
}
