#!/usr/bin/env python3
"""Report rendering — Markdown for the repo, self-contained HTML for the team.

The HTML report styles itself from PRIZM's own generated C3-dark palette, read
out of the checkout at render time rather than hardcoded here. Same principle as
everything else in this tool: derive, don't duplicate."""
import html, os, re
from common import read

FALLBACK = {"bg": "#01030c", "surface": "#0f172b", "surface-elevated": "#1d293d",
            "border": "#314158", "fg": "#fbfcfd", "fg-muted": "#cad5e2",
            "fg-subtle": "#90a1b9", "accent": "#00d3f2", "danger": "#e7000b",
            "success": "#00c950", "warning": "#fe9a00", "info": "#00a6f4"}
SEV_COLOR = {"error": "danger", "warn": "warning", "info": "info"}


def palette(prizm_path):
    css = read(os.path.join(prizm_path, "javafx", "src", "main", "resources",
                            "prizm", "themes", "c3-dark.css"))
    p = dict(FALLBACK)
    for name, val in re.findall(r"-color-([a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{6})", css):
        p[name] = val
    return p


def bar(pct, color):
    w = 0 if pct is None else max(0, min(100, pct))
    return (f'<div class="track"><div class="fill" style="width:{w}%;background:{color}"></div></div>')


