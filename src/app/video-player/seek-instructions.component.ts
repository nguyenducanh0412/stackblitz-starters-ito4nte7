import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-seek-instructions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="seek-instructions" [class.visible]="visible">
      <div class="instruction-content">
        <div class="icon">ℹ️</div>
        <div class="message">
          <div class="title">Video chưa xem xong</div>
          <div class="desc">Bạn có thể tua lùi video để xem lại phần đã xem, nhưng không thể tua tới phần chưa xem.</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .seek-instructions {
      position: absolute;
      bottom: 70px;
      left: 50%;
      transform: translateX(-50%);
      background-color: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 12px;
      border-radius: 6px;
      z-index: 10;
      max-width: 90%;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.2s, visibility 0.2s;
    }
    
    .seek-instructions.visible {
      opacity: 1;
      visibility: visible;
    }
    
    .instruction-content {
      display: flex;
      align-items: center;
    }
    
    .icon {
      font-size: 24px;
      margin-right: 10px;
    }
    
    .title {
      font-weight: bold;
      margin-bottom: 5px;
    }
    
    .desc {
      font-size: 0.9em;
      opacity: 0.9;
    }
  `]
})
export class SeekInstructionsComponent {
  visible = false;
  private hideTimeout: any;
  
  show(): void {
    // Clear any existing timeout
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
    
    this.visible = true;
    
    // Hide after 3 seconds
    this.hideTimeout = setTimeout(() => {
      this.visible = false;
    }, 3000);
  }
  
  hide(): void {
    this.visible = false;
    
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
  }
}