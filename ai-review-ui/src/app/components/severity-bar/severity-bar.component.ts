import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GateResult } from '../../models/review.models';

@Component({
  selector: 'app-severity-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sap-card-title"><i class="bi bi-bar-chart-fill"></i> Severity Breakdown</div>
    <div class="counts-row">
      <div class="count-badge critical"><span class="num">{{ gate.criticalCount }}</span><span class="lbl">Critical</span></div>
      <div class="count-badge high">    <span class="num">{{ gate.highCount }}</span>    <span class="lbl">High</span></div>
      <div class="count-badge medium">  <span class="num">{{ gate.mediumCount }}</span>  <span class="lbl">Medium</span></div>
      <div class="count-badge low">     <span class="num">{{ gate.lowCount }}</span>     <span class="lbl">Low</span></div>
    </div>
    <div class="bar-track">
      <div *ngIf="gate.criticalCount" class="seg critical" [style.width.%]="pct(gate.criticalCount)" [title]="'Critical: '+gate.criticalCount"></div>
      <div *ngIf="gate.highCount"     class="seg high"     [style.width.%]="pct(gate.highCount)"     [title]="'High: '+gate.highCount"></div>
      <div *ngIf="gate.mediumCount"   class="seg medium"   [style.width.%]="pct(gate.mediumCount)"   [title]="'Medium: '+gate.mediumCount"></div>
      <div *ngIf="gate.lowCount"      class="seg low"      [style.width.%]="pct(gate.lowCount)"      [title]="'Low: '+gate.lowCount"></div>
    </div>
  `,
  styles: [`
    .counts-row { display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
    .count-badge {
      flex: 1; min-width: 90px; border-radius: 18px; padding: 18px 14px;
      display: flex; flex-direction: column; align-items: center; border: 2px solid transparent;
    }
    .num { font-size: 32px; font-weight: 800; line-height: 1; }
    .lbl { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .6px; margin-top: 6px; }
    .critical { background: #fff0f0; border-color: #f5c6c6; color: #bb0000; }
    .high     { background: #fff4ec; border-color: #fcd3a8; color: #e76500; }
    .medium   { background: #fefce8; border-color: #fde68a; color: #92400e; }
    .low      { background: #f0fdf4; border-color: #bbf7d0; color: #107e3e; }
    .bar-track { height: 14px; border-radius: 8px; overflow: hidden; display: flex; background: #e5e7eb; }
    .seg { height: 100%; transition: width .4s; }
    .seg.critical { background: linear-gradient(90deg, #bb0000, #dc2626); }
    .seg.high     { background: linear-gradient(90deg, #e76500, #f97316); }
    .seg.medium   { background: linear-gradient(90deg, #92400e, #ca8a04); }
    .seg.low      { background: linear-gradient(90deg, #107e3e, #16a34a); }
  `]
})
export class SeverityBarComponent {
  @Input({ required: true }) gate!: GateResult;
  get total() { return this.gate.criticalCount + this.gate.highCount + this.gate.mediumCount + this.gate.lowCount; }
  pct(n: number) { return this.total === 0 ? 0 : (n / this.total) * 100; }
}
