import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GateResult, GateVerdict } from '../../models/review.models';

@Component({
  selector: 'app-verdict-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="verdict-wrapper">
      <span class="verdict-label">Gate Verdict</span>
      <div class="verdict-badge" [ngClass]="verdictClass">{{ gate.verdict }}</div>
      <p class="verdict-reason">{{ gate.reason }}</p>
    </div>
  `,
  styles: [`
    .verdict-wrapper { display: flex; flex-direction: column; gap: 6px; }
    .verdict-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: .5px; color: #888; }
    .verdict-badge {
      display: inline-block;
      padding: 10px 28px;
      border-radius: 8px;
      font-size: 20px;
      font-weight: 800;
      letter-spacing: .5px;
      width: fit-content;
    }
    .verdict-badge.pass    { background: #f0fdf4; color: #16a34a; border: 2px solid #16a34a; }
    .verdict-badge.review  { background: #fff7ed; color: #ea580c; border: 2px solid #ea580c; }
    .verdict-badge.block   { background: #fef2f2; color: #dc2626; border: 2px solid #dc2626; }
    .verdict-reason { font-size: 13px; color: #555; margin: 0; }
  `]
})
export class VerdictBadgeComponent {
  @Input({ required: true }) gate!: GateResult;

  get verdictClass(): string {
    switch (this.gate.verdict as GateVerdict) {
      case 'BLOCK':            return 'block';
      case 'PASS WITH REVIEW': return 'review';
      default:                 return 'pass';
    }
  }
}
