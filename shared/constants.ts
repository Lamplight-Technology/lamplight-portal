// Curated list of Lucide icons available for feature cards and hero badges
export const AVAILABLE_ICONS = [
  // Business & Growth
  "ChartLine",
  "TrendingUp",
  "Target",
  "Award",
  "Briefcase",
  "DollarSign",

  // Security & Trust
  "Shield",
  "ShieldCheck",
  "Lock",
  "Key",
  "ShieldAlert",

  // People & Teams
  "Users",
  "User",
  "UserCheck",
  "Heart",
  "Smile",
  "ThumbsUp",

  // Performance & Speed
  "Zap",
  "Rocket",
  "Activity",
  "TrendingUp",
  "Gauge",
  "Timer",

  // Features & Innovation
  "Sparkles",
  "Star",
  "Lightbulb",
  "Cpu",
  "Layers",
  "Package",

  // Technology
  "Globe",
  "Laptop",
  "Server",
  "Cloud",
  "Database",
  "Code",
  "Terminal",

  // Success & Quality
  "CheckCircle",
  "CheckSquare",
  "BadgeCheck",
  "Medal",
  "Trophy",

  // Communication
  "MessageSquare",
  "MessageCircle",
  "Mail",
  "Phone",
  "Bell",

  // Support
  "HelpCircle",
  "LifeBuoy",
  "AlertCircle",
  "Info",

  // Other useful icons
  "Settings",
  "Wrench",
  "Tool",
  "Puzzle",
  "Link",
  "Eye",
] as const;

export type IconName = typeof AVAILABLE_ICONS[number];

// Helper to check if an icon name is valid
export function isValidIcon(iconName: string): iconName is IconName {
  return AVAILABLE_ICONS.includes(iconName as IconName);
}
