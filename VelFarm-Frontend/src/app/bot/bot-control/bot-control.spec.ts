import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BotControl } from './bot-control';

describe('BotControl', () => {
  let component: BotControl;
  let fixture: ComponentFixture<BotControl>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BotControl]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BotControl);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
