# Security and privacy feature review checklist

For each feature/change:

- Trust boundaries, untrusted inputs/outputs, privileges, secrets, and external calls identified.
- Authentication and object/action authorization defined for every state.
- Size/time/count/depth/rate limits and retry/idempotency behavior defined.
- Logging/metrics/diagnostics use an allowlist and redaction.
- Collected data, purpose, legal/consent basis, visibility, retention, export/deletion, and providers documented.
- Abuse cases include malware, impersonation, unfair advantage, rights, privacy, spam/rate, and admin misuse where applicable.
- Failure is safe, user-visible, reversible, and does not silently weaken checks.
- Contract/migration/backward compatibility reviewed.
- Threat-model/risk-register/runbooks and tests updated.
- New parser/source/auth/payment/privilege/update behavior receives security owner review.

