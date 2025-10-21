import { NextRequest, NextResponse } from 'next/server';
import { generateRemixIdeas, StartupIdea } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idea, fullIdeas = true }: { idea: StartupIdea; fullIdeas?: boolean } = body;

    if (!idea) {
      return NextResponse.json(
        { error: 'Idea is required' },
        { status: 400 }
      );
    }

    const remixes = await generateRemixIdeas(idea, fullIdeas);
    
    return NextResponse.json(remixes);
  } catch (error) {
    console.error('Error generating remixes:', error);
    return NextResponse.json(
      { error: 'Failed to generate remixes' },
      { status: 500 }
    );
  }
}