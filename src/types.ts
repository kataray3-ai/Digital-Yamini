export interface Course {
  id: string;
  title: string;
  description: string;
  category: "Digital Marketing" | "Search Engine Optimization" | "Performance Ads" | "Generative AI" | "Marketing Automation";
  instructor: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "All Levels";
  duration: string; // e.g. "8 hrs"
  lessonsCount: number;
  rating: number;
  studentsEnrolled: number;
  price: number;
  originalPrice: number;
  lessons: Lesson[];
  resources: Array<{ name: string; type: string; url: string }>;
  enrolled?: boolean;
  progress?: number; // percentage
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: "video" | "audio" | "pdf" | "note";
  url: string;
  completed: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface MarketingTool {
  id: string;
  name: string;
  description: string;
  category: "Content" | "SEO" | "Ads" | "Strategy" | "Career";
  icon: string;
  fields: Array<{
    name: string;
    label: string;
    type: "text" | "number" | "select" | "textarea";
    placeholder?: string;
    options?: string[];
    defaultValue?: string;
  }>;
}

export interface WorkspaceJob {
  id: string;
  title: string;
  company: string;
  type: "Full-time" | "Part-time" | "Internship" | "Freelance";
  location: string;
  salary: string;
  experience: string;
  skills: string[];
  description: string;
  link: string;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  author: string;
  avatar: string;
  authorTitle: string;
  content: string;
  likes: number;
  comments: number;
  tags: string[];
  createdAt: string;
  likedByUser?: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: "SEO" | "AI" | "Digital Marketing" | "Career" | "Business Growth";
  author: string;
  readTime: string;
  date: string;
  content: string;
}

export interface AIPrompt {
  id: string;
  title: string;
  prompt: string;
  category: "SEO" | "Google Ads" | "Meta Ads" | "Content Writing" | "Email Marketing" | "YouTube" | "LinkedIn" | "AI Automation";
}
