// Redefine global/globalThis.fetch if it exists to be writable and configurable
if (typeof globalThis !== "undefined" && globalThis.fetch) {
  try {
    const originalFetch = globalThis.fetch;
    Object.defineProperty(globalThis, "fetch", {
      value: originalFetch,
      writable: true,
      configurable: true,
    });
  } catch (e) {
    console.warn("Could not modify globalThis.fetch getter:", e);
  }
}

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google GenAI lazily or verify key
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("WARNING: GEMINI_API_KEY environment variable is not set. AI Features will be limited to offline/fallback modes.");
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// CRM / Leads Store (Mock in-memory with pre-loaded mock data, can be created/deleted/listed by the admin or landing form)
interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  profession: string;
  experienceLevel: string;
  interestCategory: string;
  city: string;
  leadScore: number;
  status: "new" | "contacted" | "enrolled" | "lost";
  createdAt: string;
}

const mockLeads: Lead[] = [
  {
    id: "lead-1",
    name: "Aarav Sharma",
    email: "aarav.sharma@example.com",
    phone: "+91 98765 43210",
    profession: "Student",
    experienceLevel: "Beginner",
    interestCategory: "Generative AI",
    city: "Mumbai",
    leadScore: 85,
    status: "new",
    createdAt: "2026-05-25T10:30:00Z"
  },
  {
    id: "lead-2",
    name: "Priya Patel",
    email: "priya.patel@example.com",
    phone: "+91 87654 32109",
    profession: "Freelancer",
    experienceLevel: "Intermediate",
    interestCategory: "Social Media Marketing",
    city: "Ahmedabad",
    leadScore: 92,
    status: "enrolled",
    createdAt: "2026-05-26T14:15:00Z"
  },
  {
    id: "lead-3",
    name: "Rohan Verma",
    email: "rohan.v@example.com",
    phone: "+91 76543 21098",
    profession: "Working Professional",
    experienceLevel: "Intermediate",
    interestCategory: "Meta & Google Ads",
    city: "Bangalore",
    leadScore: 70,
    status: "contacted",
    createdAt: "2026-05-27T08:00:00Z"
  }
];

// Helper to calculate lead score based on profession and completeness
function calculateLeadScore(lead: Partial<Lead>): number {
  let score = 50; // baseline
  if (lead.profession === "Working Professional" || lead.profession === "Business Owner") {
    score += 20;
  } else if (lead.profession === "Freelancer") {
    score += 15;
  }
  if (lead.experienceLevel === "Advanced") {
    score += 15;
  } else if (lead.experienceLevel === "Intermediate") {
    score += 10;
  }
  if (lead.phone && lead.phone.length > 5) score += 10;
  if (lead.city) score += 5;
  return Math.min(score, 100);
}

// API endpoint to capture leading information (CRM Lead Capture)
app.post("/api/crm/lead", (req, res) => {
  const { name, email, phone, city, profession, experienceLevel, interestCategory } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required to submit." });
  }

  const newLead: Lead = {
    id: "lead-" + Date.now(),
    name,
    email,
    phone: phone || "",
    city: city || "",
    profession: profession || "Student",
    experienceLevel: experienceLevel || "Beginner",
    interestCategory: interestCategory || "Digital Marketing",
    leadScore: calculateLeadScore({ name, email, phone, city, profession, experienceLevel, interestCategory }),
    status: "new",
    createdAt: new Date().toISOString()
  };

  mockLeads.unshift(newLead);
  res.json({ success: true, lead: newLead });
});

// API endpoint for admin to get all CRM leads
app.get("/api/crm/leads", (req, res) => {
  res.json({ leads: mockLeads });
});

// API endpoint to update lead status
app.patch("/api/crm/leads/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const lead = mockLeads.find((l) => l.id === id);
  if (!lead) {
    return res.status(404).json({ error: "Lead not found" });
  }
  if (status) {
    lead.status = status;
  }
  res.json({ success: true, lead });
});

// Gemini Chat Endpoint
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message content is required" });
    }

    const ai = getAiClient();
    if (!ai) {
      // Offline fallback
      return res.json({
        text: `[OFFLINE MODE] Hello! Because GEMINI_API_KEY is not configured in this preview environment, I am operating in offline simulation mode. 

Yamini Katara would recommend: Always focus on practical implementation! For digital marketing or SEO, keyword research and landing page clarity are crucial. What would you like to build today?`
      });
    }

    // Prepare system instruction
    const systemInstruction = `You are AI Yamini, the digital marketing expert and Generative AI mentor for Yamini Katara's premium academy "Digital Yamini".
    Your tagline is "Learn. Implement. Grow." and secondary tagline is "Master Digital Marketing & Generative AI with Real Industry Experience."
    
    You must guide students, entrepreneurs, freelancers, and working professionals with deep, high-converting digital marketing knowledge, SEO, AEO (Answer Engine Optimization), GEO (Generative Engine Optimization), Meta & Google Ads, local SEO, content marketing, email marketing, and Generative AI strategies (using ChatGPT, Gemini, Claude, Midjourney, Canva AI).
    
    Provide helpful, professional, structured, actionable, and encouraging answers. Use bullets. Highlight practical steps.
    If asked who founded the academy, answer "Yamini Katara".`;

    // Package expects contents array. We can format history or send a single contents prompt.
    // If we have history, we can map it into parts or contents.
    const contents: any[] = [];
    if (history && Array.isArray(history)) {
      history.forEach((h: any) => {
        contents.push({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.text }]
        });
      });
    }
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Server error processing your request", details: error.message });
  }
});

