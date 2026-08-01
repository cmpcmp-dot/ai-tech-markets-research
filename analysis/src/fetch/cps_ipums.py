"""
Download CPS Basic Monthly microdata (2005-2026) from IPUMS via the API.

Window and variable list match the Budget Lab at Yale's AI-Effects replication
(github.com/Budget-Lab-Yale/AI-Effects, pull_cps.R) so their SDID design can be
reproduced sample-identically, plus the extra variables our own extensions need
(IND/IND1990 for the occupation->industry exposure weights, TELWRKPAY/TELWRKHR
for the telework confounder test, CPSIDP for longitudinal linking).

Sample-id facts verified against the IPUMS API on 2026-07-28:
  - March is the only month with two ids. `cpsYYYY_03b` is the March Basic
    Monthly file; `cpsYYYY_03s` is that year's ASEC. Excluding `_03s` is
    therefore correct and drops no basic-monthly month.
  - The only suffixes in use across 2005-2026 are `b` and `s`.
  - October 2025 does not exist (funding lapse; collection never happened).
  - The collection currently runs through June 2026.

Requirements:  pip install ipumspy
Usage:         python analysis/src/fetch/cps_ipums.py             # key from ~/.Renviron IPUMS_API_KEY
               python analysis/src/fetch/cps_ipums.py --dry-run   # print samples, submit nothing
               python analysis/src/fetch/cps_ipums.py --out=DIR   # write somewhere else

Writes analysis/inputs/cps/{cps.dat.gz, cps.xml} (818 MB), located by walking up
to the directory holding R/paths.R rather than from the working directory, so it
behaves the same as every R script here. That directory is gitignored; see
analysis/INPUTS.md. Read by analysis/src/clean/cps_age_education.R.
"""

import argparse
import os
import re
import sys
from pathlib import Path

from ipumspy import IpumsApiClient, MicrodataExtract

START_YEAR = 2005
END_YEAR = 2026

# Months with no basic monthly sample, and why. Asserted, not assumed.
KNOWN_MISSING = {(2025, 10): "government shutdown; October 2025 was never collected"}

SAMPLE_RE = re.compile(r"^cps(\d{4})_(\d{2})([bs])$")

VARIABLES = [
    # ── identifiers, weights, rotation group ────────────────────────────────
    "YEAR", "MONTH", "SERIAL", "PERNUM", "CPSID", "CPSIDP", "ASECFLAG",
    "WTFINL",   # basic monthly person weight
    "EARNWT",   # outgoing-rotation earner weight; the wage outcome needs it
    "MISH",     # month-in-sample; selects the MIS 4/8 earner study population
    # ── demographics ────────────────────────────────────────────────────────
    "AGE", "SEX", "RACE", "EDUC", "SCHLCOLL",
    # ── labor force ─────────────────────────────────────────────────────────
    "EMPSTAT", "LABFORCE", "WHYUNEMP", "DURUNEMP", "EMPSAME",
    "WKSTAT", "CLASSWKR",
    # ── occupation and industry ─────────────────────────────────────────────
    "OCC",        # contemporaneous census occupation code
    "OCC2010",    # harmonized; the unit of analysis and the exposure join key
    "IND",        # contemporaneous census industry code -> NAICS crosswalk
    "IND1990",    # harmonized industry, for anything time-varying
    # ── earnings and hours ──────────────────────────────────────────────────
    "EARNWEEK", "EARNWEEK2", "HOURWAGE", "HOURWAGE2", "UHRSWORK1", "PAIDHOUR",
    # ── telework (realized), Oct 2022+ ──────────────────────────────────────
    "TELWRKPAY", "TELWRKHR",
]


def analysis_root():
    """The analysis/ directory: walk up from this file to the one holding R/paths.R.

    Same rule as the four-line header every R script here uses, so a moved tree
    breaks in one place rather than in every script.
    """
    d = Path(__file__).resolve().parent
    while not (d / "R" / "paths.R").exists() and d.parent != d:
        d = d.parent
    if not (d / "R" / "paths.R").exists():
        sys.exit(f"Error: could not locate analysis/ starting from {Path(__file__).resolve()}")
    return d


def read_renviron(key):
    renviron = Path.home() / ".Renviron"
    if not renviron.exists():
        return None
    for line in renviron.read_text().splitlines():
        line = line.strip()
        if line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        if k.strip() == key:
            return v.strip().strip('"').strip("'")
    return None


