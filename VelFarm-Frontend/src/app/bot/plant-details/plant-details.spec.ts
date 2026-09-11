import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantDetails } from './plant-details';

describe('PlantDetails', () => {
  let component: PlantDetails;
  let fixture: ComponentFixture<PlantDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlantDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlantDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
