import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewIssue, Severity, IssueCategory } from '../../models/review.models';

@Component({
  selector: 'app-issues-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sap-card-title"><i class="bi bi-list-check"></i> Issues Found</div>

    <!-- Filters -->
    <div class="filters-row mb-2">
      <span class="filter-group-label">Severity:</span>
      <button *ngFor="let s of severityOptions" class="filter-chip"
              [class.active]="activeSev === s" (click)="activeSev = s">
        <span *ngIf="s !== 'All'" class="dot" [style.background]="severityColor(s)"></span>
        {{ s }}
        <span *ngIf="s !== 'All'" class="chip-count">{{ countBySev(s) }}</span>
      </button>
    </div>
    <div class="filters-row mb-3" *ngIf="catOptions.length > 1">
      <span class="filter-group-label">Category:</span>
      <button *ngFor="let c of catOptions" class="filter-chip"
              [class.active]="activeCat === c" (click)="activeCat = c">
        <i *ngIf="c !== 'All'" [class]="'bi ' + catIcon(c)" style="font-size:11px"></i>
        {{ c }}
      </button>
    </div>

    <div class="showing-info">Showing <strong>{{ visible }}</strong> of {{ issues.length }} issue(s)</div>

    <div *ngIf="issues.length === 0" class="empty-state">
      <i class="bi bi-patch-check-fill"></i>
      <p>No issues found — diff looks clean!</p>
    </div>

    <div class="issues-list" *ngIf="issues.length > 0">
      <div *ngFor="let issue of issues; let i = index"
           class="issue-item"
           [class.hidden]="!isVisible(issue)"
           [attr.data-sev]="issue.severity">
        <div class="issue-header" (click)="toggle(i)">
          <div class="issue-left">
            <span class="sev-badge" [style.background]="severityColor(issue.severity)">
              <i [class]="'bi ' + sevIcon(issue.severity)"></i> {{ issue.severity }}
            </span>
            <span class="cat-badge" [style.background]="categoryColor(issue.category)">
              <i [class]="'bi ' + catIcon(issue.category)"></i> {{ issue.category }}
            </span>
          </div>
          <div class="issue-middle">
            <span class="issue-title">{{ issue.title }}</span>
            <span *ngIf="issue.file" class="file-loc">
              <i class="bi bi-file-code"></i> {{ issue.file }}{{ issue.line ? ':' + issue.line : '' }}
            </span>
          </div>
          <button class="expand-btn" [class.expanded]="expanded[i]">
            <i class="bi bi-chevron-down"></i>
          </button>
        </div>
        <div class="issue-body" *ngIf="expanded[i]">
          <p class="issue-desc">{{ issue.description }}</p>
          <div *ngIf="issue.suggestion" class="suggestion-box">
            <div class="suggestion-label"><i class="bi bi-lightbulb-fill"></i> Suggestion</div>
            {{ issue.suggestion }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .filters-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 12px; }
    .filter-group-label { font-size: 11px; font-weight: 700; color: #556070; text-transform: uppercase; letter-spacing: .5px; margin-right: 4px; min-width: 62px; }
    .dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .chip-count {
      background: rgba(255,255,255,.3); border-radius: 10px;
      padding: 0 5px; font-size: 10px; min-width: 18px; text-align: center;
    }
    .filter-chip.active .chip-count { background: rgba(255,255,255,.25); }
    .showing-info { font-size: 12px; color: #556070; margin-bottom: 16px; }

    .empty-state {
      text-align: center; padding: 64px; color: #107e3e;
      display: flex; flex-direction: column; align-items: center; gap: 12px;
      i { font-size: 52px; }
      p { font-size: 15px; font-weight: 600; }
    }

    .issues-list { display: flex; flex-direction: column; gap: 14px; }

    .issue-item {
      border: 1.5px solid #e2e8f0;
      border-radius: 18px;
      overflow: hidden;
      transition: border-color .2s, box-shadow .2s;
      background: #fff;
    }
    .issue-item:hover { border-color: #0070f2; box-shadow: 0 4px 16px rgba(0,112,242,.1); }
    .issue-item.hidden { display: none; }
    .issue-item[data-sev="Critical"] { border-left: 5px solid #bb0000; }
    .issue-item[data-sev="High"]     { border-left: 5px solid #e76500; }
    .issue-item[data-sev="Medium"]   { border-left: 5px solid #ca8a04; }
    .issue-item[data-sev="Low"]      { border-left: 5px solid #107e3e; }

    .issue-header {
      display: flex; align-items: center; gap: 14px;
      padding: 18px 20px;
      cursor: pointer; background: #fff; transition: background .15s;
    }
    .issue-header:hover { background: #f8fafc; }
    .issue-left  { display: flex; gap: 8px; flex-shrink: 0; }
    .issue-middle { flex: 1; min-width: 0; }
    .issue-title { display: block; font-size: 14px; font-weight: 600; color: #1a1a2e; margin-bottom: 4px; }
    .file-loc { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; color: #0070f2; font-family: monospace; }

    .expand-btn {
      background: none; border: none; cursor: pointer; color: #9ba8b5;
      padding: 6px; border-radius: 6px; transition: all .2s; flex-shrink: 0;
      i { transition: transform .2s; }
    }
    .expand-btn.expanded i { transform: rotate(180deg); }
    .expand-btn:hover { background: #f0f4f9; color: #0070f2; }

    .issue-body {
      padding: 20px 24px;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
    }
    .issue-desc { font-size: 13px; color: #374151; line-height: 1.8; margin-bottom: 14px; }
    .suggestion-box {
      background: #fffbeb; border: 1px solid #fde68a; border-radius: 14px;
      padding: 14px 16px; font-size: 13px; color: #92400e; line-height: 1.7;
    }
    .suggestion-label { font-weight: 700; display: flex; align-items: center; gap: 5px; margin-bottom: 6px; color: #b45309; font-size: 12px; }
  `]
})
export class IssuesTableComponent implements OnInit {
  @Input({ required: true }) issues: ReviewIssue[] = [];
  activeSev: Severity | 'All' = 'All';
  activeCat: IssueCategory | 'All' = 'All';
  expanded: boolean[] = [];
  severityOptions: (Severity | 'All')[] = ['All', 'Critical', 'High', 'Medium', 'Low'];
  catOptions: (IssueCategory | 'All')[] = [];

  ngOnInit() {
    this.expanded = this.issues.map(() => false);
    const cats = [...new Set(this.issues.map(i => i.category))];
    this.catOptions = cats.length ? ['All', ...cats] : [];
  }

  toggle(i: number) { this.expanded[i] = !this.expanded[i]; }

  isVisible(issue: ReviewIssue) {
    return (this.activeSev === 'All' || issue.severity === this.activeSev) &&
           (this.activeCat === 'All' || issue.category === this.activeCat);
  }

  get visible() { return this.issues.filter(i => this.isVisible(i)).length; }

  countBySev(s: Severity | 'All') {
    return s === 'All' ? this.issues.length : this.issues.filter(i => i.severity === s).length;
  }

  severityColor(s: Severity | 'All'): string {
    const m: Record<string,string> = { Critical:'#bb0000', High:'#e76500', Medium:'#ca8a04', Low:'#107e3e', All:'#556070' };
    return m[s] ?? '#556070';
  }

  categoryColor(c: IssueCategory): string {
    const m: Record<string,string> = {
      Security:'#7c3aed', Correctness:'#0070f2', 'Code Smell':'#0f828f',
      Maintainability:'#0854a0', 'Missing Tests':'#b45309', Dependency:'#be185d'
    };
    return m[c] ?? '#556070';
  }

  sevIcon(s: Severity | 'All'): string {
    const m: Record<string,string> = { Critical:'bi-x-octagon-fill', High:'bi-exclamation-triangle-fill', Medium:'bi-exclamation-circle-fill', Low:'bi-info-circle-fill', All:'' };
    return m[s] ?? '';
  }

  catIcon(c: IssueCategory | 'All'): string {
    const m: Record<string,string> = {
      Security:'bi-shield-exclamation', Correctness:'bi-bug', 'Code Smell':'bi-recycle',
      Maintainability:'bi-tools', 'Missing Tests':'bi-clipboard-x', Dependency:'bi-box-seam', All:''
    };
    return m[c] ?? '';
  }
}
