import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GateResult, GateVerdict } from '../../models/review.models';

@Component({
  selector: 'app-verdict-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="verdict-wrapper" [ngClass]="verdictClass">
      <div class="verdict-left">
        <div class="verdict-icon"><i [class]="'bi ' + verdictIcon"></i></div>
        <div>
          <div class="verdict-label">Gate Verdict</div>
          <div class="verdict-text">{{ gate.verdict }}</div>
        </div>
      </div>
      <div class="verdict-reason">{{ gate.reason }}</div>
    </div>
  `,
  styles: [`
    .verdict-wrapper {
      display: flex; align-items: center; justify-content: space-between;
      flex-wrap: wrap; gap: 12px;
      padding: 16px 20px; border-radius: 10px; border-left: 5px solid;
    }
    .verdict-left { display: flex; align-items: center; gap: 14px; }
    .verdict-icon {
      width: 44px; height: 44px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0;
    }
    .verdict-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .5px; opacity: .75; }
    .verdict-text { font-size: 22px; font-weight: 800; letter-spacing: .3px; }
    .verdict-reason { font-size: 13px; font-weight: 500; max-width: 420px; }

    .pass    { background: #f0fdf4; border-color: #107e3e; color: #107e3e; .verdict-icon { background: #dcfce7; } }
    .review  { background: #fff7ed; border-color: #e76500; color: #e76500; .verdict-icon { background: #ffe4cc; } }
    .block   { background: #fff0f0; border-color: #bb0000; color: #bb0000; .verdict-icon { background: #ffe0e0; } }
  `]
})
export class VerdictBadgeComponent {
  @Input({ required: true }) gate!: GateResult;

  get verdictClass(): string {
    const map: Record<GateVerdict, string> = { 'BLOCK': 'block', 'PASS WITH REVIEW': 'review', 'PASS': 'pass' };
    return map[this.gate.verdict as GateVerdict] ?? 'pass';
  }

  get verdictIcon(): string {
    const map: Record<GateVerdict, string> = { 'BLOCK': 'bi-x-circle-fill', 'PASS WITH REVIEW': 'bi-exclamation-triangle-fill', 'PASS': 'bi-check-circle-fill' };
    return map[this.gate.verdict as GateVerdict] ?? 'bi-check-circle-fill';
  }
}
