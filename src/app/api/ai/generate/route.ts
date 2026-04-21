import { NextRequest, NextResponse } from "next/server";

const OPENAI_KEY = process.env.OPENAI_API_KEY;

interface GenerateRequest {
  type: "program" | "nutrition";
  clientName?: string;
  goal: string;
  duration?: string;
  preferences?: string;
  restrictions?: string;
  level?: string;
}

async function callOpenAI(systemPrompt: string, userPrompt: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 3000,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error: ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

function buildProgramPrompt(req: GenerateRequest): { system: string; user: string } {
  return {
    system: `You are an expert fitness coach and Functional Patterns practitioner. Generate structured training programs in JSON format.

Return ONLY valid JSON (no markdown, no code fences) with this exact structure:
{
  "title": "Program title",
  "description": "Brief program description",
  "duration": "${req.duration || "4 weeks"}",
  "exercises": [
    {
      "name": "Exercise name",
      "description": "How to perform it",
      "sets": 3,
      "reps": "10-12",
      "notes": "Coaching cues"
    }
  ],
  "weeklySchedule": "e.g. 3x per week",
  "warmup": "Warmup routine description",
  "cooldown": "Cooldown routine description",
  "progressionNotes": "How to progress over the program duration"
}`,
    user: `Create a training program with these details:
- Client: ${req.clientName || "General client"}
- Goal: ${req.goal}
- Duration: ${req.duration || "4 weeks"}
- Fitness level: ${req.level || "Intermediate"}
- Preferences: ${req.preferences || "None specified"}
- Restrictions/Injuries: ${req.restrictions || "None"}

Generate 6-10 exercises that are appropriate for the goal and level.`,
  };
}

function buildNutritionPrompt(req: GenerateRequest): { system: string; user: string } {
  return {
    system: `You are an expert sports nutritionist. Generate structured meal plans in JSON format.

Return ONLY valid JSON (no markdown, no code fences) with this exact structure:
{
  "title": "Plan title",
  "description": "Brief plan description",
  "duration": "${req.duration || "1 week"}",
  "dailyCalories": "estimated range",
  "macroSplit": { "protein": "30%", "carbs": "40%", "fat": "30%" },
  "meals": [
    {
      "name": "Meal name (e.g. Breakfast)",
      "time": "Suggested time",
      "foods": [
        { "item": "Food item", "amount": "Portion size", "calories": 300, "protein": 25 }
      ],
      "notes": "Preparation tips"
    }
  ],
  "hydration": "Daily water recommendation",
  "supplements": ["List of recommended supplements"],
  "groceryList": ["Organized list of items to buy"],
  "tips": ["Practical nutrition tips"]
}`,
    user: `Create a nutrition/meal plan with these details:
- Client: ${req.clientName || "General client"}
- Goal: ${req.goal}
- Duration: ${req.duration || "1 week"}
- Dietary preferences: ${req.preferences || "None specified"}
- Restrictions/Allergies: ${req.restrictions || "None"}

Generate a practical, realistic meal plan with 4-5 meals per day.`,
  };
}

function generateFallbackProgram(req: GenerateRequest) {
  const exercises = [
    { name: "Standing Decompression", description: "Stand with feet hip-width apart. Focus on lengthening spine through crown of head while grounding through feet.", sets: 3, reps: "30 sec hold", notes: "Focus on breathing deeply" },
    { name: "Hip Hinge with Reach", description: "Hinge at hips maintaining neutral spine, reach arms forward for counterbalance.", sets: 3, reps: "10-12", notes: "Keep knees slightly bent" },
    { name: "Split Squat", description: "Stagger stance, lower back knee toward ground while maintaining upright torso.", sets: 3, reps: "8 each side", notes: "Drive through front heel" },
    { name: "Pallof Press", description: "Stand perpendicular to cable/band anchor, press arms straight out resisting rotation.", sets: 3, reps: "10 each side", notes: "Keep core braced" },
    { name: "Single Leg Romanian Deadlift", description: "Balance on one leg, hinge forward reaching opposite hand toward ground.", sets: 3, reps: "8 each side", notes: "Focus on hip hinge pattern" },
    { name: "Thoracic Rotation", description: "In half-kneeling position, rotate through mid-back while keeping hips stable.", sets: 3, reps: "8 each side", notes: "Move slowly and controlled" },
    { name: "Walking Lunges with Rotation", description: "Step forward into lunge, rotate torso over front knee.", sets: 2, reps: "10 each side", notes: "Maintain upright posture" },
    { name: "Plank with Arm Reach", description: "From forearm plank, alternate reaching one arm forward while maintaining stable hips.", sets: 3, reps: "6 each side", notes: "Minimize hip shifting" },
  ];

  return {
    title: `${req.goal} Program${req.clientName ? ` for ${req.clientName}` : ""}`,
    description: `A ${req.duration || "4 week"} training program focused on ${req.goal.toLowerCase()}. Designed for ${(req.level || "intermediate").toLowerCase()} level using Functional Patterns methodology.`,
    duration: req.duration || "4 weeks",
    exercises,
    weeklySchedule: "3 sessions per week (Mon/Wed/Fri recommended)",
    warmup: "5 minutes dynamic mobility: arm circles, leg swings, hip circles, cat-cow, world's greatest stretch",
    cooldown: "5 minutes static stretching: hip flexor stretch, hamstring stretch, chest opener, child's pose",
    progressionNotes: "Week 1-2: Focus on form and mind-muscle connection. Week 3-4: Increase sets or add resistance. Track how movements feel, not just numbers.",
  };
}

function generateFallbackNutrition(req: GenerateRequest) {
  return {
    title: `${req.goal} Nutrition Plan${req.clientName ? ` for ${req.clientName}` : ""}`,
    description: `A practical meal plan designed to support ${req.goal.toLowerCase()}. Balanced macros with whole foods focus.`,
    duration: req.duration || "1 week",
    dailyCalories: "1800-2200 kcal (adjust based on activity)",
    macroSplit: { protein: "30%", carbs: "40%", fat: "30%" },
    meals: [
      {
        name: "Breakfast",
        time: "7:00 - 8:00 AM",
        foods: [
          { item: "Scrambled eggs", amount: "3 eggs", calories: 210, protein: 18 },
          { item: "Whole grain toast", amount: "2 slices", calories: 160, protein: 6 },
          { item: "Avocado", amount: "1/2", calories: 120, protein: 2 },
          { item: "Cherry tomatoes", amount: "1 cup", calories: 30, protein: 1 },
        ],
        notes: "High protein start to fuel the morning",
      },
      {
        name: "Mid-Morning Snack",
        time: "10:00 AM",
        foods: [
          { item: "Greek yogurt", amount: "200g", calories: 130, protein: 20 },
          { item: "Mixed berries", amount: "1/2 cup", calories: 40, protein: 1 },
          { item: "Honey", amount: "1 tsp", calories: 20, protein: 0 },
        ],
        notes: "Quick protein boost",
      },
      {
        name: "Lunch",
        time: "12:30 - 1:30 PM",
        foods: [
          { item: "Grilled chicken breast", amount: "150g", calories: 230, protein: 43 },
          { item: "Brown rice", amount: "1 cup cooked", calories: 215, protein: 5 },
          { item: "Mixed vegetables", amount: "2 cups", calories: 80, protein: 4 },
          { item: "Olive oil dressing", amount: "1 tbsp", calories: 120, protein: 0 },
        ],
        notes: "Largest meal of the day. Prepare in advance for convenience.",
      },
      {
        name: "Pre-Workout Snack",
        time: "3:30 PM",
        foods: [
          { item: "Banana", amount: "1 medium", calories: 105, protein: 1 },
          { item: "Almond butter", amount: "1 tbsp", calories: 100, protein: 3 },
          { item: "Rice cakes", amount: "2", calories: 70, protein: 2 },
        ],
        notes: "Eat 60-90 minutes before training",
      },
      {
        name: "Dinner",
        time: "7:00 - 8:00 PM",
        foods: [
          { item: "Salmon fillet", amount: "150g", calories: 280, protein: 34 },
          { item: "Sweet potato", amount: "1 medium", calories: 115, protein: 2 },
          { item: "Steamed broccoli", amount: "1.5 cups", calories: 50, protein: 4 },
          { item: "Tahini drizzle", amount: "1 tbsp", calories: 90, protein: 3 },
        ],
        notes: "Omega-3 rich dinner for recovery",
      },
    ],
    hydration: "2.5-3 liters of water daily. Add electrolytes on training days.",
    supplements: ["Vitamin D3 (2000 IU)", "Omega-3 Fish Oil", "Magnesium (before bed)", "Whey Protein (post-workout, if needed)"],
    groceryList: [
      "Eggs (18 pack)", "Whole grain bread", "Avocados (4)", "Cherry tomatoes",
      "Greek yogurt (1kg)", "Mixed berries", "Chicken breast (1kg)", "Brown rice",
      "Mixed vegetables (frozen bags)", "Olive oil", "Bananas (bunch)",
      "Almond butter", "Rice cakes", "Salmon fillets (4)", "Sweet potatoes (4)",
      "Broccoli (2 heads)", "Tahini", "Honey", "Lemons",
    ],
    tips: [
      "Meal prep on Sunday for the week ahead",
      "Drink a glass of water before each meal",
      "Eat slowly and chew thoroughly",
      "Adjust portions based on hunger and energy levels",
      "Don't skip meals - consistency matters more than perfection",
    ],
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();

    if (!body.goal) {
      return NextResponse.json({ error: "Goal is required" }, { status: 400 });
    }

    let result: unknown;
    let source: "ai" | "template" = "template";

    if (OPENAI_KEY) {
      try {
        const { system, user } =
          body.type === "nutrition"
            ? buildNutritionPrompt(body)
            : buildProgramPrompt(body);

        const raw = await callOpenAI(system, user);
        const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        result = JSON.parse(cleaned);
        source = "ai";
      } catch (aiError) {
        console.error("AI generation failed, using fallback:", aiError);
        result =
          body.type === "nutrition"
            ? generateFallbackNutrition(body)
            : generateFallbackProgram(body);
      }
    } else {
      result =
        body.type === "nutrition"
          ? generateFallbackNutrition(body)
          : generateFallbackProgram(body);
    }

    return NextResponse.json({ result, source });
  } catch (error) {
    console.error("AI generate error:", error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