def render_html(ctx):
    p = palette(ctx["ground_truth"]["prizm"]["path"])
    s, axes = ctx["score"], ctx["score"]["axes"]
    ov = s["overall"]
    ov_color = p["success"] if (ov or 0) >= 75 else p["warning"] if (ov or 0) >= 50 else p["danger"]

    axis_rows = []
    for key, a in axes.items():
        if a["score"] is None:
            axis_rows.append(
                f'<tr><td><b>{key}</b> {html.escape(a["name"])}</td>'
                f'<td class="muted" colspan="2">{html.escape(a["status"])}</td>'
                f'<td class="muted">{int(a["weight"]*100)}%</td></tr>')
        else:
            c = p["success"] if a["score"] >= 75 else p["warning"] if a["score"] >= 50 else p["danger"]
            axis_rows.append(
                f'<tr><td><b>{key}</b> {html.escape(a["name"])}</td>'
                f'<td class="num" style="color:{c}">{a["score"]}%</td>'
                f'<td>{bar(a["score"], c)}</td>'
                f'<td class="muted">{a["findings"]} findings / {a["opportunities"]} sites</td></tr>')

    fix_rows = []
    for i, g in enumerate(ctx["top_fixes"], 1):
        fix_rows.append(f'''<div class="fix">
<div class="fixhead"><span class="n">{i}</span>
<span class="pill {g['severity']}">{g['severity']}</span>
<code>{g['rule']}</code>
<span class="count">{g['count']}× across {len(g['files'])} file(s)</span></div>
<div class="fixmsg">{html.escape(g['example']['message'])}</div>
<div class="fixsug">{html.escape(g['suggestion'])}</div></div>''')

    finding_rows = []
    cap = ctx.get("max_findings", 300)
    for f in ctx["findings"][:cap]:
        finding_rows.append(
            f'<tr><td><span class="pill {f["severity"]}">{f["severity"]}</span></td>'
            f'<td class="rulecol"><code>{f["rule"]}</code></td>'
            f'<td class="mono">{html.escape(f["file"])}{":" + str(f["line"]) if f["line"] else ""}</td>'
            f'<td class="finding">{html.escape(f["message"])}'
            + (f'<div class="snip">{html.escape(f["snippet"])}</div>' if f["snippet"] else "")
            + f'</td><td class="muted">{f["kind"]}</td></tr>')

    hidden = max(0, len(ctx["findings"]) - cap)
    trunc_note = (f'<p class="muted">Showing the {cap} highest-severity of '
                  f'{len(ctx["findings"])} findings. The Top fixes list above is complete — '
                  f'it groups every finding by rule, which is the list worth working through.</p>'
                  if hidden else "")

    mod_rows = []
    for m in ctx.get("modules", []):
        c = (p["success"] if (m["score"] or 0) >= 75 else
             p["warning"] if (m["score"] or 0) >= 50 else p["danger"])
        mod_rows.append(
            f'<tr><td class="mono">{html.escape(m["module"])}</td>'
            f'<td class="num" style="color:{c}">{m["score"]}%</td>'
            f'<td>{bar(m["score"], c)}</td>'
            f'<td class="muted">{m["band"]}</td>'
            f'<td class="muted">{m["findings"]} findings / {m["opportunities"]} sites</td></tr>')
    modules_html = ""
    real_mods = [m for m in ctx.get("modules", []) if not m["module"].startswith("(")]
    if len(real_mods) >= 3:
        extra = (f'<p class="muted">Worst {len(mod_rows)} shown; '
                 f'{ctx["modules_truncated"]} more module(s) scored above these.</p>'
                 if ctx.get("modules_truncated") else "")
        modules_html = (f'<h2>By module — worst first</h2><div class="card"><table>'
                        f'<tr><th>Module</th><th>Score</th><th></th><th>Band</th><th>Detail</th></tr>'
                        f'{"".join(mod_rows)}</table>{extra}'
                        f'<p class="muted">Modules with fewer than 20 styling/component sites are '
                        f'folded together — a score off 3 sites is noise.</p></div>')

    caution_html = (f'<div class="warnbox" style="margin:0 0 16px">'
                    f'<b>Low confidence.</b> {html.escape(s["caution"])}</div>'
                    if s.get("caution") else "")

    # Upstream findings are deliberately NOT rendered here. The shared report goes to
    # the product team; findings about PRIZM's own code go to the maintainers only,
    # in a separate file written by run_all.py.
    if False:
        up, rows = [], "".join(
            f'<tr><td class="rulecol"><span class="pill {g["severity"]}">{g["severity"]}</span> '
            f'<code>{g["rule"]}</code></td>'
            f'<td class="mono">{html.escape(g["file"])}</td>'
            f'<td class="muted">{g["count"]}×<br>line{"s" if g["count"] > 1 else ""} '
            f'{", ".join(str(l) for l in g["lines"])}{"…" if g["count"] > len(g["lines"]) else ""}</td>'
            f'<td class="finding">{html.escape(g["message"])}'
            f'<div class="snip">{html.escape(g["snippet"])}</div></td></tr>'
            for g in up)
        upstream_html = f'''<h2>Findings about PRIZM, not this product</h2>
<div class="upstream">
<p><b>{ctx["upstream_total"]} finding(s) sit in PRIZM's own component source, copied into this
product unchanged.</b> The team here cannot fix them and is <b>not</b> scored on them — none of
these affect the score above. They are listed because an audit of a product is also, incidentally,
an audit of the design system, and this is the cheapest place to notice a gap upstream.</p>
<table><tr><th>Rule</th><th>PRIZM file</th><th>Where</th><th>Finding</th></tr>{rows}</table>
<p class="muted">Worth raising with the PRIZM maintainers. A pattern that shows up in several
product audits is a system-level gap, not a one-off.</p>
</div>'''
    mode = ctx.get("mode", "full repo")
    modenote = ("Incremental run. Compare only against other incremental runs — an "
                "incremental score answers \u201cis new work on-system\u201d, not \u201cis the "
                "product on-system\u201d."
                if mode.startswith("changed") else
                "Full-repo baseline. This is the debt number; it moves slowly.")

    na = [f'{k} {a["name"]}' for k, a in axes.items() if a["score"] is None]
    cov = ctx["coverage"]

    return f'''<!DOCTYPE html><html lang="en" data-zone="c3" data-mode="dark"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>PRIZM alignment — {html.escape(ctx["product"])}</title><style>
*{{box-sizing:border-box}}
body{{margin:0;background:{p['bg']};color:{p['fg']};
font-family:Inter,ui-sans-serif,system-ui,sans-serif;font-size:14px;line-height:1.55}}
.wrap{{max-width:1080px;margin:0 auto;padding:40px 24px 80px}}
h1{{font-size:26px;margin:0 0 4px;letter-spacing:-0.01em}}
h2{{font-size:15px;text-transform:uppercase;letter-spacing:.08em;color:{p['fg-subtle']};
margin:40px 0 12px;font-weight:600}}
.sub{{color:{p['fg-muted']};margin:0 0 28px}}
.card{{background:{p['surface']};border:1px solid {p['border']};border-radius:.5rem;padding:20px}}
.hero{{display:flex;gap:28px;align-items:center}}
.big{{font-size:56px;font-weight:600;line-height:1;color:{ov_color}}}
.band{{font-size:15px;color:{p['fg-muted']};margin-top:6px}}
table{{width:100%;border-collapse:collapse}}
td,th{{text-align:left;padding:9px 10px;border-bottom:1px solid {p['border']};vertical-align:top}}
th{{color:{p['fg-subtle']};font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:.06em}}
.num{{font-weight:600;white-space:nowrap}}
.muted{{color:{p['fg-subtle']};font-size:12.5px}}
.mono{{font-family:"JetBrains Mono",ui-monospace,monospace;font-size:12px;color:{p['fg-muted']};word-break:break-all}}
.track{{background:{p['bg']};border-radius:.125rem;height:7px;width:180px;overflow:hidden}}
.fill{{height:100%;border-radius:.125rem}}
code{{font-family:"JetBrains Mono",ui-monospace,monospace;font-size:11.5px;
background:{p['bg']};border:1px solid {p['border']};border-radius:.125rem;padding:1px 5px;
color:{p['fg-muted']};white-space:nowrap}}
.pill{{font-size:10.5px;text-transform:uppercase;letter-spacing:.05em;padding:2px 7px;
border-radius:.125rem;font-weight:600}}
.pill.error{{background:{p['danger']};color:#fff}}
.pill.warn{{background:{p['warning']};color:{p['bg']}}}
.pill.info{{background:{p['info']};color:{p['bg']}}}
.fix{{background:{p['surface']};border:1px solid {p['border']};border-left:2px solid {p['accent']};
border-radius:.375rem;padding:14px 16px;margin-bottom:10px}}
.fixhead{{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:6px}}
.n{{background:{p['accent']};color:{p['bg']};width:20px;height:20px;border-radius:.125rem;
display:grid;place-items:center;font-weight:700;font-size:12px}}
.count{{color:{p['fg-subtle']};font-size:12px;margin-left:auto}}
.fixmsg{{margin-bottom:5px}}
.fixsug{{color:{p['fg-muted']};font-size:13px}}
.snip{{font-family:"JetBrains Mono",ui-monospace,monospace;font-size:11px;color:{p['fg-subtle']};
margin-top:5px;white-space:normal;word-break:break-word}}
td.rulecol{{white-space:nowrap;width:1%}}
td.finding{{min-width:340px}}
.meta{{display:flex;gap:26px;flex-wrap:wrap;color:{p['fg-subtle']};font-size:12.5px}}
.warnbox{{border:1px solid {p['warning']};border-radius:.375rem;padding:14px 16px;
background:{p['surface']};margin-top:12px}}
</style></head><body><div class="wrap">
<h1>PRIZM alignment report</h1>
<p class="sub">{html.escape(ctx["product"])} · {ctx["date"]}</p>

{caution_html}
<div class="card hero">
  <div><div class="big">{ov if ov is not None else "n/a"}%</div>
  <div class="band">{s["band"]}</div></div>
  <div style="flex:1">
    <div class="meta">
      <div><b>PRIZM</b><br>{ctx["ground_truth"]["prizm"]["version"]} @ {ctx["ground_truth"]["prizm"]["sha"][:8]}</div>
      <div><b>Access tier</b><br>{ctx["tier"]}</div>
      <div><b>Files scanned</b><br>{cov["files_scanned"]}</div>
      <div><b>Checker</b><br>v{ctx["checker_version"]}</div>
    </div>
  </div>
</div>

<h2>Scope</h2>
<div class="card"><b>{html.escape(mode)}</b><div class="muted">{html.escape(modenote)}</div></div>

<h2>Axis breakdown</h2>
<div class="card"><table>
<tr><th>Axis</th><th>Score</th><th></th><th>Detail</th></tr>
{"".join(axis_rows)}
</table></div>

{modules_html}
<h2>Top fixes</h2>
{"".join(fix_rows) or '<div class="card muted">No findings.</div>'}

<h2>All findings ({len(ctx["findings"])})</h2>
<div class="card"><table>
<tr><th></th><th>Rule</th><th>Location</th><th>Finding</th><th>Kind</th></tr>
{"".join(finding_rows)}
</table>
{trunc_note}</div>

<h2>Not assessed</h2>
<div class="warnbox">
<b>This tier could not evaluate:</b> {html.escape(", ".join(na)) or "nothing"}.<br>
<span class="muted">{html.escape(ctx["not_assessed_note"])}</span>
</div>

<h2>Checker coverage</h2>
<div class="card muted">{html.escape(ctx["coverage_line"])}</div>
</div></body></html>'''


