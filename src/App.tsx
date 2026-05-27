import React, { useState, useEffect } from "react";
import {
  Sparkles,
  GraduationCap,
  BrainCircuit,
  Users,
  Briefcase,
  Calculator,
  BookOpen,
  Settings,
  ArrowRight,
  TrendingUp,
  Award,
  Book,
  FileText,
  Play,
  CheckCircle,
  Copy,
  PlusCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  User,
  Trash2,
  Calendar,
  Send,
  MessageSquare,
  ThumbsUp,
  Share2,
  Bookmark,
  Search,
  Check,
  Zap,
  Volume2,
  FileDown,
  Lock,
  Download,
  Filter,
  CheckCircle2,
  Info
} from "lucide-react";
import Header from "./components/Header";
import AuthModal from "./components/AuthModal";
import {
  COURSES,
  MARKETING_TOOLS,
  WORKSPACE_JOBS,
  COMMUNITY_POSTS,
  BLOG_POSTS,
  AIPROMPTS
} from "./data";
import { Course, Lesson, QuizQuestion, WorkspaceJob, CommunityPost, BlogPost, AIPrompt } from "./types";

// Firebase Integration
import { onAuthStateChanged, signOut } from "firebase/auth";
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs,
  setDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  orderBy 
} from "firebase/firestore";
import { auth, db, handleFirestoreError, OperationType } from "./firebase";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("academy");
  const [isDark, setIsDark] = useState<boolean>(true);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);

  // LMS Dynamic State
  const [selectedCourse, setSelectedCourse] = useState<Course>(COURSES[0]);
  const [activeLesson, setActiveLesson] = useState<Lesson>(COURSES[0].lessons[0]);
  const [downloadedCount, setDownloadedCount] = useState<number>(0);
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>({});
  const [coursesList, setCoursesList] = useState<Course[]>(COURSES);

  // Marketing Tools AI Generator State
  const [selectedTool, setSelectedTool] = useState(MARKETING_TOOLS[0]);
  const [toolInputs, setToolInputs] = useState<Record<string, string>>({});
  const [toolLoading, setToolLoading] = useState<boolean>(false);
  const [toolOutput, setToolOutput] = useState<string>("");

  // AI Assistant Chat State
  const [userMessage, setUserMessage] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<Array<{ role: "user" | "model"; text: string }>>([
    {
      role: "model",
      text: "Namaste! I am AI Yamini, your master Digital Marketing & Generative AI co-pilot. Want to write scroll-stopping Meta Ad hooks, re-engineer your technical SEO checklist, draft landing page sections, or prepare for custom client pitches? Pitch me a challenge!"
    }
  ]);
  const [chatLoading, setChatLoading] = useState<boolean>(false);

  // Gamified Quiz State
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizTimeLeft, setQuizTimeLeft] = useState<number>(120); // 2 minutes
  const [quizTimerActive, setQuizTimerActive] = useState<boolean>(false);

  // Certification verify state
  const [verifyId, setVerifyId] = useState<string>("");
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [activeCertification, setActiveCertification] = useState<any>({
    id: "DY-CERT-2026-948",
    candidateName: "Yamini Katara",
    courseTitle: "The Ultimate Full-Stack Digital Marketing Academy",
    issueDate: "May 27, 2026",
    credentialId: "DY-CRED-885114",
    instructorSignature: "Yamini Katara"
  });

  // Community State
  const [posts, setPosts] = useState<CommunityPost[]>(COMMUNITY_POSTS);
  const [newPostText, setNewPostText] = useState<string>("");
  const [postTag, setPostTag] = useState<string>("SEO");

  // Job Search State
  const [selectedJob, setSelectedJob] = useState<WorkspaceJob>(WORKSPACE_JOBS[0]);
  const [jobsFilter, setJobsFilter] = useState<string>("All");
  const [resumeName, setResumeName] = useState("");
  const [resumeProfession, setResumeProfession] = useState("");
  const [resumeSkills, setResumeSkills] = useState("");
  const [resumeExperience, setResumeExperience] = useState("");
  const [builtResume, setBuiltResume] = useState<any>(null);

  // CRM State
  const [leadsList, setLeadsList] = useState<any[]>([]);
  const [crmLoading, setCrmLoading] = useState<boolean>(false);

  // Calculator State
  const [calcSelected, setCalcSelected] = useState<string>("roi");
  const [calcOutputs, setCalcOutputs] = useState<string>("");
  // Inputs
  const [calcInputs, setCalcInputs] = useState({
    spend: "25000",
    revenue: "85000",
    clicks: "5000",
    conversions: "250",
    leads: "180",
    cost: "45000"
  });

  // Blog states
  const [blogSearch, setBlogSearch] = useState("");
  const [activeBlog, setActiveBlog] = useState<BlogPost>(BLOG_POSTS[0]);
  const [blogReadMode, setBlogReadMode] = useState(false);
  const [isReadingAloud, setIsReadingAloud] = useState(false);

  // Promo Coupon Sandbox State
  const [appliedCoupon, setAppliedCoupon] = useState<string>("");
  const [couponStatus, setCouponStatus] = useState<string>("");
  const [paymentDone, setPaymentDone] = useState<boolean>(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [checkoutCourse, setCheckoutCourse] = useState<Course | null>(null);

  // Prompt Library Copy Notification
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  // Timer simulation for Live Classes
  const [liveTimerSeconds, setLiveTimerSeconds] = useState<number>(720); // 12 minutes

  // Helper to sync changes to user profiles collection
  const syncProfileToFirestore = async (updatedFields: any) => {
    if (!auth.currentUser) return;
    try {
      const userRef = doc(db, "userProfiles", auth.currentUser.uid);
      await updateDoc(userRef, updatedFields);
    } catch (err) {
      console.warn("Deferred profile synchronization:", err);
    }
  };

  useEffect(() => {
    // 1. Firebase Authentication State Listener
    const unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        const profilePath = `userProfiles/${authUser.uid}`;
        try {
          const docSnap = await getDoc(doc(db, "userProfiles", authUser.uid));
          if (docSnap.exists()) {
            const profileData = docSnap.data();
            setUser(profileData);
            if (profileData.completedLessons) {
              setCompletedLessons(profileData.completedLessons);
            }
          } else {
            const defaultProfile = {
              userId: authUser.uid,
              name: authUser.displayName || "Yamini Graduate",
              email: authUser.email || "",
              phone: authUser.phoneNumber || "",
              city: "Delhi NCR",
              profession: "Freelancer",
              experienceLevel: "Intermediate",
              interestCategory: "Generative AI",
              leadScore: 90,
              enrolledCourses: ["dm-1"],
              completedLessons: {
                "dml-1": true
              },
              updatedAt: new Date().toISOString()
            };
            await setDoc(doc(db, "userProfiles", authUser.uid), defaultProfile);
            setUser(defaultProfile);
            setCompletedLessons({ "dml-1": true });
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, profilePath);
        }
      } else {
        setUser(null);
        setCompletedLessons({});
      }
    });

    // 2. Real-time Community Posts Listener
    const qPosts = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribePosts = onSnapshot(qPosts, async (snapshot) => {
      if (snapshot.empty) {
        try {
          for (const p of COMMUNITY_POSTS) {
            await setDoc(doc(db, "posts", p.id), {
              id: p.id,
              author: p.author,
              avatar: p.avatar,
              authorTitle: p.authorTitle,
              content: p.content,
              likes: p.likes,
              comments: p.comments,
              tags: p.tags,
              userId: "seed",
              likedBy: [],
              createdAt: new Date().toISOString()
            });
          }
        } catch (err) {
          console.error("Failed to seed community posts:", err);
        }
      } else {
        const list: CommunityPost[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            author: data.author || "Student",
            avatar: data.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80",
            authorTitle: data.authorTitle || "Learner",
            content: data.content || "",
            likes: data.likes || 0,
            comments: data.comments || 0,
            tags: data.tags || [],
            createdAt: "Live Sync",
            likedByUser: data.likedBy?.includes(auth.currentUser?.uid || "") || false
          });
        });
        setPosts(list);
      }
    }, (error) => {
      console.warn("Firestore onSnapshot ('posts') failed. Falling back to COMMUNITY_POSTS. Error:", error);
      setPosts(COMMUNITY_POSTS);
      try {
        handleFirestoreError(error, OperationType.LIST, "posts");
      } catch (e) {
        // Caught and reported per guidelines
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribePosts();
    };
  }, []);

  useEffect(() => {
    // Sync theme class
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

  useEffect(() => {
    // Quick tick for live class timer
    const interval = setInterval(() => {
      setLiveTimerSeconds((prev) => (prev > 0 ? prev - 1 : 720));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let timer: any;
    if (quizTimerActive && quizTimeLeft > 0) {
      timer = setInterval(() => {
        setQuizTimeLeft((p) => p - 1);
      }, 1000);
    } else if (quizTimeLeft === 0 && quizTimerActive) {
      handleFinishQuiz();
    }
    return () => clearInterval(timer);
  }, [quizTimerActive, quizTimeLeft]);

  // Load CRM leads on view
  const fetchLeads = async () => {
    setCrmLoading(true);
    try {
      const snap = await getDocs(collection(db, "leads"));
      const list: any[] = [];
      snap.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });

      if (list.length === 0) {
        const res = await fetch("/api/crm/leads");
        if (res.ok) {
          const data = await res.json();
          setLeadsList(data.leads);
          return;
        }
      }
      setLeadsList(list);
    } catch (err) {
      console.warn("Firestore leads fetching failed, running Express fallback.");
      try {
        const res = await fetch("/api/crm/leads");
        if (res.ok) {
          const data = await res.json();
          setLeadsList(data.leads);
        }
      } catch (errFallback) {
        console.error("Leads lookup failed completely:", errFallback);
      }
    } finally {
      setCrmLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "admin") {
      fetchLeads();
    }
  }, [activeTab]);

  const updateLeadStatus = async (leadId: string, status: string) => {
    try {
      // 1. Update Firestore directly
      const leadRef = doc(db, "leads", leadId);
      await updateDoc(leadRef, { status });

      // 2. Express Server proxy fallback
      await fetch(`/api/crm/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });

      setLeadsList(prev => prev.map(l => l.id === leadId ? { ...l, status } : l));
    } catch (err) {
      console.error(err);
    }
  };

  // Chat with AI Yamini
  const handleSendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userMessage.trim()) return;

    const currentMsg = userMessage;
    setUserMessage("");
    setChatLoading(true);

    const updatedHistory = [...chatHistory, { role: "user" as const, text: currentMsg }];
    setChatHistory(updatedHistory);

    try {
      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: currentMsg,
          history: updatedHistory.slice(-6)
        })
      });

      if (!res.ok) throw new Error("API server response was not OK");
      const data = await res.json();
      setChatHistory((prev) => [...prev, { role: "model", text: data.text }]);
    } catch (err) {
      // Fallback response simulating AI Yamini advising offline
      setChatHistory((prev) => [
        ...prev,
        {
          role: "model",
          text: `[FALLBACK] Welcome! I've digested your request: "${currentMsg}". \n\nAs Yamini Katara says: "Theoretical study leads to nothing without immediate application." \n\nFocus on: \n- Designing rich schemas inside Google search indexers.\n- Crafting 3 variants of ad copies.\n- Target low competition long-tail phrases instead of competitive premium words.\n\nKeep growing, implement this immediately!`
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const injectPromptIntoChat = (promptText: string) => {
    setActiveTab("mentor");
    setUserMessage(promptText);
  };

  // Generate copy inside digital marketing tool options
  const handleGenerateToolCopy = async () => {
    setToolLoading(true);
    setToolOutput("");

    try {
      const res = await fetch("/api/marketing/tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolId: selectedTool.id,
          inputData: toolInputs
        })
      });

      if (!res.ok) throw new Error("API server prompt failure");
      const data = await res.json();
      setToolOutput(data.text);
    } catch (err) {
      setToolOutput(`[DEMO OUTPUT] Here is your custom campaign mock for "${selectedTool.name}":\n\n- Primary Goal: Scalable outreach & optimization.\n- Core Hook Strategy: Target specific pains corresponding to ${JSON.stringify(toolInputs)}.\n- Action Step: Create an A/B test layout focusing on instant premium benefits.`);
    } finally {
      setToolLoading(false);
    }
  };

  // Calculators setup
  const runCalculator = () => {
    const s = parseFloat(calcInputs.spend) || 0;
    const rev = parseFloat(calcInputs.revenue) || 0;
    const cl = parseFloat(calcInputs.clicks) || 0;
    const conv = parseFloat(calcInputs.conversions) || 0;
    const ld = parseFloat(calcInputs.leads) || 0;
    const cst = parseFloat(calcInputs.cost) || 0;

    switch (calcSelected) {
      case "roi": {
        const roi = (((rev - s) / s) * 100).toFixed(2);
        setCalcOutputs(`Return on Investment (ROI): ${roi}% \nNet Profit Earned: ₹${rev - s}`);
        break;
      }
      case "cpc": {
        const cpc = (s / cl).toFixed(2);
        setCalcOutputs(`Cost Per Click (CPC): ₹${cpc} \nAvg clicks captured: ${cl}`);
        break;
      }
      case "cpl": {
        const cpl = (s / ld).toFixed(2);
        setCalcOutputs(`Cost Per Lead (CPL): ₹${cpl} \nConversion rate to lead: ${((ld / cl) * 100).toFixed(2)}%`);
        break;
      }
      case "roas": {
        const roas = (rev / s).toFixed(2);
        setCalcOutputs(`Return on Ad Spend (ROAS): ${roas}x \nMultiplication Index: ${parseFloat(roas) >= 3 ? "Excellent (Highly Profitable)" : "Low Conversion"}`);
        break;
      }
      case "convRate": {
        const rate = ((conv / cl) * 100).toFixed(2);
        setCalcOutputs(`Overall Conversion Rate: ${rate}% \nTotal Users Checked: ${cl}`);
        break;
      }
      case "seoTraffic": {
        const predictedTrafficValue = (cl * 0.35 * 75).toFixed(2);
        setCalcOutputs(`Organic SEO Traffic Value Estimate: ₹${predictedTrafficValue} \nAssumed CTR Factor: 35% on Google Rank #1 positions.`);
        break;
      }
      default:
        setCalcOutputs("Please select a valid performance calculator.");
    }
  };

  useEffect(() => {
    runCalculator();
  }, [calcSelected, calcInputs]);

  // Gamified Quiz Mock data
  const QUIZ_QUESTIONS: QuizQuestion[] = [
    {
      id: "q-1",
      question: "Which schema layout should be set up to enable GEO (Generative Engine Optimization) indexes to cite your site as a direct trust source?",
      options: [
        "JSON-LD LocalBusiness & FAQ schemas with deep citations",
        "Simple HTML italicized text anchors",
        "Keyword staffing strings inside the metadata tags",
        "Disabling sitemaps entirely for faster rendering"
      ],
      correctAnswerIndex: 0,
      explanation: "JSON-LD schemas provide clean structured data attributes that modern Large Language Models and crawling crawlers look for to establish verified factual groundings."
    },
    {
      id: "q-2",
      question: "What does PAS copywriting formula represent?",
      options: [
        "Product, Analytics, Shareability",
        "Problem, Agitation, Solution",
        "Paid Ads, SEO, Structuring",
        "Placement, Automation, Scalability"
      ],
      correctAnswerIndex: 1,
      explanation: "Problem-Agitation-Solution (PAS) is a core psychological copywriting model where you cite the pain, agitate it with empathy, and position your product as the clear relief."
    },
    {
      id: "q-3",
      question: "If your CPC is ₹15, CTR is 4%, and you get 1,000 clicks, what is your total approximate campaign spend?",
      options: [
        "₹60,000",
        "₹15,000",
        "₹4,000",
        "₹15,0,000"
      ],
      correctAnswerIndex: 1,
      explanation: "Total Spend = Clicks * CPC. Here 1,000 clicks * ₹15 = ₹15,000."
    }
  ];

  const handleStartQuiz = () => {
    setSelectedAnswers({});
    setCurrentQuizIndex(0);
    setQuizFinished(false);
    setQuizScore(0);
    setQuizTimeLeft(60);
    setQuizTimerActive(true);
    setQuizStarted(true);
  };

  const handleAnswerSelect = (optIndex: number) => {
    setSelectedAnswers({ ...selectedAnswers, [currentQuizIndex]: optIndex });
  };

  const handleNextQuestion = () => {
    if (currentQuizIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuizIndex((p) => p + 1);
    } else {
      handleFinishQuiz();
    }
  };

  const handleFinishQuiz = () => {
    setQuizTimerActive(false);
    let correct = 0;
    QUIZ_QUESTIONS.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswerIndex) {
        correct += 1;
      }
    });
    const finalScore = correct * 10;
    setQuizScore(finalScore);
    setQuizFinished(true);

    // Reward points to active user
    setUser((prev: any) => {
      if (!prev) return prev;
      const updatedUser = {
        ...prev,
        leadScore: (prev.leadScore || 100) + finalScore
      };
      syncProfileToFirestore({ leadScore: updatedUser.leadScore });
      return updatedUser;
    });
  };

  const verifyCertificate = () => {
    if (verifyId.trim().toUpperCase() === "DY-CERT-2026-948" || verifyId.trim().toUpperCase() === "DY") {
      setVerifyResult({
        valid: true,
        candidateName: "Yamini Katara",
        courseTitle: "The Ultimate Full-Stack Digital Marketing Academy",
        grade: "Distinction (98% Assessment Score)",
        credentialId: "DY-CERT-2026-948",
        verificationDate: "May 27, 2026"
      });
    } else {
      setVerifyResult({
        valid: false,
        error: "Verification ID not recognized in current blockchain ledger archives."
      });
    }
  };

  // Community action
  const handleLikePost = async (id: string) => {
    const postRef = doc(db, "posts", id);
    try {
      const postSnap = await getDoc(postRef);
      if (!postSnap.exists()) return;

      const data = postSnap.data();
      const currentUid = auth.currentUser?.uid || "anonymous";
      let likedBy = data.likedBy || [];
      let likes = data.likes || 0;

      if (likedBy.includes(currentUid)) {
        likedBy = likedBy.filter((uid: string) => uid !== currentUid);
        likes = Math.max(0, likes - 1);
      } else {
        likedBy.push(currentUid);
        likes += 1;
      }

      await updateDoc(postRef, { likes, likedBy });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `posts/${id}`);
    }
  };

  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    const pId = "post-" + Date.now();
    const post: CommunityPost = {
      id: pId,
      author: user ? user.name : "Anonymous Academy Student",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80",
      authorTitle: user ? `${user.profession} • Learner` : "Student",
      content: newPostText,
      likes: 1,
      comments: 0,
      tags: [postTag, "GenAI"],
      createdAt: "Live Sync",
      likedByUser: true
    };

    try {
      await setDoc(doc(db, "posts", pId), {
        ...post,
        userId: auth.currentUser?.uid || "anonymous",
        likedBy: auth.currentUser?.uid ? [auth.currentUser.uid] : [],
        createdAt: new Date().toISOString()
      });
      setNewPostText("");
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `posts/${pId}`);
    }
  };

  // AuthSuccess handler
  const handleAuthSuccess = (userData: any) => {
    setUser(userData);
    setIsAuthOpen(false);
    if (userData.completedLessons) {
      setCompletedLessons(userData.completedLessons);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setCompletedLessons({});
    } catch (err) {
      console.error("Sign out fail:", err);
    }
  };

  // Resume Builder Setup
  const handleBuildResume = (e: React.FormEvent) => {
    e.preventDefault();
    setBuiltResume({
      name: resumeName || user?.name || "Candidate Name",
      profession: resumeProfession || "SEO Expert & AI Copywriter",
      skills: (resumeSkills || "Meta Ads, Keyword SEO, GA4, ChatGPT").split(",").map((s) => s.trim()),
      experience: resumeExperience || "2 Years building micro funnels",
      certifiedBy: "Digital Yamini Certified Marketer"
    });
  };

  // Simulated Course Buying Action
  const handleCheckout = (course: Course) => {
    setCheckoutCourse(course);
    setPaymentDone(false);
    setPaymentAmount(course.price);
    setAppliedCoupon("");
    setCouponStatus("");
  };

  const applyPromo = () => {
    if (appliedCoupon.toUpperCase() === "YAMINI50") {
      setPaymentAmount(Math.round(checkoutCourse!.price * 0.5));
      setCouponStatus("Discount of 50% Successfully Applied via Founder Promo!");
    } else {
      setCouponStatus("Invalid Coupon Code. Try 'YAMINI50' for 50% limited discount!");
    }
  };

  const completeMockPayment = () => {
    setPaymentDone(true);
    // Add to enrolled list
    if (user && checkoutCourse) {
      const updatedEnrolled = [...(user.enrolledCourses || []), checkoutCourse.id];
      setUser({
        ...user,
        enrolledCourses: updatedEnrolled
      });
      syncProfileToFirestore({ enrolledCourses: updatedEnrolled });
      setCoursesList(
        coursesList.map((c) => {
          if (c.id === checkoutCourse.id) {
            return { ...c, enrolled: true, progress: 10 };
          }
          return c;
        })
      );
    }
  };

  // Text-To-Speech dynamic synthesis mockup
  const toggleBlogNarrator = (blogItem: BlogPost) => {
    if (isReadingAloud) {
      window.speechSynthesis.cancel();
      setIsReadingAloud(false);
    } else {
      setIsReadingAloud(true);
      const textToSpeak = `${blogItem.title}. Written by ${blogItem.author}. ${blogItem.content}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.onend = () => setIsReadingAloud(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Format Helper for relative times
  const formatSeconds = (ticks: number) => {
    const mm = Math.floor(ticks / 60);
    const ss = ticks % 60;
    return `${mm}:${ss < 10 ? "0" : ""}${ss}`;
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Header and top navigation integrations */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          // If viewing certificate, make sure preview matches
          if (tab === "academy" && selectedCourse) {
            setActiveCertification({
              id: "DY-CERT-2026-952",
              candidateName: user?.name || "Yamini Graduate",
              courseTitle: selectedCourse.title,
              issueDate: "May 27, 2026",
              credentialId: "DY-CRED-" + selectedCourse.id,
              instructorSignature: "Yamini Katara"
            });
          }
        }}
        isDark={isDark}
        setIsDark={setIsDark}
        openAuthModal={() => setIsAuthOpen(true)}
        user={user}
        handleLogout={handleLogout}
      />

      {/* Main Container Wrapper */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Banner Segment - Dynamic Live Warning Alert from UI elements selection guidance */}
        <div className="mb-8 bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-indigo-900/40 border border-indigo-500/30 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden backdrop-blur-md">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping"></span>
              <span className="text-xs uppercase font-bold text-teal-300 tracking-widest bg-teal-950/50 px-2.5 py-1 rounded-full border border-teal-500/20">
                Academy Live Streaming
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Next Interactive Q&A Session with Yamini starts in <span className="text-blue-400 font-mono text-2xl font-black">{formatSeconds(liveTimerSeconds)}</span>
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Topic: Overcoming conversion drop-offs & GEO markup pipelines. Check back soon.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 relative z-10 w-full sm:w-auto">
            <button
              onClick={() => {
                alert("Opening Web-based Zoom simulation class. Attendance logged for " + (user ? user.name : "Guest"));
              }}
              className="px-5 py-2.5 bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              <ExternalLink className="h-4.5 w-4.5" />
              <span>Launch Live Zoom</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("mentor");
                setUserMessage("Can you explain how to set up Answer Engine Optimization step by step?");
              }}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs sm:text-sm"
            >
              Ask Live Q&A
            </button>
          </div>
          {/* Neon absolute glows to align with Elegant Dark theme */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        </div>

        {/* Dynamic Nav Tabs Core Render */}
        {activeTab === "academy" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Courses selection and list */}
            <div className="lg:col-span-8 flex flex-col gap-8">
              
              {/* Giant Professional Hero banner */}
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 rounded-[32px] p-8 sm:p-10 relative overflow-hidden shadow-2xl shadow-blue-500/10">
                <div className="relative z-10 max-w-xl">
                  <span className="inline-block px-3.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-white mb-4 italic">
                    Mentorship & Authority
                  </span>
                  <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight mb-3">
                    Master Generative AI <br/>for Performance Marketing.
                  </h2>
                  <p className="text-blue-50/95 text-sm sm:text-base leading-relaxed mb-6">
                    A comprehensive ecosystem founded by <span className="font-extrabold text-teal-200">Yamini Katara</span>. Learn modern SEO strategies, automated copywriting, high-converting funnel metrics, and command AI agents with authentic, hands-on masterclass series.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => {
                        const target = document.getElementById("featured-class-section");
                        target?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold text-sm shadow-xl transition-all hover:scale-105"
                    >
                      Explore Syllabi
                    </button>
                    <button
                      onClick={() => {
                        setIsAuthOpen(true);
                      }}
                      className="px-6 py-3 bg-black/30 backdrop-blur-md text-white border border-white/20 rounded-xl font-bold text-sm hover:bg-black/40 transition-all"
                    >
                      Book Free Demo
                    </button>
                  </div>
                </div>
                {/* Decorative Elements */}
                <div className="absolute right-0 bottom-0 top-0 w-1/3 hidden md:block">
                  <div className="absolute right-10 top-1/2 -translate-y-1/2 w-48 h-48 border border-white/10 rounded-full animate-spin"></div>
                  <div className="absolute right-16 top-1/2 -translate-y-1/2 w-36 h-36 border-2 border-dashed border-white/20 rounded-full"></div>
                </div>
                <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
              </div>

              {/* Course categories selectors */}
              <div id="featured-class-section" className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2">
                  <div>
                    <h3 className="text-2xl font-extrabold tracking-tight text-white leading-none">
                      Academy Premium Tracks
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Choose your learning path. Live workshops & accredited certificates included.
                    </p>
                  </div>
                  <span className="text-xs px-3 py-1.5 bg-slate-800/80 rounded-xl border border-slate-700/60 font-medium text-blue-400">
                    4 Distinct Tracks Active
                  </span>
                </div>

                {/* Courses map details list view */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {coursesList.map((course) => {
                    const isEnrolled = !!course.enrolled;
                    return (
                      <div
                        key={course.id}
                        onClick={() => setSelectedCourse(course)}
                        className={`group bg-slate-800/30 hover:bg-slate-800/60 border rounded-3xl p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                          selectedCourse.id === course.id
                            ? "border-blue-500 shadow-lg shadow-blue-500/5 bg-slate-800/70"
                            : "border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-blue-950 text-blue-400 border border-blue-900/40">
                              {course.category}
                            </span>
                            <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {course.duration}
                            </span>
                          </div>
                          <h4 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                            {course.title}
                          </h4>
                          <p className="text-xs text-slate-400 mt-2 line-clamp-3">
                            {course.description}
                          </p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-800/60">
                          {isEnrolled ? (
                            <div>
                              <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                                <span className="font-semibold text-teal-400">Track Progress</span>
                                <span className="font-mono text-white font-bold">{course.progress || 0}%</span>
                              </div>
                              <div className="h-2 w-full bg-slate-700/40 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-teal-400 rounded-full transition-all duration-350"
                                  style={{ width: `${course.progress || 0}%` }}
                                ></div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="text-slate-400 text-xs block">Price Tag</span>
                                <span className="text-white font-bold">
                                  ₹{course.price}{" "}
                                  <span className="text-xs line-through text-slate-500 font-normal">
                                    ₹{course.originalPrice}
                                  </span>
                                </span>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCheckout(course);
                                }}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition"
                              >
                                Buy Lesson
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* LMS Core Workspace - Video/Audio Lessons & Completed State */}
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-[32px] p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">
                      Active Academy Player
                    </span>
                    <h3 className="text-xl font-bold text-white mt-1">
                      {selectedCourse.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-slate-800 text-slate-400 rounded-xl text-xs font-mono font-bold">
                      {Object.keys(completedLessons).filter(id => id.startsWith(selectedCourse.id === "dm-1" ? "dml" : "seol")).length} / {selectedCourse.lessonsCount} Complete
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Playlist selector list */}
                  <div className="lg:col-span-5 flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800">
                    {selectedCourse.lessons.map((lesson, idx) => {
                      const isCompleted = completedLessons[lesson.id];
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => setActiveLesson(lesson)}
                          className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left group ${
                            activeLesson.id === lesson.id
                              ? "bg-blue-600/10 border-blue-500 text-white"
                              : "bg-slate-800/20 border-slate-800 hover:border-slate-700 text-slate-300"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-xs font-mono text-slate-500 group-hover:text-blue-400">
                              {idx + 1}.
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold truncate leading-snug">
                                {lesson.title}
                              </p>
                              <span className="text-[10px] text-slate-400 font-mono uppercase mt-0.5 inline-block">
                                {lesson.type} • {lesson.duration}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 ml-2">
                            {isCompleted ? (
                              <CheckCircle className="h-4.5 w-4.5 text-teal-400 flex-shrink-0" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-slate-600 flex-shrink-0"></div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Active lesson detail stage / note writing pad */}
                  <div className="lg:col-span-7 flex flex-col justify-between bg-slate-950/40 rounded-2xl p-5 border border-slate-800/60 min-h-[320px]">
                    <div>
                      <div className="flex items-center justify-between gap-4 mb-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 px-2.5 py-1 text-slate-400 rounded">
                          Playing {activeLesson.type} media
                        </span>
                        <span className="text-slate-400 font-mono text-xs">{activeLesson.duration} duration</span>
                      </div>

                      <h4 className="text-base font-bold text-white mb-2 leading-tight">
                        {activeLesson.title}
                      </h4>

                      {/* Video Player Box Area */}
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-4 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                        <div className="relative z-10 p-3 bg-blue-600 text-white rounded-full shadow-lg group-hover:scale-110 transition cursor-pointer">
                          <Play className="h-6 w-6 fill-current ml-0.5" />
                        </div>
                        <p className="relative z-10 text-xs font-mono text-slate-400 mt-2.5">
                          Click to stream secure lesson audio/video
                        </p>
                        <span className="text-[10px] text-teal-400 mt-1 uppercase font-semibold">
                          Verified DRM Security Sandbox Client
                        </span>
                        <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition duration-300"></div>
                      </div>

                      {/* Resources attachment segment */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                          Download Lesson Workbooks & Assets
                        </span>
                        {selectedCourse.resources.map((resUr, rIdx) => (
                          <div
                            key={rIdx}
                            className="flex items-center justify-between p-2 bg-slate-800/30 rounded-lg text-xs border border-slate-800"
                          >
                            <span className="text-slate-300 font-medium">{resUr.name}</span>
                            <button
                              onClick={() => {
                                setDownloadedCount(prev => prev + 1);
                                alert("Downloading workbook asset template to standard storage directory");
                              }}
                              className="text-blue-400 hover:text-white flex items-center gap-1 font-bold font-mono"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>{resUr.type}</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-800/40 flex flex-wrap justify-between items-center gap-3 mt-6">
                      <button
                        onClick={() => {
                          const currentId = activeLesson.id;
                          setCompletedLessons((prev) => {
                            const updated = { ...prev, [currentId]: !prev[currentId] };
                            syncProfileToFirestore({ completedLessons: updated });
                            return updated;
                          });
                          // Boost user score if completed
                          if (!completedLessons[currentId]) {
                            setUser((prevUser: any) => {
                              if (!prevUser) return prevUser;
                              const updatedUser = {
                                ...prevUser,
                                leadScore: (prevUser.leadScore || 0) + 5
                              };
                              syncProfileToFirestore({ leadScore: updatedUser.leadScore });
                              return updatedUser;
                            });
                          }
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          completedLessons[activeLesson.id]
                            ? "bg-teal-950 text-teal-400 border border-teal-800"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                      >
                        <Check className="w-4 h-4" />
                        <span>
                          {completedLessons[activeLesson.id] ? "Marked as Complete!" : "Mark Lesson Done (+5 XP)"}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          const userNotes = prompt("Jot down quick thoughts to save with this lesson:", "PAS Hook variant: Include high statistical citations first!");
                          if (userNotes) {
                            alert("Notes preserved securely with Yamini Katara Masterclass Database.");
                          }
                        }}
                        className="px-3.5 py-2 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl border border-slate-800"
                      >
                        Keep Notes Notepad
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: AI Yamini instant panel, Gamified Interactive Quiz, Student ratings */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* Gamified Active mini Quiz */}
              <div className="bg-gradient-to-tr from-slate-900 via-slate-800/60 to-slate-900 border border-slate-800 rounded-[32px] p-6 relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 p-4 bg-teal-500/10 rounded-bl-3xl border-l border-b border-teal-500/10">
                  <Award className="h-6 w-6 text-teal-400" />
                </div>

                <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest block mb-1">
                  Daily Gamified Challenge
                </span>
                <h4 className="text-xl font-extrabold text-white leading-tight">
                  Marketing & AI Aptitude
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mb-4">
                  Test your technical expertise to unlock certified bonus points & badges!
                </p>

                {!quizStarted ? (
                  <button
                    onClick={handleStartQuiz}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold py-3 px-4 rounded-xl text-xs sm:text-sm tracking-wide transition flex items-center justify-center gap-2"
                  >
                    <Zap className="h-4 w-4 text-yellow-400" />
                    <span>Launch 60s Timed Challenge Entry</span>
                  </button>
                ) : quizFinished ? (
                  <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800 text-center">
                    <CheckCircle className="h-10 w-10 text-teal-400 mx-auto mb-2" />
                    <h5 className="font-bold text-white text-sm">Challenge Concluded!</h5>
                    <p className="text-lg text-white font-mono font-black mt-1">
                      Score Rated: {quizScore} Points
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Your score has been updated to your digital leader credential ledger!
                    </p>
                    <button
                      onClick={handleStartQuiz}
                      className="mt-3 text-xs text-blue-400 hover:underline font-bold"
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                    <div className="flex justify-between items-center text-xs text-slate-400">
                      <span>Question {currentQuizIndex + 1} of {QUIZ_QUESTIONS.length}</span>
                      <span className="font-mono text-rose-400 font-bold">
                        {quizTimeLeft}s left
                      </span>
                    </div>

                    <h5 className="text-xs font-semibold text-slate-100 mt-1 leading-snug">
                      {QUIZ_QUESTIONS[currentQuizIndex].question}
                    </h5>

                    <div className="space-y-2 mt-3">
                      {QUIZ_QUESTIONS[currentQuizIndex].options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          onClick={() => handleAnswerSelect(oIdx)}
                          className={`w-full text-left p-2.5 rounded-lg text-xs leading-relaxed transition ${
                            selectedAnswers[currentQuizIndex] === oIdx
                              ? "bg-blue-600 text-white font-semibold"
                              : "bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800"
                          }`}
                        >
                          {String.fromCharCode(65 + oIdx)}. {opt}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={handleNextQuestion}
                      disabled={selectedAnswers[currentQuizIndex] === undefined}
                      className="w-full mt-2 py-2 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 font-bold text-xs rounded-xl text-white disabled:opacity-40"
                    >
                      {currentQuizIndex === QUIZ_QUESTIONS.length - 1 ? "Complete Challenge" : "Continue"}
                    </button>
                  </div>
                )}
              </div>

              {/* Verified Digital Certificate verification card */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-[32px] p-6">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-1">
                  Accreditation Verify Engine
                </span>
                <h4 className="text-base font-bold text-white leading-tight mb-2">
                  Verify Credentials
                </h4>
                <p className="text-xs text-slate-400 mb-4">
                  Enter student Certificate ID (e.g., <span className="font-mono text-teal-400 font-bold">DY-CERT-2026-948</span>) to search global learning logs file.
                </p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={verifyId}
                    onChange={(e) => setVerifyId(e.target.value)}
                    placeholder="Credential Certificate Code"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 uppercase"
                  />
                  <button
                    onClick={verifyCertificate}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-bold text-xs transition"
                  >
                    Lookup
                  </button>
                </div>

                {verifyResult && (
                  <div className="mt-4 p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                    {verifyResult.valid ? (
                      <div>
                        <span className="text-[10px] uppercase font-mono tracking-widest text-teal-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> SECURED AND VERIFIED
                        </span>
                        <p className="font-bold text-white mt-2 mb-1">{verifyResult.candidateName}</p>
                        <p className="text-slate-400 text-[11px] leading-tight">Course: {verifyResult.courseTitle}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-1">Released {verifyResult.verificationDate}</p>
                      </div>
                    ) : (
                      <span className="text-[10px] uppercase font-mono tracking-widest text-rose-400 font-bold">
                        ⚠️ CERTIFICATE NOT FOUND
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Student Success and Metrics */}
              <div className="bg-slate-900/20 border border-slate-800/50 rounded-[32px] p-6 flex flex-col gap-6">
                <div>
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest block">
                    Your Learning Analytics
                  </h4>
                  <p className="text-xs text-slate-500">Track total commitment time and rank standing</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-400">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">TIME INVESTMENT</span>
                        <span className="text-sm font-bold text-white">24.5 Hours total</span>
                      </div>
                    </div>
                    <span className="text-xs text-teal-400 font-mono font-bold">+12.4%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-teal-500/10 rounded-xl flex items-center justify-center text-teal-400">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">COMMITTED SCORE</span>
                        <span className="text-sm font-bold text-white">
                          {user ? user.leadScore : 85} Points
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-teal-400 font-mono font-bold">Rank #4 Match</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 font-bold text-xs"
                >
                  View Lifetime Certificate Ledger
                </button>
              </div>

            </div>
          </div>
        )}

        {/* AI Yamini Mentor Interactive Chat System */}
        {activeTab === "mentor" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* Founder Profile block */}
              <div className="bg-gradient-to-tr from-[#1E293B] to-slate-900 border border-slate-800 rounded-[32px] p-6 relative">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-tr from-teal-400 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg shadow-lg">
                    YK
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white leading-tight">Yamini Katara</h3>
                    <p className="text-xs text-teal-400">Academy Founder & AI Advisor</p>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  &quot;The marketing landscape in 2026 demands deep, tactical hybrid skills. Simply writing prompts is useless; you must tie your code directly into search citation pipelines, automated email leads lists, and dynamic performance creative suites.&quot;
                </p>
                <div className="mt-4 pt-4 border-t border-slate-800/60 grid grid-cols-2 gap-4 text-center">
                  <div>
                    <span className="text-lg font-black text-white block">10k+</span>
                    <span className="text-[10px] uppercase font-mono text-slate-500">Learners Trained</span>
                  </div>
                  <div>
                    <span className="text-lg font-black text-white block">15+</span>
                    <span className="text-[10px] uppercase font-mono text-slate-500">AI Tool Integrations</span>
                  </div>
                </div>
              </div>

              {/* Guided strategy topics suggestions for chat */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-[32px] p-6 space-y-3">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">
                  Click to Ask Instant Strategy Formulas
                </span>
                
                <button
                  onClick={() => injectPromptIntoChat("Draft a 3-stage PAS copywriting layout for an enterprise SaaS tool.")}
                  className="w-full text-left p-3 bg-slate-800/30 border border-slate-800 hover:border-slate-700 rounded-xl text-xs text-slate-300 transition"
                >
                  📝 Copywriting: PAS Layout Variant
                </button>

                <button
                  onClick={() => injectPromptIntoChat("How should I configure JSON-LD LocalBusiness and FAQ structures for Google search ranking?")}
                  className="w-full text-left p-3 bg-slate-800/30 border border-slate-800 hover:border-slate-700 rounded-xl text-xs text-slate-300 transition"
                >
                  🔍 Technical SEO: JSON-LD Structure Setup
                </button>

                <button
                  onClick={() => injectPromptIntoChat("Write a 5-step follow-up email sequence for high-value leads with strong limited-time triggers.")}
                  className="w-full text-left p-3 bg-slate-800/30 border border-slate-800 hover:border-slate-700 rounded-xl text-xs text-slate-300 transition"
                >
                  ✉️ Email Marketing: High-Value Sequencing
                </button>
              </div>

            </div>

            {/* Main Interactive conversation stage */}
            <div className="lg:col-span-8 flex flex-col h-[600px] bg-slate-900/40 border border-slate-800 rounded-[32px] overflow-hidden">
              <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center bg-gradient-to-r from-blue-950/20 to-indigo-950/20">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-teal-400 animate-pulse"></div>
                  <div>
                    <h4 className="font-bold text-white text-sm">AI Yamini Expert Advisor</h4>
                    <p className="text-[10px] text-slate-400 uppercase tracking-[0.1em] font-mono font-bold">
                      Interactive Flash LLM Pipeline active
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setChatHistory([{ role: "model", text: "Namaste! Fresh chat buffer initialized. Ask me anything on SEO, Meta, or copy creation formulas." }])}
                  className="text-slate-500 hover:text-white hover:bg-slate-800 p-2 rounded-xl transition text-xs"
                >
                  Clear history
                </button>
              </div>

              {/* Chat Message list box */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {chatHistory.map((chat, index) => {
                  const isUser = chat.role === "user";
                  return (
                    <div
                      key={index}
                      className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed ${
                          isUser
                            ? "bg-blue-600 text-white rounded-br-none"
                            : "bg-slate-800/70 text-slate-300 border border-slate-800 rounded-bl-none"
                        }`}
                      >
                        <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">
                          {isUser ? "You Candidate" : "AI Yamini Mentor"}
                        </span>
                        {chat.text}
                      </div>
                    </div>
                  );
                })}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-800 border border-slate-800 text-slate-300 rounded-2xl rounded-bl-none p-4 text-xs">
                      <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">
                        Thinking...
                      </span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Text Area Form trigger */}
              <form onSubmit={handleSendChatMessage} className="p-4 bg-slate-900 border-t border-slate-800 flex gap-2">
                <input
                  type="text"
                  value={userMessage}
                  required
                  onChange={(e) => setUserMessage(e.target.value)}
                  placeholder="Ask a tactical SEO, Ad, or design structuring query..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-500"
                />
                <button
                  type="submit"
                  disabled={chatLoading}
                  className="px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs sm:text-sm transition flex items-center justify-center disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* AI Tools Hub and Prompts Generator Tab */}
        {activeTab === "tools" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left selector sidebar: choosing different specialized copywriting tools */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="p-2 border border-slate-800 bg-slate-900/60 rounded-3xl">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest p-3">
                  AI Marketing Instruments
                </h3>
                <div className="space-y-1">
                  {MARKETING_TOOLS.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => {
                        setSelectedTool(tool);
                        setToolInputs({});
                        setToolOutput("");
                      }}
                      className={`w-full flex items-center gap-3 p-3 text-left rounded-xl transition-all ${
                        selectedTool.id === tool.id
                          ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/10"
                          : "text-slate-400 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <Sparkles className="h-4 w-4" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate">{tool.name}</p>
                        <p className={`text-[10px] ${selectedTool.id === tool.id ? "text-blue-100" : "text-slate-500"}`}>
                          {tool.category} Tool
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Categorized AI Prompt matrix block */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-[32px] p-6 space-y-4">
                <div>
                  <h4 className="text-base font-bold text-white">Copy Master Prompts</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Preformed matrices optimized for ChatGPT, Gemini, and Claude parameters.
                  </p>
                </div>

                <div className="space-y-3">
                  {AIPROMPTS.map((pr) => (
                    <div
                      key={pr.id}
                      className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between gap-2 text-xs"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-mono bg-indigo-950 text-indigo-400 px-2 py-0.5 rounded border border-indigo-900/50">
                          {pr.category}
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(pr.prompt);
                            setCopiedPromptId(pr.id);
                            setTimeout(() => setCopiedPromptId(null), 2000);
                          }}
                          className="text-blue-400 hover:text-white text-[10px] flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{copiedPromptId === pr.id ? "Copied!" : "Copy URL"}</span>
                        </button>
                      </div>
                      <p className="text-slate-300 font-medium leading-relaxed italic">{pr.title}</p>
                      <p className="text-[10px] text-slate-500 line-clamp-3 bg-slate-900 p-2 rounded border border-slate-800/50">
                        {pr.prompt}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Stage Panel: Direct input & AI parameters generation logs */}
            <div className="lg:col-span-8 bg-slate-900/40 border border-slate-800 rounded-[32px] p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="pb-6 border-b border-slate-800 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-teal-400 font-bold block mb-1">
                      Interactive GenAI Copy Catalyst
                    </span>
                    <h3 className="text-2xl font-black text-white">{selectedTool.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-xl">
                      {selectedTool.description}
                    </p>
                  </div>
                </div>

                {/* Input Fields Generation form setup */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedTool.fields.map((f, index) => (
                    <div key={index} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                        {f.label}
                      </label>
                      {f.type === "select" ? (
                        <select
                          value={toolInputs[f.name] || ""}
                          onChange={(e) => setToolInputs({ ...toolInputs, [f.name]: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">Select option...</option>
                          {f.options?.map((opt, oIdx) => (
                            <option key={oIdx} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : f.type === "textarea" ? (
                        <textarea
                          rows={3}
                          placeholder={f.placeholder}
                          value={toolInputs[f.name] || ""}
                          onChange={(e) => setToolInputs({ ...toolInputs, [f.name]: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      ) : (
                        <input
                          type="text"
                          placeholder={f.placeholder}
                          value={toolInputs[f.name] || ""}
                          onChange={(e) => setToolInputs({ ...toolInputs, [f.name]: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleGenerateToolCopy}
                  disabled={toolLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 font-bold py-3.5 mt-6 rounded-xl text-white text-xs sm:text-sm tracking-wide transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4.5 h-4.5 animate-spin" />
                  <span>{toolLoading ? "Generating tactical outputs..." : "Activate AI Pipeline Engine"}</span>
                </button>
              </div>

              {/* Dynamic Answer Outputs display */}
              <div className="mt-8 bg-slate-950 rounded-2xl p-5 border border-slate-800 min-h-[220px] flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-[#14B8A6] font-bold">
                      Generated Creative Copies
                    </span>
                    {toolOutput && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(toolOutput);
                          alert("Output copy code successfully written to temporary container clipboard.");
                        }}
                        className="text-blue-400 hover:text-white text-xs flex items-center gap-1 font-mono font-bold"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Output</span>
                      </button>
                    )}
                  </div>

                  {toolOutput ? (
                    <div className="text-slate-300 text-xs leading-relaxed font-mono whitespace-pre-wrap max-h-[280px] overflow-y-auto pr-2 scrollbar-thin">
                      {toolOutput}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-slate-600 text-xs">
                      No parameters processed yet. Specify product name, niche, audience targets, and run the pipeline above.
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-900/80 flex justify-between items-center mt-6">
                  <span className="text-[10px] text-slate-500 italic">
                    Powered by high-precision Gemini 3.5 models.
                  </span>
                  <button
                    onClick={() => {
                      if (!toolOutput) return;
                      setActiveTab("mentor");
                      setUserMessage(`Can you critique this copy & give structural advice:\n\n${toolOutput}`);
                    }}
                    className="text-xs text-blue-400 hover:underline font-bold"
                  >
                    Analyze with Mentorship Advisor
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* LinkedIn-style Community Forums and showcase post board */}
        {activeTab === "community" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left sidebar: guidelines & quick categories filter */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-slate-900/40 border border-slate-800 rounded-[32px] p-6 space-y-4">
                <div>
                  <h4 className="text-base font-bold text-white">Community Forums</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Connect with 5000+ active agency leaders, freelancers, and AI experts.
                  </p>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => setPostTag("SEO")}
                    className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-800/30 border border-slate-850 hover:border-slate-700/80 rounded-xl text-xs text-slate-300"
                  >
                    <span>🔍 Technical SEO Discussions</span>
                    <span className="font-mono text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded">
                      24 active
                    </span>
                  </button>

                  <button
                    onClick={() => setPostTag("Meta Ads")}
                    className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-800/30 border border-slate-850 hover:border-slate-700/80 rounded-xl text-xs text-slate-300"
                  >
                    <span>📣 Meta Ads & Scaling Hack</span>
                    <span className="font-mono text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded">
                      40 active
                    </span>
                  </button>

                  <button
                    onClick={() => setPostTag("Generative AI")}
                    className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-800/30 border border-slate-850 hover:border-slate-700/80 rounded-xl text-xs text-slate-300"
                  >
                    <span>🤖 Generative AI and Agents</span>
                    <span className="font-mono text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded">
                      18 active
                    </span>
                  </button>
                </div>
              </div>

              {/* Student Success Showcasing Badge lists */}
              <div className="bg-slate-900/20 border border-slate-800/50 rounded-[32px] p-6 space-y-3">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                  Weekly Authority Badges
                </h4>
                <div className="flex flex-wrap gap-2">
                  <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 font-bold px-3 py-1 rounded-full">
                    👑 Ads Guru
                  </span>
                  <span className="text-[10px] bg-teal-950 text-teal-300 border border-teal-800 font-bold px-3 py-1 rounded-full">
                    ⚡ Prompt Master
                  </span>
                  <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-800 font-bold px-3 py-1 rounded-full">
                    🚀 Campaign Titan
                  </span>
                </div>
              </div>
            </div>

            {/* Middle main column postings */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* Write New Post Form */}
              <form onSubmit={handleAddPost} className="bg-slate-900/40 border border-slate-800 rounded-[32px] p-6">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#14B8A6] font-bold block mb-1">
                  Connect & Contribute
                </span>
                <h3 className="text-base font-bold text-white mb-4">Share Your Campaign Insights</h3>

                <div className="space-y-4">
                  <textarea
                    rows={3}
                    required
                    placeholder="Ask a question or showcase your performance campaign win rates (PAS framework rules apply!)..."
                    value={newPostText}
                    onChange={(e) => setNewPostText(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 font-medium">Tag Category:</span>
                      <select
                        value={postTag}
                        onChange={(e) => setPostTag(e.target.value)}
                        className="bg-slate-950 border border-slate-800 text-xs px-2.5 py-1.5 rounded-lg text-slate-300"
                      >
                        <option value="Success Story">📣 Success Story</option>
                        <option value="SEO">🔍 SEO Optimization</option>
                        <option value="Generative AI">🤖 Generative AI</option>
                        <option value="Freelancing">💼 Freelancing / Jobs</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer ml-auto"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Release Forum Post</span>
                    </button>
                  </div>
                </div>
              </form>

              {/* Map post loops */}
              <div className="space-y-6">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-slate-900/30 border border-slate-800/80 rounded-3xl p-6 flex flex-col gap-4 shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={post.avatar}
                          alt={post.author}
                          className="w-10 h-10 rounded-full border border-slate-700 object-cover"
                        />
                        <div>
                          <h4 className="font-bold text-sm text-white">{post.author}</h4>
                          <p className="text-[10px] text-slate-500 leading-tight">
                            {post.authorTitle}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono font-bold">
                        {post.createdAt}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal whitespace-pre-wrap">
                      {post.content}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-1">
                      {post.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[9px] font-mono bg-slate-950 hover:bg-slate-800 px-2.5 py-1 rounded-lg text-slate-400 border border-slate-850"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-slate-850 flex items-center gap-4">
                      <button
                        onClick={() => handleLikePost(post.id)}
                        className={`flex items-center gap-1.5 text-xs font-semibold ${
                          post.likedByUser ? "text-teal-400" : "text-slate-500 hover:text-white"
                        }`}
                      >
                        <ThumbsUp className="h-4.5 w-4.5" />
                        <span>{post.likes}</span>
                      </button>

                      <button
                        onClick={() => {
                          const userComment = prompt("Contribute inside discussion thread:");
                          if (userComment) {
                            alert("Your comment index has successfully requested node routing pipeline update.");
                          }
                        }}
                        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-white font-semibold"
                      >
                        <MessageSquare className="h-4.5 w-4.5" />
                        <span>{post.comments} Comments</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        )}

        {/* Career Jobs and Internship board, combined with active Resume Builder */}
        {activeTab === "jobs" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left list list */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* Quick filter navigation */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-slate-900 border border-slate-800 rounded-2xl gap-4">
                <div>
                  <h4 className="font-bold text-white text-sm">Targeted Job Options</h4>
                  <p className="text-xs text-slate-400">Internships & freelance matches verified for Yamini Graduates</p>
                </div>

                <div className="flex flex-wrap gap-1">
                  {["All", "Full-time", "Internship", "Freelance"].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setJobsFilter(tag)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                        jobsFilter === tag
                          ? "bg-blue-600 text-white"
                          : "bg-slate-800 hover:bg-slate-750 text-slate-300"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Careers elements mapping list loops */}
              <div className="space-y-4">
                {WORKSPACE_JOBS.filter(j => jobsFilter === "All" || j.type === jobsFilter).map((job) => (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    className={`p-6 bg-slate-900/30 border rounded-[24px] cursor-pointer transition-all ${
                      selectedJob.id === job.id
                        ? "border-blue-500 bg-slate-800/40 shadow"
                        : "border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                      <div>
                        <span className="text-[9px] uppercase font-bold tracking-widest text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-800/40">
                          {job.type}
                        </span>
                        <h4 className="text-lg font-bold text-white mt-1 group-hover:text-blue-400 transition-colors">
                          {job.title}
                        </h4>
                        <p className="text-xs text-slate-400">{job.company} • {job.location}</p>
                      </div>

                      <div className="text-right sm:text-right">
                        <span className="text-xs font-mono font-extrabold text-[#14B8A6] block">
                          {job.salary}
                        </span>
                        <span className="text-[10px] text-slate-500 block">Experience: {job.experience}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-4">
                      {job.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      {job.skills.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-[9px] font-semibold bg-slate-950 text-slate-400 px-2 py-1 rounded-md border border-slate-850"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Dynamic CV creator builder box */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-[32px] p-6 sm:p-8">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-6">
                  <div className="p-2bg-blue-600/10 text-blue-400 rounded-xl">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Dynamic AI Resume Generator</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Convert your Digital Yamini course history and scores into a certified agency application.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleBuildResume} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Priyesh Patel"
                      value={resumeName}
                      onChange={(e) => setResumeName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Target Profession</label>
                    <input
                      type="text"
                      placeholder="e.g. Generative AI Copywriter"
                      value={resumeProfession}
                      onChange={(e) => setResumeProfession(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Core Technical Skills (comma separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. Meta Conversions API, Answer Engine Optimizations, Stable Diffusion, Claude Prompts"
                      value={resumeSkills}
                      onChange={(e) => setResumeSkills(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Summarize Client Project Experience</label>
                    <textarea
                      rows={3}
                      placeholder="Briefly state actual campaign accomplishments (e.g. Cut client CPA score by 40% with automated Midjourney visual variations)"
                      value={resumeExperience}
                      onChange={(e) => setResumeExperience(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="sm:col-span-2 w-full bg-blue-600 hover:bg-blue-700 font-bold py-3 rounded-xl text-white text-xs sm:text-sm tracking-wide transition uppercase cursor-pointer"
                  >
                    Forge Professional CV PDF Preview
                  </button>
                </form>

                {builtResume && (
                  <div className="mt-6 p-6 bg-slate-950 rounded-2xl border border-dashed border-teal-500/40 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 bg-teal-500/10 rounded-bl-xl border-l border-b border-teal-500/10 text-[9px] font-mono text-teal-400 font-bold">
                      ACCREDITED CV PROFILE
                    </div>

                    <h5 className="font-extrabold text-white text-lg leading-tight uppercase tracking-tight">
                      {builtResume.name}
                    </h5>
                    <p className="text-xs text-teal-400 font-mono font-bold">{builtResume.profession}</p>

                    <div className="my-4 pt-4 border-t border-slate-850 space-y-3">
                      <div>
                        <span className="text-[9px] uppercase font-mono tracking-widest text-slate-500 block mb-1">
                          TECHNICAL CAPABILITIES INDEX
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {builtResume.skills.map((s: string, idx: number) => (
                            <span key={idx} className="text-[9px] bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-[9px] uppercase font-mono tracking-widest text-slate-500 block mb-1">
                          EXPERTISED MILESTONES & PROOF OF STUDY
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed font-normal">
                          {builtResume.experience}
                        </p>
                      </div>

                      <div className="pt-2">
                        <span className="text-[10px] text-teal-300 font-bold font-mono">
                          ✓ Digital Yamini Course Certificate Authenticated • Earned {user ? user.leadScore : 100} XP Points and Distinction Rank logs.
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => alert("Simulating localized export process to PDF/HTML format for job candidate.")}
                      className="text-xs text-blue-400 hover:underline font-bold flex items-center gap-1 mt-4"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Ready-To-Apply CV Format</span>
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* Right details panel summary */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-slate-900/40 border border-slate-800 rounded-[32px] p-6 space-y-4">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#14B8A6] font-bold block mb-1">
                  Active Career Spec Spec
                </span>
                <h4 className="text-lg font-bold text-white leading-tight">
                  {selectedJob.title}
                </h4>
                <p className="text-xs text-slate-400 leading-normal">{selectedJob.company} • {selectedJob.location}</p>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Proposed Pay Rate</span>
                    <span className="font-mono text-white font-bold">{selectedJob.salary}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Candidate Experience</span>
                    <span className="font-mono text-white font-bold">{selectedJob.experience}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedJob.description}
                </p>

                <button
                  onClick={() => {
                    alert("Application submitted matching profile credential records successfully.");
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm tracking-wide transition flex items-center justify-center gap-1.5"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Submit Application Vault</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Digital Marketing Calculators Tab */}
        {activeTab === "calculators" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="p-2 border border-slate-800 bg-slate-900/60 rounded-3xl">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest p-3">
                  Select Performance Metrix
                </h3>
                <div className="space-y-1">
                  {[
                    { id: "roi", name: "ROI Return Analyst" },
                    { id: "cpc", name: "CPC Click cost metrics" },
                    { id: "cpl", name: "CPL Core Lead calculator" },
                    { id: "roas", name: "ROAS Multiplication Factor" },
                    { id: "convRate", name: "Overall Conversion Rate %" },
                    { id: "seoTraffic", name: "SEO Traffic Financial Value" }
                  ].map((calc) => (
                    <button
                      key={calc.id}
                      onClick={() => setCalcSelected(calc.id)}
                      className={`w-full flex items-center gap-3 p-3 text-left rounded-xl transition-all ${
                        calcSelected === calc.id
                          ? "bg-blue-600 text-white font-bold"
                          : "text-slate-400 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <Calculator className="h-4 w-4" />
                      <span className="text-xs font-semibold">{calc.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Informative tips widget block */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-[32px] p-6 text-xs text-slate-400 leading-relaxed">
                <div className="flex items-center gap-2 text-white font-bold mb-2">
                  <Info className="w-4 h-4 text-teal-400" />
                  <span>Yamini's Rule of Sound Math</span>
                </div>
                Before scaling Meta budget levels, calculate your minimum cost limit baseline. Always ensure that ROAS is &gt;= 2.8x to cover standard merchant transactional logistics taxes.
              </div>
            </div>

            {/* Input fields to count calculators */}
            <div className="lg:col-span-8 bg-slate-900/40 border border-slate-800 rounded-[32px] p-6 sm:p-8 space-y-6">
              <div className="pb-4 border-b border-slate-800">
                <h3 className="text-xl font-bold text-white">Conversion & CPC Math Simulator</h3>
                <p className="text-xs text-slate-400 mt-0.5">Edit numbers to recalculate live conversion values instantly.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Ad Campaign Spend (₹)</label>
                  <input
                    type="number"
                    value={calcInputs.spend}
                    onChange={(e) => setCalcInputs({ ...calcInputs, spend: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Generated Revenue (₹)</label>
                  <input
                    type="number"
                    value={calcInputs.revenue}
                    onChange={(e) => setCalcInputs({ ...calcInputs, revenue: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Calculated Total Link Clicks</label>
                  <input
                    type="number"
                    value={calcInputs.clicks}
                    onChange={(e) => setCalcInputs({ ...calcInputs, clicks: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Conversions count</label>
                  <input
                    type="number"
                    value={calcInputs.conversions}
                    onChange={(e) => setCalcInputs({ ...calcInputs, conversions: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Captured Total Leads</label>
                  <input
                    type="number"
                    value={calcInputs.leads}
                    onChange={(e) => setCalcInputs({ ...calcInputs, leads: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100"
                  />
                </div>
              </div>

              {/* Display panel */}
              <div className="p-6 bg-slate-950 rounded-2xl border border-teal-500/20 text-center space-y-2">
                <span className="text-[10px] uppercase font-mono tracking-widest text-teal-400 font-bold block">Analysis Outputs</span>
                <p className="text-white text-base sm:text-lg font-mono font-bold whitespace-pre-line">
                  {calcOutputs}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Blogs and insights list pages with voice narrative capability */}
        {activeTab === "blogs" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="bg-slate-900/40 border border-slate-800 rounded-[32px] p-6 space-y-4">
                <h4 className="font-extrabold text-white text-base">Academy Written Insights</h4>
                <p className="text-xs text-slate-400">Read master tactics directly penned by certified founder instructors.</p>

                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={blogSearch}
                    onChange={(e) => setBlogSearch(e.target.value)}
                    placeholder="Search articles & guides..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none placeholder-slate-600"
                  />
                </div>
              </div>

              {/* Direct lists mapping left sidebar selection */}
              <div className="space-y-2.5">
                {BLOG_POSTS.filter(b => b.title.toLowerCase().includes(blogSearch.toLowerCase()) || b.excerpt.toLowerCase().includes(blogSearch.toLowerCase())).map((blog) => (
                  <button
                    key={blog.id}
                    onClick={() => {
                      setActiveBlog(blog);
                      setBlogReadMode(true);
                      window.speechSynthesis.cancel();
                      setIsReadingAloud(false);
                    }}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex flex-col gap-2 ${
                      activeBlog.id === blog.id
                        ? "bg-blue-600/10 border-blue-500"
                        : "bg-slate-900/30 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="text-[9px] bg-slate-950 text-slate-400 px-2.5 py-0.5 rounded border border-slate-850">
                        {blog.category}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{blog.readTime}</span>
                    </div>
                    <h5 className="font-bold text-xs sm:text-sm text-slate-100 group-hover:text-blue-400 transition-colors">
                      {blog.title}
                    </h5>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight">
                      {blog.excerpt}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Article display with Text to speech trigger */}
            <div className="lg:col-span-8 bg-slate-900/40 border border-slate-800 rounded-[32px] p-6 sm:p-8 flex flex-col justify-between min-h-[500px]">
              <div>
                <div className="pb-6 border-b border-slate-800 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className="text-[9px] uppercase font-mono tracking-widest text-[#14B8A6] font-bold bg-[#14B8A6]/10 px-2.5 py-1 rounded inline-block mb-2">
                      {activeBlog.category} Insights Track
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                      {activeBlog.title}
                    </h2>
                    <p className="text-xs text-slate-400 mt-2">
                      Published {activeBlog.date} • Written by Academy Mentor <span className="font-semibold text-white">{activeBlog.author}</span>
                    </p>
                  </div>

                  {/* Vocal synthesizer controls */}
                  <button
                    onClick={() => toggleBlogNarrator(activeBlog)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                      isReadingAloud ? "bg-amber-600 text-white" : "bg-slate-800 text-slate-200"
                    }`}
                  >
                    <Volume2 className="h-4 w-4 animate-bounce" />
                    <span>{isReadingAloud ? "Mute Aloud Reader" : "Translate Text Aloud"}</span>
                  </button>
                </div>

                <div className="text-slate-200 text-xs sm:text-sm leading-relaxed space-y-4 font-normal whitespace-pre-wrap">
                  {activeBlog.content}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-8">
                <span className="text-[10px] text-slate-500">
                  © 2026 Digital Yamini Academy. Fully optimized with valid FAQ schema structures.
                </span>
                
                <button
                  onClick={() => {
                    const emailInput = prompt("Enter subscriber email to dispatch dispatch PDF copies:", user?.email || "");
                    if (emailInput) {
                      alert("Successfully queued dynamic educational PDF copy for immediate SMTP relay dispatch.");
                    }
                  }}
                  className="px-4 py-2 border border-slate-800 rounded-xl hover:bg-slate-800 text-xs text-slate-300 font-bold font-mono inline-flex items-center gap-1"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Receive as Certified PDF Guide</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Admin/CRM Dashboard view */}
        {activeTab === "admin" && (
          <div className="space-y-8">
            
            {/* Super Admin status header overview */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl">
                <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Total Capture Database</span>
                <p className="text-2xl font-black text-white">{leadsList.length || 3}</p>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="w-[85%] bg-blue-600 h-full"></div>
                </div>
              </div>

              <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl">
                <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Enrolled conversion</span>
                <p className="text-2xl font-black text-white">
                  {leadsList.filter(l => l.status === "enrolled").length + 1} candidates
                </p>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="w-[45%] bg-teal-400 h-full"></div>
                </div>
              </div>

              <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl">
                <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Average conversion rate score</span>
                <p className="text-2xl font-black text-white">84 XP</p>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="w-[84%] bg-amber-500 h-full"></div>
                </div>
              </div>

              <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl">
                <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Campaign API Webhook Status</span>
                <span className="text-xs px-2.5 py-1 bg-teal-950 font-mono font-bold text-teal-300 rounded border border-teal-800 inline-block mt-2">
                  ○ ACTIVE LEDGER
                </span>
              </div>
            </div>

            {/* CRM List database map */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-[32px] p-6 sm:p-8">
              <div className="flex justify-between items-center mb-6 border-b border-slate-880 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Digital Yamini Candidate CRM Leads</h3>
                  <p className="text-xs text-slate-400">Captured active applications with AI estimated conversion ratings</p>
                </div>
                <button
                  onClick={fetchLeads}
                  className="px-4 py-2 bg-slate-800 text-xs font-bold rounded-xl border border-slate-700 hover:bg-slate-750"
                >
                  Sync leads
                </button>
              </div>

              {crmLoading ? (
                <div className="text-center py-10 text-xs text-slate-500">Pulling ledger data...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300 min-w-[700px]">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                        <th className="py-3 px-2">CANDIDATE</th>
                        <th className="py-3 px-2">CONTACTS</th>
                        <th className="py-3 px-2">PROFESSION / EXP</th>
                        <th className="py-3 px-2">DESIRED TRACK</th>
                        <th className="py-3 px-2">AI CAPTURE RATINGS</th>
                        <th className="py-3 px-2 text-right">STAGE FLOW</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {leadsList.map((lead) => (
                        <tr key={lead.id} className="hover:bg-slate-850/40 transition">
                          <td className="py-4 px-2 font-bold text-white">{lead.name}</td>
                          <td className="py-4 px-2 font-mono">
                            <span className="block">{lead.email}</span>
                            <span className="text-[10px] text-slate-500">{lead.phone} • {lead.city}</span>
                          </td>
                          <td className="py-4 px-2">
                            <span className="block">{lead.profession}</span>
                            <span className="text-[10px] text-slate-500">Experience: {lead.experienceLevel}</span>
                          </td>
                          <td className="py-4 px-2">
                            <span className="text-xs px-2 py-0.5 bg-blue-950 text-blue-300 rounded border border-blue-900/50">
                              {lead.interestCategory}
                            </span>
                          </td>
                          <td className="py-4 px-2">
                            <span className="font-mono text-teal-400 font-extrabold">{lead.leadScore || 85}% Score</span>
                          </td>
                          <td className="py-4 px-2 text-right">
                            <div className="flex gap-1 justify-end">
                              {["new", "contacted", "enrolled", "lost"].map((st) => (
                                <button
                                  key={st}
                                  onClick={() => updateLeadStatus(lead.id, st)}
                                  className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase ${
                                    lead.status === st
                                      ? "bg-blue-600 text-white"
                                      : "bg-slate-800 text-slate-500 hover:text-white"
                                  }`}
                                >
                                  {st}
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            {/* Direct simulated Lead broadcaster trigger */}
            <div className="bg-slate-900/20 border border-slate-800 rounded-[32px] p-6 text-xs text-slate-300">
              <span className="text-[10px] uppercase font-mono tracking-widest text-teal-400 font-bold block mb-1">SMS Broadcasting sandbox</span>
              <p className="mb-4">Instantly trigger simulated academy push-notifications or WhatsApp campaign followups to captured candidate pipelines.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => alert("Simulated dynamic SMS push triggered to " + leadsList.length + " candidate directories.")}
                  className="p-3 bg-slate-800 rounded-xl hover:bg-slate-750 font-bold"
                >
                  🚀 Push Live Class Reminders
                </button>
                <button
                  onClick={() => alert("Queued automated WhatsApp promotional campaigns with Founder discount.")}
                  className="p-3 bg-slate-800 rounded-xl hover:bg-slate-750 font-bold"
                >
                  💬 Dispatch Discount Coupons
                </button>
                <button
                  onClick={() => alert("Verification reports of automated assignment tests concluded.")}
                  className="p-3 bg-slate-800 rounded-xl hover:bg-slate-750 font-bold"
                >
                  🗒️ Conclude Grading Loops
                </button>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Checkout Payment Gateway modal Sandbox overlay */}
      {checkoutCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-850 text-slate-100 rounded-[32px] p-6 max-w-md w-full relative">
            <h3 className="text-xl font-bold text-white mb-2">Secure Payment Gateway checkout</h3>
            <p className="text-xs text-slate-400 mb-4">You are enrolling in: <span className="font-extrabold text-white">{checkoutCourse.title}</span></p>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 mb-4">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Original Syllabi Price</span>
                <span className="font-mono text-slate-300 line-through">₹{checkoutCourse.originalPrice}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Promotional Price</span>
                <span className="font-mono text-white">₹{checkoutCourse.price}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-xs text-teal-400 font-semibold">
                  <span>Discount Applied</span>
                  <span className="font-mono">-₹{checkoutCourse.price - paymentAmount}</span>
                </div>
              )}
              <div className="border-t border-slate-900 pt-2 flex justify-between text-sm text-teal-300 font-bold">
                <span>Total amount to process</span>
                <span className="font-mono font-black text-white text-base">₹{paymentAmount}</span>
              </div>
            </div>

            {couponStatus && (
              <span className="block text-xs font-semibold text-teal-400 mb-3">{couponStatus}</span>
            )}

            {!paymentDone ? (
              <div className="space-y-4">
                {/* Apply Coupon Trigger */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter Coupon Code (Try YAMINI50)"
                    value={appliedCoupon}
                    onChange={(e) => setAppliedCoupon(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-650"
                  />
                  <button
                    onClick={applyPromo}
                    className="absolute right-2 top-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded-lg"
                  >
                    Apply Coupon
                  </button>
                </div>

                {/* Simulated payment selector models */}
                <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center">Available Payment Sandbox Integrations</span>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <button
                    onClick={completeMockPayment}
                    className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300"
                  >
                    Credit Card / UPI
                  </button>
                  <button
                    onClick={completeMockPayment}
                    className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300"
                  >
                    Razorpay Sandbox
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-4">
                <CheckCircle className="h-12 w-12 text-teal-400 mx-auto" />
                <h4 className="font-bold text-white text-lg">Payment Confirmed!</h4>
                <p className="text-xs text-slate-400">Class unlocked and course synced with localized academic player ledger.</p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => {
                      setCheckoutCourse(null);
                      setActiveTab("academy");
                    }}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl"
                  >
                    Enter Academy Masterclass player
                  </button>
                </div>
              </div>
            )}

            {!paymentDone && (
              <button
                onClick={() => setCheckoutCourse(null)}
                className="w-full text-center text-slate-500 hover:text-white text-xs font-bold mt-4"
              >
                Cancel Checkout
              </button>
            )}
          </div>
        </div>
      )}

      {/* Footer Branding Area matching PM, PMS requirements */}
      <footer className="mt-auto py-8 bg-[#090D1A] border-t border-slate-900 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex items-center justify-center gap-2">
            <span className="w-2.5 h-2.5 bg-teal-400 rounded-full"></span>
            <p className="text-xs font-bold font-mono tracking-widest text-slate-500 uppercase">
              Digital Yamini AI-Powered Learning Ecosystem
            </p>
          </div>
          <p className="text-[11px] text-slate-600 max-w-xl mx-auto leading-normal">
            Designed for students, working professionals, and small startup agencies. 
            All courses accredited with global verify credential indexes. Founded by Yamini Katara. 
            tagline: &quot;Learn. Implement. Grow.&quot;
          </p>
          <div className="flex justify-center gap-6 text-[10px] text-slate-600 font-mono">
            <span>Schema Markup: OK</span>
            <span>AEO / GEO Optimization: ACTIVE</span>
            <span>Local SEO: STABLE</span>
          </div>
        </div>
      </footer>

      {/* Auth Modal Overlay */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />

    </div>
  );
}
