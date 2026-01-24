import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserProfile, StudyPlan, CheckInData } from "../types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `
You are an AI Academic Rescue Agent designed to help students prepare for exams under time pressure, emotional stress, and cognitive overload.

Your role is NOT to generate notes or generic schedules.
Your role is to act as an intelligent intervention system that:
- prioritizes effort,
- minimizes stress-induced failure,
- adapts dynamically to human inconsistency,
- and optimizes exam performance under constraints.

CORE OBJECTIVES:
1. Convert exam anxiety into actionable clarity.
2. Maximize exam ROI (marks per unit time), not syllabus completion.
3. Reduce burnout risk while preserving momentum.
4. Continuously adapt plans based on user feedback and performance.
5. Be realistic, humane, and pressure-aware.

REASONING FRAMEWORK:
1. Time Scarcity Analysis: Calculate remaining days. Identify impossible coverage zones. Decide what must be skipped.
2. Cognitive Load Management: Avoid consecutive high-effort tasks. Insert recovery.
3. Weakness-Priority Logic: Focus on low-confidence + high-impact topics.
4. Stress-Adaptive Planning: If stress is high -> reduce volume.
5. Human Behavior Assumptions: Assume procrastination and anxiety.

OUTPUT: Return strictly JSON.
`;

const PLAN_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    strategy: {
      type: Type.OBJECT,
      properties: {
        priorities: { type: Type.ARRAY, items: { type: Type.STRING } },
        skip: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              topic: { type: Type.STRING },
              reason: { type: Type.STRING },
            },
          },
        },
        master: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              topic: { type: Type.STRING },
              reason: { type: Type.STRING },
            },
          },
        },
        pacingPhilosophy: { type: Type.STRING },
      },
    },
    schedule: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          dayNumber: { type: Type.INTEGER },
          date: { type: Type.STRING, description: "YYYY-MM-DD" },
          tasks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                type: { type: Type.STRING, enum: ["study", "review", "break", "practice"] },
                effort: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
                duration: { type: Type.STRING },
              },
            },
          },
          checkpoint: { type: Type.STRING },
          stressTip: { type: Type.STRING },
        },
      },
    },
    adaptationNotes: { type: Type.STRING },
  },
  required: ["strategy", "schedule", "adaptationNotes"],
};

export const generateInitialPlan = async (profile: UserProfile): Promise<StudyPlan> => {
  const prompt = `
    Create a rescue study plan for:
    Exam: ${profile.examName}
    Date: ${profile.examDate}
    Daily Hours: ${profile.dailyHours}
    Current Stress: ${profile.stressLevel}
    
    Subjects:
    ${JSON.stringify(profile.subjects)}

    Today is ${new Date().toISOString().split('T')[0]}.
    
    Remember:
    - If stress is HIGH, reduce daily load significantly.
    - If confidence is LOW in a subject, prioritize high-yield basics.
    - Do NOT fill every hour. Leave buffer.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: PLAN_SCHEMA,
      },
    });
    
    if (!response.text) throw new Error("No response from AI");
    return JSON.parse(response.text) as StudyPlan;
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw error;
  }
};

export const updatePlan = async (
  currentPlan: StudyPlan,
  profile: UserProfile,
  checkIn: CheckInData
): Promise<StudyPlan> => {
  const prompt = `
    ADAPTATION REQUIRED.
    Current Context:
    - User reported stress: ${checkIn.currentStress}
    - Feedback notes: ${checkIn.notes}
    - Completed Task IDs from previous plan: ${checkIn.completedTaskIds.join(", ")}
    
    Original Strategy:
    ${JSON.stringify(currentPlan.strategy)}

    Previous Adaptation Notes:
    ${currentPlan.adaptationNotes}

    INSTRUCTIONS:
    1. If the user missed tasks, DO NOT just push them to tomorrow. Decide if they should be dropped or condensed.
    2. If stress increased, reduce the difficulty of the next 2 days.
    3. Re-generate the schedule starting from TOMORROW. Keep today's remaining tasks if relevant, but primarily focus on the future.
    
    Today is ${new Date().toISOString().split('T')[0]}.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: PLAN_SCHEMA,
      },
    });

    if (!response.text) throw new Error("No response from AI");
    return JSON.parse(response.text) as StudyPlan;
  } catch (error) {
    console.error("AI Adaptation Error:", error);
    throw error;
  }
};
