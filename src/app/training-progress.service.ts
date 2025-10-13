import { Injectable } from '@angular/core';

export interface SlideProgress {
  totalSlides: number;
  viewedSlides: number[];
  currentSlideIndex: number;
  progressPercent: number;
  lastUpdated: string;
}

export interface VideoProgress {
  videoId: string;
  currentTime: number;
  duration: number;
  completed: boolean;
  lastUpdated: string;
}

@Injectable({ providedIn: 'root' })
export class TrainingProgressService {
  private STORAGE_KEY = 'trainingProgress';
  private VIDEO_STORAGE_KEY = 'videoProgress';

  getProgress(): SlideProgress | null {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  }

  saveProgress(progress: SlideProgress): void {
    progress.lastUpdated = new Date().toISOString();
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progress));
  }
  
  getVideoProgress(videoId: string): VideoProgress | null {
    const allVideoProgress = this.getAllVideoProgress();
    return allVideoProgress.find(vp => vp.videoId === videoId) || null;
  }
  
  getAllVideoProgress(): VideoProgress[] {
    const data = localStorage.getItem(this.VIDEO_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }
  
  saveVideoProgress(progress: VideoProgress): void {
    progress.lastUpdated = new Date().toISOString();
    
    // Get existing video progress array
    const allProgress = this.getAllVideoProgress();
    
    // Update or add the current video progress
    const index = allProgress.findIndex(vp => vp.videoId === progress.videoId);
    if (index !== -1) {
      allProgress[index] = progress;
    } else {
      allProgress.push(progress);
    }
    
    // Save back to storage
    localStorage.setItem(this.VIDEO_STORAGE_KEY, JSON.stringify(allProgress));
  }

  resetProgress(totalSlides: number): SlideProgress {
    const progress: SlideProgress = {
      totalSlides,
      viewedSlides: [],
      currentSlideIndex: 1,
      progressPercent: 0,
      lastUpdated: new Date().toISOString(),
    };
    this.saveProgress(progress);
    return progress;
  }
}
