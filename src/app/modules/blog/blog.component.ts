import { Component, OnInit, OnDestroy, ElementRef,HostListener, ViewChild,AfterViewInit } from '@angular/core';
import { FetchDataService } from '../../core/services/fetch-data/fetch-data.service';
import{Post} from'../../core/models/model.interface';
import { CommonModule } from '@angular/common';
import{DynamicModalComponent}from '../../core/components/dynamic-modal/dynamic-modal.component';
import { Location } from '@angular/common';
const SLIDE_DURATION = 4000; //  Centralized timing for easy maintenance
// import { ParticlesScatterService } from '../../core/services/particles-scatter/particles-scatter.service';

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
  textBlocks = [
        "  Well, it's time we transcend further!",
        "  Aren't we just a little sprinkle from the sweeping stardust?",
        "  A slight murmur of the encompassing vast?",
        "  Now hear, hear from my little zest!",
        "  One stroke, one tale at a time…",
    ];

  scrimOpacity = 0;
  isControlActive = false;
    private scrollTimeout: any;
    private touchStartX = 0;
    private touchEndX = 0;
    @ViewChild('slideshow') slideshowRef!: ElementRef;
    @HostListener('window:scroll', [])
    onScroll(): void {
        clearTimeout(this.scrollTimeout);
        this.scrollTimeout = setTimeout(() => {
            const container = document.querySelector('.poem-scroll-container') as HTMLElement;
            const containerRect = container.getBoundingClientRect();
            const scrollProgress = (window.innerHeight - containerRect.top) / containerRect.height;
              this.scrimOpacity = Math.min(0.30+scrollProgress * 0.05, 0.35);
        }, 100);
        const section = document.querySelector('.carousel');
        if (section) {
        const sectionTop = section.getBoundingClientRect().top;
        const sectionHeight = section.getBoundingClientRect().height;
        const triggerPoint = window.innerHeight - sectionHeight * 0.75;
        this.isControlActive = sectionTop < triggerPoint;
      }
    }
  constructor(private blogService: FetchDataService, private el: ElementRef,private location: Location,
     // private scatterService: ParticlesScatterService
   ) {}

  ngOnInit(): void {
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
  // this.scatterService.pauseRendering();
  // this.scatterService.resizeRenderer();
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
       // this.scatterService.resumeRendering();
       // this.scatterService.resizeRenderer();
       // this.scatterService.setvelocity(0.002)
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

  getStyle(index: number) {
      const totalItems = 5;
      const revealStart = index * (1 / totalItems);
      const revealEnd = revealStart + (1 / totalItems);

      const container = document.querySelector('.poem-scroll-container') as HTMLElement;
      if (!container) return { opacity: 0, transform: 'translateY(50px)' };

      const containerRect = container.getBoundingClientRect();
      if (containerRect.height === 0) return { opacity: 0, transform: 'translateY(50px)' };

      const scrollProgress = (window.innerHeight - containerRect.top) / containerRect.height;

      if (scrollProgress > revealStart && scrollProgress < revealEnd) {
          const opacity = (scrollProgress - revealStart) / (revealEnd - revealStart);
        //  console.log("am i", index*opacity)
           // this.scatterService.setZoom(3-(index*opacity));
           //     this.scatterService.setvelocity(0.002*(index*opacity));
          return {
              opacity: opacity,
              transform: `translateY(${(1 - opacity) * 50}px)`
          };
      } else if (scrollProgress >= revealEnd) {

          return {

              opacity: 1,
              transform: `translateY(0px)`
          };
      } else {

          return {
              opacity: 0,
              transform: `translateY(50px)`
          };
      }
  }

  handleBrowserBack = (): void => {
   if (this.selectedPost) {
     this.closeModal();
   }
 };

  ngOnDestroy(): void {
    this.stopAutoSlide();
    this.observer?.unobserve(this.el.nativeElement);
    this.observer?.disconnect();
  }
}
