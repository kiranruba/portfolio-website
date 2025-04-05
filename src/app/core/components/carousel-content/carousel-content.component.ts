import { Component, Input, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
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
export class CarouselContentComponent implements AfterViewInit {
  @Input() content: any;
   @Input() index!: number; // Add this for alternating layout
  @ViewChild('containerCanvas', { static: false }) containerCanvasRef!: ElementRef;

  get nativeElement(): HTMLElement {
    return this.el.nativeElement;
  }

  constructor(
    private containerService: ParticlesContainerService,
    private el: ElementRef
  ) {}

  ngAfterViewInit(): void {
    if (!this.containerCanvasRef) return;

    this.containerService.initThreeJS(this.containerCanvasRef.nativeElement);
    this.containerService.loadParticles(this.content.section);

    setTimeout(() => {
      if (this.containerService.isAnimating) {
        this.containerService.morphEffect("modelJump",true);
        this.containerService.morphEffect("modelBubbleHueShift",false);
        this.containerService.morphEffect("modelPulseBlue",true);

         this.containerService.morphEffect("modelSway",true);
        this.containerService.animate();
      }
    }, 500);
  }
}
