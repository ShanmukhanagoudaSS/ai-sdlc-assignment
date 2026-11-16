import { Routes } from '@angular/router';
import { SubmitPage } from './pages/submit/submit.page';
import { ReportPage } from './pages/report/report.page';

export const routes: Routes = [
  { path: '',       component: SubmitPage },
  { path: 'report', component: ReportPage },
  { path: '**',     redirectTo: '' }
];
