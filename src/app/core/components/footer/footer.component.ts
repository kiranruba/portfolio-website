import { Component } from "@angular/core";

@Component({
  selector: "app-footer",
  standalone: true,
  imports: [],
  templateUrl: "./footer.component.html",
  styleUrl: "./footer.component.scss",
})
export class FooterComponent {
  email: string = "kiranrubamuraliraj@yahoo.com";
  resumeLink: string = "https://drive.google.com/file/d/1hFmDQ2xXaL99MTL7dVvmmlnhCsD6aE8d/view?usp=sharing";
  linkedinLink: string = "https://www.linkedin.com/in/kiran-ruba/";
  wordpressLink: string = "https://chiselmee.wordpress.com/";
  githubLink: string = "https://github.com/kiranruba";

  copyEmail() {
    navigator.clipboard.writeText(this.email).then(() => {
      const alertBox = document.getElementById("custom-alert");
      if (alertBox) {
        alertBox.classList.add("show");
        alertBox.innerText = "Email copied to clipboard!";
        setTimeout(() => {
          alertBox.classList.remove("show");
        }, 2000);
      }
    });
  }

  openResume() {
    window.open(this.resumeLink, "_blank");
  }
  openLinkedIn(): void {
    this.openLink(this.linkedinLink);
  }

  openWordPress(): void {
    this.openLink(this.wordpressLink);
  }

  openGitHub(): void {
    this.openLink(this.githubLink);
  }
  openLink(url: string): void {
    if (url) {
      window.open(url, "_blank");
    } else {
      console.error("URL is undefined or invalid.");
    }
  }
}
