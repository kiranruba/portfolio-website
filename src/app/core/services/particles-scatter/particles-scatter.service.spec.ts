import { TestBed } from '@angular/core/testing';

import { ParticlesScatterService } from './particles-scatter.service';

describe('ParticlesScatterService', () => {
  let service: ParticlesScatterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ParticlesScatterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
