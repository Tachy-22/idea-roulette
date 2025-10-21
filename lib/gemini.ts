import { GoogleGenerativeAI } from '@google/generative-ai';
import { getSeenIdeas } from './storage';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

export interface StartupIdea {
  name: string;
  icon: string; // Lucide icon name
  tagline: string;
  category: string;
  rating: number;
  description: string;
  tags: string[];
  remixes: string[];
}

export interface UserPreferences {
  likedCategories: string[];
  likedTags: string[];
  personalityTraits: string[];
  engagementPattern: 'quick' | 'thoughtful' | 'creative';
}

export async function generateIdeas(
  preferences?: UserPreferences,
  count: number = 10
): Promise<StartupIdea[]> {
  // Add randomness to prevent repetitive ideas
  const randomSeed = Math.random().toString(36).substring(7);
  const timestamp = Date.now();
  const seenIdeas = getSeenIdeas();
  
  const diversityPrompts = [
    "Focus on emerging technologies and unexpected combinations",
    "Think about problems that don't have solutions yet", 
    "Combine traditional industries with modern tech",
    "Focus on underserved markets and niche communities",
    "Think about post-pandemic lifestyle changes",
    "Consider climate change and sustainability angles",
    "Explore AR/VR and spatial computing possibilities", 
    "Think about aging population and accessibility",
    "Consider remote work and digital nomad trends",
    "Focus on mental health and wellness innovations"
  ];
  
  const randomDiversityPrompt = diversityPrompts[Math.floor(Math.random() * diversityPrompts.length)];
  
  const prompt = `Generate ${count} COMPLETELY UNIQUE and creative startup ideas. AVOID common or obvious ideas. ${randomDiversityPrompt}

  IMPORTANT: Each idea must be:
  - Completely different from typical startup ideas
  - Novel and unexpected 
  - Solve real problems in creative ways
  - Have unique value propositions
  - Feel like they could be the next big thing

  Random seed: ${randomSeed} | Timestamp: ${timestamp}
  
  ${preferences ? `User has shown interest in: ${preferences.likedCategories.join(', ')}
  Preferred tags: ${preferences.likedTags.join(', ')}
  User traits: ${preferences.personalityTraits.join(', ')}
  
  Weight towards these preferences but still include variety from other categories.` : 'Generate diverse ideas across multiple categories.'}

  ${seenIdeas.length > 0 ? `CRITICAL: DO NOT generate ideas with these names (user has already seen them):
  ${seenIdeas.slice(-50).join(', ')}
  
  Make sure ALL generated ideas are completely different and unique.` : ''}
  
  Return ONLY a JSON array with this exact structure:
  {
    "name": "Unique Startup Name",
    "icon": "lucide-icon-name", 
    "tagline": "Compelling unique tagline",
    "category": "Category / Subcategory",
    "rating": 8.5,
    "description": "What it does and why it's revolutionary - be specific and compelling",
    "tags": ["specific-tag1", "specific-tag2", "specific-tag3"],
    "remixes": ["Creative variation 1", "Creative variation 2", "Creative variation 3"]
  }

  CATEGORY OPTIONS (mix these up):
  "AI / Robotics", "AI / Healthcare", "AI / Creativity", "AI / Education", "AI / Finance"
  "Social / Dating", "Social / Professional", "Social / Gaming", "Social / Communities"  
  "Health / Mental", "Health / Fitness", "Health / Medical", "Health / Wellness"
  "Fintech / Payments", "Fintech / Investment", "Fintech / Insurance", "Fintech / Crypto"
  "Climate / Energy", "Climate / Agriculture", "Climate / Transportation", "Climate / Materials"
  "Gaming / VR", "Gaming / Mobile", "Gaming / Education", "Gaming / Fitness"
  "Food / Delivery", "Food / Nutrition", "Food / Sustainability", "Food / Culture"
  "Travel / Planning", "Travel / Accommodation", "Travel / Transport", "Travel / Experience"
  "Education / K12", "Education / Higher", "Education / Professional", "Education / Skills"
  "Entertainment / Streaming", "Entertainment / Events", "Entertainment / Creation"
  "Fashion / Sustainable", "Fashion / Tech", "Fashion / Personal"
  "Real Estate / PropTech", "Real Estate / Investment", "Real Estate / Rental"

  ICON OPTIONS: brain, rocket, heart, zap, users, globe, smartphone, laptop, camera, music, gamepad2, plane, car, home, briefcase, shield, leaf, dollar-sign, lightbulb, target, trending-up, wifi, headphones, microphone, video, image, book, pencil, scissors, wrench, settings, bell, clock, calendar, map-pin, search, filter, star, flag, gift, crown, diamond, key, lock, unlock, eye, hand, fingerprint

  Make ratings between 7.2 and 9.6 with realistic distribution (most 7.5-8.5, few 9+).`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }
    
    const ideas: StartupIdea[] = JSON.parse(jsonMatch[0]);
    return ideas;
  } catch (error) {
    console.error('Error generating ideas:', error);
    // Return fallback ideas if API fails
    return getFallbackIdeas().slice(0, count);
  }
}

