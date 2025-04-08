import {  Component,  AfterViewInit,  ViewChild,  ElementRef,  OnDestroy,  HostListener} from "@angular/core";
import { ParticlesScatterService } from "../../core/services/particles-scatter/particles-scatter.service";
import { ParticlesContainerService } from "../../core/services/particles-container/particles-container.service";
import { gsap } from "gsap";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-hero",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./hero.component.html",
  styleUrls: ["./hero.component.scss"],
  providers: [ParticlesContainerService], // Ensure services are available
})
export class HeroComponent implements AfterViewInit, OnDestroy {
  @ViewChild("containerCanvas", { static: false })
  containerCanvasRef!: ElementRef;
  @ViewChild("scatterCanvas", { static: false }) scatterCanvasRef!: ElementRef;
  private animationFrameId: number | null = null;
  private resizeTimeout: ReturnType<typeof setTimeout> | null = null;
  private hasDecreasedVelocity = false;
  private retryCount = 0;
  private readonly maxRetries = 10;
  private readonly retryDelay = 500;
  constructor(
    private scatterService: ParticlesScatterService,
    private containerService: ParticlesContainerService,
    private el: ElementRef
  ) {}

  ngAfterViewInit(): void {
    this.loadSignatureSVG();
    this.animateTextReveal();
    this.initializeServices();
    this.alignParticlesContainer();
    const observer = new IntersectionObserver(
      (entries) => {
        const isHeroVisible = entries[0].isIntersecting;
        if (isHeroVisible) {
          this.decreaseVelocity();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(this.el.nativeElement);


  }
  @HostListener("window:resize")
  onResize(): void {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }

    this.resizeTimeout = setTimeout(() => {
      this.adjustCanvasSize();
      this.adjustTextScaling();
      }, 200); // Adding a slight delay to optimize performance
  }

  private adjustCanvasSize(): void {
    const containerElement = this.containerCanvasRef?.nativeElement;
    const scatterElement = this.scatterCanvasRef?.nativeElement;

    if (containerElement && scatterElement) {
      containerElement.width = window.innerWidth;
      containerElement.height = window.innerHeight;

      scatterElement.width = window.innerWidth;
      scatterElement.height = window.innerHeight;
      const isMobile = window.innerWidth < 768;
      if (!isMobile)
      this.containerService.resizeRenderer();
      this.scatterService.resizeRenderer();
    }
  }

  private adjustTextScaling(): void {
    const textContainer =
      this.el.nativeElement.querySelector(".text-container");
    if (textContainer) {
      const scaleFactor = window.innerWidth < 768 ? 1.2 : 1;
      gsap.to(textContainer, { scale: scaleFactor, duration: 0.5 });
    }
  }

  private initializeServices(): void {
    const canvasReady =
      this.containerCanvasRef?.nativeElement && this.scatterCanvasRef?.nativeElement;

    if (!canvasReady) {
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        setTimeout(() => this.initializeServices(), this.retryDelay);
      }
      return;
    }

    // Reset retry count when canvas is ready
    this.retryCount = 0;

    // Init both services
    this.scatterService.initThreeJS(this.scatterCanvasRef.nativeElement);
    this.containerService.initThreeJS(this.containerCanvasRef.nativeElement);
    this.containerService.loadParticles("home");

    // Delay to check if animation started
    setTimeout(() => {
      if (!this.containerService.isAnimating) {
        if (this.retryCount < this.maxRetries) {
          this.retryCount++;
          this.initializeServices(); // Retry everything again
        }
        return;
      }

      // Success: trigger animation
      this.containerService.animate();
    }, 1500);
  }

  private loadSignatureSVG(): void {
    fetch("branding/sign.svg")
      .then((response) => response.text())
      .then((svgContent) => {
        const container = this.el.nativeElement.querySelector(
          "#signature-container"
        );
        setTimeout(() => {
          container.innerHTML = svgContent;
          const path = this.el.nativeElement.querySelector(".signature-path");
          if (!path) {
            // console.error("Signature path not found!");
            return;
          }

          const length = path.getTotalLength();
          path.style.strokeDasharray = length.toString();
          path.style.strokeDashoffset = length.toString();

          gsap.fromTo(
            path,
            { strokeDashoffset: length, opacity: 0 },
            {
              strokeDashoffset: 0,
              opacity: 1,
              duration: 3, // Slower draw effect
              ease: "power2.inOut",
            }
          );

          gsap.to(path, {
            filter: "drop-shadow(0px 0px 4px rgba(167, 200, 233, 0.4))",
            duration: 2,
            delay: 1, // Delayed glow for better pacing
          });
          this.alignParticlesContainer();
        }, 200);
      });
  }
  private animateTextReveal(): void {
    const textContainer =
      this.el.nativeElement.querySelector(".text-container");
    gsap.killTweensOf(textContainer);
    gsap.set(textContainer, { opacity: 0, scale: 1.5, y: "10%" });
    gsap.set(textContainer, {
      opacity: 0,
      scale: 1.5,
      y: "5%",
      filter: "blur(10px)",
    });
    gsap.to(textContainer, {
      opacity: 0.9,
      scale: 1,
      y: "-8%",
      filter: "blur(0px)", // Clear text as it animates in
      duration: 2.5,
      ease: "cubic-bezier(0.25, 1, 0.5, 1)",
      delay: 2,
    });
  }


  decreaseVelocity(duration: number = 500) {
    if (this.hasDecreasedVelocity) return; // Prevent duplicate calls

    const startValue = 0.09;
    const endValue = 0.002;
    const interval = 10;
    const steps = duration / interval;
    const decrement = (startValue - endValue) / steps;
    let currentValue = startValue;
    const intervalId = setInterval(() => {
      currentValue -= decrement;
      this.scatterService.setvelocity(currentValue);
      if (currentValue <= endValue) {
        this.scatterService.setvelocity(endValue);
        clearInterval(intervalId);
        this.hasDecreasedVelocity = true; // Mark as completed
      }
    }, interval);
  }
  private alignParticlesContainer(): void {
    const isMobile = window.innerWidth < 768;
    const isPortrait = window.matchMedia("(orientation: portrait)").matches;
    if (isMobile || isPortrait) return;

    const signature = this.el.nativeElement.querySelector('#signature-container');
    const particles = this.containerCanvasRef?.nativeElement;
    const svg = this.el.nativeElement.querySelector('#signature-container svg');
    const svgRect = svg.getBoundingClientRect();
    const svgWidth = svgRect.width;

    if (signature && particles) {
      const signatureRect = signature.getBoundingClientRect();

      // Position the particle container at the end of the signature
      const left =(svgWidth-signatureRect.left )
// signatureRect.width;signatureRect.left
      particles.style.position = 'absolute';
      particles.style.left = `${left}px`;
      // particles.style.top = `${signatureRect.top}px`; // Optional: align vertically to signature top
    }
  }



  ngOnDestroy(): void {
    this.containerService.disposeParticles();
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
  }
}
