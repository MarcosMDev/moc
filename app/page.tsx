"use client";

import { OrganogramaProvider } from "@/components/organograma-provider";
import OrganogramaView from "@/components/organograma-view";
import { Toaster } from "@/components/ui/toaster";

export default function Home() {
  return (
    <div>
      <main className="container mx-auto p-4 max-w-6xl">
        <OrganogramaView />
      </main>
      <Toaster />
    </div>
  );
}
