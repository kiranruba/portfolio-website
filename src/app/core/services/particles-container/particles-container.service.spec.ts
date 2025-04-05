import { TestBed } from '@angular/core/testing';

import { ParticlesContainerService } from './particles-container.service';

describe('ParticlesContainerService', () => {
  let service: ParticlesContainerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ParticlesContainerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
