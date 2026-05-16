"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthCallback() {
  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      login(token);
      router.push("/dashboard");
    } else {
      router.push("/dashboard");
    }
  }, [login, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Logging in...</p>
    </div>
  );
}
