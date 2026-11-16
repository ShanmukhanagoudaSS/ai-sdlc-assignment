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
    <!-- Navbar -->
    <nav class="app-navbar">
      <a class="brand">
        <span class="brand-icon"><i class="bi bi-code-slash"></i></span>
        AI Code Review
      </a>
    </nav>

    <!-- Hero -->
    <div class="hero-section">
      <div class="container-xl px-4">
        <div class="hero-inner">
          <div class="hero-text">
            <div class="hero-tag"><i class="bi bi-stars"></i> AI-Powered Analysis</div>
            <h1>Smart Code Review<br><span class="hero-highlight">in Seconds</span></h1>
            <p>Submit a git diff or GitHub PR — Claude analyzes every line for security vulnerabilities, bugs, code quality, and more.</p>
          </div>
          <div class="hero-stats">
            <div class="stat-pill"><i class="bi bi-shield-check text-success"></i> Security</div>
            <div class="stat-pill"><i class="bi bi-bug text-danger"></i> Bugs</div>
            <div class="stat-pill"><i class="bi bi-lightning text-warning"></i> Quality</div>
            <div class="stat-pill"><i class="bi bi-graph-up text-info"></i> Dependencies</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main form card -->
    <div class="container-xl px-4 pb-5">
      <div class="sap-card form-card">

        <!-- Tab switcher -->
        <div class="input-type-toggle mb-4">
          <button class="toggle-btn" [class.active]="inputType === 'diff'" (click)="inputType = 'diff'">
            <i class="bi bi-file-diff"></i> Paste / Upload Diff
          </button>
          <button class="toggle-btn" [class.active]="inputType === 'github_pr'" (click)="inputType = 'github_pr'">
            <i class="bi bi-github"></i> GitHub PR Link
          </button>
        </div>

        <!-- Diff input -->
        <div *ngIf="inputType === 'diff'">
          <div class="upload-row mb-3">
            <label class="upload-btn">
              <i class="bi bi-upload"></i> Upload .diff file
              <input type="file" accept=".diff,.patch" (change)="onFileUpload($event)" hidden />
            </label>
            <span class="divider-text">or paste below</span>
          </div>
          <div class="textarea-wrapper">
            <textarea
              class="diff-textarea"
              [(ngModel)]="diffText"
              placeholder="diff --git a/src/routes/users.js b/src/routes/users.js&#10;index 3a1b2c4..d8f9e12 100644&#10;--- a/src/routes/users.js&#10;+++ b/src/routes/users.js&#10;@@ -1,5 +1,12 @@&#10;+const userId = req.params.id;&#10;+const query = &#96;SELECT * FROM users WHERE id = &#36;{userId}&#96;;"
              rows="14">
            </textarea>
            <div class="textarea-hint" *ngIf="diffText">
              <i class="bi bi-check-circle-fill text-success"></i>
              {{ lineCount }} lines ready
            </div>
          </div>
        </div>

        <!-- GitHub PR input -->
        <div *ngIf="inputType === 'github_pr'">
          <label class="field-label"><i class="bi bi-link-45deg"></i> GitHub Pull Request URL</label>
          <div class="pr-input-wrapper">
            <span class="pr-icon"><i class="bi bi-github"></i></span>
            <input
              type="url"
              class="pr-input"
              [(ngModel)]="prUrl"
              placeholder="https://github.com/owner/repo/pull/123"
            />
          </div>
          <div class="info-box mt-3">
            <i class="bi bi-info-circle"></i>
            Public repos work without a token. For private repos, set <code>github.token</code> in the backend <code>application.properties</code>.
          </div>
        </div>

        <!-- Error -->
        <div *ngIf="errorMsg" class="error-box mt-3">
          <i class="bi bi-exclamation-triangle-fill"></i> {{ errorMsg }}
        </div>

        <!-- Submit -->
        <div class="mt-4 d-flex justify-content-end">
          <button class="btn-sap-primary submit-btn" [disabled]="loading || !canSubmit" (click)="submit()">
            <span *ngIf="!loading"><i class="bi bi-search"></i> Analyze Code</span>
            <span *ngIf="loading"><span class="spinner-border spinner-border-sm me-2"></span> Analyzing…</span>
          </button>
        </div>
      </div>

      <!-- Feature cards -->
      <div class="row g-3 mt-1">
        <div class="col-6 col-md-3" *ngFor="let f of features">
          <div class="feature-card">
            <div class="feature-icon" [style.background]="f.bg">
              <i [class]="'bi ' + f.icon" [style.color]="f.color"></i>
            </div>
            <div class="feature-label">{{ f.label }}</div>
            <div class="feature-desc">{{ f.desc }}</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hero-section {
      background: linear-gradient(135deg, #0854a0 0%, #0070f2 60%, #0f828f 100%);
      padding: 48px 24px 56px;
      margin-bottom: -28px;
    }
    .hero-inner { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 24px; }
    .hero-tag {
      display: inline-flex; align-items: center; gap: 6px;
      background: rgba(255,255,255,.15); color: #fff; padding: 5px 14px;
      border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 14px;
      border: 1px solid rgba(255,255,255,.25);
    }
    .hero-text h1 { color: #fff; font-size: 36px; font-weight: 800; line-height: 1.2; margin-bottom: 12px; font-family: 'Google Sans', sans-serif; }    .hero-highlight { color: #a8d8ff; }
    .hero-text p { color: rgba(255,255,255,.85); font-size: 15px; max-width: 500px; }
    .hero-stats { display: flex; flex-wrap: wrap; gap: 10px; }
    .stat-pill {
      background: rgba(255,255,255,.15); backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,.25); border-radius: 24px;
      padding: 8px 16px; color: #fff; font-size: 13px; font-weight: 600;
      display: flex; align-items: center; gap: 7px;
    }

    .form-card { border-top: 4px solid #0070f2; border-radius: 0 0 12px 12px; }

    .input-type-toggle {
      display: flex; gap: 4px;
      background: #f0f4f9; border-radius: 10px; padding: 4px;
    }
    .toggle-btn {
      flex: 1; padding: 10px 16px; border: none; border-radius: 8px;
      background: transparent; color: #556070; font-size: 13px; font-weight: 600;
      cursor: pointer; transition: all .2s; display: flex; align-items: center; justify-content: center; gap: 7px;
    }
    .toggle-btn.active { background: #fff; color: #0070f2; box-shadow: 0 2px 8px rgba(0,112,242,.15); }
    .toggle-btn:hover:not(.active) { color: #0070f2; }

    .upload-row { display: flex; align-items: center; gap: 14px; }
    .upload-btn {
      display: inline-flex; align-items: center; gap: 7px;
      padding: 8px 18px; background: #e8f4fd; color: #0070f2;
      border: 1.5px solid #0070f2; border-radius: 8px;
      cursor: pointer; font-size: 13px; font-weight: 600; transition: all .15s;
    }
    .upload-btn:hover { background: #0070f2; color: #fff; }
    .divider-text { color: #9ba8b5; font-size: 13px; }

    .textarea-wrapper { position: relative; }
    .diff-textarea {
      width: 100%; padding: 14px 16px;
      border: 1.5px solid #d4dce6; border-radius: 10px;
      font-family: 'Fira Code', 'Cascadia Code', monospace; font-size: 12px;
      line-height: 1.6; resize: vertical; background: #fafbfc;
      transition: border-color .2s; box-sizing: border-box;
    }
    .diff-textarea:focus { outline: none; border-color: #0070f2; background: #fff; box-shadow: 0 0 0 3px rgba(0,112,242,.1); }
    .textarea-hint {
      position: absolute; bottom: 12px; right: 12px;
      font-size: 11px; color: #556070; display: flex; align-items: center; gap: 4px;
    }

    .field-label { display: block; font-size: 13px; font-weight: 700; color: #1a1a2e; margin-bottom: 10px; }
    .pr-input-wrapper { position: relative; }
    .pr-icon {
      position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
      font-size: 18px; color: #556070;
    }
    .pr-input {
      width: 100%; padding: 12px 14px 12px 44px;
      border: 1.5px solid #d4dce6; border-radius: 10px; font-size: 14px;
      transition: border-color .2s; background: #fafbfc; box-sizing: border-box;
    }
    .pr-input:focus { outline: none; border-color: #0070f2; background: #fff; box-shadow: 0 0 0 3px rgba(0,112,242,.1); }

    .info-box {
      background: #e8f4fd; border: 1px solid #b3d6f5; border-radius: 8px;
      padding: 10px 14px; font-size: 12px; color: #0854a0;
      display: flex; align-items: flex-start; gap: 8px;
    }
    .info-box code { background: rgba(0,112,242,.1); padding: 1px 5px; border-radius: 4px; font-size: 11px; }

    .error-box {
      background: #fff0f0; border: 1px solid #f5c6c6; border-radius: 8px;
      padding: 10px 14px; font-size: 13px; color: #bb0000;
      display: flex; align-items: center; gap: 8px;
    }

    .submit-btn { min-width: 180px; justify-content: center; font-size: 15px; padding: 13px 32px; }

    .feature-card {
      background: #fff; border: 1px solid #d4dce6; border-radius: 10px;
      padding: 18px 16px; transition: all .2s;
    }
    .feature-card:hover { transform: translateY(-3px); box-shadow: 0 6px 20px rgba(0,112,242,.12); border-color: #0070f2; }
    .feature-icon {
      width: 40px; height: 40px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; margin-bottom: 10px;
    }
    .feature-label { font-size: 13px; font-weight: 700; color: #1a1a2e; margin-bottom: 4px; }
    .feature-desc { font-size: 12px; color: #556070; line-height: 1.5; }
  `]
})
export class SubmitPage {
  inputType: InputType = 'diff';
  diffText = '';
  prUrl = '';
  loading = false;
  errorMsg = '';

  features = [
    { icon: 'bi-shield-exclamation', label: 'Security', desc: 'SQL injection, XSS, secrets, auth bypasses', color: '#bb0000', bg: '#fff0f0' },
    { icon: 'bi-bug', label: 'Correctness', desc: 'Logic errors, null checks, race conditions', color: '#e76500', bg: '#fff4ec' },
    { icon: 'bi-recycle', label: 'Code Quality', desc: 'Smells, SOLID violations, tech debt', color: '#0070f2', bg: '#e8f4fd' },
    { icon: 'bi-box-seam', label: 'Dependencies', desc: 'Vulnerable packages, outdated versions', color: '#0f828f', bg: '#e6f5f6' },
  ];

  constructor(private reviewService: ReviewService, private router: Router) {}

  get canSubmit(): boolean {
    return this.inputType === 'diff' ? this.diffText.trim().length > 0 : this.prUrl.trim().length > 0;
  }

  get lineCount(): number {
    return this.diffText.split('\n').length;
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
        this.errorMsg = err?.error?.message ?? err?.message ?? 'Review failed. Is the backend running on port 8080?';
      }
    });
  }
}
