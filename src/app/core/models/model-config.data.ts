import { ModelConfig } from './model.interface';

export const MODELS_CONFIG: ModelConfig[] =[
  { section: 'home', models_array: [{ model: 'girlbird', camera_position: [8, 0, 0], camera_lookat: [0, 0, 0], xyz: [0, 0, 0], no_rotation_flag: 'true' }] },
  { section: 'box', models_array: [{ model: 'cube', camera_position: [0, 0, 3.5], camera_lookat: [0, 1, 0], xyz: [0, 0, 0] }, { model: 'planet', camera_position: [0, 0, 3.5], camera_lookat: [0, 1, 0], xyz: [0, 0, 0] }] },
  { section: 'blog-butterfly', models_array: [{ model: 'butterfly', camera_position: [0, 0, 4], camera_lookat: [0, 0, 0], xyz: [0, -0.1, 0] }] },
  { section: 'blog-cat', models_array: [{ model: 'cat', camera_position: [0, 0, 2.75], camera_lookat: [0, 0, 0], xyz: [0, 0.1, 0] }] },
  { section: 'blog-space', models_array: [{ model: 'spaceboi', camera_position: [0, 0, 3], camera_lookat: [0, 0, 0], xyz: [0, -0.6, 0] }] },
  { section: 'blog-wavy', models_array: [{ model: 'wavyhair', camera_position: [0, 0, 2.5], camera_lookat: [0, 0, 0], xyz: [0, 0.25, 0] }] },
  { section: 'blog-gramophone', models_array: [{ model: 'gramophone', camera_position: [0, 0, 2.85], camera_lookat: [0, 0, 0], xyz: [0, -0.7, 0] }] },
  { section: 'blog-moon', models_array: [{ model: 'moon', camera_position: [0, 0, 3], camera_lookat: [0, 0, 0], xyz: [0, 0.1, 0] }] },
  { section: 'blog-rain', models_array: [{ model: 'rain', camera_position: [0, 0, 2.5], camera_lookat: [0, 0, 0], xyz: [0, -0.85, 0] }] },
  { section: 'blog-kite', models_array: [{ model: 'kite', camera_position: [0, 0, 2], camera_lookat: [0, 0, 0], xyz: [0, 0.1, 0] }] },
  { section: 'skill-Connector', models_array: [{ model: 'people', camera_position: [0, 1, 6], camera_lookat: [0, 0, 0], xyz: [0, -1, 0]}] },
  { section: 'skill-Eloquence', models_array: [{ model: 'girlbookligh', camera_position: [0, 0, 3.25], camera_lookat: [0, 0, 0], xyz: [0, -0.2, 0] }] },
  { section: 'skill-solve', models_array: [{ model: 'solve', camera_position: [0, 0, 2.75], camera_lookat: [0, 0, 0], xyz: [0, -0.25, 0] }] },
  { section: 'skill-big', models_array: [{ model: 'big', camera_position: [0, 0, 3], camera_lookat: [0, 0, 0], xyz: [0, 0, 0] }] },
  { section: 'skill-decision', models_array: [{ model: 'decision', camera_position: [0, 0, 3], camera_lookat: [0, 0, 0], xyz: [0, 0, 0] }] }
];
