# Desktop and service performance plan

Status: test design complete; measurements require implementation and Windows hardware  
Last reviewed: 2026-09-01

## Desktop gates

Reference workload includes local library startup, 10,000 catalog summaries in SQLite, virtualized/thumbnails screen, profile resolve, progress events, deep link, updater bootstrap, offline mode, and a large streamed archive.

| Metric | Proposed gate |
|---|---:|
| Cold launch to local interactive | < 500 ms |
| Idle working set | < 60 MB |
| Idle CPU after stabilization | approximately 0% |
| Process after normal close | none |
| Installer payload excluding shared OS runtime | target < 20 MB |
| Download/extraction buffer | < 32 MB bounded buffer |
| Local library interaction | no dependency on network response |

Measure at least 10 cold and 30 warm runs after controlled reboot/cache procedure; report median, p95, range, hardware, OS, power mode, security software, build/signing/debug state, dataset, and profiler. Compare WinUI 3+Rust and all-Rust shells with identical core mock/data.

## Service tests

Catalog/search/read, install resolution, multipart completion, scan queue, source-adapter sync, revocation propagation, and restore/rebuild. Report throughput, p50/p95/p99, errors, CPU/memory/DB/query/object/queue saturation, cache behavior, and cost-driving operations at expected and 3× beta load.

Performance optimization cannot weaken validation, journaling, hashing, scanning, accessibility, or auditability.

