# Apache Jira LLM Data Scraper

This repository provides a data scraping and transformation pipeline that extracts public issue data from **Apache’s Jira** instance and converts it into a structured JSONL dataset.  
The generated corpus is suitable for training or evaluating large language models (LLMs) on summarization, classification, and question-answering tasks.

---

## 1. Overview

The system scrapes issue metadata, descriptions, and comments from selected Apache Jira projects and transforms them into model-ready datasets.  
It demonstrates a resilient scraping architecture with checkpointing, configurable parameters, and efficient text processing.

Default target projects: `HADOOP`, `SPARK`, and `KAFKA`.

---

## 2. Setup Instructions

### 2.1 Clone the Repository
```bash
git clone https://github.com/AarushiDaksh/APACHE-SCRAPING-LLM.git
cd APACHE-SCRAPING-LLM
```

### 2.2 Install Dependencies
```bash
npm install
```

### 2.3 Configure Environment Variables
Create a `.env` file in the root directory:

```env
JIRA_BASE_URL=https://issues.apache.org/jira
PROJECTS=HADOOP,SPARK,KAFKA
PAGE_SIZE=100

# parameters needed else you may get large dataset
MAX_ISSUES=50
SINCE_DAYS=7
NO_RAW=false
QUIET=true
```

### 2.4 Run the Scraper
```bash
npm run start
```

### 2.5 Output Structure
```
data/
├─ raw/     # Raw issue data (NO_RAW=false) 
└─ llm/     # Transformed JSONL dataset for LLM tasks
```

---

## 3. Architecture Overview

### 3.1 File Structure
| File | Description |
|------|--------------|
| `src/config.js` | Loads configuration and environment variables. |
| `src/jiraClient.js` | Handles HTTP requests, retries, and pagination. |
| `src/scraper.js` | Fetches issues and comments with checkpointing. |
| `src/transform.js` | Converts raw data into LLM-ready JSONL format. |
| `src/state.js` | Stores and retrieves checkpoint progress. |
| `src/utils.js` | Helper utilities for text cleaning and file handling. |
| `src/main.js` | Main orchestrator controlling scraper and transformer. |

### 3.2 Data Flow
1. Load configuration from `.env`.
2. Fetch issues and comments from the Jira API with pagination and retries.
3. Save results in JSONL format under `data/raw/`.
4. Transform the raw files into structured datasets in `data/llm/`.

---

## 4. Design Reasoning

| Component | Design Decision | Rationale |
|------------|-----------------|-----------|
| **Data Source** | Apache Jira REST API | Provides structured, reliable, and machine-readable data. |
| **HTTP Client** | Axios with `p-retry` | Supports automatic retries on network errors and rate limits. |
| **Data Format** | JSONL | Efficient, line-delimited format ideal for ML pipelines. |
| **Checkpointing** | JSON-based state tracking | Allows the scraper to resume after interruptions. |
| **Transformation Layer** | Summarization, Classification, QnA | Generates diverse LLM tasks from a single dataset. |
| **Configuration** | Environment variables via `.env` | Simplifies parameter tuning without code modification. |

---

## 5. Edge Cases Handled

| Edge Case | Handling Strategy |
|------------|------------------|
| **HTTP 429 (Rate Limit)** | Waits using `Retry-After` header or exponential backoff. |
| **5xx Server Errors** | Retries automatically with capped delay. |
| **Network Timeouts** | Retries on failure with exponential wait. |
| **Malformed or Empty Fields** | Defaults to safe empty strings and skips invalid entries. |
| **Partial Runs / Interruptions** | Uses checkpoints (`state.json`) to resume progress. |
| **Duplicate Fetches** | Orders issues by `updated` timestamp to prevent duplicates. |
| **Large Data Volumes** | Uses `MAX_ISSUES` and `SINCE_DAYS` filters to limit size. |

---

## 6. Optimization Decisions

| Optimization | Description |
|---------------|-------------|
| **Asynchronous Pagination** | Fetches multiple pages concurrently for efficiency. |
| **Configurable Rate Limit** | Maintains speed while avoiding API throttling. |
| **Resumable Design** | Prevents data loss through incremental checkpointing. |
| **Selective Scraping** | Limits scope by date and issue count. |
| **Minimal Logging** | `QUIET=true` mode suppresses unnecessary console output. |
| **Optional Raw Storage** | `NO_RAW=true` skips large intermediate files. |

---

## 7. Potential Future Improvements

| Area | Proposed Enhancement |
|-------|----------------------|
| **Concurrency Management** | Add worker pool for higher throughput. |
| **Data Quality** | Integrate sentiment and topic tagging for comments. |
| **Validation** | Enforce schema validation using `zod` or `ajv`. |
| **CLI Support** | Provide runtime flags for project-specific scraping. |
| **Data Source Expansion** | Extend to GitHub Issues, Bugzilla, or JIRA Cloud APIs. |
| **Automation** | Add scheduling or Docker containerization. |

---

## 8. Example Output

Example record from `data/llm/HADOOP.jsonl`:

```json
{
  "task": "summarization",
  "id": "HADOOP-12345::summ",
  "input": "Title: Improve data serialization performance\nDescription: This issue focuses on optimizing JSON serialization across modules.",
  "metadata": {
    "project": "HADOOP",
    "priority": "Major",
    "status": "Open"
  }
}
```

---

## 9. Tech Stack

| Category | Technology |
|-----------|-------------|
| Language | Node.js (ESM) |
| Dependencies | axios, p-retry, fs-extra, dotenv |
| Data Format | JSONL |
| API Source | Apache Jira REST API |
| Storage | Local filesystem |

---

## 10. Author

**Aarushi Daksh**  
Developer | 
[GitHub Profile](https://github.com/AarushiDaksh)  |
[Portfolio](https://www.aarushi.cloud/)
