import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReviewService } from '../../services/review.service';
import { InputType } from '../../models/review.models';

@Component({
  selector: 'app-submit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="card">
        <div class="header">
          <h1>AI Code Review</h1>
          <p class="subtitle">Paste a git diff or enter a GitHub PR link to get an instant AI-powered review.</p>
        </div>

        <!-- Tabs -->
        <div class="tabs">
          <button class="tab" [class.active]="inputType === 'diff'" (click)="inputType = 'diff'">
            📄 Paste / Upload Diff
          </button>
          <button class="tab" [class.active]="inputType === 'github_pr'" (click)="inputType = 'github_pr'">
            🔗 GitHub PR Link
          </button>
        </div>

        <!-- Diff input -->
        <div *ngIf="inputType === 'diff'" class="input-section">
          <div class="upload-row">
            <label class="upload-btn">
              Upload .diff file
              <input type="file" accept=".diff,.patch" (change)="onFileUpload($event)" hidden />
            </label>
            <span class="or">or paste below</span>
          </div>
          <textarea
            class="diff-textarea"
            [(ngModel)]="diffText"
            placeholder="Paste your git diff here..."
            rows="18"
          ></textarea>
        </div>

        <!-- GitHub PR input -->
        <div *ngIf="inputType === 'github_pr'" class="input-section">
          <label class="field-label">GitHub Pull Request URL</label>
          <input
            type="url"
            class="pr-input"
            [(ngModel)]="prUrl"
            placeholder="https://github.com/owner/repo/pull/123"
          />
          <p class="hint">
            Public repos work without a token. For private repos, set <code>github.token</code> in the backend config.
          </p>
        </div>

        <!-- Error -->
        <div *ngIf="errorMsg" class="error-banner">{{ errorMsg }}</div>

        <!-- Submit -->
        <button class="submit-btn" [disabled]="loading || !canSubmit" (click)="submit()">
          <span *ngIf="!loading">🔍 Review</span>
          <span *ngIf="loading" class="spinner">Analyzing…</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .page { min-height: 100vh; background: #f5f5f5; display: flex; align-items: flex-start; justify-content: center; padding: 48px 16px; }
    .card { background: #fff; border-radius: 14px; padding: 36px 40px; width: 100%; max-width: 720px; box-shadow: 0 2px 12px rgba(0,0,0,.08); }
    .header { margin-bottom: 24px; }
    h1 { font-size: 26px; font-weight: 800; color: #111; margin-bottom: 6px; }
    .subtitle { font-size: 14px; color: #666; }
    .tabs { display: flex; gap: 4px; border-bottom: 2px solid #e5e7eb; margin-bottom: 24px; }
    .tab { padding: 10px 18px; border: none; background: none; cursor: pointer; font-size: 14px;
           font-weight: 500; color: #6b7280; border-bottom: 2px solid transparent; margin-bottom: -2px;
           transition: all .15s; }
    .tab.active { color: #111; border-bottom-color: #111; }
    .input-section { margin-bottom: 20px; }
    .upload-row { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
    .upload-btn { display: inline-block; padding: 7px 16px; background: #f3f4f6; border: 1px solid #d1d5db;
                  border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 500; color: #374151; }
    .upload-btn:hover { background: #e5e7eb; }
    .or { font-size: 13px; color: #9ca3af; }
    .diff-textarea { width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px;
                     font-family: monospace; font-size: 12px; resize: vertical; background: #fafafa;
                     box-sizing: border-box; }
    .diff-textarea:focus { outline: none; border-color: #111; }
    .field-label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 8px; }
    .pr-input { width: 100%; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 8px;
                font-size: 14px; box-sizing: border-box; }
    .pr-input:focus { outline: none; border-color: #111; }
    .hint { font-size: 12px; color: #9ca3af; margin-top: 8px; }
    .hint code { background: #f3f4f6; padding: 1px 4px; border-radius: 4px; }
    .error-banner { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 10px 14px;
                    border-radius: 8px; font-size: 13px; margin-bottom: 16px; }
    .submit-btn { width: 100%; padding: 13px; background: #111; color: #fff; border: none; border-radius: 10px;
                  font-size: 15px; font-weight: 700; cursor: pointer; transition: background .15s; }
    .submit-btn:hover:not(:disabled) { background: #333; }
    .submit-btn:disabled { opacity: .5; cursor: not-allowed; }
    .spinner { display: inline-block; }
  `]
})
export class SubmitPage {
  inputType: InputType = 'diff';
  diffText = '';
  prUrl = '';
  loading = false;
  errorMsg = '';

  constructor(private reviewService: ReviewService, private router: Router) {}

  get canSubmit(): boolean {
    return this.inputType === 'diff'
      ? this.diffText.trim().length > 0
      : this.prUrl.trim().length > 0;
  }

  onFileUpload(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { this.diffText = reader.result as string; };
    reader.readAsText(file);
  }

  submit(): void {
    this.loading = true;
    this.errorMsg = '';
    const input = this.inputType === 'diff' ? this.diffText.trim() : this.prUrl.trim();

    this.reviewService.submit({ input, inputType: this.inputType }).subscribe({
      next: (response) => {
        this.loading = false;
        this.router.navigate(['/report'], { state: { data: response } });
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message ?? err?.message ?? 'Review failed. Check the backend is running.';
      }
    });
  }
}
