import { Component, OnInit, HostListener } from "@angular/core";
import { FetchDataService } from "../../core/services/fetch-data/fetch-data.service";
import { Project } from "../../core/models/model.interface";
import { CommonModule } from "@angular/common";
import { DynamicModalComponent } from "../../core/components/dynamic-modal/dynamic-modal.component";
import { Location } from "@angular/common";
@Component({
  selector: "app-projects",
  imports: [CommonModule, DynamicModalComponent],
  templateUrl: "./projects.component.html",
  styleUrl: "./projects.component.scss",
  standalone: true,
})
export class ProjectsComponent implements OnInit {
  projects: Project[] = [];
  private scrollPosition = 0;
  hoverMessage: boolean = false;
  constructor(
    private projectService: FetchDataService,
    private location: Location,
  ) {}

  ngOnInit(): void {
    this.projectService.getProjects().subscribe((data) => {
      this.projects = data;
    });
  }
  selectedProject: any = null;
  openMailClient() {
    const email = "kiranrubamuraliraj@yahoo.com";
    const subject = encodeURIComponent("Let's Connect!");
    const body = encodeURIComponent(
      "Hi Kiran,\n\nI came across your website and would love to connect."
    );

    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  }
  openModal(project: any) {
    this.selectedProject = project;
    history.pushState({ modalOpen: true }, "", "/modal-open");

    document.documentElement.classList.add("no-scroll");
    window.addEventListener("popstate", this.handleBrowserBack);
  }
  @HostListener("document:keydown.escape", ["$event"])
  handleEscapeKey(event: KeyboardEvent) {
    if (this.selectedProject) {
      this.closeModal();
    }
  }

  closeModal() {
    this.selectedProject = null;
    document.documentElement.classList.remove("no-scroll"); // Add to `<html>`
    if (window.history.state?.modalOpen) {
      history.back();
    } else {
      this.location.replaceState("/");
    }
    window.removeEventListener("popstate", this.handleBrowserBack);
  }
  handleBrowserBack = (): void => {
    if (this.selectedProject) {
      this.closeModal();
    }
  };
}
