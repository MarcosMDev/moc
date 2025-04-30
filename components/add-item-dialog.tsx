"use client";

import { useState } from "react";
import { useOrganograma } from "./organograma-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  departmentTypeLabel,
  departmentParentType,
  type DepartmentType,
} from "@/lib/types";

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: DepartmentType | "ACTIVITY";
  preSelectedParentId?: string;
}

export default function AddItemDialog({
  open,
  onOpenChange,
  initialTab = "DIRECTORATE",
  preSelectedParentId,
}: AddItemDialogProps) {
  const {
    departments,
    addDepartment,
    addActivity,
    listDepartmentsByType,
    getCEO,
  } = useOrganograma();

  const [activeTab, setActiveTab] = useState<DepartmentType | "ACTIVITY">(
    initialTab
  );
  const [newDepartment, setNewDepartment] = useState({
    name: "",
    description: "",
    type: initialTab as DepartmentType,
  });
  const [parentId, setParentId] = useState<string | null>(
    preSelectedParentId || null
  );
  const [newActivity, setNewActivity] = useState({
    name: "",
    description: "",
    flowchartURL: "",
  });
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<
    string | null
  >(preSelectedParentId || null);

  // Reset form when dialog opens
  const onOpenChangeWrapper = (open: boolean) => {
    if (!open) {
      // Reset form
      setNewDepartment({
        name: "",
        description: "",
        type: initialTab as DepartmentType,
      });
      setNewActivity({
        name: "",
        description: "",
        flowchartURL: "",
      });

      // Keep the preselected parent if provided
      if (!preSelectedParentId) {
        setParentId(null);
        setSelectedDepartmentId(null);
      }
    }
    onOpenChange(open);
  };

  const handleAddDepartment = () => {
    if (newDepartment.name.trim()) {
      let finalParentId = parentId;

      // Se for uma Diretoria, sempre vincular à Diretoria Gerencial (CEO)
      if (activeTab === "DIRECTORATE") {
        finalParentId = getCEO().id;
      } else {
        // Para outros tipos, verificar se precisa de um departamento pai
        const parentType = departmentParentType[activeTab as DepartmentType];

        if (parentType && !finalParentId) {
          alert(
            `Um(a) ${
              departmentTypeLabel[activeTab as DepartmentType]
            } precisa estar vinculado(a) a um(a) ${
              departmentTypeLabel[parentType]
            }.`
          );
          return;
        }
      }

      addDepartment(newDepartment, finalParentId);
      onOpenChangeWrapper(false);
    }
  };

  const handleAddActivity = () => {
    if (selectedDepartmentId && newActivity.name.trim()) {
      addActivity(selectedDepartmentId, newActivity);
      onOpenChangeWrapper(false);
    }
  };

  // Get departments by type for parent selection
  const getDepartmentOptions = (type: DepartmentType) => {
    return listDepartmentsByType(type).map((dept) => (
      <SelectItem key={dept.id} value={dept.id}>
        {dept.name}
      </SelectItem>
    ));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChangeWrapper}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Item ao Organograma</DialogTitle>
          <DialogDescription>
            Selecione o tipo de item que deseja adicionar e preencha as
            informações necessárias.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as DepartmentType | "ACTIVITY")
          }
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="DIRECTORATE">Diretoria</TabsTrigger>
            <TabsTrigger value="MANAGEMENT">Gerência</TabsTrigger>
            <TabsTrigger value="SECTOR">Setor</TabsTrigger>
            <TabsTrigger value="ACTIVITY">Atividade</TabsTrigger>
          </TabsList>

          {/* Forms for Directorate, Management, Sector */}
          {(["DIRECTORATE", "MANAGEMENT", "SECTOR"] as DepartmentType[]).map(
            (type) => (
              <TabsContent key={type} value={type} className="space-y-4 py-4">
                {/* Parent department selection */}
                {departmentParentType[type] && (
                  <div className="space-y-2">
                    <Label htmlFor={`${type}-parent`}>
                      {type === "DIRECTORATE"
                        ? "CEO"
                        : departmentTypeLabel[
                            departmentParentType[type] as DepartmentType
                          ]}{" "}
                      (obrigatório)
                    </Label>
                    <Select
                      value={parentId || ""}
                      onValueChange={(value) => setParentId(value)}
                      disabled={
                        type === "DIRECTORATE" || Boolean(preSelectedParentId)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            type === "DIRECTORATE"
                              ? "Diretoria Gerencial (selecionado automaticamente)"
                              : `Selecione um(a) ${
                                  departmentTypeLabel[
                                    departmentParentType[type] as DepartmentType
                                  ]
                                }`
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {type === "DIRECTORATE" ? (
                          <SelectItem value={getCEO().id}>
                            Diretoria Gerencial
                          </SelectItem>
                        ) : (
                          getDepartmentOptions(
                            departmentParentType[type] as DepartmentType
                          )
                        )}
                      </SelectContent>
                    </Select>
                    {type === "DIRECTORATE" && (
                      <p className="text-xs text-muted-foreground">
                        Todas as Diretorias são automaticamente vinculadas à
                        Diretoria Gerencial.
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor={`${type}-name`}>Nome</Label>
                  <Input
                    id={`${type}-name`}
                    value={newDepartment.name}
                    onChange={(e) =>
                      setNewDepartment({
                        ...newDepartment,
                        name: e.target.value,
                        type,
                      })
                    }
                    placeholder={`Ex: ${
                      type === "DIRECTORATE"
                        ? "Diretoria Financeira"
                        : type === "MANAGEMENT"
                        ? "Gerência Financeira"
                        : "Financeiro"
                    }`}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`${type}-description`}>
                    Descrição (opcional)
                  </Label>
                  <Textarea
                    id={`${type}-description`}
                    value={newDepartment.description}
                    onChange={(e) =>
                      setNewDepartment({
                        ...newDepartment,
                        description: e.target.value,
                      })
                    }
                    placeholder="Descreva as responsabilidades"
                    rows={3}
                  />
                </div>
              </TabsContent>
            )
          )}

          {/* Form for Activities */}
          <TabsContent value="ACTIVITY" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sector-select">Selecione o Setor</Label>
              <Select
                value={selectedDepartmentId || ""}
                onValueChange={(value) => setSelectedDepartmentId(value)}
                disabled={Boolean(preSelectedParentId)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um setor" />
                </SelectTrigger>
                <SelectContent>{getDepartmentOptions("SECTOR")}</SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="activity-name">Nome da Atividade</Label>
              <Input
                id="activity-name"
                value={newActivity.name}
                onChange={(e) =>
                  setNewActivity({ ...newActivity, name: e.target.value })
                }
                placeholder="Ex: Controle de Almoxarifado"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="activity-description">
                Descrição da Atividade
              </Label>
              <Textarea
                id="activity-description"
                value={newActivity.description}
                onChange={(e) =>
                  setNewActivity({
                    ...newActivity,
                    description: e.target.value,
                  })
                }
                placeholder="Descreva os detalhes desta atividade"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="activity-flowchart">
                URL do Fluxograma (opcional)
              </Label>
              <Input
                id="activity-flowchart"
                value={newActivity.flowchartURL}
                onChange={(e) =>
                  setNewActivity({
                    ...newActivity,
                    flowchartURL: e.target.value,
                  })
                }
                placeholder="https://exemplo.com/fluxograma.png"
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChangeWrapper(false)}>
            Cancelar
          </Button>
          <Button
            onClick={
              activeTab === "ACTIVITY" ? handleAddActivity : handleAddDepartment
            }
            disabled={
              (activeTab === "ACTIVITY" && !selectedDepartmentId) ||
              (activeTab !== "ACTIVITY" && !newDepartment.name.trim())
            }
          >
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
