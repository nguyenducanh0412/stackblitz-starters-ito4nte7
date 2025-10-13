import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { timer, Subscription, interval } from 'rxjs';
import {
  SlideProgress,
  TrainingProgressService,
  VideoProgress
} from '../training-progress.service';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { CommonModule } from '@angular/common';
import { VideoPlayerComponent } from '../video-player/video-player.component';

@Component({
  selector: 'app-training-viewer',
  templateUrl: './training-viewer.component.html',
  styleUrls: ['./training-viewer.component.scss'],
  imports: [NgxExtendedPdfViewerModule, CommonModule, VideoPlayerComponent],
})
export class TrainingViewerComponent implements OnInit, OnDestroy {
  // PDF Configuration
  pdfUrl = './CV_Dinh-Cong-Truong.pdf';
  totalSlides = 5; // có thể lấy từ metadata hoặc API

  // Navigation State
  currentPage = 1;
  allowNext = false;
  showPopup = false;

  // Progress Tracking
  progress!: SlideProgress;
  
  // Video Player
  @ViewChild(VideoPlayerComponent) videoPlayer!: VideoPlayerComponent;
  showVideoPopup = false;
  trainingVideos = [
    {
      id: 'video1',
      title: 'Introduction to Training',
      source: 'https://storage.googleapis.com/muxdemofiles/mux-video-intro.mp4',
      thumbnail: 'https://images.pexels.com/photos/6953871/pexels-photo-6953871.jpeg'
    },
    {
      id: 'video2',
      title: 'Advanced Training Techniques',
      source: 'https://storage.googleapis.com/muxdemofiles/mux-video-intro.mp4',
      thumbnail: 'https://images.pexels.com/photos/5428826/pexels-photo-5428826.jpeg'
    }
  ];

  // Timer Management
  timerSub?: Subscription;
  countdownSub?: Subscription;
  countdown = 5; // seconds
  timerProgress = 0; // 0-100%

  // Constants
  readonly SLIDE_TIMER_DURATION = 5000; // 5 seconds

  // Navigation Control
  zoomLevel = '100%';
  showNavigationBlockedMessage = false;
  private navigationBlockTimeout?: any;

  constructor(private progressService: TrainingProgressService) {}

  ngOnInit() {
    // Load existing progress or create new
    const saved = this.progressService.getProgress();
    if (saved) {
      this.progress = saved;
      // Resume from last viewed slide
      this.currentPage = saved.currentSlideIndex;
    } else {
      this.progress = this.progressService.resetProgress(this.totalSlides);
    }

    // Don't auto-start timer, wait for popup to open
  }

  // ===== POPUP MANAGEMENT =====

  /**
   * Open slide viewer popup
   * Implements requirement: Cover Image Snap & Slide Viewer Popup
   */
  openSlidePopup(): void {
    this.showPopup = true;
    // Ensure we start from the correct page
    this.updateCurrentPage(this.progress.currentSlideIndex);
    
    // Check if current slide has been viewed before marking it as viewed
    const isAlreadyViewed = this.progress.viewedSlides.includes(this.progress.currentSlideIndex);
    
    // Only start timer if current slide hasn't been viewed before
    if (!isAlreadyViewed) {
      this.startSlideTimer();
    } else {
      // If slide already viewed, allow immediate navigation
      this.allowNext = true;
      this.countdown = 0;
      this.timerProgress = 100;
    }
    
    // Mark current slide as viewed
    this.updateProgress();

    // Add global keyboard event listener to block navigation
    document.addEventListener(
      'keydown',
      this.globalKeydownHandler.bind(this),
      true
    );
  }

  /**
   * Close slide viewer popup and save progress
   * Implements requirement: Lưu tiến độ khi đóng popup
   */
  closeSlidePopup(): void {
    this.showPopup = false;
    this.stopTimers();
    this.saveProgress();

    // Remove global keyboard event listener
    document.removeEventListener(
      'keydown',
      this.globalKeydownHandler.bind(this),
      true
    );
  }

