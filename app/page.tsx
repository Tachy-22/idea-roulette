import { MainApp } from '@/components/MainApp';
import { generateIdeas } from '@/lib/gemini';

export default async function Home() {
  // Generate initial ideas server-side
  const initialIdeas = await generateIdeas(undefined, 30);

  return <MainApp initialIdeas={initialIdeas} />;
}
