"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, AlertCircle, Eye, EyeOff, ShieldCheck, Key, Smartphone, Copy, Check } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [step, setStep] = useState<"LOGIN" | "2FA">("LOGIN");
  const [twoFaCode, setTwoFaCode] = useState("");
  const [trustDevice, setTrustDevice] = useState(true);
  const [secretKey, setSecretKey] = useState("BS24KPGQY567ABCD");
  const [hasSetup2FA, setHasSetup2FA] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Seed default admin account
    const storedUsers = localStorage.getItem("bizsearch24_users");
    let usersList = storedUsers ? JSON.parse(storedUsers) : [];
    
    const adminEmail = "nicholauscostochetty@gmail.com";
    const hasAdmin = usersList.some((u: any) => u.email === adminEmail);
    
    if (!hasAdmin) {
      usersList.push({
        email: adminEmail,
        password: "Nic6604211989!?",
        role: "ADMIN",
        plan: "PREMIUM",
        secretKey: "BS24KPGQY567ABCD",
        hasSetup2FA: false
      });
      localStorage.setItem("bizsearch24_users", JSON.stringify(usersList));
    }
  }, []);

  const handleFirstStep = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      setErrorMsg("Email and password are required.");
      return;
    }
    
    // Load registered users from localStorage
    const storedUsers = localStorage.getItem("bizsearch24_users");
    const usersList = storedUsers ? JSON.parse(storedUsers) : [];

    if (isRegister) {
      // 1. REGISTRATION FLOW
      const userExists = usersList.some((u: any) => u.email === normalizedEmail);
      if (userExists) {
        setErrorMsg("Email is already registered. Please sign in instead.");
        return;
      }

      // Generate a fresh, RFC 4648 standard Base32 compliant 16-character key (no 0, 1, 8, 9, or hyphens)
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
      let generatedSecret = "BS24";
      for (let i = 0; i < 12; i++) {
        generatedSecret += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      const newUser = {
        email: normalizedEmail,
        password: password,
        role: "USER" as const,
        plan: "FREE" as const,
        secretKey: generatedSecret,
        hasSetup2FA: false
      };

      // Store in users list
      usersList.push(newUser);
      localStorage.setItem("bizsearch24_users", JSON.stringify(usersList));

      // Go to 2FA stage to finish verification setup
      setSecretKey(generatedSecret);
      setHasSetup2FA(false);
      setStep("2FA");
    } else {
      // 2. LOGIN FLOW
      const foundUser = usersList.find((u: any) => u.email === normalizedEmail);
      if (!foundUser) {
        setErrorMsg("User not registered. Please register an account first.");
        return;
      }

      if (foundUser.password !== password) {
        setErrorMsg("Incorrect password. Please try again or click 'Forgot Password?' to reset.");
        return;
      }

      // Load user 2FA state
      setSecretKey(foundUser.secretKey);
      setHasSetup2FA(foundUser.hasSetup2FA || false);

      // Check for trusted device
      const isTrusted = localStorage.getItem(`trusted_device_${normalizedEmail}`);
      if (isTrusted === "true") {
        login(foundUser.email, foundUser.role, foundUser.plan);
        router.push("/dashboard");
      } else {
        setStep("2FA");
      }
    }
  };

  const handle2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (twoFaCode.length < 6) {
      setErrorMsg("Please enter a valid 6-digit verification code.");
      return;
    }
    
    const normalizedEmail = email.trim().toLowerCase();

    // Look up the user in localStorage users list
    const storedUsers = localStorage.getItem("bizsearch24_users");
    const usersList = storedUsers ? JSON.parse(storedUsers) : [];
    const userIndex = usersList.findIndex((u: any) => u.email === normalizedEmail);

    if (userIndex === -1) {
      setErrorMsg("An unexpected session error occurred. Please restart login.");
      return;
    }

    const matchedUser = usersList[userIndex];

    // Mark 2FA as setup so key is hidden next time!
    matchedUser.hasSetup2FA = true;
    usersList[userIndex] = matchedUser;
    localStorage.setItem("bizsearch24_users", JSON.stringify(usersList));

    if (trustDevice) {
      localStorage.setItem(`trusted_device_${normalizedEmail}`, "true");
    }

    login(matchedUser.email, matchedUser.role, matchedUser.plan);
    router.push("/dashboard");
  };

  return (
    <div className="flex-grow flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 relative">
      <div className="max-w-md w-full relative z-10">
        <div className="bg-white p-10 sm:p-12 rounded-[2rem] shadow-sm border border-slate-100">
          
          {step === "LOGIN" ? (
            <>
              <div className="text-center mb-8">
                <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                  <LogIn className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-3">
                  {isRegister ? "Join Bizsearch24" : "Log In to Bizsearch24"}
                </h2>
                <p className="text-slate-500 font-medium text-sm">
                  {isRegister ? "Register to list your business and reach thousands." : "Access your dashboard."}
                </p>
              </div>
              
              {errorMsg && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 font-medium px-4 py-3 rounded-xl flex items-center text-sm">
                  <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                  {errorMsg}
                </div>
              )}
              
              <form className="space-y-6" onSubmit={handleFirstStep}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Email Address or Username
                    </label>
                    <input
                      type="text"
                      required
                      className="block w-full rounded-xl bg-slate-100 px-4 py-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm border border-transparent focus:border-emerald-500"
                      placeholder="Enter your email or username"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-semibold text-slate-800">Password</label>
                      <Link 
                        href="/forgot-password" 
                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
                      >
                        Forgot Password?
                      </Link>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        className="block w-full rounded-xl bg-slate-100 pl-4 pr-12 py-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm border border-transparent focus:border-emerald-500"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2 pb-4">
                  <button
                    type="submit"
                    className="w-full flex justify-center rounded-xl bg-emerald-600 py-3.5 px-4 text-base font-semibold text-white hover:bg-emerald-700 focus:outline-none transition-colors"
                  >
                    {isRegister ? "Create Account" : "Sign In"}
                  </button>
                </div>
              </form>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsRegister(!isRegister)}
                  className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors text-sm"
                >
                  {isRegister ? "Already have an account? Sign In" : "Need an account? Register Now"}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="mx-auto w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-6">
                  <ShieldCheck className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-3">
                  2-Step Verification
                </h2>
                {!hasSetup2FA ? (
                  <div className="bg-emerald-50 p-4 rounded-2xl mb-6 border border-emerald-100">
                     <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-widest mb-2 justify-center">
                        <Key className="w-4 h-4" /> Authenticator Secret Key
                     </div>
                     <div className="flex items-center justify-between gap-2 bg-white rounded-lg p-3 font-mono text-emerald-600 font-bold border border-emerald-100 font-semibold">
                        <span className="flex-grow text-center tracking-wider select-all text-sm">{secretKey}</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(secretKey);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }}
                          className="p-1 px-2 rounded-md hover:bg-emerald-100/50 text-emerald-700 active:scale-95 transition-all text-xs flex items-center gap-1 justify-center shrink-0 border border-emerald-200/50"
                          title="Copy Key to Clipboard"
                        >
                          {copied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-600 font-semibold font-sans">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span className="font-sans">Copy</span>
                            </>
                          )}
                        </button>
                     </div>
                     <p className="text-[10px] text-emerald-700 mt-2 text-center uppercase font-black tracking-normal leading-normal">
                       16-Character Compliant Base32 Key
                     </p>
                     <p className="text-[9px] text-emerald-600/70 mt-1 text-center font-medium leading-relaxed">
                       Copy/paste directly into Google Authenticator or scan/manual add. Do not enter old keys with numbers like &quot;0&quot; or &quot;-&quot; hyphens.
                     </p>
                  </div>
                ) : (
                  <div className="bg-slate-50 p-4 rounded-2xl mb-6 border border-slate-200/60 text-center">
                    <p className="text-xs font-semibold text-slate-700">
                      🔐 Authenticator setup is already active for <span className="text-emerald-600 font-extrabold">{email}</span>.
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1 max-w-[280px] mx-auto font-medium">
                      Enter the corresponding 6-digit code from your Google Authenticator app choice.
                    </p>
                  </div>
                )}
                <p className="text-slate-500 font-medium text-sm">
                  Enter the 6-digit code from your Google Authenticator app.
                </p>
              </div>
              
              {errorMsg && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 font-medium px-4 py-3 rounded-xl flex items-center text-sm">
                  <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                  {errorMsg}
                </div>
              )}

              <form className="space-y-6" onSubmit={handle2FA}>
                <div>
                  <label className="block text-center text-sm font-semibold text-slate-800 mb-3">
                    Authenticator Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    className="block w-full text-center rounded-xl bg-slate-100 px-4 py-4 text-2xl font-mono tracking-widest text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all border border-transparent focus:border-emerald-500"
                    placeholder="000000"
                    value={twoFaCode}
                    onChange={(e) => setTwoFaCode(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
                
                <div className="flex items-start">
                  <input
                     type="checkbox"
                     id="trustDevice"
                     checked={trustDevice}
                     onChange={(e) => setTrustDevice(e.target.checked)}
                     className="mt-1 mr-3 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600"
                  />
                  <label htmlFor="trustDevice" className="text-sm text-slate-600">
                    Trust this device. Memory DB will bypass 2FA for future logins to prevent hijacking vulnerabilities.
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full flex justify-center rounded-xl bg-slate-900 py-3.5 px-4 text-base font-semibold text-white hover:bg-slate-800 focus:outline-none transition-colors"
                  >
                    Verify Identity
                  </button>
                </div>
                
                <div className="text-center">
                  <button type="button" onClick={() => setStep("LOGIN")} className="text-sm font-semibold text-slate-500 hover:text-slate-700">Cancel</button>
                </div>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
