import { Component,HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParticlesScatterService } from '../../core/services/particles-scatter/particles-scatter.service';

@Component({
  selector: 'app-poem-intro',
  imports: [CommonModule],
  standalone:true,
  templateUrl: './poem-intro.component.html',
  styleUrl: './poem-intro.component.scss'
})
export class PoemIntroComponent {
  private scrollTimeout: any;
  scrimOpacity = 0;
  textBlocks = [
        "  Well, it's time we transcend further!",
        "  Aren't we just a little sprinkle from the sweeping stardust?",
        "  A slight murmur of the encompassing vast?",
        "  Now hear, hear from my little zest!",
        "  One stroke, one tale at a time…",
    ];
    constructor( private scatterService: ParticlesScatterService) {}

    @HostListener('window:scroll', [])
    onScroll(): void {
        clearTimeout(this.scrollTimeout);
        this.scrollTimeout = setTimeout(() => {
            const container = document.querySelector('.poem-scroll-container') as HTMLElement;
            const containerRect = container.getBoundingClientRect();
            const scrollProgress = (window.innerHeight - containerRect.top) / containerRect.height;
              this.scrimOpacity = Math.min(0.30+scrollProgress * 0.05, 0.35);
        }, 100);

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
             this.scatterService.setZoom(3-(index*opacity));
                 this.scatterService.setvelocity(0.002*(index*opacity));
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
}