def render_markdown(ctx):
    s, axes = ctx["score"], ctx["score"]["axes"]
    L = [f'# PRIZM alignment report — {ctx["product"]}', "",
         f'**Overall:** {s["overall"]}% · {s["band"]}'
         + ("  \n> **Low confidence.** " + s["caution"] if s.get("caution") else "") + "  ",
         f'**PRIZM:** {ctx["ground_truth"]["prizm"]["version"]} @ '
         f'{ctx["ground_truth"]["prizm"]["sha"][:8]} · **Checker:** v{ctx["checker_version"]} · '
         f'**Tier:** {ctx["tier"]} · **Scope:** {ctx.get("mode", "full repo")} · '
         f'**Date:** {ctx["date"]}', "",
         "## Axis breakdown", "", "| Axis | Score | Weight | Detail |", "|---|---|---|---|"]
    for k, a in axes.items():
        if a["score"] is None:
            L.append(f'| {k} {a["name"]} | — | {int(a["weight"]*100)}% | {a["status"]} |')
        else:
            L.append(f'| {k} {a["name"]} | **{a["score"]}%** | {int(a["weight"]*100)}% | '
                     f'{a["findings"]} findings across {a["opportunities"]} sites |')
    mods = ctx.get("modules", [])
    if len([m for m in mods if not m["module"].startswith("(")]) >= 3:
        L += ["", "## By module — worst first", "",
              "| Module | Score | Band | Findings / sites |", "|---|---|---|---|"]
        for m in mods:
            L.append(f'| `{m["module"]}` | **{m["score"]}%** | {m["band"]} | '
                     f'{m["findings"]} / {m["opportunities"]} |')
        if ctx.get("modules_truncated"):
            L.append(f'')
            L.append(f'_{ctx["modules_truncated"]} further module(s) scored above these._')
    L += ["", "## Top fixes", ""]
    for i, g in enumerate(ctx["top_fixes"], 1):
        L.append(f'{i}. **{g["rule"]}** ({g["severity"]}, {g["count"]}× in '
                 f'{len(g["files"])} file(s)) — {g["example"]["message"]}')
        L.append(f'   - *Fix:* {g["suggestion"]}')
    cap = ctx.get("max_findings", 300)
    L += ["", f'## Findings ({min(cap, len(ctx["findings"]))} of {len(ctx["findings"])})', "",
          "| Rule | Sev | Location | Finding |", "|---|---|---|---|"]
    for f in ctx["findings"][:cap]:
        loc = f'{f["file"]}:{f["line"]}' if f["line"] else f["file"]
        L.append(f'| `{f["rule"]}` | {f["severity"]} | `{loc}` | {f["message"]} |')
    if len(ctx["findings"]) > cap:
        L += ["", f'_{len(ctx["findings"]) - cap} further findings omitted. The Top fixes list '
                  f'groups every finding by rule and is complete._']
    caution_html = (f'<div class="warnbox" style="margin:0 0 16px">'
                    f'<b>Low confidence.</b> {html.escape(s["caution"])}</div>'
                    if s.get("caution") else "")

    L += ["", "## Not assessed", "",
          "This tier could not evaluate: " +
          (", ".join(f'{k} {a["name"]}' for k, a in axes.items() if a["score"] is None) or "nothing") + ".",
          "", ctx["not_assessed_note"], "", "## Checker coverage", "", ctx["coverage_line"], ""]
    return "\n".join(L)
