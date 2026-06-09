"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthCallback() {
  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const token = params.get("token");
    const redirectTo = sessionStorage.getItem("authRedirect") || "/";
    sessionStorage.removeItem("authRedirect");
    if (token) {
      login(token);
      router.push(redirectTo);
    } else {
      router.push(redirectTo);
    }
  }, [login, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Logging in...</p>
    </div>
  );
}
