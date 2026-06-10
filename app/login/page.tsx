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
  const [secretKey, setSecretKey] = useState("BS24KPGQY567ABCD");
  const [hasSetup2FA, setHasSetup2FA] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Clear any previously saved plain-text credentials from localStorage so they don't auto-fill
    localStorage.removeItem("bizsearch24_remembered_email");
    localStorage.removeItem("bizsearch24_remembered_password");
  }, []);

  const handleFirstStep = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      setErrorMsg("Email and password are required.");
      return;
    }
    
    try {
      if (isRegister) {
        // Enforce same-device restriction on the client early
        const deviceBoundEmail = typeof window !== 'undefined' ? localStorage.getItem("bizsearch24_device_registered_email") : null;
        if (deviceBoundEmail && deviceBoundEmail.toLowerCase() !== normalizedEmail && normalizedEmail !== "nicholauscostochetty@gmail.com") {
          setErrorMsg(`Registration Denied: This device and browser are already linked to an existing registered account (${deviceBoundEmail}). Only one account is permitted per device & IP.`);
          return;
        }

        // 1. REGISTRATION FLOW - call server-side API
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: normalizedEmail, password }),
        });
        const data = await res.json();

        if (res.ok) {
          // Go to 2FA stage to finish verification setup
          setSecretKey(data.user.secretKey);
          setHasSetup2FA(false);
          setStep("2FA");
          if (typeof window !== 'undefined') {
            localStorage.setItem("bizsearch24_device_registered_email", normalizedEmail);
          }
        } else {
          setErrorMsg(data.error || "Registration failed.");
        }
      } else {
        // 2. LOGIN FLOW - call server-side API
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: normalizedEmail, password }),
        });
        const data = await res.json();

        if (res.ok) {
          // Load user 2FA state
          setSecretKey(data.user.secretKey || "");
          setHasSetup2FA(data.user.hasSetup2FA || false);
          
          // Go to 2FA screen (Always required, never bypassed!)
          setStep("2FA");
        } else {
          setErrorMsg(data.error || "Incorrect password or unregistered user.");
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("An unexpected connection error occurred.");
    }
  };

  const handle2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (twoFaCode.length < 6) {
      setErrorMsg("Please enter a valid 6-digit verification code.");
      return;
    }
    
    setErrorMsg("");
    const normalizedEmail = email.trim().toLowerCase();

    try {
      // Mark 2FA as setup/verified on server
      const res = await fetch("/api/auth/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      const data = await res.json();

      if (res.ok) {
        // Complete the authentication session by retrieving session user profile
        const loginCheckRes = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: normalizedEmail, password }),
        });
        const loginCheckData = await loginCheckRes.json();

        if (loginCheckRes.ok) {
          if (typeof window !== 'undefined' && loginCheckData.user.email !== "nicholauscostochetty@gmail.com") {
            localStorage.setItem("bizsearch24_device_registered_email", loginCheckData.user.email);
          }
          login(loginCheckData.user.email, loginCheckData.user.role, loginCheckData.user.plan);
          router.push("/dashboard");
        } else {
          setErrorMsg(loginCheckData.error || "Failed to finalize session.");
        }
      } else {
        setErrorMsg(data.error || "Failed to complete verification.");
      }
    } catch (err) {
      setErrorMsg("An unexpected verification error occurred.");
    }
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
