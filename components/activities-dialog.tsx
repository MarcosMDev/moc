"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PlusCircle, FileText, ArrowRight } from "lucide-react";
import type { Activity, Department } from "@/lib/types";

interface ActivitiesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department: Department | null;
  onAddActivity: (departmentId: string) => void;
}

export default function ActivitiesDialog({
  open,
  onOpenChange,
  department,
  onAddActivity,
}: ActivitiesDialogProps) {
  const router = useRouter();

  if (!department) {
    return null;
  }

  const handleViewActivity = (activityId: string) => {
    router.push(`/atividade/${activityId}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Atividades de {department.name}</DialogTitle>
          <DialogDescription>
            Lista de todas as atividades associadas a este setor.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {department.activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 text-muted-foreground/70" />
              <p>Nenhuma atividade cadastrada para este setor.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  onOpenChange(false);
                  onAddActivity(department.id);
                }}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Atividade
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {department.activities.map((activity: Activity) => (
                <div
                  key={activity.id}
                  className="border rounded-md p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => handleViewActivity(activity.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{activity.name}</h3>
                      {activity.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {activity.description}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              ))}

              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => {
                    onOpenChange(false);
                    onAddActivity(department.id);
                  }}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Adicionar Atividade
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
