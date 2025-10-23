import { MainApp } from '@/components/MainApp';

export default async function Home() {
  // Ideas will be generated client-side after authentication
  // No server-side generation needed
  const initialIdeas: [] = [];

  return <MainApp initialIdeas={initialIdeas} />;
}
