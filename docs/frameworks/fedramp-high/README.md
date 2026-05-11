# FedRAMP High reference packet

## Official scope

- **Program owner:** FedRAMP / GSA
- **Working target in this folder:** legacy FedRAMP **High** baseline references, captured alongside the current FedRAMP documentation model.
- **Important caveat:** modern FedRAMP public documentation is moving from the old impact-level labels to certification-class labels.

## Primary sources

1. [FedRAMP Authorization Act](https://www.fedramp.gov/docs/authority/law/)
   - Statutory foundation for modern FedRAMP.
2. [OMB Memorandum M-24-15](https://www.fedramp.gov/docs/authority/m-24-15/)
   - Program-modernization memo.
3. [M-24-15 Section IV: The FedRAMP Authorization Process](https://www.fedramp.gov/docs/authority/m-24-15/process/)
   - Documents the presumption of adequacy and authorization-path structure.
4. [FedRAMP Rev5 documentation and playbooks](https://www.fedramp.gov/docs/rev5/)
   - Current Rev5 playbook landing page.
5. [Notice 0004: Initial Outcome from RFC-0020 FedRAMP Authorization Designations](https://www.fedramp.gov/notices/0004)
   - Official notice describing the certification-class transition.
6. [RFC-0020 FedRAMP Authorization Designations](https://www.fedramp.gov/rfcs/0020/)
   - Historical context only; not normative for implementation.
7. [FedRAMP/docs GitHub repository](https://github.com/FedRAMP/docs)
   - Official documentation repository and FRMR source.

## Captured notes

- Current FedRAMP authority/process documentation still talks about authorization reuse through **FIPS 199 impact levels**.
- Notice `0004` says the 2026 consolidated rules will keep four baselines of assessment but relabel them into certification classes.
- That same notice states that, for **Rev5**, **Class D** will include the current **High** baseline.
- The historical `RFC-0020` page is useful for mapping context, but the page itself explicitly says it is closed and should not be implemented directly.
- The `FedRAMP/docs` repository states that its FRMR materials are the authoritative source of truth for FedRAMP processes.
- The old public `/baselines/` landing page is no longer usable, so newer authority/process/playbook sources are the safer anchor points.

## Implementation notes

- Keep `FedRAMP High` as a legacy-compatible label in Comp AI because many vendors and buyers still use it.
- Also store the forward-looking mapping to **Rev5 Class D**.
- Prefer current FedRAMP authority/process/playbook documentation over dead legacy baseline pages.
- If deeper baseline-package harvesting is needed later, follow the current `FedRAMP/docs` / FRMR trail rather than depending on historical URLs.

## Known gaps

- We did not confirm a single public replacement page for the old `High baseline` landing/package path.
- A future follow-up may need deeper harvesting from the Rev5 docs and FRMR repository if exact package structure is needed for automated import.
