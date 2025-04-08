import { Component, HostListener, Input, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
@Component({
  selector: "app-navbar",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./navbar.component.html",
  styleUrl: "./navbar.component.scss",
})
export class NavbarComponent implements OnInit {
  constructor(private breakpointObserver: BreakpointObserver) {}
  @Input() sectionIds: string[] = [];
  isNavbarVisible = true;
  isMenuOpen = false;
  isMobile: boolean = false;
  isnotTablet: boolean = false;

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    if (this.isMenuOpen && this.isMobile) {
      document.documentElement.classList.add("no-scroll");
    } else {
      document.documentElement.classList.remove("no-scroll");
    }
  }

  ngOnInit(): void {
    this.breakpointObserver
      .observe(['(max-width: 1199px)'])
      .subscribe((result) => {
        this.isMobile = result.matches;
      });
      this.breakpointObserver
   .observe(['(max-width: 768px)'])
   .subscribe((result) => {
     this.isnotTablet = result.matches;
   });

    setTimeout(() => {
      this.checkActiveSection();
    }, 1000);
  }


  @HostListener("window:scroll", [])
  onScroll(): void {
    this.checkActiveSection();
  }

  @HostListener("mouseenter")
  onMouseEnter(): void {
    this.isNavbarVisible = true;
  }

  @HostListener("mouseleave")
  onMouseLeave(): void {
    const activeSectionIndex = this.getActiveSectionIndex();
    this.isNavbarVisible = activeSectionIndex === 0;
  }
  @HostListener("document:keydown.escape", ["$event"])
  handleEscapeKey(event: KeyboardEvent) {
    if (this.isMenuOpen) {
      this.toggleMenu();
    }
  }
  private checkActiveSection(): void {
    const activeSectionIndex = this.getActiveSectionIndex();
    this.isNavbarVisible = activeSectionIndex === 0;
  }

  private getActiveSectionIndex(): number {
    let activeIndex = 0;
    for (let i = 0; i < this.sectionIds.length; i++) {
      const section = document.getElementById(this.sectionIds[i]);
      if (section) {
        const rect = section.getBoundingClientRect();
        if (
          rect.top <= window.innerHeight * 0.5 &&
          rect.bottom >= window.innerHeight * 0.5
        ) {
          activeIndex = i;
          break;
        }
      }
    }
    return activeIndex;
  }
  scrollToSection(sectionId: string): void {
    const section = document.getElementById(sectionId);
    if (section) {
      window.scrollTo({
        top: section.offsetTop,
        behavior: "smooth",
      });
    }
    this.toggleMenu();
  }
}
