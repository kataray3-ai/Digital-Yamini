import React, { useState } from "react";
import { X, Mail, Phone, Lock, Sparkles, Send, ShieldCheck } from "lucide-react";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, handleFirestoreError, OperationType } from "../firebase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userData: any) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isRegister, setIsRegister] = useState(true);
  const [loginMethod, setLoginMethod] = useState<"email" | "otp">("email");

  // Registration Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [profession, setProfession] = useState("Working Professional");
  const [experienceLevel, setExperienceLevel] = useState("Beginner");
  const [interestCategory, setInterestCategory] = useState("Generative AI");
  const [registerPassword, setRegisterPassword] = useState("");

  // Login verification
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginPhone, setLoginPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    if (registerPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      // 1. Create client-side Authentication user
      const userCredential = await createUserWithEmailAndPassword(auth, email, registerPassword);
      const user = userCredential.user;

      const profileData = {
        userId: user.uid,
        name,
        email,
        phone,
        city,
        profession,
        experienceLevel,
        interestCategory,
        leadScore: 90,
        enrolledCourses: ["dm-1"],
        completedLessons: {
          "dml-1": true
        },
        updatedAt: new Date().toISOString()
      };

      // 2. Save User Profile to Firestore
      const userProfilePath = `userProfiles/${user.uid}`;
      try {
        await setDoc(doc(db, "userProfiles", user.uid), profileData);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, userProfilePath);
      }

      // 3. Save to CRM Leads database in Firestore
      const leadPath = `leads/${user.uid}`;
      try {
        await setDoc(doc(db, "leads", user.uid), {
          id: user.uid,
          name,
          email,
          phone,
          city,
          profession,
          experienceLevel,
          interestCategory,
          leadScore: 90,
          status: "new",
          createdAt: new Date().toISOString()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, leadPath);
      }

      // 4. Send fallback backend lead tracking (full CRM compatibility)
      try {
        await fetch("/api/crm/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(profileData)
        });
      } catch (e) {
        console.warn("Express backend CRM proxy reported offline fallback, successfully synchronized with Cloud Firestore database.");
      }

      // 5. Notify App component
      onSuccess(profileData);
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/operation-not-allowed" || (err.message && err.message.includes("operation-not-allowed"))) {
        setErrorMessage("Firebase Auth Error: The 'Email/Password' provider is not enabled in your Firebase console. Please go to your Firebase Console -> Authentication -> Sign-in Method, and enable the Email/Password sign-in provider.");
      } else {
        setErrorMessage(err.message || "Something went wrong registering user with Firebase.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      const user = userCredential.user;

      // Fetch user profile from Firestore or compile fallback
      const userProfilePath = `userProfiles/${user.uid}`;
      let profileData;
      try {
        const docSnap = await getDoc(doc(db, "userProfiles", user.uid));
        if (docSnap.exists()) {
          profileData = docSnap.data();
        } else {
          // Fallback if record was deleted
          profileData = {
            userId: user.uid,
            name: user.displayName || "Yamini Student",
            email: user.email || loginEmail,
            phone: "",
            city: "Delhi NCR",
            profession: "Working Professional",
            experienceLevel: "Beginner",
            interestCategory: "Generative AI",
            leadScore: 85,
            enrolledCourses: ["dm-1"],
            completedLessons: {},
            updatedAt: new Date().toISOString()
          };
          await setDoc(doc(db, "userProfiles", user.uid), profileData);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, userProfilePath);
      }

      onSuccess(profileData);
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/operation-not-allowed" || (err.message && err.message.includes("operation-not-allowed"))) {
        setErrorMessage("Firebase Auth Error: The 'Email/Password' provider is not enabled in your Firebase console. Please go to your Firebase Console -> Authentication -> Sign-in Method, and enable the Email/Password sign-in provider.");
      } else if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setErrorMessage("Invalid email address or password configuration.");
      } else {
        setErrorMessage(err.message || "Failed to authenticate your session with Firebase.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (platform: string) => {
    setLoading(true);
    setErrorMessage("");

    if (platform !== "Google") {
      // Simulate LinkedIn / Facebook as auth providers with mocked tokens
      setTimeout(() => {
        onSuccess({
          name: `${platform} Graduate`,
          email: `graduate@${platform.toLowerCase()}.com`,
          phone: "+91 91111 22222",
          city: "Mumbai",
          profession: "Freelancer",
          experienceLevel: "Intermediate",
          interestCategory: "Generative AI",
          leadScore: 88,
          enrolledCourses: ["dm-1"],
          completedLessons: {}
        });
        setLoading(false);
        onClose();
      }, 600);
      return;
    }

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userProfilePath = `userProfiles/${user.uid}`;
      let profileData;
      try {
        const docSnap = await getDoc(doc(db, "userProfiles", user.uid));
        if (docSnap.exists()) {
          profileData = docSnap.data();
        } else {
          profileData = {
            userId: user.uid,
            name: user.displayName || "Yamini Student",
            email: user.email || "",
            phone: user.phoneNumber || "",
            city: "",
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
          await setDoc(doc(db, "userProfiles", user.uid), profileData);

          // Write new lead
          await setDoc(doc(db, "leads", user.uid), {
            id: user.uid,
            name: profileData.name,
            email: profileData.email,
            phone: profileData.phone || "",
            city: profileData.city || "",
            profession: profileData.profession,
            experienceLevel: profileData.experienceLevel,
            interestCategory: profileData.interestCategory,
            leadScore: profileData.leadScore,
            status: "new",
            createdAt: new Date().toISOString()
          });

          // Sync with server CRM proxy
          try {
            await fetch("/api/crm/lead", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(profileData)
            });
          } catch (e) {
            console.warn("Express backend CRM proxy offline status");
          }
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, userProfilePath);
      }

      onSuccess(profileData);
      onClose();
    } catch (err: any) {
      console.error("Google Auth popup failure:", err);
      if (err.code === "auth/operation-not-allowed" || (err.message && err.message.includes("operation-not-allowed"))) {
        setErrorMessage("Firebase Auth Error: Google sign-in is not enabled in your Firebase console. Please go to your Firebase Console -> Authentication -> Sign-in Method, and enable the Google provider.");
      } else {
        setErrorMessage(err.message || "Google Authentication flow completed with error.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Mobile OTP simulated verification
  const handleOtpLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      onSuccess({
        name: "OTP Verified Yamini Student",
        email: "student.otp@digitalyamini.com",
        phone: loginPhone || "+91 99999 88888",
        city: "Delhi NCR",
        profession: "Business Owner",
        experienceLevel: "Intermediate",
        interestCategory: "Generative AI",
        leadScore: 95,
        enrolledCourses: ["dm-1"],
        completedLessons: {}
      });
      setLoading(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in text-slate-800 dark:text-slate-100">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header Visual Bar */}
        <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 animate-pulse text-teal-400" />
            <span className="text-xs uppercase tracking-widest font-bold text-blue-200">DIGITAL YAMINI ACADEMY</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight mt-1">
            {isRegister ? "Join Premium LMS & Toolkit" : "Welcome Back Professional"}
          </h2>
          <p className="text-xs text-blue-100 mt-1">
            Learn digital marketing & Gen AI with founder Yamini Katara
          </p>
        </div>

        {/* Scrollable Register Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-sm font-medium">
              {errorMessage}
            </div>
          )}

          {isRegister ? (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">FULL NAME *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-850 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">EMAIL ADDRESS *</label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-850 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">PHONE NUMBER *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 XXXXX XXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-850 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">CITY *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bangalore"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-850 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">PASSWORD (MIN. 6 CHARS) *</label>
                  <input
                    type="password"
                    required
                    placeholder="Create security password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-850 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">PROFESSION</label>
                  <select
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-850 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="Student">Student / Fresher</option>
                    <option value="Job Seeker">Job Seeker</option>
                    <option value="Working Professional">Working Professional</option>
                    <option value="Freelancer">Independent Freelancer</option>
                    <option value="Business Owner">Entrepreneur / Business Owner</option>
                    <option value="Corporate Employee">Corporate Employee</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">EXPERIENCE LEVEL</label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-850 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="Beginner">Beginner (No experience)</option>
                    <option value="Intermediate">Intermediate (1-3 yrs)</option>
                    <option value="Advanced">Advanced (3+ yrs)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">INTEREST CATEGORY</label>
                  <select
                    value={interestCategory}
                    onChange={(e) => setInterestCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-850 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="Digital Marketing">SEO & Growth Hacking</option>
                    <option value="Meta & Google Ads">Meta & Google Ads</option>
                    <option value="Generative AI">Generative AI (ChatGPT/Gemini)</option>
                    <option value="Marketing Automation">Email & CRM Automation</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg transition duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? "Registering Candidate..." : "Secure My Placement"}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-2 border-b border-gray-100 dark:border-slate-800 pb-3 mb-2">
                <button
                  type="button"
                  onClick={() => setLoginMethod("email")}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg ${
                    loginMethod === "email" ? "bg-blue-50 dark:bg-slate-805 text-blue-600 font-bold" : "text-gray-500"
                  }`}
                >
                  Email Login
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod("otp")}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg ${
                    loginMethod === "otp" ? "bg-blue-50 dark:bg-slate-805 text-blue-600 font-bold" : "text-gray-500"
                  }`}
                >
                  Mobile OTP
                </button>
              </div>

              {loginMethod === "email" ? (
                <form onSubmit={handleEmailLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">EMAIL ADDRESS</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        placeholder="name@example.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-250 dark:border-slate-700 bg-gray-50 dark:bg-slate-850 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">PASSWORD</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-250 dark:border-slate-700 bg-gray-50 dark:bg-slate-850 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg transition duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? "Authenticating..." : "Access Dashboard"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleOtpLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">PHONE NUMBER</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Phone className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                        <input
                          type="tel"
                          required
                          placeholder="+91 99999 88888"
                          value={loginPhone}
                          onChange={(e) => setLoginPhone(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-850 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setOtpSent(true)}
                        className="px-4 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 cursor-pointer"
                      >
                        Send Code
                      </button>
                    </div>
                  </div>

                  {otpSent && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">ENTER 6-DIGIT OTP</label>
                      <input
                        type="text"
                        required
                        placeholder="123456"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="w-full tracking-widest text-center py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-850 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg transition duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? "Verifying..." : "Verify and Login"}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Social Logins */}
          <div className="mt-6">
            <div className="relative flex items-center justify-center mb-4">
              <span className="absolute inset-x-0 h-px bg-gray-200 dark:bg-slate-800"></span>
              <span className="relative px-3 bg-white dark:bg-slate-900 text-xs text-slate-500 font-medium">Or Quick Sign-in With</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleSocialLogin("Google")}
                className="flex items-center justify-center py-2 border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 dark:text-slate-200 rounded-xl text-xs font-medium cursor-pointer"
              >
                Google
              </button>
              <button
                onClick={() => handleSocialLogin("LinkedIn")}
                className="flex items-center justify-center py-2 border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 dark:text-slate-200 rounded-xl text-xs font-medium cursor-pointer"
              >
                LinkedIn
              </button>
              <button
                onClick={() => handleSocialLogin("Facebook")}
                className="flex items-center justify-center py-2 border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 dark:text-slate-200 rounded-xl text-xs font-medium cursor-pointer"
              >
                Facebook
              </button>
            </div>
          </div>
        </div>

        {/* Footer Switching Area */}
        <div className="p-4 bg-gray-50 dark:bg-slate-950 border-t border-gray-100 dark:border-slate-800 flex justify-center text-xs text-slate-500 gap-1">
          {isRegister ? (
            <>
              Already registered?{" "}
              <button onClick={() => setIsRegister(false)} className="text-blue-600 hover:underline font-bold cursor-pointer">
                Log In Instead
              </button>
            </>
          ) : (
            <>
              New learner?{" "}
              <button onClick={() => setIsRegister(true)} className="text-blue-600 hover:underline font-bold cursor-pointer">
                Reserve Place Now
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
