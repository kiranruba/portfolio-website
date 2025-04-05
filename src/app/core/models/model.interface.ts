export interface Particle {
  x: number;
  y: number;
  z: number;          
}

export interface Project {
  project_id: number;
  title: string;
  tags: string[];
  tagline: string;
}

export interface Post {
  post_id: number;
  title: string;
  post_content: string;
  revealphrase: string;
  tag: string;
  tagline: string;
}

export interface ModelConfig {
  section: string;
  models_array: Array<{
    model: string;
    camera_position: number[];
    camera_lookat: number[];
    xyz: number[];
    no_rotation_flag?: string;
  }>;
}
