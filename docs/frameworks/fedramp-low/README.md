# FedRAMP Low reference packet

## Official scope

- **Program owner:** FedRAMP / GSA
- **Working target in this folder:** legacy FedRAMP **Low** baseline references, captured alongside the current FedRAMP documentation model.
- **Important caveat:** current FedRAMP public documentation is transitioning away from the old impact-level labels as primary marketplace labels.

## Primary sources

1. [FedRAMP Authorization Act](https://www.fedramp.gov/docs/authority/law/)
   - Statutory foundation for modern FedRAMP.
2. [OMB Memorandum M-24-15](https://www.fedramp.gov/docs/authority/m-24-15/)
   - Program-modernization memo that rescinded and replaced prior FedRAMP policy.
3. [M-24-15 Section IV: The FedRAMP Authorization Process](https://www.fedramp.gov/docs/authority/m-24-15/process/)
   - Still frames authorization reuse through FIPS 199 impact levels and presumption of adequacy.
4. [FedRAMP Rev5 documentation and playbooks](https://www.fedramp.gov/docs/rev5/)
   - Current Rev5 playbook landing page.
5. [Notice 0004: Initial Outcome from RFC-0020 FedRAMP Authorization Designations](https://www.fedramp.gov/notices/0004)
   - Official notice describing the certification-class transition.
6. [RFC-0020 FedRAMP Authorization Designations](https://www.fedramp.gov/rfcs/0020/)
   - Historical context only; the page explicitly says not to implement from the RFC itself.
7. [FedRAMP/docs GitHub repository](https://github.com/FedRAMP/docs)
   - Official machine-readable/human-readable documentation repository.

## Captured notes

- `M-24-15` and the FedRAMP authorization-process documentation still describe the **presumption of adequacy** in terms of a FedRAMP authorization at a given **FIPS 199 impact level**.
- Notice `0004` says the 2026 consolidated rules will **keep four baselines of assessment** but relabel them into certification classes.
- The notice states that, for **Rev5**, **Class B** will include the current **Li-SaaS and Low** baselines.
- The closed `RFC-0020` page is still useful as historical context because it spells out the earlier proposed mapping of:
  - `Certified Level 2` → `Low`
- The `FedRAMP/docs` repository says its FRMR materials are the **authoritative source of truth for FedRAMP processes**.
- The public `https://www.fedramp.gov/baselines/` path now returns `404`, so the modern documentation trail is the safer place to anchor future work.

## Implementation notes

- Keep `FedRAMP Low` as a user-facing legacy label because procurement and vendor language still commonly uses it.
- Also store the forward-looking mapping to **Rev5 Class B** for future compatibility.
- Prefer current FedRAMP authority/process pages and the `FedRAMP/docs` repository over dead legacy baseline landing pages.
- Treat the RFC page as historical context only; do not use it as a normative source when the notice or current docs contradict it.

## Known gaps

- We did not confirm a single modern public page that serves as a direct replacement for the old `Low baseline` artifact landing page.
- If a future import needs the exact baseline package contents, a follow-up should harvest the current Rev5/FRMR documentation more deeply.
