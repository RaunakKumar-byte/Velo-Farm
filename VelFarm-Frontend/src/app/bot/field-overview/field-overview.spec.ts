import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldOverview } from './field-overview';

describe('FieldOverview', () => {
  let component: FieldOverview;
  let fixture: ComponentFixture<FieldOverview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FieldOverview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FieldOverview);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
