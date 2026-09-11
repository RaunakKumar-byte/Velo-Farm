import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sprayer } from './sprayer';

describe('Sprayer', () => {
  let component: Sprayer;
  let fixture: ComponentFixture<Sprayer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Sprayer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Sprayer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
