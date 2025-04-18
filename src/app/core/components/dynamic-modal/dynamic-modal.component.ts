import {  Component,  Input,  Output,  EventEmitter,  AfterViewInit, OnDestroy, ViewChild,  ElementRef,} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ParticlesContainerService } from "../../services/particles-container/particles-container.service";

@Component({
  selector: "app-dynamic-modal",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./dynamic-modal.component.html",
  styleUrl: "./dynamic-modal.component.scss",
  providers: [ParticlesContainerService],
})
export class DynamicModalComponent implements AfterViewInit ,OnDestroy{
  @Input() modal_data: any;
  @Output() close = new EventEmitter<void>();

  @ViewChild("containerCanvas", { static: false }) containerCanvasRef!: ElementRef;

  isModalOpen = false;
  isClosing = false;
  disableParticles = false;
  private retryCount = 0;
  private maxRetries =4;
  constructor(private containerService: ParticlesContainerService) {}

  ngAfterViewInit(): void {

    setTimeout(() => {
        this.isModalOpen = true;
        this.particlesAnimate();
     });
  }
  ngOnDestroy(): void {
  this.containerService.destroy();
}
particlesAnimate(): void {
  const canvas = this.containerCanvasRef?.nativeElement;

  if (canvas) {
    this.containerService.initThreeJS(canvas);
    this.containerService.loadParticles(this.modal_data.section);

    setTimeout(() => {
      if (this.containerService.isAnimating) {
        this.containerService.animate();
        this.retryCount = 0; // success
      } else if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        this.particlesAnimate(); // Retry if animation didn’t start
      }
    }, 500);
  } else if (this.retryCount < this.maxRetries) {
    this.retryCount++;
    setTimeout(() => this.particlesAnimate(), 500); // Retry if canvas not ready
  }
}



  closeModal(): void {
    this.isClosing = true;
    // Stop particles & clean up WebGL
    this.containerService.destroy();
    setTimeout(() => {
      this.isModalOpen = false;
      this.isClosing = false;
      this.close.emit();
    }, 1100);
  }



  highlightText(text: string, highlights: string[]): string {
    if (!highlights?.length) return text;

    return highlights.reduce((updatedText, word) => {
      const regex = new RegExp(`(${word.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")})`, "gi");
      return updatedText.replace(regex, `<span class="highlight">$1</span>`);
    }, text);
  }
}
