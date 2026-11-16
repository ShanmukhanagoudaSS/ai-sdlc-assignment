import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GateResult } from '../../models/review.models';

@Component({
  selector: 'app-severity-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bar-card">
      <p class="card-title">Severity Breakdown</p>
      <div class="bar-track">
        <div *ngIf="gate.criticalCount" class="seg critical" [style.width.%]="pct(gate.criticalCount)"
             [title]="'Critical: ' + gate.criticalCount"></div>
        <div *ngIf="gate.highCount"     class="seg high"     [style.width.%]="pct(gate.highCount)"
             [title]="'High: ' + gate.highCount"></div>
        <div *ngIf="gate.mediumCount"   class="seg medium"   [style.width.%]="pct(gate.mediumCount)"
             [title]="'Medium: ' + gate.mediumCount"></div>
        <div *ngIf="gate.lowCount"      class="seg low"      [style.width.%]="pct(gate.lowCount)"
             [title]="'Low: ' + gate.lowCount"></div>
      </div>
      <div class="legend">
        <span class="legend-item"><span class="dot critical-dot"></span>Critical: {{ gate.criticalCount }}</span>
        <span class="legend-item"><span class="dot high-dot"></span>High: {{ gate.highCount }}</span>
        <span class="legend-item"><span class="dot medium-dot"></span>Medium: {{ gate.mediumCount }}</span>
        <span class="legend-item"><span class="dot low-dot"></span>Low: {{ gate.lowCount }}</span>
      </div>
    </div>
  `,
  styles: [`
    .bar-card { }
    .card-title { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: .5px; color: #888; margin-bottom: 10px; }
    .bar-track  { height: 28px; border-radius: 6px; overflow: hidden; display: flex; background: #e5e7eb; }
    .seg        { height: 100%; }
    .critical   { background: #dc2626; }
    .high       { background: #ea580c; }
    .medium     { background: #ca8a04; }
    .low        { background: #16a34a; }
    .legend     { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 10px; font-size: 12px; color: #374151; }
    .legend-item{ display: flex; align-items: center; gap: 5px; }
    .dot        { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .critical-dot{ background: #dc2626; }
    .high-dot   { background: #ea580c; }
    .medium-dot { background: #ca8a04; }
    .low-dot    { background: #16a34a; }
  `]
})
export class SeverityBarComponent {
  @Input({ required: true }) gate!: GateResult;

  get total(): number {
    return this.gate.criticalCount + this.gate.highCount + this.gate.mediumCount + this.gate.lowCount;
  }

  pct(count: number): number {
    return this.total === 0 ? 0 : (count / this.total) * 100;
  }
}
