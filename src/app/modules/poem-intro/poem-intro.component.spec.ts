import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoemIntroComponent } from './poem-intro.component';

describe('PoemIntroComponent', () => {
  let component: PoemIntroComponent;
  let fixture: ComponentFixture<PoemIntroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoemIntroComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoemIntroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
