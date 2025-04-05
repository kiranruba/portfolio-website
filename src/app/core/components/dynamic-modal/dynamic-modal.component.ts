import {  Component,  Input,  Output,  EventEmitter,  AfterViewInit,  ViewChild,  ElementRef,} from "@angular/core";
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
export class DynamicModalComponent implements AfterViewInit {
  @Input() modal_data: any;
  @Output() close = new EventEmitter<void>();

  @ViewChild("containerCanvas", { static: false }) containerCanvasRef!: ElementRef;

  isModalOpen = false;
  isClosing = false;

  constructor(private containerService: ParticlesContainerService) {}

  ngAfterViewInit(): void {
    this.isModalOpen = true;

    if (this.containerCanvasRef) {
      this.containerService.initThreeJS(this.containerCanvasRef.nativeElement);
      this.containerService.loadParticles(this.modal_data.section);

      setTimeout(() => {
        this.containerService.animate();
      }, 500);
    }
  }

  closeModal(): void {
    this.isClosing = true;

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
