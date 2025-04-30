export interface Activity {
  id: string;
  name: string;
  description: string;
  flowchartURL: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  type: DepartmentType;
  activities: Activity[];
  children: Department[];
  parentId?: string | null;
}

export type DepartmentType = "CEO" | "DIRECTORATE" | "MANAGEMENT" | "SECTOR";

export const departmentTypeLabel: Record<DepartmentType, string> = {
  CEO: "CEO",
  DIRECTORATE: "Diretoria",
  MANAGEMENT: "Gerência",
  SECTOR: "Setor",
};

export const departmentTypeHierarchy: Record<DepartmentType, DepartmentType[]> =
  {
    CEO: ["DIRECTORATE"],
    DIRECTORATE: ["MANAGEMENT"],
    MANAGEMENT: ["SECTOR"],
    SECTOR: [],
  };

export const departmentParentType: Record<
  DepartmentType,
  DepartmentType | null
> = {
  CEO: null,
  DIRECTORATE: "CEO",
  MANAGEMENT: "DIRECTORATE",
  SECTOR: "MANAGEMENT",
};