  /**
   * Handle clicks on popup overlay
   */
  onPopupOverlayClick(event: Event): void {
    // Close popup when clicking outside
    this.closeSlidePopup();
  }

  // ===== NAVIGATION CONTROLS =====

  /**
   * Handle page change events from PDF viewer
   * Implements requirement: Điều khiển chuyển slide
   */
  onPageChange(newPage: number): void {
    // Completely prevent any navigation from PDF viewer
    // Only allow navigation through our controlled buttons
    console.log('Page change blocked:', newPage, 'Current:', this.currentPage);
    this.showNavigationBlockedMessage = true;

    // Hide message after 2 seconds
    clearTimeout(this.navigationBlockTimeout);
    this.navigationBlockTimeout = setTimeout(() => {
      this.showNavigationBlockedMessage = false;
    }, 2000);

    // Force PDF viewer to stay on current page
    // Note: We removed two-way binding [(page)] and use [page] only
    return;
  }

  /**
   * Navigate to previous slide
   */
  goToPreviousSlide(): void {
    if (this.currentPage > 1) {
      this.navigateToSlide(this.currentPage - 1);
    }
  }

  /**
   * Navigate to next slide
   * Implements requirement: 5 second timer enforcement
   */
  goToNextSlide(): void {
    if (this.allowNext && this.currentPage < this.totalSlides) {
      this.navigateToSlide(this.currentPage + 1);
    }
  }

  /**
   * Navigate to specific slide (only through our controlled buttons)
   */
  private navigateToSlide(slideNumber: number): void {
    this.progress.currentSlideIndex = slideNumber;
    this.updateCurrentPage(slideNumber);
    
    // Check if slide has been viewed before updating progress
    const isAlreadyViewed = this.progress.viewedSlides.includes(slideNumber);
    
    // Update progress (this will add the slide to viewedSlides)
    this.updateProgress();
    
    // Only start timer if this slide hasn't been viewed before
    if (!isAlreadyViewed) {
      this.startSlideTimer();
    } else {
      // If slide already viewed, allow immediate navigation
      this.allowNext = true;
      this.countdown = 0;
      this.timerProgress = 100;
      this.stopTimers();
    }
  }

  // ===== TIMER MANAGEMENT =====

  /**
   * Start 5-second slide timer
   * Implements requirement: 5 giây mỗi slide
   */
  startSlideTimer(): void {
    this.stopTimers();
    this.allowNext = false;
    this.countdown = 5;
    this.timerProgress = 0;

    // Main timer - allows next after 5 seconds
    this.timerSub = timer(this.SLIDE_TIMER_DURATION).subscribe(() => {
      this.allowNext = true;
      this.countdown = 0;
      this.timerProgress = 100;
    });

    // Countdown timer - updates every second for whole numbers
    this.countdownSub = interval(1000).subscribe(() => {
      this.countdown -= 1;
      this.timerProgress = ((5 - this.countdown) / 5) * 100;

      if (this.countdown <= 0) {
        this.countdown = 0;
        this.timerProgress = 100;
        this.countdownSub?.unsubscribe();
      }
    });
  }

  /**
   * Stop all timers
   */
  private stopTimers(): void {
    this.timerSub?.unsubscribe();
    this.countdownSub?.unsubscribe();
  }

  /**
   * Format countdown time for display
   */
  formatTime(seconds: number): string {
    return seconds.toString();
  }

  // ===== PROGRESS MANAGEMENT =====

  /**
   * Update and calculate progress
   * Implements requirement: Progress = (Slides viewed ÷ Total slides) × 100%
   */
  updateProgress(): void {
    // Add current slide to viewed slides if not already present
    if (!this.progress.viewedSlides.includes(this.currentPage)) {
      this.progress.viewedSlides.push(this.currentPage);
    }

    // Calculate progress percentage
    this.progress.progressPercent =
      (this.progress.viewedSlides.length / this.progress.totalSlides) * 100;

    // Auto-save progress
    this.progressService.saveProgress(this.progress);
  }

