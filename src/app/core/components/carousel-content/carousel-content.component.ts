import { Component, Input, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParticlesContainerService } from '../../services/particles-container/particles-container.service';

@Component({
  selector: 'app-carousel-content',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './carousel-content.component.html',
  styleUrl: './carousel-content.component.scss',
  providers: [ParticlesContainerService],
})
export class CarouselContentComponent implements AfterViewInit ,OnDestroy{
  @Input() content: any;
   @Input() index!: number; // Add this for alternating layout
  @ViewChild('containerCanvas', { static: false }) containerCanvasRef!: ElementRef;
  // @ViewChild('container', { static: true }) containerRef!: ElementRef;
  private observer!: IntersectionObserver;

  get nativeElement(): HTMLElement {
    return this.el.nativeElement;
  }

  constructor(
    private containerService: ParticlesContainerService,
    private el: ElementRef
  ) {}

  ngAfterViewInit(): void {
  const waitForCanvas = () => {
    if (!this.containerCanvasRef?.nativeElement) {
      requestAnimationFrame(waitForCanvas); // Keep retrying until defined
      return;
    }
    this.containerService.initThreeJS(this.containerCanvasRef.nativeElement);
    this.containerService.loadParticles(this.content.section);

    setTimeout(() => {
      if (this.containerService.isAnimating) {
        this.containerService.morphEffect("modelJump", true);
        this.containerService.morphEffect("modelBubbleHueShift", false);
        this.containerService.morphEffect("modelPulseBlue", true);
        this.containerService.morphEffect("modelSway", true);
        this.containerService.animate();
      }
    }, 500);
    // Canvas is now defined, set up the observer
    this.observer = new IntersectionObserver(
      (entries) => {
        for (let entry of entries) {
          if (entry.isIntersecting) {
            this.containerService.initThreeJS(this.containerCanvasRef.nativeElement);
            this.containerService.loadParticles(this.content.section);

            setTimeout(() => {
              if (this.containerService.isAnimating) {
                this.containerService.morphEffect("modelJump", true);
                this.containerService.morphEffect("modelBubbleHueShift", false);
                this.containerService.morphEffect("modelPulseBlue", true);
                this.containerService.morphEffect("modelSway", true);
                this.containerService.animate();
              }
            }, 500);
          } else {
            this.containerService.disposeParticles();
          }
        }
      },
      { threshold: 0.4 }
    );

    this.observer.observe(this.containerCanvasRef.nativeElement);
  };

  waitForCanvas(); // Start the loop
}

  ngOnDestroy(): void {
    if (this.observer && this.containerCanvasRef) {
      this.observer.unobserve(this.containerCanvasRef.nativeElement);
    }
    this.containerService.disposeParticles(); // Just in case
  }

}
