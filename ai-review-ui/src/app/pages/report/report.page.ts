import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReviewResponse } from '../../models/review.models';
import { VerdictBadgeComponent } from '../../components/verdict-badge/verdict-badge.component';
import { SeverityBarComponent } from '../../components/severity-bar/severity-bar.component';
import { IssuesTableComponent } from '../../components/issues-table/issues-table.component';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule, VerdictBadgeComponent, SeverityBarComponent, IssuesTableComponent],
  template: `
    <div class="page">
      <div class="container" *ngIf="data; else noData">

        <!-- Header -->
        <div class="card header-card">
          <div class="header-top">
            <h1>AI Code Review Report</h1>
            <button class="new-btn" (click)="newReview()">+ New Review</button>
          </div>
          <div class="meta-row">
            <span class="meta-item">📄 <strong>{{ data.result.diffStats.filesChanged }}</strong> file(s) changed</span>
            <span class="meta-item added">+{{ data.result.diffStats.linesAdded }} added</span>
            <span class="meta-item removed">-{{ data.result.diffStats.linesRemoved }} removed</span>
            <span class="meta-item">🕐 {{ formatDate(data.result.reviewedAt) }}</span>
            <span class="meta-item">🤖 {{ data.result.model }}</span>
          </div>
          <app-verdict-badge [gate]="data.gate" />
        </div>

        <!-- Summary -->
        <div class="card">
          <p class="card-title">Summary</p>
          <p class="summary-text">{{ data.result.summary }}</p>
        </div>

        <!-- Severity bar -->
        <div class="card">
          <app-severity-bar [gate]="data.gate" />
        </div>

        <!-- Issues table -->
        <div class="card">
          <app-issues-table [issues]="data.result.issues" />
        </div>

        <footer>
          Powered by {{ data.result.model }} via AI Code Review &mdash; {{ formatDate(data.result.reviewedAt) }}
        </footer>
      </div>

      <ng-template #noData>
        <div class="no-data">
          <p>No review data found.</p>
          <button class="new-btn" (click)="newReview()">← Go back</button>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .page { min-height: 100vh; background: #f5f5f5; padding: 24px 16px; }
    .container { max-width: 1100px; margin: 0 auto; }
    .card { background: #fff; border-radius: 10px; padding: 24px 28px; margin-bottom: 16px;
            box-shadow: 0 1px 4px rgba(0,0,0,.07); }
    .header-card { }
    .header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    h1 { font-size: 22px; font-weight: 800; color: #111; }
    .new-btn { padding: 8px 18px; background: #111; color: #fff; border: none; border-radius: 8px;
               cursor: pointer; font-size: 13px; font-weight: 600; }
    .new-btn:hover { background: #333; }
    .meta-row { display: flex; flex-wrap: wrap; gap: 16px; font-size: 13px; color: #555; margin-bottom: 20px; }
    .meta-item { display: flex; align-items: center; gap: 4px; }
    .added   { color: #16a34a; }
    .removed { color: #dc2626; }
    .card-title { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: .5px; color: #888; margin-bottom: 10px; }
    .summary-text { font-size: 14px; color: #333; line-height: 1.7; }
    footer { text-align: center; font-size: 12px; color: #9ca3af; margin-top: 16px; padding: 16px; }
    .no-data { display: flex; flex-direction: column; align-items: center; justify-content: center;
               min-height: 60vh; gap: 16px; font-size: 16px; color: #666; }
  `]
})
export class ReportPage implements OnInit {
  data: ReviewResponse | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    const state = history.state as { data?: ReviewResponse };
    if (state?.data) {
      this.data = state.data;
    } else {
      this.router.navigate(['/']);
    }
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleString();
  }

  newReview(): void {
    this.router.navigate(['/']);
  }
}
