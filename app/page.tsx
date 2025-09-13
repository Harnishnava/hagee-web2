"use client";

import { useAuth } from "@clerk/nextjs";
import { LandingPage } from "@/components/landing-page";
import { Dashboard } from "@/components/dashboard";

export default function Home() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <Dashboard />;
  }

  return <LandingPage />;
}
