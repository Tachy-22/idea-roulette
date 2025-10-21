import { MainApp } from '@/components/MainApp';
import { generateIdeas } from '@/lib/gemini';

export default async function Home() {
  // Generate initial ideas server-side with fallback
  let initialIdeas;
  try {
    // Reduce count to speed up build
    initialIdeas = await generateIdeas(undefined, 10);
  } catch (error) {
    console.error('Failed to generate initial ideas:', error);
    // Fallback to empty array, will load client-side
    initialIdeas = [];
  }

  return <MainApp initialIdeas={initialIdeas} />;
}
