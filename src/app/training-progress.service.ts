import { Injectable } from '@angular/core';

export interface SlideProgress {
  totalSlides: number;
  viewedSlides: number[];
  currentSlideIndex: number;
  progressPercent: number;
  lastUpdated: string;
}

@Injectable({ providedIn: 'root' })
export class TrainingProgressService {
  private STORAGE_KEY = 'trainingProgress';

  getProgress(): SlideProgress | null {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  }

  saveProgress(progress: SlideProgress): void {
    progress.lastUpdated = new Date().toISOString();
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progress));
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
