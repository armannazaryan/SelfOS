interface OnboardingData {
  main_problem: string;
  daily_routine: string;
  available_time: string;
  personal_goals: string[];
  motivation_level: number;
}

interface Task {
  title: string;
  description: string;
}

interface ActionPlan {
  tasks: Task[];
  motivationalMessage: string;
}

const motivationalMessages = {
  low: [
    "Small steps lead to big changes. You've got this!",
    "Progress, not perfection. Let's start simple today.",
    "Every journey begins with a single step. Take yours now.",
  ],
  medium: [
    "You're building momentum! Keep the energy flowing.",
    "Consistency is key. You're doing great!",
    "Your dedication is inspiring. Let's make today count!",
  ],
  high: [
    "Your determination is unstoppable! Let's achieve greatness today.",
    "Channel that energy into action. Amazing things await!",
    "You're on fire! Let's turn that motivation into results.",
  ],
};

const problemBasedTasks: Record<string, Task[]> = {
  laziness: [
    { title: "Start with 5 minutes", description: "Do your most important task for just 5 minutes" },
    { title: "Physical movement", description: "10 jumping jacks or a quick walk to energize" },
    { title: "Quick win", description: "Complete one small task you've been avoiding" },
  ],
  procrastination: [
    { title: "Break it down", description: "Divide your biggest task into 3 smaller steps" },
    { title: "Time block", description: "Schedule 25 minutes of focused work (Pomodoro)" },
    { title: "Remove distractions", description: "Put phone away and close unnecessary tabs" },
  ],
  discipline: [
    { title: "Morning routine", description: "Follow your planned morning sequence" },
    { title: "Track progress", description: "Log what you accomplished today" },
    { title: "Evening review", description: "Reflect on wins and tomorrow's priorities" },
  ],
  focus: [
    { title: "Single-task focus", description: "Work on ONE thing at a time for 30 minutes" },
    { title: "Environment setup", description: "Create a distraction-free workspace" },
    { title: "Mindfulness break", description: "5 minutes of deep breathing or meditation" },
  ],
};

const goalBasedTasks: Record<string, Task[]> = {
  study: [
    { title: "Study session", description: "30 minutes of focused learning" },
    { title: "Review notes", description: "Go through today's key concepts" },
    { title: "Practice problems", description: "Complete 3 practice exercises" },
  ],
  work: [
    { title: "Priority task", description: "Complete your most important work task" },
    { title: "Email management", description: "Respond to urgent messages" },
    { title: "Plan tomorrow", description: "List top 3 priorities for tomorrow" },
  ],
  health: [
    { title: "Physical activity", description: "20 minutes of exercise or movement" },
    { title: "Healthy meal", description: "Prepare or eat a nutritious meal" },
    { title: "Hydration check", description: "Drink 2 glasses of water" },
  ],
  habits: [
    { title: "New habit practice", description: "Spend 10 minutes on your new habit" },
    { title: "Habit tracking", description: "Mark off today's habit completions" },
    { title: "Reflect on progress", description: "Note how you feel about your habits" },
  ],
};

export function generateActionPlan(onboarding: OnboardingData): ActionPlan {
  const tasks: Task[] = [];

  const problemTasks = problemBasedTasks[onboarding.main_problem.toLowerCase()] ||
                       problemBasedTasks.procrastination;
  tasks.push(problemTasks[0]);

  onboarding.personal_goals.forEach((goal) => {
    const goalTasks = goalBasedTasks[goal.toLowerCase()];
    if (goalTasks) {
      tasks.push(goalTasks[0]);
    }
  });

  if (onboarding.available_time.includes('morning')) {
    tasks.push({
      title: "Morning momentum",
      description: "Complete your most challenging task first thing"
    });
  }

  if (tasks.length < 3) {
    tasks.push({
      title: "Reflect and plan",
      description: "Spend 5 minutes reviewing your goals"
    });
  }

  tasks.push({
    title: "Celebrate progress",
    description: "Acknowledge what you accomplished today"
  });

  const motivationLevel =
    onboarding.motivation_level <= 3 ? 'low' :
    onboarding.motivation_level <= 7 ? 'medium' : 'high';

  const messages = motivationalMessages[motivationLevel];
  const motivationalMessage = messages[Math.floor(Math.random() * messages.length)];

  return {
    tasks: tasks.slice(0, 5),
    motivationalMessage,
  };
}

export function getStreakMotivation(streak: number): string {
  if (streak === 0) return "Start your streak today!";
  if (streak === 1) return "Great start! Keep it going!";
  if (streak < 7) return `${streak} days strong! You're building momentum!`;
  if (streak < 30) return `${streak} days! You're creating lasting change!`;
  return `${streak} days! You're unstoppable!`;
}
