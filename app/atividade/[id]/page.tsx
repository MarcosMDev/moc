"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useOrganograma } from "@/components/organograma-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, FileText, Edit } from "lucide-react";
import type { Activity } from "@/lib/types";

export default function AtividadeDetalhes({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { findActivityById, findDepartmentByActivityId } = useOrganograma();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [departmentName, setDepartmentName] = useState<string>("");

  useEffect(() => {
    const foundActivity = findActivityById(params.id);
    if (foundActivity) {
      setActivity(foundActivity);

      const department = findDepartmentByActivityId(params.id);
      if (department) {
        setDepartmentName(department.name);
      }
    }
  }, [params.id, findActivityById, findDepartmentByActivityId]);

  if (!activity) {
    return (
      <div className="container mx-auto p-4 max-w-3xl">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">
              Atividade não encontrada
            </h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              A atividade solicitada não foi encontrada ou foi removida.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{activity.name}</CardTitle>
              <CardDescription>{departmentName}</CardDescription>
            </div>
            <Button variant="outline" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Descrição</h3>
            <div className="bg-muted/30 p-4 rounded-md">
              {activity.description || "Nenhuma descrição disponível."}
            </div>
          </div>

          {activity.flowchartURL && (
            <div>
              <h3 className="text-lg font-medium mb-2">Fluxograma</h3>
              <div className="border rounded-md overflow-hidden bg-white">
                <img
                  src={activity.flowchartURL || "/placeholder.svg"}
                  alt={`Fluxograma de ${activity.name}`}
                  className="w-full h-auto max-h-[500px] object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg?height=400&width=600";
                    target.alt = "Imagem não disponível";
                  }}
                />
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t pt-6 flex justify-between">
          <div className="text-sm text-muted-foreground">ID: {activity.id}</div>
        </CardFooter>
      </Card>
    </div>
  );
}
