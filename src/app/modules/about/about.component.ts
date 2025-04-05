import {  Component,  AfterViewInit,  HostListener,  ElementRef,  ViewChild} from "@angular/core";
import { CommonModule } from "@angular/common";
@Component({
  selector: "app-about",
  imports: [CommonModule],
  templateUrl: "./about.component.html",
  styleUrl: "./about.component.scss",
  standalone: true,
  providers: [],
})
export class AboutComponent implements AfterViewInit {
  isVisible = false;
  @ViewChild("imageCanvas", { static: false }) imageCanvasRef!: ElementRef;

  constructor() {}
  ngAfterViewInit() {}
  textParts: string[] = [
    "I love making things work.",
    "Be it designing unique, intuitive,",
    " and exciting user experiences,",
    "Integrating cutting-edge technologies, or",
    "Understanding the business behind it,",
    "I blend them into a recipe that truly enchants!",
    "I’m energized by challenging use cases",
    " and dynamic environments—where creativity, technology, and passion",
    " unite to build something extraordinary.",
    "Come! Let’s create something amazing together!",
  ];
  specialIndex: number = this.textParts.indexOf(
    "Come! Let’s create something amazing together!"
  );

  highlightedIndices: number[] = [];

  @ViewChild("scrollsections", { static: true }) section!: ElementRef;

  @HostListener("window:scroll", [])
  onScroll(): void {
    const section = this.section.nativeElement;
    const scrollTop = window.scrollY;
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    const windowHeight = window.innerHeight;

    // Calculate progress for text reveal
    const progress = Math.min(
      Math.max(
        (scrollTop - sectionTop + windowHeight) / sectionHeight / 2,
        0
      ),
      1
    );
    if (scrollTop + windowHeight > sectionTop + sectionHeight * 0.1) {
      this.isVisible = true;
    }

    // Highlight words gradually
    const highlightCount = Math.floor(progress * this.textParts.length);
    this.highlightedIndices = Array.from(
      { length: highlightCount },
      (_, i) => i
    );
    this.highlightedIndices = Array.from(
      { length: highlightCount },
      (_, i) => i
    );

    if (
      !this.highlightedIndices.includes(this.specialIndex) &&
      this.specialIndex <= highlightCount
    ) {
      this.highlightedIndices.push(this.specialIndex);
    }

    // Gradient scaling and opacity logic
    const scaleValue = Math.min(0.5 + scrollTop / 1500, 1.2); // Limits max scale
    const gradientLayers = document.querySelectorAll(".gradient-layer");

    gradientLayers.forEach((layer, index) => {
      const delayFactor = index * 0.2;
      const hueRotation = scrollTop * 0.1;

      (layer as HTMLElement).style.transform = `scale(${
        scaleValue + delayFactor
      })`;
      (layer as HTMLElement).style.opacity = `${0.8 + scrollTop / 3000}`;
      (layer as HTMLElement).style.filter = `blur(${Math.max(10,60 - scrollTop / 20)}px) hue-rotate(${hueRotation * 0.1}deg)`;
    });
  }
}
