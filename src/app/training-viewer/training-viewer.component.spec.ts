import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingViewerComponent } from './training-viewer.component';

describe('TrainingViewerComponent', () => {
  let component: TrainingViewerComponent;
  let fixture: ComponentFixture<TrainingViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainingViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