// Dedicated AI Marketing Tools Endpoint
// Handles structured prompts for Ads, Keywords, SEO, and Landing Pages
app.post("/api/marketing/tool", async (req, res) => {
  try {
    const { toolId, inputData } = req.body;
    if (!toolId || !inputData) {
      return res.status(400).json({ error: "toolId and inputData are required" });
    }

    const ai = getAiClient();
    if (!ai) {
      return res.json({
        text: `[OFFLINE DEMO MODE] Generate mock results for ${toolId}:
        
- Key recommendations for "${inputData.businessName || inputData.topic || 'your business'}":
  - Emphasize benefits over features
  - target your ideal client demographic (${inputData.niche || 'Digital Marketing'})
  - Include strong action-based CTAs like "Download Free Guide" or "Book demo"
  - Maximize organic reaches using simple semantic keywords.
  
Configure your GEMINI_API_KEY in the Secrets panel to activate live high-precision generation!`
      });
    }

    let prompt = "";
    let systemInstruction = "You are AI Yamini, an elite digital marketing consultant and master copywriter.";

    switch (toolId) {
      case "meta-ads":
        prompt = `Generate 3 high-converting variations of Meta (Facebook/Instagram) ad copies for:
        Business Name: ${inputData.businessName}
        Business Niche/Offer: ${inputData.offer}
        Target Audience: ${inputData.audience}
        Tone of Voice: ${inputData.tone || 'Exciting & Direct'}
        
        For each variation, include:
        1. Attention Graving Primary Text (using Hook-Story-Offer approach with emojis)
        2. Compelling Headline (max 40 characters)
        3. Clear Call to Action (CTA)`;
        break;
      case "seo-keywords":
        prompt = `Perform keyword research and content mapping for:
        Primary Topic/Industry: ${inputData.topic}
        Focus Region: ${inputData.region || 'Global'}
        Target Intent: ${inputData.intent || 'Commercial & Informational'}
        
        Provide a structured breakdown including:
        1. 5 High-volume transactional keywords (with estimated difficulty and search intent)
        2. 5 Informational search queries (perfect for blogging/FAQ section)
        3. Low-hanging fruits (long-tail keywords with lower difficulty)
        4. Brief SEO Optimization checklist for this specific sector.`;
        break;
      case "email-sequence":
        prompt = `Write a high-converting 3-part email campaign sequence (Lead Nurturing) for:
        Product/Service: ${inputData.productName}
        Goal/Core Benefit: ${inputData.benefit}
        Target Audience: ${inputData.targetAudience}
        
        Provide:
        - Email 1: The Welcome and Instat Gratification (Deliver the lead magnet/hook, set expectations)
        - Email 2: The Logic and Value (Deconstruct their main problem, offer social proof or expert advice)
        - Email 3: The Scarcity & Action (Introduce a limited-time opportunity, handle key objections, direct CTA)`;
        break;
      case "landing-page":
        prompt = `Create a high-converting responsive landing page copywriting wireframe for:
        Product/Service Name: ${inputData.productName}
        Core Problem Solved: ${inputData.problem}
        Unique Value Proposition (UVP): ${inputData.uvp}
        
        Structure your copy with clear labels:
        1. Header Hero section (Headline, Sub-headline, Primary CTA)
        2. Social Proof / Authority banner
        3. Detailed Features vs. Benefits checklist
        4. "Who is this for?" versus "Who is this NOT for?" section
        5. Gamified Interactive Section design suggestion
        6. Frequently Asked Questions (FAQ) with Schema Markup guidance`;
        break;
      case "marketing-strategy":
        prompt = `Develop a comprehensive, bespoke digital marketing launch plan and strategy for:
        Company/Brand: ${inputData.brandName}
        Niche or Sector: ${inputData.niche}
        Primary Competitor: ${inputData.competitor || 'General Market'}
        Monthly Budget Range: ${inputData.budget || 'Low/Organic focus'}
        
        Provide a detailed roadmap covering:
        1. Brand Positioning & UVP
        2. Focus Platforms (where the target audience resides)
        3. Paid Traffic breakdown & Ad Campaign setups
        4. Organic SEO, AEO, and GEO optimization recommendations
        5. 30-Day execution milestones checklist`;
        break;
      case "interview-prep":
        prompt = `You are simulated mock interviewer for a Digital Marketing and AI Specialist position.
        Generate 5 critical, real-world scenario questions and recommended answers tailored for:
        Candidate Level: ${inputData.candidateLevel || 'Professional'}
        Specialty Focus: ${inputData.specialty || 'Full-Stack Performance Marketing'}`;
        break;
      default:
        prompt = `Help me with digital marketing planning for: ${JSON.stringify(inputData)}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.8,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Marketing Tool Error:", error);
    res.status(500).json({ error: "Server error generating tool copy", details: error.message });
  }
});

// Configure Vite or file serving
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Digital Yamini Server running on port ${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("Vite/Express Server failed to boot:", err);
});
