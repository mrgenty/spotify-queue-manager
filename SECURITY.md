# Security Policy

## Supported versions

Security fixes are applied to the latest version on the default branch. Deployments should track a reviewed commit or release rather than relying on an unpinned moving branch in production.

## Reporting a vulnerability

Please do not disclose security vulnerabilities through public GitHub issues.

Send a report to [security@senioxtreme.it](mailto:security@senioxtreme.it) with the subject `[SECURITY] Spotify Queue Manager`.

Include, where possible:

- a concise description of the issue;
- affected files, endpoints, versions, or deployments;
- reproducible steps or a proof of concept;
- the security impact and realistic attack scenario;
- any relevant logs, screenshots, or suggested mitigations.

Please avoid including live Spotify client secrets, refresh tokens, admin passwords, or other credentials. Redact them before sending a report.

## Response process

We aim to acknowledge reports within five business days. After triage, we will investigate the impact, coordinate a fix, and communicate remediation or mitigation steps to the reporter when appropriate.

For critical issues involving exposed credentials, include the affected environment and rotate the credentials immediately if you are authorized to do so.

## Responsible disclosure

Good-faith security research is welcome. Do not access, modify, delete, or retain data that does not belong to you; do not degrade availability; and stop testing after confirming the issue. We ask researchers to allow reasonable time for remediation before public disclosure.

## Security boundaries

The following are generally configuration or operational issues rather than vulnerabilities in this repository:

- leaked credentials that were committed or configured by a deployment owner;
- insecure Cloudflare account or repository permissions;
- behavior imposed by Spotify API availability, account eligibility, or policy;
- denial-of-service testing against a public deployment without prior authorization.

These issues can still be reported privately when they expose a concrete risk.
