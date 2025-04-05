import { Component } from "@angular/core";
import { HeroComponent } from "./modules/hero/hero.component";
import { AboutComponent } from "./modules/about/about.component";
import { ProjectsComponent } from "./modules/projects/projects.component";
import { BlogComponent } from "./modules/blog/blog.component";
import { SkillSetComponent } from "./modules/skill-set/skill-set.component";
import { NavbarComponent } from "./core/components/navbar/navbar.component";
import { FooterComponent } from "./core/components/footer/footer.component";

@Component({
  selector: "app-root",
  imports: [
    HeroComponent,
    AboutComponent,
    ProjectsComponent,
    BlogComponent,
    SkillSetComponent,
    NavbarComponent,
    FooterComponent,
  ],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})
export class AppComponent {}
