"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrganogramaProvider } from "@/components/organograma-provider";
import CadastroForm from "@/components/cadastro-form";
import OrganogramaView from "@/components/organograma-view";
import { Toaster } from "@/components/ui/toaster";

export default function Home() {
  const [activeTab, setActiveTab] = useState("cadastro");

  return (
    <OrganogramaProvider>
      <main className="container mx-auto p-4 max-w-6xl">
        <h1 className="text-3xl font-bold text-center my-6">
          Organograma Hierárquico
        </h1>

        <Tabs
          defaultValue="cadastro"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="cadastro">Cadastro</TabsTrigger>
            <TabsTrigger value="visualizacao">Visualização</TabsTrigger>
          </TabsList>

          <TabsContent value="cadastro" className="space-y-4">
            <CadastroForm onComplete={() => setActiveTab("visualizacao")} />
          </TabsContent>

          <TabsContent value="visualizacao">
            <OrganogramaView />
          </TabsContent>
        </Tabs>
      </main>
      <Toaster />
    </OrganogramaProvider>
  );
}