def select_basic_monthly_samples(all_samples):
    """Basic Monthly sample ids in [START_YEAR, END_YEAR]; exclude the ASEC (_03s)."""
    selected = []
    for sample_id in sorted(all_samples):
        m = SAMPLE_RE.match(sample_id)
        if not m:
            continue
        year = int(m.group(1))
        if not (START_YEAR <= year <= END_YEAR):
            continue
        if sample_id.endswith("_03s"):  # ASEC, not the March basic monthly file
            continue
        selected.append(sample_id)
    return selected


def check_coverage(samples):
    """Exactly one sample per calendar month, except the documented gaps.

    Fails loudly. A silently missing month would show up much later as an
    unexplained hole in a seasonally adjusted quarterly panel.
    """
    seen = {}
    for s in samples:
        m = SAMPLE_RE.match(s)
        ym = (int(m.group(1)), int(m.group(2)))
        seen.setdefault(ym, []).append(s)

    dupes = {ym: ids for ym, ids in seen.items() if len(ids) > 1}
    if dupes:
        sys.exit(f"Error: more than one sample for {sorted(dupes)}: {dupes}")

    last_year, last_month = max(seen)
    expected = [
        (y, mo)
        for y in range(START_YEAR, last_year + 1)
        for mo in range(1, 13)
        if not (y == last_year and mo > last_month)
    ]
    missing = [ym for ym in expected if ym not in seen]

    unexplained = [ym for ym in missing if ym not in KNOWN_MISSING]
    if unexplained:
        sys.exit(
            "Error: unexplained gaps in the monthly sample list: "
            f"{unexplained}. Add them to KNOWN_MISSING with a reason, or fix the filter."
        )
    for ym in missing:
        print(f"  gap (known):  {ym[0]}-{ym[1]:02d}  {KNOWN_MISSING[ym]}")

    print(f"  coverage:     {START_YEAR}-01 through {last_year}-{last_month:02d}, "
          f"{len(samples)} samples, {len(missing)} known gap(s)")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true",
                    help="print the sample list and variables, submit nothing")
    ap.add_argument("--out", metavar="DIR", default=None,
                    help="write here instead of analysis/inputs/cps "
                         "(the --out=<dir> contract every fetch script honours)")
    args = ap.parse_args()

    api_key = os.environ.get("IPUMS_API_KEY", "").strip() or read_renviron("IPUMS_API_KEY") or ""
    if not api_key:
        sys.exit("Error: IPUMS_API_KEY not found in environment or ~/.Renviron")

    ipums = IpumsApiClient(api_key)
    out_dir = Path(args.out) if args.out else analysis_root() / "inputs" / "cps"
    out_dir.mkdir(parents=True, exist_ok=True)

    print("Fetching available CPS samples from IPUMS...")
    all_samples = ipums.get_all_sample_info("cps")
    samples = select_basic_monthly_samples(all_samples)
    if not samples:
        sys.exit("Error: no basic monthly samples matched the window.")
    print(f"  selected:     {len(samples)}  ({samples[0]} ... {samples[-1]})")
    check_coverage(samples)
    print(f"  variables:    {len(VARIABLES)}")

    if args.dry_run:
        print("\n--dry-run: nothing submitted.")
        return

    extract = MicrodataExtract(
        collection="cps",
        samples=samples,
        variables=VARIABLES,
        description=(
            f"CPS Basic Monthly {START_YEAR}-{END_YEAR}: Budget Lab AI-Effects "
            "replication + adoption/exposure extensions"
        ),
        data_format="fixed_width",
        data_structure={"rectangular": {"on": "P"}},
    )

    print("Submitting extract...")
    ipums.submit_extract(extract)
    print(f"  extract id:   {extract.extract_id}")
    print("  waiting for completion (this window is large; expect a long queue)...")
    ipums.wait_for_extract(extract)
    print("  complete. Downloading...")
    ipums.download_extract(extract, download_dir=out_dir)
    print(f"  downloaded to {out_dir.resolve()}")

    # Normalize filenames to cps.dat.gz / cps.xml for the R pipeline. Match on the
    # extract id rather than "newest file", so a stale download can't be renamed.
    dat = out_dir / f"cps_{int(extract.extract_id):05d}.dat.gz"
    xml = out_dir / f"cps_{int(extract.extract_id):05d}.xml"
    for src, dst in ((dat, out_dir / "cps.dat.gz"), (xml, out_dir / "cps.xml")):
        if src.exists():
            src.replace(dst)
            print(f"  -> {dst}")
        else:
            print(f"  WARNING: expected {src.name}, not found; leaving filenames as-is")
    print("Done.")


if __name__ == "__main__":
    main()
