import { ReviewResult, GateResult, GateVerdict, Severity, IssueCategory } from "./types";

function escHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function severityColor(severity: Severity): string {
  const map: Record<Severity, string> = {
    [Severity.CRITICAL]: "#dc2626",
    [Severity.HIGH]: "#ea580c",
    [Severity.MEDIUM]: "#ca8a04",
    [Severity.LOW]: "#16a34a",
  };
  return map[severity];
}

function verdictStyle(verdict: GateVerdict): { bg: string; text: string; border: string } {
  if (verdict === GateVerdict.BLOCK) return { bg: "#fef2f2", text: "#dc2626", border: "#dc2626" };
  if (verdict === GateVerdict.PASS_WITH_REVIEW) return { bg: "#fff7ed", text: "#ea580c", border: "#ea580c" };
  return { bg: "#f0fdf4", text: "#16a34a", border: "#16a34a" };
}

function categoryBadgeColor(category: IssueCategory): string {
  const map: Record<IssueCategory, string> = {
    [IssueCategory.SECURITY]: "#7c3aed",
    [IssueCategory.CORRECTNESS]: "#1d4ed8",
    [IssueCategory.CODE_SMELL]: "#0f766e",
    [IssueCategory.MAINTAINABILITY]: "#0369a1",
    [IssueCategory.MISSING_TESTS]: "#b45309",
    [IssueCategory.DEPENDENCY]: "#be185d",
  };
  return map[category];
}

