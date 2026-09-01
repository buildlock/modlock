# Authorization matrix

Status: proposed  
Last reviewed: 2026-09-01

| Action | Anonymous | Player account | Creator member | Creator owner | Moderator | Copyright | Security | Admin |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Browse public metadata/download manual content | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Resolve desktop install | Policy/rate choice | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Create report | Yes with abuse controls | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Create/edit own draft | No | No | Scoped | Yes | No | No | No | Break-glass only |
| Complete upload | No | No | Scoped | Yes | No | No | No | Break-glass only |
| Submit/publish own release | No | No | Scoped submit | Yes; publish subject to state | Review/approve | No | Emergency block | Break-glass only |
| Manage creator members | No | No | No | Yes | No | No | No | Break-glass only |
| Verify identity/artifact | No | No | No | Request only | Dedicated trust role | No | Revoke on compromise | Break-glass only |
| Policy delist/suspend | No | No | No | No | Scoped | Copyright target only | Emergency/security target | Break-glass only |
| Copyright notice/counter decision | No | Submit | Submit | Submit | View limited | Yes | Security overlap only | Break-glass only |
| Malware/hash/global revoke | No | Report | Report | Report | Escalate | No | Yes, dual review | Break-glass only |
| Change policies/roles/signing/trust roots | No | No | No | No | No | No | Scoped proposal | Protected admin/operator approval |

IDs are not authorization. Every server action resolves current actor, ownership/membership, target state, role scope, step-up state, and policy. Break-glass is time-bound, separately approved/audited, and reviewed after use.

