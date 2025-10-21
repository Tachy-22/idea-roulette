import { MainApp } from '@/components/MainApp';
import { generateIdeas } from '@/lib/gemini';

export default async function Home() {
  // Generate fewer initial ideas server-side to speed up build
  const initialIdeas = await generateIdeas(undefined, 5);

  return <MainApp initialIdeas={initialIdeas} />;
}