export function generateReport(result: ReviewResult, gate: GateResult): string {
  const vs = verdictStyle(gate.verdict);
  const totalIssues = result.issues.length;

  const categories = [...new Set(result.issues.map((i) => i.category))];
  const severities = [...new Set(result.issues.map((i) => i.severity))];

  const totalBar = gate.criticalCount + gate.highCount + gate.mediumCount + gate.lowCount;

  function barSegment(count: number, color: string, label: string): string {
    if (count === 0 || totalBar === 0) return "";
    const pct = (count / totalBar) * 100;
    return `<div class="bar-seg" style="width:${pct.toFixed(1)}%;background:${color}" title="${label}: ${count}"></div>`;
  }

  const issueRows = result.issues
    .map((issue, idx) => {
      const sc = severityColor(issue.severity);
      const cc = categoryBadgeColor(issue.category);
      const fileLine =
        issue.file
          ? `<span class="file-loc">${escHtml(issue.file)}${issue.line ? `:${issue.line}` : ""}</span>`
          : "";
      const suggestion = issue.suggestion
        ? `<div class="suggestion"><strong>Suggestion:</strong> ${escHtml(issue.suggestion)}</div>`
        : "";
      return `
    <tr class="issue-row" data-severity="${escHtml(issue.severity)}" data-category="${escHtml(issue.category)}">
      <td><span class="badge" style="background:${sc}">${escHtml(issue.severity)}</span></td>
      <td><span class="badge" style="background:${cc}">${escHtml(issue.category)}</span></td>
      <td class="title-cell">
        <button class="expand-btn" data-idx="${idx}" aria-expanded="false">&#9654;</button>
        <span class="issue-title">${escHtml(issue.title)}</span>
        ${fileLine}
        <div class="issue-detail" id="detail-${idx}" hidden>
          <p>${escHtml(issue.description)}</p>
          ${suggestion}
        </div>
      </td>
    </tr>`;
    })
    .join("");

  const catFilterBtns = categories
    .map(
      (c) =>
        `<button class="filter-btn cat-btn" data-cat="${escHtml(c)}">${escHtml(c)}</button>`
    )
    .join("");

  const sevFilterBtns = (["Critical", "High", "Medium", "Low"] as const)
    .filter((s) => severities.includes(s as Severity))
    .map(
      (s) =>
        `<button class="filter-btn sev-btn" data-sev="${s}" style="--accent:${severityColor(s as Severity)}">${s}</button>`
    )
    .join("");

  const formattedDate = new Date(result.reviewedAt).toLocaleString();

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AI Code Review Report</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5;color:#1a1a1a;font-size:14px;line-height:1.5}
  a{color:inherit}
  .container{max-width:1100px;margin:0 auto;padding:24px 16px}
  header{background:#fff;border-radius:12px;padding:28px 32px;margin-bottom:20px;box-shadow:0 1px 4px rgba(0,0,0,.08)}
  h1{font-size:22px;font-weight:700;margin-bottom:12px}
  .meta-row{display:flex;flex-wrap:wrap;gap:16px;font-size:13px;color:#555;margin-bottom:20px}
  .meta-item{display:flex;align-items:center;gap:4px}
  .verdict-badge{display:inline-block;padding:10px 28px;border-radius:8px;font-size:18px;font-weight:800;border:2px solid ${vs.border};background:${vs.bg};color:${vs.text};letter-spacing:.5px}
  .verdict-row{display:flex;align-items:center;gap:16px}
  .verdict-label{font-size:13px;color:#666}
  .gate-reason{font-size:13px;color:#555;margin-top:6px}
  .card{background:#fff;border-radius:10px;padding:20px 24px;margin-bottom:16px;box-shadow:0 1px 3px rgba(0,0,0,.07)}
  .card-title{font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:#888;margin-bottom:10px}
  .summary-text{font-size:14px;color:#333;line-height:1.7}
  .bar-container{height:28px;border-radius:6px;overflow:hidden;display:flex;background:#e5e7eb;margin-top:8px}
  .bar-seg{height:100%;transition:width .3s}
  .bar-legend{display:flex;flex-wrap:wrap;gap:12px;margin-top:10px;font-size:12px}
  .legend-item{display:flex;align-items:center;gap:5px}
  .legend-dot{width:10px;height:10px;border-radius:50%}
  .filters{margin-bottom:12px;display:flex;flex-wrap:wrap;gap:8px;align-items:center}
  .filter-label{font-size:12px;font-weight:600;color:#888;margin-right:4px}
  .filter-btn{padding:4px 12px;border-radius:20px;border:1px solid #d1d5db;background:#fff;cursor:pointer;font-size:12px;font-weight:500;color:#374151;transition:all .15s}
  .filter-btn:hover{background:#f3f4f6}
  .filter-btn.active{background:var(--accent,#374151);border-color:var(--accent,#374151);color:#fff}
  .filter-btn.active.cat-btn{background:#374151;border-color:#374151;color:#fff}
  .count-info{font-size:12px;color:#6b7280;margin-bottom:8px}
  table{width:100%;border-collapse:collapse}
  th{text-align:left;padding:10px 12px;font-size:12px;text-transform:uppercase;letter-spacing:.4px;color:#6b7280;border-bottom:2px solid #e5e7eb;background:#fafafa}
  td{padding:10px 12px;border-bottom:1px solid #f0f0f0;vertical-align:top}
  .issue-row:hover td{background:#fafafa}
  .issue-row.hidden{display:none}
  .badge{display:inline-block;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:600;color:#fff;white-space:nowrap}
  .title-cell{min-width:300px}
  .expand-btn{background:none;border:none;cursor:pointer;font-size:10px;color:#9ca3af;padding:0 4px 0 0;transition:transform .2s;vertical-align:middle}
  .expand-btn[aria-expanded="true"]{transform:rotate(90deg)}
  .issue-title{font-weight:500;font-size:13px}
  .file-loc{display:block;font-size:11px;color:#6b7280;margin-top:2px;font-family:monospace}
  .issue-detail{margin-top:10px;padding:12px;background:#f9fafb;border-radius:6px;border-left:3px solid #d1d5db;font-size:13px;color:#374151}
  .issue-detail p{margin-bottom:8px}
  .suggestion{font-size:12px;color:#374151;background:#fffbeb;padding:8px 10px;border-radius:4px;border-left:3px solid #fbbf24}
  footer{text-align:center;font-size:12px;color:#9ca3af;margin-top:28px;padding:16px}
  @media(max-width:700px){.meta-row{gap:10px}.verdict-badge{font-size:14px;padding:8px 18px}td,th{padding:8px}}
</style>
</head>
<body>
<div class="container">
  <header>
    <h1>AI Code Review Report</h1>
    <div class="meta-row">
      <span class="meta-item">&#128196; <strong>${result.diffStats.filesChanged}</strong>&nbsp;file(s) changed</span>
      <span class="meta-item" style="color:#16a34a">+${result.diffStats.linesAdded} added</span>
      <span class="meta-item" style="color:#dc2626">-${result.diffStats.linesRemoved} removed</span>
      <span class="meta-item">&#128336; ${escHtml(formattedDate)}</span>
      <span class="meta-item">&#129302; ${escHtml(result.model)}</span>
    </div>
    <div class="verdict-row">
      <div>
        <div class="verdict-label">Gate Verdict</div>
        <div class="verdict-badge">${escHtml(gate.verdict)}</div>
        <div class="gate-reason">${escHtml(gate.reason)}</div>
      </div>
    </div>
  </header>

  <div class="card">
    <div class="card-title">Summary</div>
    <div class="summary-text">${escHtml(result.summary)}</div>
  </div>

  <div class="card">
    <div class="card-title">Severity Breakdown</div>
    <div class="bar-container">
      ${barSegment(gate.criticalCount, "#dc2626", "Critical")}
      ${barSegment(gate.highCount, "#ea580c", "High")}
      ${barSegment(gate.mediumCount, "#ca8a04", "Medium")}
      ${barSegment(gate.lowCount, "#16a34a", "Low")}
    </div>
    <div class="bar-legend">
      <span class="legend-item"><span class="legend-dot" style="background:#dc2626"></span>Critical: ${gate.criticalCount}</span>
      <span class="legend-item"><span class="legend-dot" style="background:#ea580c"></span>High: ${gate.highCount}</span>
      <span class="legend-item"><span class="legend-dot" style="background:#ca8a04"></span>Medium: ${gate.mediumCount}</span>
      <span class="legend-item"><span class="legend-dot" style="background:#16a34a"></span>Low: ${gate.lowCount}</span>
    </div>
  </div>

  <div class="card">
    <div class="card-title">Issues</div>
    <div class="filters">
      <span class="filter-label">Severity:</span>
      <button class="filter-btn sev-btn active" data-sev="All" style="--accent:#374151">All</button>
      ${sevFilterBtns}
    </div>
    ${categories.length > 0 ? `<div class="filters">
      <span class="filter-label">Category:</span>
      <button class="filter-btn cat-btn active" data-cat="All">All</button>
      ${catFilterBtns}
    </div>` : ""}
    <div class="count-info" id="count-info">Showing <span id="visible-count">${totalIssues}</span> of ${totalIssues} issue(s)</div>
    <table>
      <thead>
        <tr>
          <th>Severity</th>
          <th>Category</th>
          <th>Issue</th>
        </tr>
      </thead>
      <tbody id="issues-tbody">
        ${issueRows}
      </tbody>
    </table>
    ${totalIssues === 0 ? '<p style="text-align:center;color:#6b7280;padding:24px">No issues found.</p>' : ""}
  </div>

  <footer>Powered by ${escHtml(result.model)} via AI Code Review CLI &mdash; ${escHtml(formattedDate)}</footer>
</div>
<script>
(function(){
  var activeSev = 'All';
  var activeCat = 'All';

  function applyFilters(){
    var rows = document.querySelectorAll('.issue-row');
    var visible = 0;
    rows.forEach(function(row){
      var sev = row.getAttribute('data-severity');
      var cat = row.getAttribute('data-category');
      var show = (activeSev === 'All' || sev === activeSev) && (activeCat === 'All' || cat === activeCat);
      row.classList.toggle('hidden', !show);
      if(show) visible++;
    });
    document.getElementById('visible-count').textContent = visible;
  }

  document.querySelectorAll('.sev-btn').forEach(function(btn){
    btn.addEventListener('click', function(){
      document.querySelectorAll('.sev-btn').forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      activeSev = btn.getAttribute('data-sev');
      applyFilters();
    });
  });

  document.querySelectorAll('.cat-btn').forEach(function(btn){
    btn.addEventListener('click', function(){
      document.querySelectorAll('.cat-btn').forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      activeCat = btn.getAttribute('data-cat');
      applyFilters();
    });
  });

  document.querySelectorAll('.expand-btn').forEach(function(btn){
    btn.addEventListener('click', function(){
      var idx = btn.getAttribute('data-idx');
      var detail = document.getElementById('detail-' + idx);
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      detail.hidden = expanded;
    });
  });
})();
</script>
</body>
</html>`;
}
