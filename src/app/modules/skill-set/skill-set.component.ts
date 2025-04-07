import {  Component,  ElementRef,  HostListener,  OnInit,  ViewChild,  AfterViewInit} from "@angular/core";
import { FetchDataService } from "../../core/services/fetch-data/fetch-data.service";
import { CommonModule } from "@angular/common";
import { CarouselContentComponent } from "../../core/components/carousel-content/carousel-content.component";
import { ParticlesContainerService } from "../../core/services/particles-container/particles-container.service";

@Component({
  selector: "app-skill-set",
  imports: [CommonModule, CarouselContentComponent],
  standalone: true,
  templateUrl: "./skill-set.component.html",
  styleUrl: "./skill-set.component.scss",
  providers: [ParticlesContainerService],
})
export class SkillSetComponent implements OnInit, AfterViewInit {
  @ViewChild("containerCanvas", { static: false })
  containerCanvasRef!: ElementRef;
  private transitionDuration = 3000;
  private retryCount = 0;
  private readonly maxRetries = 20;
  private readonly retryDelay = 500;
  carouselItems: any[] = [];
  scrimOpacity = 0;
  active: boolean = false;
  activeIndex: number = -1;
  textParts: string[] = [
    "The box, by itself, never matters.",
    "But how it evolves,",
    "endures, and emerges—",
    "",
    "Through the lows and the highs,",
    "between twisted breaks,",
    "and fate's folly plays—",
    "",
    "Is what truly matters!",
  ];
  constructor(
    private skillsService: FetchDataService,
    private containerService: ParticlesContainerService,
    private el: ElementRef
  ) {}
  ngOnInit(): void {
    this.skillsService.getSkills().subscribe((data) => {
      this.carouselItems = data;
    });
  }
  ngAfterViewInit(): void {
    this.checkVisibility();
   this.initializeCanvasAndParticles();
  }
  @HostListener("window:scroll", [])
  onScroll(): void {
    this.checkVisibility();
    const container = document.querySelector(".carousel-scroll-container") as HTMLElement;
    const containerRect = container.getBoundingClientRect();
    const scrollProgress =
      (window.innerHeight - containerRect.top) / containerRect.height;

    // Control scrim effect
    this.scrimOpacity = Math.min(0.15 + scrollProgress * 0.25, 0.25);
  }

  getStyle(index: number) {
    const totalItems = this.carouselItems.length;
    const segmentSize = 1 / totalItems;

    const bufferStart = 0.2;
    const bufferEnd = 0.8;

    const revealStart =
      bufferStart + index * segmentSize * (bufferEnd - bufferStart);
    const revealEnd = revealStart + segmentSize * (bufferEnd - bufferStart);

    const holdDuration = 1; // Amount of time opacity stays at 1
    const fadeStart = revealStart + (revealEnd - revealStart) * holdDuration;

    const container = document.querySelector(".carousel-scroll-container") as HTMLElement;
    const containerRect = container.getBoundingClientRect();
    const scrollProgress =
      (window.innerHeight - containerRect.top) / containerRect.height;

    if (scrollProgress >= revealStart && scrollProgress < revealEnd) {
      let opacity;
      if (scrollProgress < fadeStart) {
        opacity = 1; // Hold opacity at 1 during the hold phase
      } else {
        opacity = 1 - (scrollProgress - fadeStart) / (revealEnd - fadeStart);
      }

      const contentHeight =
        document.querySelector(".carousel-copy")?.getBoundingClientRect()
          .height || 0;
      const topOffset = (window.innerHeight - contentHeight) / 2;

      const translateY = (1 - opacity) * 100;

      return {
        opacity: opacity,
        transform: `translateY(${translateY}px)`,
        top: `${topOffset}px`,
      };
    } else {
      return {
        opacity: 0,
        transform: `translateY(100px)`,
        top: "100vh",
      };
    }
  }
  private initializeCanvasAndParticles(): void {
  if (!this.containerCanvasRef?.nativeElement) {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      setTimeout(() => this.initializeCanvasAndParticles(), this.retryDelay);
    } else {
    }
    return;
  }

  this.retryCount = 0;

  this.containerService.initThreeJS(this.containerCanvasRef.nativeElement);
  this.containerService.loadParticles("box");

  if (this.containerService.isAnimating) {
    this.containerService.animate();
  }

  setTimeout(() => {
    if (this.containerService.isAnimating) {
      this.containerService.animate();
    }
  }, 500);

  // Schedule repeated morph transitions
  setTimeout(() => {
    setInterval(() => {
      this.containerService.setTarget();
    }, this.transitionDuration);
  }, this.transitionDuration);
}

  private checkVisibility(): void {
    const section = document.getElementById("box-out-section");
    if (!section) return;

    const sectionTop = section.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;

    if (sectionTop < windowHeight * 0.8) {
      section.classList.add("active");
    }
  }
}
