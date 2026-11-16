import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewIssue, Severity, IssueCategory } from '../../models/review.models';

@Component({
  selector: 'app-issues-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <p class="card-title">Issues</p>

      <!-- Severity filters -->
      <div class="filters">
        <span class="filter-label">Severity:</span>
        <button *ngFor="let s of severityOptions"
                class="filter-btn"
                [class.active]="activeSeverity === s"
                [style.--accent]="severityColor(s)"
                (click)="activeSeverity = s">
          {{ s }}
        </button>
      </div>

      <!-- Category filters -->
      <div class="filters" *ngIf="categoryOptions.length">
        <span class="filter-label">Category:</span>
        <button *ngFor="let c of categoryOptions"
                class="filter-btn cat-btn"
                [class.active]="activeCategory === c"
                (click)="activeCategory = c">
          {{ c }}
        </button>
      </div>

      <p class="count-info">Showing <strong>{{ visible }}</strong> of {{ issues.length }} issue(s)</p>

      <div *ngIf="issues.length === 0" class="empty">No issues found.</div>

      <table *ngIf="issues.length > 0">
        <thead>
          <tr>
            <th>Severity</th>
            <th>Category</th>
            <th>Issue</th>
          </tr>
        </thead>
        <tbody>
          <ng-container *ngFor="let issue of issues; let i = index">
            <tr class="issue-row"
                *ngIf="isVisible(issue)"
                [class.expanded]="expanded[i]">
              <td>
                <span class="badge sev-badge"
                      [style.background]="severityColor(issue.severity)">
                  {{ issue.severity }}
                </span>
              </td>
              <td>
                <span class="badge cat-badge"
                      [style.background]="categoryColor(issue.category)">
                  {{ issue.category }}
                </span>
              </td>
              <td class="title-cell">
                <button class="expand-btn" (click)="toggle(i)"
                        [attr.aria-expanded]="expanded[i]">
                  {{ expanded[i] ? '▼' : '▶' }}
                </button>
                <span class="issue-title">{{ issue.title }}</span>
                <span *ngIf="issue.file" class="file-loc">
                  {{ issue.file }}{{ issue.line ? ':' + issue.line : '' }}
                </span>
                <div *ngIf="expanded[i]" class="issue-detail">
                  <p>{{ issue.description }}</p>
                  <div *ngIf="issue.suggestion" class="suggestion">
                    <strong>Suggestion:</strong> {{ issue.suggestion }}
                  </div>
                </div>
              </td>
            </tr>
          </ng-container>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .card-title { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: .5px; color: #888; margin-bottom: 12px; }
    .filters    { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 8px; }
    .filter-label { font-size: 12px; font-weight: 600; color: #888; margin-right: 4px; }
    .filter-btn {
      padding: 4px 12px; border-radius: 20px; border: 1px solid #d1d5db;
      background: #fff; cursor: pointer; font-size: 12px; font-weight: 500;
      color: #374151; transition: all .15s;
    }
    .filter-btn:hover { background: #f3f4f6; }
    .filter-btn.active { background: var(--accent, #374151); border-color: var(--accent, #374151); color: #fff; }
    .cat-btn.active { background: #374151; border-color: #374151; }
    .count-info { font-size: 12px; color: #6b7280; margin-bottom: 8px; }
    .empty { text-align: center; color: #6b7280; padding: 24px; }
    table  { width: 100%; border-collapse: collapse; }
    th     { text-align: left; padding: 10px 12px; font-size: 12px; text-transform: uppercase;
             letter-spacing: .4px; color: #6b7280; border-bottom: 2px solid #e5e7eb; background: #fafafa; }
    td     { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; vertical-align: top; }
    .issue-row:hover td { background: #fafafa; }
    .badge { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 11px;
             font-weight: 600; color: #fff; white-space: nowrap; }
    .title-cell  { min-width: 300px; }
    .expand-btn  { background: none; border: none; cursor: pointer; font-size: 10px;
                   color: #9ca3af; padding: 0 4px 0 0; vertical-align: middle; }
    .issue-title { font-weight: 500; font-size: 13px; }
    .file-loc    { display: block; font-size: 11px; color: #6b7280; margin-top: 2px; font-family: monospace; }
    .issue-detail {
      margin-top: 10px; padding: 12px; background: #f9fafb;
      border-radius: 6px; border-left: 3px solid #d1d5db; font-size: 13px; color: #374151;
    }
    .issue-detail p { margin-bottom: 8px; }
    .suggestion {
      font-size: 12px; color: #374151; background: #fffbeb;
      padding: 8px 10px; border-radius: 4px; border-left: 3px solid #fbbf24;
    }
  `]
})
export class IssuesTableComponent implements OnInit {
  @Input({ required: true }) issues: ReviewIssue[] = [];

  activeSeverity: Severity | 'All' = 'All';
  activeCategory: IssueCategory | 'All' = 'All';
  expanded: boolean[] = [];

  severityOptions: (Severity | 'All')[] = ['All', 'Critical', 'High', 'Medium', 'Low'];
  categoryOptions: (IssueCategory | 'All')[] = [];

  ngOnInit(): void {
    this.expanded = this.issues.map(() => false);
    const cats = [...new Set(this.issues.map(i => i.category))];
    this.categoryOptions = cats.length ? ['All', ...cats] : [];
  }

  toggle(i: number): void {
    this.expanded[i] = !this.expanded[i];
  }

  isVisible(issue: ReviewIssue): boolean {
    const sevOk = this.activeSeverity === 'All' || issue.severity === this.activeSeverity;
    const catOk = this.activeCategory === 'All' || issue.category === this.activeCategory;
    return sevOk && catOk;
  }

  get visible(): number {
    return this.issues.filter(i => this.isVisible(i)).length;
  }

  severityColor(s: Severity | 'All'): string {
    const map: Record<string, string> = {
      Critical: '#dc2626', High: '#ea580c', Medium: '#ca8a04', Low: '#16a34a', All: '#374151'
    };
    return map[s] ?? '#374151';
  }

  categoryColor(c: IssueCategory): string {
    const map: Record<string, string> = {
      Security: '#7c3aed', Correctness: '#1d4ed8', 'Code Smell': '#0f766e',
      Maintainability: '#0369a1', 'Missing Tests': '#b45309', Dependency: '#be185d'
    };
    return map[c] ?? '#374151';
  }
}
