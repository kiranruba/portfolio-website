import { Component, OnInit, OnDestroy, ElementRef,HostListener, ViewChild,AfterViewInit } from '@angular/core';
import { FetchDataService } from '../../core/services/fetch-data/fetch-data.service';
import{Post} from'../../core/models/model.interface';
import { CommonModule } from '@angular/common';
import{DynamicModalComponent}from '../../core/components/dynamic-modal/dynamic-modal.component';
import { Location } from '@angular/common';
const SLIDE_DURATION = 4000; //  Centralized timing for easy maintenance

@Component({
  selector: 'app-blog',
  imports: [CommonModule,DynamicModalComponent],
  standalone: true,
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.scss'
})
export class BlogComponent implements OnInit, OnDestroy,AfterViewInit {
  posts: Post[] = [];
  Math = Math;
  autoSlideInterval: any;
  interactionPauseTimeout: any;
  observer: IntersectionObserver | null = null;
  active = 0;
  maxVisibility = 3;
  isAnimating = false;
  isPlaying = true;
  progressValue = 0;
  progressStartTime: number | null = null;
  progressPauseTime: number | null = null;
  animationFrameId: number | null = null;
  selectedPost: Post | null = null;
  isLoading = true;
  lastSetTime: number  = 0;
  pauseflag = false;
  isControlActive = false;
  disableParticles = false;
    private touchStartX = 0;
    private touchEndX = 0;
    @ViewChild('slideshow') slideshowRef!: ElementRef;
    @HostListener('window:scroll', [])
    onScroll(): void {
        const section = document.querySelector('.carousel');
        if (section) {
        const sectionTop = section.getBoundingClientRect().top;
        const sectionHeight = section.getBoundingClientRect().height;
        const triggerPoint = window.innerHeight - sectionHeight * 0.75;
        this.isControlActive = sectionTop < triggerPoint;
      }
    }
  constructor(private blogService: FetchDataService, private el: ElementRef,private location: Location, ) {}

  ngOnInit(): void {
    this.disableParticles = this.isLowEndGPU();

    this.blogService.getPosts().subscribe(
      data => {
        this.posts = data;
        this.active = Math.min(this.active, this.posts.length - 1);
        this.isLoading = false;
        this.initObserver();
      },
      error => {
        this.isLoading = false;
      }
    );
  }
  ngAfterViewInit() {
    const el = this.slideshowRef.nativeElement;

    el.addEventListener('touchstart', (e: TouchEvent) => {
      this.touchStartX = e.changedTouches[0].screenX;
    });

    el.addEventListener('touchend', (e: TouchEvent) => {
      this.touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe();
    });
  }
  private handleSwipe(): void {
  const diff = this.touchStartX - this.touchEndX;

  // minimum swipe distance to consider
  if (Math.abs(diff) < 50) return;

  if (diff > 0) {
    // Swiped Left
    this.scrollToIndex(this.active + 1);
  } else {
    // Swiped Right
    this.scrollToIndex(this.active - 1);
  }
}
  initObserver(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        const isVisible = entries[0].isIntersecting;

        isVisible && this.isPlaying ? this.startAutoSlide() : this.stopAutoSlide();
         if (this.disableParticles) {
           if (isVisible) {
                    document.documentElement.classList.add('no-background-canvas'); // Blog is in view → remove particles
                  } else {
                    document.documentElement.classList.remove('no-background-canvas'); // Blog out of view → restore particles
                  }
         }
      },
      { threshold: 0.1 }
    );

    this.observer.observe(this.el.nativeElement);
  }

  startAutoSlide(): void {
      if (!this.isPlaying) return;
      clearTimeout(this.autoSlideInterval);

      const remainingTime = SLIDE_DURATION * (1 - (this.progressValue / 100));

      this.autoSlideInterval = setTimeout(() => {
          if (!this.isPlaying) return;
          this.setActive(this.active + 1);
          this.startAutoSlide();
      }, remainingTime);

      this.startProgress();
  }

  stopAutoSlide(): void {
    clearInterval(this.autoSlideInterval);
    this.autoSlideInterval = null;

    //  Store the exact paused time in milliseconds for accurate resumption
    this.progressPauseTime = performance.now() - (this.progressStartTime || 0);
    this.clearProgress(false); // Don't reset progress on pause
  }

  startProgress(): void {
      this.clearProgress();
      if (!this.isPlaying) return;

      this.progressStartTime = performance.now() - (this.progressPauseTime || 0);

      this.progressPauseTime = null;

      const animateProgress = (timestamp: number) => {
          if (!this.progressStartTime || !this.isPlaying) return;

          const elapsed = timestamp - this.progressStartTime;
          this.progressValue = Math.min((elapsed / SLIDE_DURATION) * 100, 100);

          if (this.progressValue < 100) {
              this.animationFrameId = requestAnimationFrame(animateProgress);
          } else if (this.isPlaying) {
              // Add a slight delay buffer to prevent rapid slide jumps
              setTimeout(() => {
                  if (this.isPlaying) {
                      this.setActive(this.active + 1);
                  }
              }, 100); // Small delay buffer to smooth out timing
          }
      };

      this.animationFrameId = requestAnimationFrame(animateProgress);
  }
  clearProgress(reset = true): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.progressValue = reset ? 0 : this.progressValue;
  }

  togglePlayPause(): void {
    this.isPlaying = !this.isPlaying;

    if (this.isPlaying) {
        this.progressStartTime = performance.now() - (this.progressPauseTime || 0);
        this.startAutoSlide();
    } else {
        this.stopAutoSlide();
    }
  }

