# NIST SP 800-53 Rev. 5 reference packet

## Official scope

- **Publisher:** NIST Computer Security Resource Center (CSRC)
- **Core publication:** SP 800-53 Rev. 5, Update 1
- **What this packet covers:**
  - the control catalog (`SP 800-53`),
  - assessment procedures (`SP 800-53A`), and
  - baseline/tailoring references (`SP 800-53B`)
- **Why it matters for Comp AI:** this is the core control-family and control-identifier source for federal-style security control modeling.

## Primary sources

1. [SP 800-53 Rev. 5, Update 1](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final)
   - Core security and privacy control catalog.
   - Publication page includes DOI, PDF, supplemental materials, mappings, and release notes.
2. [SP 800-53A Rev. 5](https://csrc.nist.gov/pubs/sp/800/53/a/r5/final)
   - Assessment procedures for the controls in SP 800-53.
   - Publication page also points to OSCAL resources.
3. [SP 800-53B, Update 1](https://csrc.nist.gov/pubs/sp/800/53/b/upd1/final)
   - Control baselines and tailoring guidance.
   - Publication page links the control baselines spreadsheet, SCOR, and OSCAL resources.
4. [NIST Security and Privacy Control Overlay Repository (SCOR)](https://csrc.nist.gov/projects/risk-management/scor)
   - NIST overlay-sharing platform relevant when a baseline needs community-specific tailoring.

## Captured notes

- `SP 800-53` is the **catalog**; it is not, by itself, the low/moderate/high baseline membership list.
- `SP 800-53A` is the **assessment companion**; it should be treated separately from the control text.
- `SP 800-53B` is the **baseline/tailoring** publication and is the correct place to source low/moderate/high baseline membership.
- The `SP 800-53B` page points to:
  - a **Control Baselines spreadsheet**,
  - **SCOR** for overlays, and
  - **OSCAL** resources.
- The NIST publication material for `SP 800-53B` notes that **Release 5.2.0 made no baseline changes**.

## Implementation notes

- Model the control catalog and baseline membership as separate layers:
  - **catalog layer:** `SP 800-53`
  - **assessment layer:** `SP 800-53A`
  - **baseline layer:** `SP 800-53B`
- Preserve NIST publication metadata such as DOI, update level, publication page URL, and PDF URL.
- When multiple machine-readable helper files exist, prefer the publication page and the NIST PDF when any discrepancy appears.
- If future ingestion needs overlays, start from `SP 800-53B` + `SCOR` rather than inventing baseline variants from the catalog.

## Known gaps

- No significant gaps for the core `SP 800-53` / `53A` / `53B` packet.
- NSS-specific tailoring is tracked separately in `../nist-800-53-r5-nss/README.md`.
