import { TestBed } from '@angular/core/testing';
import { LoaderService } from './loader.service';

describe('LoaderService', () => {
  let service: LoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with loading false', () => {
    expect(service.isLoading).toBeFalse();
  });

  it('should show loader when show() is called', () => {
    service.show();
    expect(service.isLoading).toBeTrue();
  });

  it('should hide loader when hide() is called', () => {
    service.show();
    service.hide();
    expect(service.isLoading).toBeFalse();
  });

  it('should emit loading state changes', (done) => {
    const states: boolean[] = [];
    service.loading$.subscribe(state => {
      states.push(state);
      if (states.length === 2) {
        expect(states).toEqual([false, true]);
        done();
      }
    });
    service.show();
  });
});
