"use client"

import { useState, useEffect } from "react"
import { useOrganograma } from "./organograma-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, Save, ChevronRight } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { Department, Activity, DepartmentType } from "@/lib/types"
import { departmentTypeLabel, departmentTypeHierarchy, departmentParentType } from "@/lib/types"

export default function CadastroForm({ onComplete }: { onComplete: () => void }) {
  const {
    departments,
    addDepartment,
    addActivity,
    findDepartmentById,
    listAllDepartments,
    listDepartmentsByType,
    getCEO,
  } = useOrganograma()

  const [activeTab, setActiveTab] = useState<DepartmentType>("DIRECTORATE")
  const [newDepartment, setNewDepartment] = useState<Partial<Department>>({
    name: "",
    description: "",
    type: "DIRECTORATE",
  })
  const [parentId, setParentId] = useState<string | null>(null)
  const [newActivity, setNewActivity] = useState<Partial<Activity>>({
    name: "",
    description: "",
    flowchartURL: "",
  })

  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null)
  const [allDepartments, setAllDepartments] = useState<
    { id: string; name: string; level: number; type: DepartmentType }[]
  >([])
  const [departmentsByType, setDepartmentsByType] = useState<
    Record<DepartmentType, { id: string; name: string; level: number }[]>
  >({
    CEO: [],
    DIRECTORATE: [],
    MANAGEMENT: [],
    SECTOR: [],
  })

  // Update the list of all departments when needed
  useEffect(() => {
    setAllDepartments(listAllDepartments())

    // Update lists by type
    setDepartmentsByType({
      CEO: listDepartmentsByType("CEO"),
      DIRECTORATE: listDepartmentsByType("DIRECTORATE"),
      MANAGEMENT: listDepartmentsByType("MANAGEMENT"),
      SECTOR: listDepartmentsByType("SECTOR"),
    })
  }, [departments, listAllDepartments, listDepartmentsByType])

  // Update department type when tab changes
  useEffect(() => {
    setNewDepartment((prev) => ({ ...prev, type: activeTab }))

    // Reset parent when changing tabs
    setParentId(null)

    // If it's a type that needs a parent, try to pre-select one
    const parentType = departmentParentType[activeTab as DepartmentType]
    if (parentType) {
      if (parentType === "CEO") {
        // For Directorates, always use CEO as parent
        setParentId(getCEO().id)
      } else if (departmentsByType[parentType].length > 0) {
        setParentId(departmentsByType[parentType][0].id)
      }
    }
  }, [activeTab, departmentsByType, getCEO])

  const handleAddDepartment = () => {
    if (newDepartment.name?.trim()) {
      // Check if it needs a parent department
      const parentType = departmentParentType[activeTab as DepartmentType]

      if (parentType && !parentId) {
        alert(
          `Um(a) ${departmentTypeLabel[activeTab as DepartmentType]} precisa estar vinculado(a) a um(a) ${departmentTypeLabel[parentType]}.`,
        )
        return
      }

      const newId = addDepartment(newDepartment, parentId)
      setNewDepartment({ name: "", description: "", type: activeTab })

      // If it's a type that can have children, select to add children
      if (departmentTypeHierarchy[activeTab as DepartmentType].length > 0) {
        setTimeout(() => {
          const nextType = departmentTypeHierarchy[activeTab as DepartmentType][0]
          setActiveTab(nextType)
          setParentId(newId)
        }, 100)
      }
    }
  }

  const handleAddActivity = () => {
    if (selectedDepartmentId && newActivity.name?.trim()) {
      addActivity(selectedDepartmentId, newActivity)
      setNewActivity({ name: "", description: "", flowchartURL: "" })
    }
  }

  // Render the list of departments recursively
  const renderDepartments = (departmentList: Department[], level = 0) => {
    return departmentList.map((dept) => (
      <div key={dept.id} className={`border rounded-lg p-4 ${level > 0 ? "ml-6 mt-4" : "mt-4"}`}>
        <h3 className="text-lg font-semibold flex items-center">
          {level > 0 && <ChevronRight className="h-4 w-4 mr-2 text-muted-foreground" />}
          <Badge variant="outline" className="mr-2">
            {departmentTypeLabel[dept.type]}
          </Badge>
          {dept.name}
          {dept.description && (
            <span className="text-sm font-normal text-muted-foreground ml-2">- {dept.description}</span>
          )}
        </h3>

        {dept.activities.length > 0 && (
          <div className="ml-6 mt-2 space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">Atividades:</h4>
            {dept.activities.map((activity) => (
              <div key={activity.id} className="border-l-2 pl-4 py-2">
                <h5 className="font-medium">{activity.name}</h5>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Render child departments recursively */}
        {dept.children && dept.children.length > 0 && (
          <div className="mt-3">{renderDepartments(dept.children, level + 1)}</div>
        )}
      </div>
    ))
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Cadastro Hierárquico</CardTitle>
          <CardDescription>
            Cadastre a estrutura organizacional seguindo a hierarquia: CEO → Diretoria → Gerência → Setor → Atividades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DepartmentType)} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="DIRECTORATE">Diretoria</TabsTrigger>
              <TabsTrigger value="MANAGEMENT">Gerência</TabsTrigger>
              <TabsTrigger value="SECTOR">Setor</TabsTrigger>
              <TabsTrigger value="ATIVIDADES">Atividades</TabsTrigger>
            </TabsList>

            {/* Form for Directorate, Management and Sector */}
            {["DIRECTORATE", "MANAGEMENT", "SECTOR"].map((type) => (
              <TabsContent key={type} value={type} className="space-y-4">
                <div className="space-y-4 p-4 border rounded-md">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Cadastro de {departmentTypeLabel[type as DepartmentType]}</h3>
                    <Badge variant="outline">{departmentTypeLabel[type as DepartmentType]}</Badge>
                  </div>

                  {/* Field to select parent department, if needed */}
                  {departmentParentType[type as DepartmentType] && (
                    <div className="space-y-2">
                      <Label htmlFor={`${type}-pai`}>
                        {type === "DIRECTORATE"
                          ? "CEO"
                          : departmentTypeLabel[departmentParentType[type as DepartmentType] as DepartmentType]}{" "}
                        (obrigatório)
                      </Label>
                      <Select
                        value={parentId || ""}
                        onValueChange={(value) => setParentId(value)}
                        disabled={type === "DIRECTORATE"} // Disable for Directorate, as it will always be linked to CEO
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              type === "DIRECTORATE"
                                ? "CEO (selecionado automaticamente)"
                                : `Selecione um(a) ${departmentTypeLabel[departmentParentType[type as DepartmentType] as DepartmentType]}`
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {type !== "DIRECTORATE" &&
                            departmentsByType[departmentParentType[type as DepartmentType] as DepartmentType].map(
                              (dept) => (
                                <SelectItem key={dept.id} value={dept.id}>
                                  {dept.name}
                                </SelectItem>
                              ),
                            )}
                        </SelectContent>
                      </Select>
                      {type === "DIRECTORATE" && (
                        <p className="text-xs text-muted-foreground">
                          Todas as Diretorias são automaticamente vinculadas ao CEO.
                        </p>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor={`${type}-nome`}>Nome</Label>
                    <Input
                      id={`${type}-nome`}
                      value={newDepartment.name}
                      onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
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
                    <Label htmlFor={`${type}-descricao`}>Descrição (opcional)</Label>
                    <Textarea
                      id={`${type}-descricao`}
                      value={newDepartment.description || ""}
                      onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })}
                      placeholder="Descreva as responsabilidades"
                      rows={2}
                    />
                  </div>

                  <Button onClick={handleAddDepartment} className="mt-2">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar {departmentTypeLabel[type as DepartmentType]}
                  </Button>
                </div>
              </TabsContent>
            ))}

            {/* Form for Activities */}
            <TabsContent value="ATIVIDADES" className="space-y-4">
              <div className="space-y-4 p-4 border rounded-md">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Cadastro de Atividades</h3>
                  <Badge variant="outline">Atividades</Badge>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="setor-select">Selecione o Setor</Label>
                  <Select value={selectedDepartmentId || ""} onValueChange={(value) => setSelectedDepartmentId(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um setor" />
                    </SelectTrigger>
                    <SelectContent>
                      {departmentsByType.SECTOR.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedDepartmentId && (
                  <div className="space-y-4 border-l-2 border-primary/20 pl-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="atividade-nome">Nome da Atividade</Label>
                      <Input
                        id="atividade-nome"
                        value={newActivity.name}
                        onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                        placeholder="Ex: Controle de Almoxarifado"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="atividade-descricao">Descrição da Atividade</Label>
                      <Textarea
                        id="atividade-descricao"
                        value={newActivity.description || ""}
                        onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                        placeholder="Descreva os detalhes desta atividade"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="atividade-fluxograma">URL do Fluxograma (opcional)</Label>
                      <Input
                        id="atividade-fluxograma"
                        value={newActivity.flowchartURL || ""}
                        onChange={(e) => setNewActivity({ ...newActivity, flowchartURL: e.target.value })}
                        placeholder="https://exemplo.com/fluxograma.png"
                      />
                    </div>
                    <Button onClick={handleAddActivity} className="mt-2">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Adicionar Atividade
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* List of registered items */}
      <Card>
        <CardHeader>
          <CardTitle>Estrutura Organizacional</CardTitle>
          <CardDescription>Visualize a estrutura organizacional cadastrada</CardDescription>
        </CardHeader>
        <CardContent>
          {departments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum item cadastrado ainda. Comece adicionando uma Diretoria.
            </div>
          ) : (
            <div className="space-y-4">{renderDepartments(departments)}</div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="lg" onClick={onComplete} disabled={departments.length === 0}>
          <Save className="mr-2 h-5 w-5" />
          Visualizar Organograma
        </Button>
      </div>
    </div>
  )
}
