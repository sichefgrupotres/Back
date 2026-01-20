export interface TutorialResponse {
  id: string;
  title: string;
  description: string;
  videoUrl: string;

  ingredients: string;
  steps: string;

  recipe: {
    id: string;
    title: string;
  };

  user: {
    id: string;
    email: string;
  };
}
