import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TrainingViewerComponent } from './training-viewer/training-viewer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TrainingViewerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'angular-pdf-viewer';
}
