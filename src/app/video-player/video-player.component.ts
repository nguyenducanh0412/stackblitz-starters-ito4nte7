import { Component, OnInit, OnDestroy, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoProgress, TrainingProgressService } from '../training-progress.service';

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="video-popup-overlay" *ngIf="isOpen" (click)="onOverlayClick($event)">
      <div class="video-popup" (click)="$event.stopPropagation()">
        <div class="popup-header">
          <h2>{{ videoTitle }}</h2>
          <button class="close-btn" (click)="closePopup()">&times;</button>
        </div>
        <div class="video-container">
          <video #videoPlayer 
                 (play)="onVideoPlay()" 
                 (pause)="onVideoPause()" 
                 (ended)="onVideoEnded()"
                 (timeupdate)="onTimeUpdate()"
                 (loadedmetadata)="onMetadataLoaded()"
                 [src]="videoSource"
                 controlsList="nodownload nofullscreen" 
                 disablePictureInPicture>
            Your browser does not support the video tag.
          </video>
          <div class="video-ended-overlay" *ngIf="videoEnded">
            <div class="video-ended-message">
              <span>Video đã kết thúc</span>
              <button (click)="restartVideo()">Xem lại</button>
            </div>
          </div>
        </div>
        <div class="video-controls">
          <button (click)="togglePlayPause()" [class.restart-btn]="videoEnded">
            {{ videoEnded ? 'Phát lại' : (isPlaying ? 'Tạm dừng' : 'Phát') }}
          </button>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" [style.width.%]="progressPercent"></div>
            </div>
            <span class="time-display">{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .video-popup-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    
    .video-popup {
      width: 80%;
      max-width: 800px;
      background-color: #fff;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .popup-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 20px;
      background-color: #f0f0f0;
      border-bottom: 1px solid #ddd;
    }
    
    .popup-header h2 {
      margin: 0;
      font-size: 1.2rem;
    }
    
    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      padding: 0 5px;
    }
    
    .video-container {
      width: 100%;
    }
    
    video {
      width: 100%;
      display: block;
    }
    
    .video-ended-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.6);
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .video-ended-message {
      background-color: rgba(255, 255, 255, 0.9);
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      max-width: 80%;
    }
    
    .video-ended-message span {
      display: block;
      margin-bottom: 15px;
      font-size: 1.2rem;
      font-weight: bold;
    }
    
    .video-ended-message button {
      background-color: #3498db;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      transition: background-color 0.2s;
    }
    
    .video-ended-message button:hover {
      background-color: #2980b9;
    }
    
    .video-container {
      position: relative;
    }
    
    .video-controls {
      display: flex;
      align-items: center;
      padding: 10px;
      background-color: #f0f0f0;
    }
    
    .progress-container {
      flex: 1;
      margin: 0 15px;
    }
    
    .progress-bar {
      height: 8px;
      background-color: #ccc;
      border-radius: 4px;
      margin-bottom: 5px;
      overflow: hidden;
    }
    
    .progress-fill {
      height: 100%;
      background-color: #3498db;
      transition: width 0.1s linear;
    }
    
    .time-display {
      font-size: 0.9rem;
      color: #555;
    }
    
    .restart-btn {
      background-color: #27ae60;
      color: white;
      font-weight: bold;
    }
  `]
})
export class VideoPlayerComponent implements OnInit, OnDestroy {
  @ViewChild('videoPlayer') videoPlayerRef!: ElementRef<HTMLVideoElement>;
  
  isOpen = false;
  videoSource = '';
  videoId = '';
  videoTitle = 'Training Video';
  isPlaying = false;
  currentTime = 0;
  duration = 0;
  progressPercent = 0;
  videoEnded = false;
  saveInterval: any;
  
  get videoElement(): HTMLVideoElement {
    return this.videoPlayerRef?.nativeElement;
  }
  
  constructor(private progressService: TrainingProgressService) {}
  
  ngOnInit(): void {
    // Initialize the periodic save interval (every 5 seconds)
    this.saveInterval = setInterval(() => {
      if (this.isOpen && this.currentTime > 0) {
        this.saveVideoProgress();
      }
    }, 5000);
  }
  
  ngOnDestroy(): void {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
    }
    
    // Save progress before destroying component
    if (this.currentTime > 0) {
      this.saveVideoProgress();
    }
    
    // Clean up video element to avoid memory leaks
    if (this.videoElement) {
      this.videoElement.removeEventListener('seeking', this.preventSeeking.bind(this));
      this.videoElement.pause();
      this.videoElement.src = '';
    }
  }
  
  @HostListener('window:beforeunload')
  saveBeforeUnload(): void {
    this.saveVideoProgress();
  }
  
  openPopup(videoId: string, source: string, title: string = 'Training Video'): void {
    // Reset the previous video state
    if (this.isOpen && this.videoElement) {
      this.videoElement.pause();
      this.saveVideoProgress();
    }
    
    this.videoId = videoId;
    this.videoSource = source;
    this.videoTitle = title;
    this.isOpen = true;
    this.currentTime = 0;
    this.duration = 0;
    this.progressPercent = 0;
    this.isPlaying = false;
    this.videoEnded = false;
    
    // Let the view render first, then initialize the video
    setTimeout(() => {
      this.initializeVideo();
    }, 100);
  }
  
  closePopup(): void {
    // Save progress before closing
    this.saveVideoProgress();
    this.isOpen = false;
    this.isPlaying = false;
    if (this.videoElement) {
      this.videoElement.pause();
    }
  }
  
  onOverlayClick(event: MouseEvent): void {
    // Close popup when clicking outside the video container
    this.closePopup();
  }
  
  togglePlayPause(): void {
    if (this.videoElement) {
      // Nếu video đã kết thúc, phát lại từ đầu
      if (this.videoEnded) {
        this.restartVideo();
        return;
      }
      
      if (this.isPlaying) {
        this.videoElement.pause();
      } else {
        this.videoElement.play();
      }
    }
  }
  
  restartVideo(): void {
    if (this.videoElement) {
      // Đặt vị trí về đầu video
      this.videoElement.currentTime = 0;
      this.currentTime = 0;
      this.videoEnded = false;
      
      // Phát video
      this.videoElement.play();
    }
  }
  
  onVideoPlay(): void {
    this.isPlaying = true;
  }
  
  onVideoPause(): void {
    this.isPlaying = false;
    this.saveVideoProgress();
  }
  
  onVideoEnded(): void {
    this.isPlaying = false;
    this.videoEnded = true;
    
    // Mark the video as completed
    const progress: VideoProgress = {
      videoId: this.videoId,
      currentTime: this.duration,
      duration: this.duration,
      completed: true,
      lastUpdated: new Date().toISOString()
    };
    
    this.progressService.saveVideoProgress(progress);
  }
  
  onTimeUpdate(): void {
    if (this.videoElement) {
      // Update current state
      this.currentTime = this.videoElement.currentTime;
      this.duration = this.videoElement.duration || 0;
      
      // Calculate progress percentage, but ensure it's valid
      if (this.duration > 0 && !isNaN(this.currentTime)) {
        this.progressPercent = Math.min(100, (this.currentTime / this.duration) * 100);
      } else {
        this.progressPercent = 0;
      }
      
      // Auto-save progress every 30 seconds of playback
      if (Math.floor(this.currentTime) % 30 === 0 && this.currentTime > 1) {
        this.saveVideoProgress();
      }
    }
  }
  
  onMetadataLoaded(): void {
    // Once metadata is loaded, check if we need to restore playback position
    if (this.videoElement && this.videoId) {
      const savedProgress = this.progressService.getVideoProgress(this.videoId);
      if (savedProgress && savedProgress.currentTime > 0) {
        // Check if video was completed
        if (savedProgress.completed) {
          // If video was completed, show the ended state
          this.videoEnded = true;
          this.currentTime = savedProgress.duration;
          this.videoElement.currentTime = 0; // Start at beginning for replay
        } 
        // Only set the time if it's not at the end of the video
        else if (savedProgress.currentTime < savedProgress.duration - 1) {
          console.log('Restoring position to:', savedProgress.currentTime);
          this.videoElement.currentTime = savedProgress.currentTime;
          this.currentTime = savedProgress.currentTime;
        }
      }
    }
  }
  
  private initializeVideo(): void {
    if (!this.videoElement) return;
    
    // Remove any existing seeking listener first to prevent duplicates
    this.videoElement.removeEventListener('seeking', this.preventSeeking.bind(this));
    
    // Disable seeking functionality
    this.videoElement.addEventListener('seeking', this.preventSeeking.bind(this));
    
    // Load saved progress - this is now handled by onMetadataLoaded
    // but we'll do a quick check if metadata is already loaded
    if (this.videoElement.readyState >= 1) {
      this.onMetadataLoaded();
    }
  }
  
  private preventSeeking(e: Event): void {
    if (this.videoElement) {
      const seekingTo = this.videoElement.currentTime;
      
      // Don't prevent small time adjustments due to buffering
      if (Math.abs(seekingTo - this.currentTime) > 1) {
        console.log('Seeking prevented', this.currentTime);
        // Prevent the seeking action by setting the time back
        this.videoElement.currentTime = this.currentTime;
      } else {
        // Small adjustment is likely buffering, update our current time
        this.currentTime = this.videoElement.currentTime;
      }
    }
  }
  
  private saveVideoProgress(): void {
    if (!this.videoId || this.currentTime <= 0) return;
    
    const progress: VideoProgress = {
      videoId: this.videoId,
      currentTime: this.currentTime,
      duration: this.duration,
      completed: this.currentTime >= this.duration - 1, // Consider completed if within 1 second of the end
      lastUpdated: new Date().toISOString()
    };
    
    this.progressService.saveVideoProgress(progress);
  }
  
  /**
   * Reset the video player state
   */
  resetPlayer(): void {
    if (this.videoElement) {
      this.videoElement.pause();
      this.videoElement.currentTime = 0;
      this.videoElement.src = '';
    }
    this.currentTime = 0;
    this.duration = 0;
    this.progressPercent = 0;
    this.isPlaying = false;
    this.videoEnded = false;
  }
  
  formatTime(seconds: number): string {
    if (isNaN(seconds) || seconds === Infinity) return '00:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}