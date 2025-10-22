import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeResourceUrlPipe } from '../safe-resource-url.pipe';

@Component({
  selector: 'app-custom-pptx-viewer',
  standalone: true,
  imports: [CommonModule, SafeResourceUrlPipe],
  template: `
    <div class="pptx-viewer-container">
      <iframe *ngIf="embedUrl" [src]="embedUrl | safeResourceUrl" frameborder="0" width="100%" height="100%"></iframe>
    </div>
  `,
  styles: [`
    .pptx-viewer-container {
      width: 100%;
      height: 80vh;
      border: 1px solid #ddd;
    }
  `]
})
export class CustomPptxViewerComponent implements OnInit, OnChanges {
  @Input() pptxBase64: string = '';
  
  embedUrl: string = '';

  constructor() { }

  ngOnInit(): void {
    this.updateEmbedUrl();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pptxBase64']) {
      this.updateEmbedUrl();
    }
  }

  private updateEmbedUrl(): void {
    if (this.pptxBase64) {
      // Create a data URL for the PPTX file
      this.embedUrl = 'data:application/vnd.openxmlformats-officedocument.presentationml.presentation;base64,' + this.pptxBase64;
    }
  }
}
