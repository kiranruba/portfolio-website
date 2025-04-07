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
     });

     // this.disableParticles = this.isLowEndGPU();

   if (!this.disableParticles) {
     this.particlesAnimate();
   }
  }
  ngOnDestroy(): void {
  this.containerService.destroy();
}
  particlesAnimate(): void {
    if (this.containerCanvasRef?.nativeElement) {
      this.containerService.initThreeJS(this.containerCanvasRef.nativeElement);
      this.containerService.loadParticles(this.modal_data.section);

      setTimeout(() => {
        this.containerService.animate();
      }, 500);
    } else if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      setTimeout(() => this.particlesAnimate(), 500);
    } else {
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
  isLowEndGPU(): boolean {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") as WebGLRenderingContext | null
              || canvas.getContext("experimental-webgl") as WebGLRenderingContext | null;

      if (!gl) return true;

      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      if (!debugInfo) return false;

      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)?.toLowerCase();
      const lowEndKeywords = ["mali", "adreno 3", "powervr", "intel hd", "apple a7", "apple a8"];
      return lowEndKeywords.some(keyword => renderer.includes(keyword));
    } catch {
      return true;
    }
  }



  highlightText(text: string, highlights: string[]): string {
    if (!highlights?.length) return text;

    return highlights.reduce((updatedText, word) => {
      const regex = new RegExp(`(${word.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")})`, "gi");
      return updatedText.replace(regex, `<span class="highlight">$1</span>`);
    }, text);
  }
}