  /**
   * Manually save progress
   */
  saveProgress(): void {
    this.progressService.saveProgress(this.progress);
    console.log('Progress saved:', this.progress);
  }

  /**
   * Legacy method for compatibility
   */
  onClosePopup(): void {
    this.closeSlidePopup();
  }

  // ===== NAVIGATION BLOCKING =====

  /**
   * Global keyboard event handler to block all navigation
   */
  globalKeydownHandler(event: KeyboardEvent): void {
    if (this.showPopup) {
      this.preventKeyboardNavigation(event);
    }
  }

  /**
   * Prevent keyboard navigation (Arrow keys, Page Up/Down, Home, End, etc.)
   */
  preventKeyboardNavigation(event: KeyboardEvent): void {
    const blockedKeys = [
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'PageUp',
      'PageDown',
      'Home',
      'End',
      'Space',
      'Enter',
      'Backspace',
      ' ', // Space bar
    ];

    if (blockedKeys.includes(event.key)) {
      event.preventDefault();
      event.stopPropagation();
      this.showNavigationBlockedMessage = true;

      clearTimeout(this.navigationBlockTimeout);
      this.navigationBlockTimeout = setTimeout(() => {
        this.showNavigationBlockedMessage = false;
      }, 2000);

      console.log('Keyboard navigation blocked:', event.key);
    }
  }

  /**
   * Prevent scroll navigation (mouse wheel, trackpad scroll)
   */
  preventScrollNavigation(event: WheelEvent): void {
    // Block scroll events that could trigger page changes
    event.preventDefault();
    event.stopPropagation();

    this.showNavigationBlockedMessage = true;

    clearTimeout(this.navigationBlockTimeout);
    this.navigationBlockTimeout = setTimeout(() => {
      this.showNavigationBlockedMessage = false;
    }, 1500);

    console.log('Scroll navigation blocked');
  }

  /**
   * Update current page through controlled navigation only
   */
  private updateCurrentPage(newPage: number): void {
    // Force update the PDF viewer to show correct page
    this.currentPage = newPage;

    // Small delay to ensure PDF viewer updates
    setTimeout(() => {
      // Additional force update if needed
      const pdfViewer = document.querySelector('ngx-extended-pdf-viewer');
      if (pdfViewer) {
        // Trigger a re-render
        (pdfViewer as any).page = this.currentPage;
      }
    }, 100);
  }
  
  // ===== VIDEO PLAYER FUNCTIONS =====
  
  /**
   * Opens the video player popup for the selected video
   * @param video The video to play
   */
  openVideoPlayer(video: any): void {
    if (!this.videoPlayer) {
      console.error('Video player component not found');
      return;
    }
    
    // There was an issue with ViewChild not being available immediately 
    // after component initialization
    setTimeout(() => {
      this.videoPlayer.openPopup(video.id, video.source, video.title);
    }, 0);
  }
  
  /**
   * Gets the progress information for a specific video
   * @param videoId The ID of the video
   */
  getVideoProgress(videoId: string): VideoProgress | null {
    return this.progressService.getVideoProgress(videoId);
  }
  
  /**
   * Calculates the progress percentage for a video
   * @param videoId The ID of the video
   */
  getVideoProgressPercent(videoId: string): number {
    const progress = this.getVideoProgress(videoId);
    if (progress && progress.duration > 0) {
      return Math.floor((progress.currentTime / progress.duration) * 100);
    }
    return 0;
  }
  
  /**
   * Check if a video has been completed
   * @param videoId The ID of the video
   */
  isVideoCompleted(videoId: string): boolean {
    const progress = this.getVideoProgress(videoId);
    return progress?.completed || false;
  }

  // ===== LIFECYCLE HOOKS =====

  ngOnDestroy(): void {
    this.stopTimers();
    clearTimeout(this.navigationBlockTimeout);

    // Clean up global event listener
    if (this.showPopup) {
      document.removeEventListener(
        'keydown',
        this.globalKeydownHandler.bind(this),
        true
      );
    }

    this.saveProgress();
  }
}
