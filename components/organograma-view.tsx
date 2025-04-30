"use client";

import { useState, useCallback } from "react";
import { useOrganograma } from "./organograma-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  PlusCircle,
  FolderOpen,
} from "lucide-react";
import Tree from "react-d3-tree";
import type { Department } from "@/lib/types";
import { useMobile } from "@/hooks/use-mobile";
import AddItemDialog from "./add-item-dialog";
import ActivitiesDialog from "./activities-dialog";

// Types for react-d3-tree
interface TreeNode {
  name: string;
  attributes?: Record<string, string>;
  children?: TreeNode[];
  _collapsed?: boolean;
  nodeData?: any;
}

export default function OrganogramaView() {
  const { departments, saveData, getCEO, findDepartmentById } =
    useOrganograma();
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.8);
  const [isVertical, setIsVertical] = useState(true);
  const isMobile = useMobile();

  // Dialog states
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);
  const [activitiesDialogOpen, setActivitiesDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);
  const [addItemInitialTab, setAddItemInitialTab] = useState<
    "DIRECTORATE" | "MANAGEMENT" | "SECTOR" | "ACTIVITY"
  >("DIRECTORATE");
  const [preSelectedParentId, setPreSelectedParentId] = useState<string | null>(
    null
  );

  // Convert organization chart data to the format expected by react-d3-tree
  const transformDataToTreeFormat = useCallback((): TreeNode => {
    // Recursive function to transform departments and their children
    const transformDepartment = (department: Department): TreeNode => {
      const children: TreeNode[] = [];

      // Add child departments
      if (department.children && department.children.length > 0) {
        department.children.forEach((childDept) => {
          children.push(transformDepartment(childDept));
        });
      }

      // Add activities node if there are activities
      if (department.activities.length > 0 && department.type === "SECTOR") {
        children.push({
          name: "Atividades",
          attributes: {
            tipo: "ACTIVITIES_GROUP",
            count: `${department.activities.length} atividade(s)`,
          },
          nodeData: {
            departmentId: department.id,
            isActivitiesNode: true,
          },
        });
      }

      return {
        name: department.name,
        attributes: {
          tipo: department.type,
          descricao: department.description || "",
        },
        children: children.length > 0 ? children : undefined,
        nodeData: {
          departmentId: department.id,
          isActivitiesNode: false,
        },
      };
    };

    // Get CEO and use it as root node
    const ceo = getCEO();
    return transformDepartment(ceo);
  }, [departments, getCEO]);

  // Handle node click
  const handleNodeClick = (nodeDatum: any) => {
    console.log("Node clicked:", nodeDatum);

    if (nodeDatum.nodeData?.isActivitiesNode) {
      // Se é um nó de atividades, buscar o departamento pelo ID
      const departmentId = nodeDatum.nodeData.departmentId;
      const department = findDepartmentById(departmentId);

      console.log("Department found:", department);

      if (department) {
        setSelectedDepartment(department);
        setActivitiesDialogOpen(true);
      }
    }
  };

  // Handle adding activity from activities dialog
  const handleAddActivity = (departmentId: string) => {
    setPreSelectedParentId(departmentId);
    setAddItemInitialTab("ACTIVITY");
    setAddItemDialogOpen(true);
  };

  // Custom component for tree nodes
  const renderCustomNodeElement = ({ nodeDatum, toggleNode }: any) => {
    const nodeType = nodeDatum.attributes?.tipo || "DESCONHECIDO";

    // Define colors and styles based on node type
    const getNodeStyles = () => {
      switch (nodeType) {
        case "CEO":
          return {
            container:
              "bg-gradient-to-r from-purple-700 to-purple-900 border-purple-950",
            text: "text-white font-bold",
          };
        case "DIRECTORATE":
          return {
            container:
              "bg-gradient-to-r from-blue-500 to-blue-600 border-blue-700",
            text: "text-white font-semibold",
          };
        case "MANAGEMENT":
          return {
            container:
              "bg-gradient-to-r from-green-500 to-green-600 border-green-700",
            text: "text-white",
          };
        case "SECTOR":
          return {
            container:
              "bg-gradient-to-r from-yellow-500 to-yellow-600 border-yellow-700",
            text: "text-yellow-950",
          };
        case "ACTIVITIES_GROUP":
          return {
            container:
              "bg-gradient-to-r from-gray-100 to-gray-200 border-gray-300",
            text: "text-amber-950",
          };
        default:
          return {
            container: "bg-gray-200 border-gray-400",
            text: "text-gray-800",
          };
      }
    };

    const styles = getNodeStyles();
    const isActivitiesNode = nodeType === "ACTIVITIES_GROUP";
    const isCEO = nodeType === "CEO";

    return (
      <g>
        <foreignObject
          width={isCEO ? 180 : 160}
          height={isCEO ? 60 : 50}
          x={isCEO ? -90 : -80}
          y={isCEO ? -30 : -25}
          style={{ overflow: "visible" }}
        >
          <div
            className={`h-full w-full rounded-md border-2 shadow-md px-2 py-1 cursor-pointer transition-all hover:shadow-lg ${styles.container}`}
            onClick={(e) => {
              e.stopPropagation();
              if (isActivitiesNode) {
                handleNodeClick(nodeDatum);
              } else {
                toggleNode && toggleNode();
              }
            }}
          >
            <div className={`text-xs truncate ${styles.text}`}>
              {!isCEO && !isActivitiesNode && (
                <span className="text-[9px] opacity-90 block">
                  {nodeType === "DIRECTORATE"
                    ? "DIRETORIA"
                    : nodeType === "MANAGEMENT"
                    ? "GERÊNCIA"
                    : nodeType === "SECTOR"
                    ? "SETOR"
                    : ""}
                </span>
              )}
              {nodeDatum.name}
            </div>
            {nodeDatum.attributes?.descricao && !isActivitiesNode && (
              <div className="text-[10px] truncate opacity-80">
                {nodeDatum.attributes.descricao.substring(0, 20)}
                {nodeDatum.attributes.descricao.length > 20 ? "..." : ""}
              </div>
            )}
            {isActivitiesNode && (
              <div className="text-[10px] flex items-center">
                <FolderOpen className="h-3 w-3 mr-1" />
                {nodeDatum.attributes?.count}
              </div>
            )}
          </div>
        </foreignObject>
      </g>
    );
  };

  // Set initial tree position
  const handleTreeInitialized = useCallback(() => {
    const dimensions = {
      width: typeof window !== "undefined" ? window.innerWidth - 100 : 1000,
      height: typeof window !== "undefined" ? window.innerHeight - 200 : 800,
    };
    setTranslate({
      x: dimensions.width / 2,
      y: 50, // Lower value to start more at the top
    });
  }, []);

  const toggleOrientation = () => {
    setIsVertical((prev) => !prev);
    // Readjust view after changing orientation
    setTimeout(handleTreeInitialized, 50);
  };

  const exportJSON = () => {
    const dataStr = JSON.stringify(departments, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = "organograma-dados.json";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.3));
  };

  const handleReset = () => {
    handleTreeInitialized();
    setZoom(0.8);
  };

  const handleAddItem = () => {
    setPreSelectedParentId(null);
    setAddItemDialogOpen(true);
  };

  if (departments.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">Nenhum dado cadastrado</h3>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            Você ainda não cadastrou nenhum setor no organograma.
          </p>
          <Button onClick={handleAddItem}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Item
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Visualização do Organograma</CardTitle>
            <CardDescription>
              Clique nos itens para expandir ou recolher
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center border rounded-md">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleZoomIn}
                className="h-8 w-8"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleZoomOut}
                className="h-8 w-8"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleReset}
                className="h-8 w-8"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleOrientation}
              className="text-xs"
            >
              {isVertical ? "Horizontal" : "Vertical"}
            </Button>
            <Button variant="outline" onClick={exportJSON}>
              <Download className="mr-2 h-4 w-4" />
              Exportar JSON
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div
            className="organograma-tree border rounded-lg bg-muted/30 overflow-hidden"
            style={{ height: "70vh" }}
          >
            <Tree
              data={transformDataToTreeFormat()}
              orientation={isVertical ? "vertical" : "horizontal"}
              translate={translate}
              zoom={zoom}
              nodeSize={{ x: 180, y: 120 }}
              renderCustomNodeElement={renderCustomNodeElement}
              pathFunc="step"
              separation={{ siblings: 1.2, nonSiblings: 1.5 }}
              enableLegacyTransitions={true}
              transitionDuration={300}
              collapsible={true}
              zoomable={true}
              draggable={true}
              pathClassFunc={() => "stroke-muted-foreground stroke-[1.5px]"}
            />
          </div>
        </CardContent>
      </Card>

      {/* Botão flutuante único para adicionar itens */}
      <div className="fixed bottom-8 right-8">
        <Button
          onClick={handleAddItem}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg"
        >
          <PlusCircle className="h-6 w-6" />
          <span className="sr-only">Adicionar Item</span>
        </Button>
      </div>

      {/* Dialogs */}
      <AddItemDialog
        open={addItemDialogOpen}
        onOpenChange={setAddItemDialogOpen}
        initialTab={addItemInitialTab}
        preSelectedParentId={preSelectedParentId ?? undefined}
      />

      <ActivitiesDialog
        open={activitiesDialogOpen}
        onOpenChange={setActivitiesDialogOpen}
        department={selectedDepartment}
        onAddActivity={handleAddActivity}
      />
    </div>
  );
}
