import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, forkJoin, of } from "rxjs";
import { catchError } from "rxjs/operators";
import { Particle,  Project,  Post,  ModelConfig} from "../../models/model.interface";
import { MODELS_CONFIG } from "../../models/model-config.data";

@Injectable({
  providedIn: "root",
})
export class FetchDataService {
  private project_jsonUrl = "data/content/projects.json";
  private blogs_jsonUrl = "data/content/blogposts.json";
  private skills_jsonUrl = "data/content/skills.json";

  private modelSubject = new BehaviorSubject<string>("defaultModel");
  public model$ = this.modelSubject.asObservable();

  private modelsConfig: ModelConfig[] = MODELS_CONFIG;

  constructor(private http: HttpClient) {}

  /** Fetch particles from JSON files */
  private getParticles(model: string): Observable<Particle[]> {
    return this.http.get<Particle[]>("/data/models/" + model + ".json").pipe(
      catchError((error) => {
        console.error("Error loading particles", error);
        return of([]);
      })
    );
  }

  /** Load all particles for a given section */
  loadAllParticlesForSection(section: string): Observable<Particle[][]> {
    const sectionData = this.modelsConfig.find((x) => x.section === section);
    if (!sectionData) return of([]);

    const observables = sectionData.models_array.map((val) =>
      this.getParticles(val.model)
    );
    return forkJoin(observables);
  }

  /** Fetch model positions for a section */
  fetchModelPosition(section: string) {
    const sectionData = this.modelsConfig.find((x) => x.section === section);
    return sectionData ? sectionData.models_array : [];
  }

  /** Load a single particle model */
  loadParticles(name: string): Observable<Particle[]> {
    return this.getParticles(name);
  }

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.project_jsonUrl).pipe(
      catchError((error) => {
        console.error("Error fetching projects", error);
        return of([]);
      })
    );
  }

  getSkills(): Observable<any[]> {
    return this.http.get<any[]>(this.skills_jsonUrl).pipe(
      catchError((error) => {
        console.error("Error fetching skills", error);
        return of([]);
      })
    );
  }

  getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(this.blogs_jsonUrl).pipe(
      catchError((error) => {
        console.error("Error fetching blog posts", error);
        return of([]);
      })
    );
  }
}
