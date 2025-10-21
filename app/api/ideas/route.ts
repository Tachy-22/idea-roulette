import { NextRequest, NextResponse } from 'next/server';
import { generateIdeas, UserPreferences } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { preferences, count = 30 }: { preferences?: UserPreferences; count?: number } = body;

    const ideas = await generateIdeas(preferences, count);
    
    return NextResponse.json(ideas);
  } catch (error) {
    console.error('Error generating ideas:', error);
    return NextResponse.json(
      { error: 'Failed to generate ideas' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const ideas = await generateIdeas(undefined, 30);
    return NextResponse.json(ideas);
  } catch (error) {
    console.error('Error generating ideas:', error);
    return NextResponse.json(
      { error: 'Failed to generate ideas' },
      { status: 500 }
    );
  }
}