setActive(index: number): void {
    if (this.selectedPost || this.isAnimating) return;

    const now = performance.now();

    if (this.lastSetTime && now - this.lastSetTime < SLIDE_DURATION * 0.8) {
        return;
    }

    this.lastSetTime = now;
    this.active = (index + this.posts.length) % this.posts.length;
    this.clearProgress(false);

    if (this.isPlaying) {
        this.startProgress();
        clearTimeout(this.autoSlideInterval);
        this.startAutoSlide();
    }

    this.isAnimating = true;
    requestAnimationFrame(() => {
        setTimeout(() => {
            this.isAnimating = false;
        }, 600);
    });
}
openModal(post: Post): void {
    this.selectedPost = post;
    this.stopAutoSlide();
    history.pushState({ modalOpen: true }, '', '/modal-open');
    document.documentElement.classList.add('no-scroll');
    window.addEventListener('popstate', this.handleBrowserBack);
  }

  @HostListener('document:keydown.escape', ['$event'])
   handleEscapeKey(event: KeyboardEvent) {
     if (this.selectedPost) {
       this.closeModal();
     }
   }


     closeModal(): void {
       this.selectedPost = null;
       document.documentElement.classList.remove('no-scroll');
       if (window.history.state?.modalOpen) {
         history.back();
       } else {
         this.location.replaceState('/');
       }

       if (this.isPlaying) this.startAutoSlide();
       window.removeEventListener('popstate', this.handleBrowserBack);
     }

  scrollToIndex(index: number): void {
      if (this.active === index) return;
      if (index < 0) {
           this.active = this.posts.length - 1;
       } else if (index >= this.posts.length) {
           this.active = 0;
       } else {
           this.active = index;
       }
      //  Clear both progress and auto-slide timing immediately
      this.clearProgress();
      clearTimeout(this.autoSlideInterval);

      // Start progress from 0% for a smooth transition
      this.progressValue = 0;
      this.progressPauseTime = null;
      this.progressStartTime = performance.now();

      if (this.isPlaying) {
          this.startProgress();
          this.startAutoSlide();
      }
  }



  handleBrowserBack = (): void => {
   if (this.selectedPost) {
     this.closeModal();
   }
 };
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


  ngOnDestroy(): void {
    this.stopAutoSlide();
    this.observer?.unobserve(this.el.nativeElement);
    this.observer?.disconnect();
  }
}
