# CMMC Level 3 reference packet

## Official scope

- **Program owner:** U.S. Department of Defense (DoD CIO)
- **Level purpose:** provide enhanced protection for sensitive DoD CUI against advanced threats
- **Core rule structure:** current Level 2 requirements plus **24 selected requirements from NIST SP 800-172** with DoD-defined parameters
- **Assessment mode:** DIBCAC certification assessment

## Primary sources

1. [DoD CIO CMMC About page](https://dodcio.defense.gov/cmmc/About/)
   - High-level description of Level 3 and the 24 selected enhanced requirements.
2. [DoD CIO CMMC Resources & Documentation page](https://dodcio.defense.gov/cmmc/Resources-Documentation/)
   - Resource index for level guides and supporting NIST material.
3. [Federal Register: 32 CFR Part 170 final rule](https://www.federalregister.gov/documents/2024/10/15/2024-22905/cybersecurity-maturity-model-certification-cmmc-program)
   - Authoritative rule text, including the table of selected Level 3 requirements and DoD-defined ODPs.
4. [NIST SP 800-172](https://csrc.nist.gov/pubs/sp/800/172/final)
   - Enhanced security requirements supplementing SP 800-171 Rev. 2.
5. [NIST SP 800-172A](https://csrc.nist.gov/pubs/sp/800/172/a/final)
   - Assessment procedures for SP 800-172.
6. [NIST SP 800-171 Rev. 2](https://csrc.nist.gov/pubs/sp/800/171/r2/upd1/final)
   - Base requirement set that Level 3 builds on through prerequisite Level 2 status.

## Captured notes

- The current CMMC final rule defines **Level 3** as:
  - the Level 2 requirement set, plus
  - **24 selected requirements from NIST SP 800-172 Feb. 2021**.
- The Federal Register final rule makes **Final Level 2 (C3PAO)** a prerequisite for Level 3.
- The DoD rule, not generic NIST SP 800-172 alone, is the authoritative source for **which 24 requirements are selected** and **which ODP values apply**.
- The final rule states Level 3 certification assessments are performed by **DCMA DIBCAC**.
- The NIST `SP 800-172` page provides helper spreadsheets/CSV files but explicitly says the **PDF is the authoritative source** if formats differ.
- `SP 800-172A` is the matching assessment companion.

## Implementation notes

- Model CMMC Level 3 as an **additive layer over current CMMC Level 2**, not as a direct implementation of all of `SP 800-172`.
- Source the selected-requirement list and DoD-defined ODPs from the **32 CFR Part 170 rule text**, then use `SP 800-172` / `SP 800-172A` for the underlying requirement and assessment context.
- Preserve the distinction between:
  - generic NIST enhanced requirements, and
  - the smaller DoD-selected subset used in CMMC Level 3.

## Known gaps

- Level-specific CMMC Level 3 guide PDFs were listed on the DoD CIO resources page but were not individually harvested in this session.
- If we later automate a Level 3 import, we should separately capture the rule table from `32 CFR Part 170` and not rely on NIST alone.
