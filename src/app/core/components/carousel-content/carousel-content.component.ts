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
    const maxRetries = 10;
    let retryCount = 0;

    const initialize = () => {
      const canvas = this.containerCanvasRef?.nativeElement;

      if (!canvas) {
        requestAnimationFrame(waitForCanvas);
        return;
      }

      this.containerService.initThreeJS(canvas);
      this.containerService.loadParticles(this.content.section);

      setTimeout(() => {
        if (!this.containerService.isAnimating) {
          if (retryCount < maxRetries) {
            retryCount++;
            initialize(); // Retry full init
          }
          return;
        }

        // Success: morph and animate
        this.containerService.morphEffect("modelJump", true);
        this.containerService.morphEffect("modelBubbleHueShift", false);
        this.containerService.morphEffect("modelPulseBlue", true);
        this.containerService.morphEffect("modelSway", true);
        this.containerService.animate();
      }, 1000);
    };

    const waitForCanvas = () => {
      if (!this.containerCanvasRef?.nativeElement) {
        requestAnimationFrame(waitForCanvas);
      } else {
        initialize(); // Canvas is ready → start init loop
      }
    };

    waitForCanvas();
  }


  ngOnDestroy(): void {
    if (this.observer && this.containerCanvasRef) {
      this.observer.unobserve(this.containerCanvasRef.nativeElement);
    }
    this.containerService.disposeParticles(); // Just in case
  }

}
