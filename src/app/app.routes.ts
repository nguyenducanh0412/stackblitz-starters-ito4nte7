import { Routes } from '@angular/router';
import { DocumentPageComponent } from './document-page/document-page.component';
import { TrainingViewerComponent } from './training-viewer/training-viewer.component';

export const routes: Routes = [
  { path: 'documents', component: DocumentPageComponent },
  { path: 'training', component: TrainingViewerComponent },
  { path: '', redirectTo: '/documents', pathMatch: 'full' }
];
