import { TestBed } from '@angular/core/testing';

import { TrainingProgressService } from './training-progress.service';

describe('TrainingProgressService', () => {
  let service: TrainingProgressService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrainingProgressService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