export async function generateRemixes(idea: StartupIdea): Promise<string[]> {
  const prompt = `Generate 3 creative remixes/variations of this startup idea: "${idea.name} - ${idea.tagline}"
  
  The original idea: ${idea.description}
  Category: ${idea.category}
  
  Return ONLY a JSON array of 3 strings, each being a brief remix idea title (not full descriptions):
  ["Remix title 1", "Remix title 2", "Remix title 3"]
  
  Make them creative variations like "for pets", "for kids", "enterprise version", "AI-powered", "social media version", etc.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error generating remixes:', error);
    return [
      `${idea.name} for Teams`,
      `${idea.name} Mobile`,
      `AI-Powered ${idea.name}`
    ];
  }
}

export async function generateRemixIdeas(idea: StartupIdea, fullIdeas: boolean = true): Promise<StartupIdea[] | string[]> {
  if (!fullIdeas) {
    return generateRemixes(idea);
  }

  const randomSeed = Math.random().toString(36).substring(7);
  
  const prompt = `Generate 3 COMPLETE startup ideas that are creative remixes/variations of this original idea:

  ORIGINAL IDEA:
  Name: ${idea.name}
  Tagline: ${idea.tagline}
  Description: ${idea.description}
  Category: ${idea.category}
  Tags: ${idea.tags.join(', ')}

  Create 3 FULL startup ideas that are inspired by but distinct from the original. Each should:
  - Take the core concept in a new direction
  - Target different markets or use cases
  - Have unique value propositions
  - Feel like natural evolutions or variations

  Random seed: ${randomSeed}

  Return ONLY a JSON array with this exact structure:
  [
    {
      "name": "Unique Remix Name",
      "icon": "lucide-icon-name",
      "tagline": "Compelling remix tagline", 
      "category": "Category / Subcategory",
      "rating": 8.3,
      "description": "How this remix differs and what value it provides",
      "tags": ["remix-tag1", "remix-tag2", "remix-tag3"],
      "remixes": ["Sub-remix 1", "Sub-remix 2", "Sub-remix 3"]
    }
  ]

  ICON OPTIONS: brain, rocket, heart, zap, users, globe, smartphone, laptop, camera, music, gamepad2, plane, car, home, briefcase, shield, leaf, dollar-sign, lightbulb, target, trending-up, wifi, headphones, microphone, video, image, book, pencil, scissors, wrench, settings, bell, clock, calendar, map-pin, search, filter, star, flag, gift, crown, diamond, key, lock, unlock, eye, hand, fingerprint

  Make ratings between 7.8 and 9.2 for remixes.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }
    
    const remixIdeas: StartupIdea[] = JSON.parse(jsonMatch[0]);
    return remixIdeas;
  } catch (error) {
    console.error('Error generating remix ideas:', error);
    // Return fallback remix ideas
    return [
      {
        name: `${idea.name} Pro`,
        icon: 'briefcase',
        tagline: `Enterprise version of ${idea.tagline}`,
        category: idea.category,
        rating: 8.1,
        description: `Professional-grade version of ${idea.name} designed for teams and organizations with advanced features and compliance.`,
        tags: ['enterprise', 'teams', 'professional'],
        remixes: [`${idea.name} Enterprise`, `${idea.name} Teams`, `${idea.name} Compliance`]
      },
      {
        name: `${idea.name} Mobile`,
        icon: 'smartphone',
        tagline: `${idea.tagline} - on the go`,
        category: idea.category,
        rating: 7.9,
        description: `Mobile-first version of ${idea.name} optimized for smartphones with offline capabilities and native features.`,
        tags: ['mobile', 'app', 'on-the-go'],
        remixes: [`${idea.name} Lite`, `${idea.name} Offline`, `${idea.name} Widget`]
      }
    ];
  }
}

function getFallbackIdeas(): StartupIdea[] {
  return [
    {
      name: "DreamSync",
      icon: "moon",
      tagline: "Record and analyze your dreams using AI",
      category: "AI / Lifestyle",
      rating: 8.4,
      description: "Voice-record your dreams each morning and get AI-powered insights about your subconscious patterns and emotional state.",
      tags: ["AI", "mental health", "sleep"],
      remixes: ["DreamSync for Couples", "DreamSync for Kids", "DreamSync Analytics"]
    },
    {
      name: "CodeWhisper",
      icon: "code",
      tagline: "AI pair programming with voice commands",
      category: "AI / Developer Tools",
      rating: 9.1,
      description: "Talk to your IDE and let AI write code while you explain your logic in natural language.",
      tags: ["AI", "developer tools", "voice"],
      remixes: ["CodeWhisper Mobile", "CodeWhisper for Teams", "CodeWhisper Education"]
    },
    {
      name: "PlantParent",
      icon: "leaf",
      tagline: "Smart plant care with computer vision",
      category: "IoT / Home",
      rating: 7.8,
      description: "Point your phone at plants to get instant health diagnostics and personalized care recommendations.",
      tags: ["computer vision", "plants", "home"],
      remixes: ["PlantParent Pro", "PlantParent for Offices", "PlantParent Social"]
    }
  ];
}