import { TestBed } from '@angular/core/testing';

import { MorphEffectService } from './morph-effect.service';

describe('MorphEffectService', () => {
  let service: MorphEffectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MorphEffectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
