import { Directive, ElementRef, HostListener, Input, OnInit } from '@angular/core';
import { TrainingProgressService } from '../training-progress.service';

@Directive({
  selector: 'video[appSeekControl]',
  standalone: true
})
export class SeekControlDirective implements OnInit {
  @Input() videoId = '';
  
  // Track the maximum allowed position (furthest watched position)
  private maxAllowedPosition = 0;
  private isCompleted = false;
  
  constructor(
    private el: ElementRef<HTMLVideoElement>,
    private progressService: TrainingProgressService
  ) {}
  
  ngOnInit(): void {
    // Check if this video has been completed before
    if (this.videoId) {
      const savedProgress = this.progressService.getVideoProgress(this.videoId);
      this.isCompleted = savedProgress?.completed || false;
      this.maxAllowedPosition = savedProgress?.currentTime || 0;
      
      // Listen for timeupdate to track furthest position
      this.el.nativeElement.addEventListener('timeupdate', () => {
        if (!this.isCompleted) {
          const currentTime = this.el.nativeElement.currentTime;
          if (currentTime > this.maxAllowedPosition) {
            this.maxAllowedPosition = currentTime;
          }
        }
      });
    }
  }
  
  @HostListener('seeking')
  onSeeking(): void {
    const video = this.el.nativeElement;
    const seekingTo = video.currentTime;
    
    // If video is completed, allow seeking anywhere
    if (this.isCompleted) {
      return;
    }
    
    // If seeking forward beyond max allowed position, prevent it
    if (seekingTo > this.maxAllowedPosition) {
      console.log(`Preventing forward seek to ${seekingTo}, max allowed: ${this.maxAllowedPosition}`);
      video.currentTime = this.maxAllowedPosition;
    }
  }
}