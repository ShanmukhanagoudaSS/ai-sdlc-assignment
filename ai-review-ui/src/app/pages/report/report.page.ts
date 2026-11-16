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
    <!-- Navbar -->
    <nav class="app-navbar">
      <a class="brand">
        <span class="brand-icon"><i class="bi bi-code-slash"></i></span>
        AI Code Review
      </a>
      <button class="btn-new" (click)="newReview()">
        <i class="bi bi-plus-lg"></i> New Review
      </button>
    </nav>

    <div *ngIf="data; else noData">
      <!-- Report header banner -->
      <div class="report-banner">
        <div class="container-xl px-4">
          <div class="banner-top">
            <div class="banner-tag"><i class="bi bi-file-earmark-diff"></i> Review Complete</div>
            <h2 class="banner-title">Code Review Report</h2>
            <div class="meta-chips">
              <span class="meta-chip"><i class="bi bi-file-earmark-code"></i> {{ data.result.diffStats.filesChanged }} file(s)</span>
              <span class="meta-chip added"><i class="bi bi-plus-lg"></i> {{ data.result.diffStats.linesAdded }} added</span>
              <span class="meta-chip removed"><i class="bi bi-dash-lg"></i> {{ data.result.diffStats.linesRemoved }} removed</span>
              <span class="meta-chip"><i class="bi bi-clock"></i> {{ formatDate(data.result.reviewedAt) }}</span>
              <span class="meta-chip"><i class="bi bi-cpu"></i> {{ data.result.model }}</span>
            </div>
          </div>
          <div class="banner-verdict">
            <app-verdict-badge [gate]="data.gate" />
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="container-xl px-4 pb-5 pt-4">

        <!-- Summary + Severity row -->
        <div class="row g-4 mb-4">
          <div class="col-lg-5">
            <div class="sap-card h-100">
              <div class="sap-card-title"><i class="bi bi-chat-square-text-fill"></i> AI Summary</div>
              <p class="summary-text">{{ data.result.summary }}</p>
            </div>
          </div>
          <div class="col-lg-7">
            <div class="sap-card h-100">
              <app-severity-bar [gate]="data.gate" />
            </div>
          </div>
        </div>

        <!-- Issues -->
        <div class="sap-card">
          <app-issues-table [issues]="data.result.issues" />
        </div>

        <footer class="report-footer">
          <i class="bi bi-cpu"></i> Powered by {{ data.result.model }} &mdash;
          <i class="bi bi-clock"></i> {{ formatDate(data.result.reviewedAt) }}
        </footer>
      </div>
    </div>

    <ng-template #noData>
      <div class="no-data-state">
        <i class="bi bi-file-earmark-x"></i>
        <p>No review data found.</p>
        <button class="btn-sap-primary" (click)="newReview()"><i class="bi bi-arrow-left"></i> Go Back</button>
      </div>
    </ng-template>
  `,
  styles: [`
    .btn-new {
      background: rgba(255,255,255,.15); color: #fff;
      border: 1.5px solid rgba(255,255,255,.4); border-radius: 8px;
      padding: 7px 18px; font-size: 13px; font-weight: 600;
      cursor: pointer; display: flex; align-items: center; gap: 6px;
      transition: all .2s; font-family: 'Google Sans', sans-serif;
    }
    .btn-new:hover { background: rgba(255,255,255,.25); }

    .report-banner {
      background: linear-gradient(135deg, #0854a0 0%, #0070f2 60%, #0f828f 100%);
      padding: 28px 0 40px;
      margin-bottom: -20px;
    }
    .banner-top { margin-bottom: 16px; }
    .banner-tag {
      display: inline-flex; align-items: center; gap: 6px;
      background: rgba(255,255,255,.15); color: #fff; padding: 4px 12px;
      border-radius: 20px; font-size: 11px; font-weight: 600; margin-bottom: 8px;
      border: 1px solid rgba(255,255,255,.25);
    }
    .banner-title { color: #fff; font-size: 26px; font-weight: 800; margin-bottom: 12px; font-family: 'Google Sans', sans-serif; }
    .meta-chips { display: flex; flex-wrap: wrap; gap: 8px; }
    .meta-chip {
      display: inline-flex; align-items: center; gap: 5px;
      background: rgba(255,255,255,.15); color: rgba(255,255,255,.9);
      padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500;
      border: 1px solid rgba(255,255,255,.2);
    }
    .meta-chip.added   { background: rgba(16,126,62,.35);  border-color: rgba(16,126,62,.5); }
    .meta-chip.removed { background: rgba(187,0,0,.35);    border-color: rgba(187,0,0,.5);   }
    .banner-verdict { margin-top: 16px; }

    .summary-text { font-size: 14px; color: #374151; line-height: 1.8; }

    .report-footer {
      text-align: center; font-size: 12px; color: #9ba8b5;
      margin-top: 8px; padding: 16px;
      display: flex; align-items: center; justify-content: center; gap: 6px;
    }

    .no-data-state {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; min-height: 60vh; gap: 16px;
      font-size: 16px; color: #556070;
      i { font-size: 56px; color: #d4dce6; }
    }
  `]
})
export class ReportPage implements OnInit {
  data: ReviewResponse | null = null;

  constructor(private router: Router) {}

  ngOnInit() {
    const state = history.state as { data?: ReviewResponse };
    if (state?.data) {
      this.data = state.data;
    } else {
      this.router.navigate(['/']);
    }
  }

  formatDate(iso: string) { return new Date(iso).toLocaleString(); }
  newReview() { this.router.navigate(['/']); }
}
