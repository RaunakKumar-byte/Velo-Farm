import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiseaseDetection } from './disease-detection';

describe('DiseaseDetection', () => {
  let component: DiseaseDetection;
  let fixture: ComponentFixture<DiseaseDetection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DiseaseDetection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiseaseDetection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
