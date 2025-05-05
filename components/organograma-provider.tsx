"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import type { Department, Activity, DepartmentType } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from "uuid";
import { departmentTypeLabel } from "@/lib/types";

type OrgChartContextType = {
  departments: Department[];
  addDepartment: (
    department: Partial<Department>,
    parentId?: string | null
  ) => string;
  addActivity: (departmentId: string, activity: Partial<Activity>) => void;
  loadData: () => void;
  saveData: () => void;
  findDepartmentById: (id: string) => Department | null;
  findDepartmentPath: (id: string) => Department[];
  findActivityById: (id: string) => Activity | null;
  findDepartmentByActivityId: (activityId: string) => Department | null;
  listAllDepartments: () => {
    id: string;
    name: string;
    level: number;
    type: DepartmentType;
  }[];
  listDepartmentsByType: (
    type: DepartmentType
  ) => { id: string; name: string; level: number }[];
  getCEO: () => Department;
};

const OrgChartContext = createContext<OrgChartContextType | undefined>(
  undefined
);

// Fixed ID for CEO to make references easier
const CEO_ID = "ceo-root-node";

export function OrganogramaProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const { toast } = useToast();

  // Ensure CEO exists
  useEffect(() => {
    const ceoExists = departments.some((dept) => dept.id === CEO_ID);

    if (!ceoExists) {
      setDepartments((prev) => [
        ...prev,
        {
          id: CEO_ID,
          name: "CEO",
          type: "CEO",
          activities: [],
          children: [],
          parentId: null,
        },
      ]);
    }
  }, []);

  // Get CEO node
  const getCEO = (): Department => {
    const ceo = departments.find((dept) => dept.id === CEO_ID);

    if (!ceo) {
      // Create CEO if it doesn't exist (shouldn't happen due to the useEffect above)
      const newCEO: Department = {
        id: CEO_ID,
        name: "CEO",
        description: "",
        type: "CEO",
        activities: [],
        children: [],
        parentId: null,
      };

      setDepartments((prev) => [...prev, newCEO]);
      return newCEO;
    }

    return ceo;
  };

  // Load data from localStorage on start
  useEffect(() => {
    loadData();
  }, []);

  // Recursive function to find a department by ID at any level of the hierarchy
  const findDepartmentById = (
    id: string,
    departmentList = departments
  ): Department | null => {
    for (const dept of departmentList) {
      if (dept.id === id) {
        return dept;
      }

      if (dept.children && dept.children.length > 0) {
        const foundDept = findDepartmentById(id, dept.children);
        if (foundDept) {
          return foundDept;
        }
      }
    }

    return null;
  };

  // Function to find an activity by ID
  const findActivityById = (id: string): Activity | null => {
    let foundActivity: Activity | null = null;

    const searchInDepartment = (departmentList: Department[]) => {
      for (const dept of departmentList) {
        // Search in this department's activities
        const activity = dept.activities.find((act) => act.id === id);
        if (activity) {
          foundActivity = activity;
          return true;
        }

        // Search in children departments
        if (dept.children && dept.children.length > 0) {
          if (searchInDepartment(dept.children)) {
            return true;
          }
        }
      }
      return false;
    };

    searchInDepartment(departments);
    return foundActivity;
  };

  // Function to find the department that contains a specific activity
  const findDepartmentByActivityId = (
    activityId: string
  ): Department | null => {
    let foundDepartment: Department | null = null;

    const searchInDepartment = (departmentList: Department[]) => {
      for (const dept of departmentList) {
        // Check if this department has the activity
        if (dept.activities.some((act) => act.id === activityId)) {
          foundDepartment = dept;
          return true;
        }

        // Search in children departments
        if (dept.children && dept.children.length > 0) {
          if (searchInDepartment(dept.children)) {
            return true;
          }
        }
      }
      return false;
    };

    searchInDepartment(departments);
    return foundDepartment;
  };

  // Function to find the path to a department (list of parent departments)
  const findDepartmentPath = (id: string): Department[] => {
    const path: Department[] = [];

    const findPath = (
      id: string,
      departmentList: Department[],
      currentPath: Department[]
    ): boolean => {
      for (const dept of departmentList) {
        if (dept.id === id) {
          currentPath.push(dept);
          return true;
        }

        if (dept.children && dept.children.length > 0) {
          currentPath.push(dept);
          const found = findPath(id, dept.children, currentPath);
          if (found) {
            return true;
          }
          currentPath.pop();
        }
      }

      return false;
    };

    findPath(id, departments, path);
    return path;
  };

  // Function to list all departments in a flat format with level information
  const listAllDepartments = () => {
    const list: {
      id: string;
      name: string;
      level: number;
      type: DepartmentType;
    }[] = [];

    const addDepartments = (departmentList: Department[], level: number) => {
      for (const dept of departmentList) {
        list.push({ id: dept.id, name: dept.name, level, type: dept.type });

        if (dept.children && dept.children.length > 0) {
          addDepartments(dept.children, level + 1);
        }
      }
    };

    addDepartments(departments, 0);
    return list;
  };

  // Function to list departments of a specific type
  const listDepartmentsByType = (type: DepartmentType) => {
    const list: { id: string; name: string; level: number }[] = [];

    const addDepartmentsByType = (
      departmentList: Department[],
      level: number
    ) => {
      for (const dept of departmentList) {
        if (dept.type === type) {
          list.push({ id: dept.id, name: dept.name, level });
        }

        if (dept.children && dept.children.length > 0) {
          addDepartmentsByType(dept.children, level + 1);
        }
      }
    };

    addDepartmentsByType(departments, 0);
    return list;
  };

  // Recursive function to add a child department to an existing department
  const addChildDepartment = (
    departmentList: Department[],
    parentId: string,
    newDepartment: Department
  ): Department[] => {
    return departmentList.map((dept) => {
      if (dept.id === parentId) {
        return {
          ...dept,
          children: [...dept.children, newDepartment],
        };
      }

      if (dept.children && dept.children.length > 0) {
        return {
          ...dept,
          children: addChildDepartment(dept.children, parentId, newDepartment),
        };
      }

      return dept;
    });
  };

  const addDepartment = (
    department: Partial<Department>,
    parentId: string | null = null
  ): string => {
    const newId = uuidv4();
    const newDepartment: Department = {
      id: newId,
      name: department.name || "Novo Departamento",
      description: department.description || "",
      type: department.type || "SECTOR",
      activities: [],
      children: [],
      parentId: parentId,
    };

    // If it's a Directorate and no parent specified, link to CEO
    if (department.type === "DIRECTORATE" && !parentId) {
      parentId = CEO_ID;
    }

    if (parentId) {
      // Add as a child of an existing department
      setDepartments((prev) =>
        addChildDepartment(prev, parentId!, newDepartment)
      );
    } else {
      // Add as a root department
      setDepartments((prev) => [...prev, newDepartment]);
    }

    toast({
      title: "Item adicionado",
      description: `${departmentTypeLabel[newDepartment.type]}: "${
        newDepartment.name
      }" foi adicionado com sucesso.`,
    });

    return newId;
  };

  // Recursive function to add an activity to a department
  const addActivityToDepartment = (
    departmentList: Department[],
    departmentId: string,
    newActivity: Activity
  ): Department[] => {
    return departmentList.map((dept) => {
      if (dept.id === departmentId) {
        return {
          ...dept,
          activities: [...dept.activities, newActivity],
        };
      }

      if (dept.children && dept.children.length > 0) {
        return {
          ...dept,
          children: addActivityToDepartment(
            dept.children,
            departmentId,
            newActivity
          ),
        };
      }

      return dept;
    });
  };

  const addActivity = (departmentId: string, activity: Partial<Activity>) => {
    const newActivity: Activity = {
      id: uuidv4(),
      name: activity.name || "Nova Atividade",
      description: activity.description || "",
      flowchartURL: activity.flowchartURL || "",
    };

    setDepartments((prev) =>
      addActivityToDepartment(prev, departmentId, newActivity)
    );

    toast({
      title: "Atividade adicionada",
      description: `A atividade "${newActivity.name}" foi adicionada com sucesso.`,
    });
  };

  const loadData = () => {
    try {
      const savedData = localStorage.getItem("organograma-dados");
      if (savedData) {
        const data = JSON.parse(savedData);

        // Ensure CEO exists in loaded data
        const ceoExists = data.some((dept: Department) => dept.id === CEO_ID);

        if (!ceoExists) {
          data.push({
            id: CEO_ID,
            name: "CEO",
            description: "",
            type: "CEO",
            activities: [],
            children: [],
            parentId: null,
          });
        }

        setDepartments(data);
        toast({
          title: "Dados carregados",
          description: "Os dados do organograma foram carregados com sucesso.",
        });
      } else {
        // If no data, initialize with CEO
        setDepartments([
          {
            id: CEO_ID,
            name: "CEO",
            description: "",
            type: "CEO",
            activities: [],
            children: [],
            parentId: null,
          },
        ]);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Ocorreu um erro ao carregar os dados do organograma.",
        variant: "destructive",
      });

      // In case of error, initialize with CEO
      setDepartments([
        {
          id: CEO_ID,
          name: "CEO",
          description: "",
          type: "CEO",
          activities: [],
          children: [],
          parentId: null,
        },
      ]);
    }
  };

  const saveData = () => {
    try {
      localStorage.setItem("organograma-dados", JSON.stringify(departments));
      toast({
        title: "Dados salvos",
        description: "Os dados do organograma foram salvos com sucesso.",
      });
    } catch (error) {
      console.error("Error saving data:", error);
      toast({
        title: "Erro ao salvar dados",
        description: "Ocorreu um erro ao salvar os dados do organograma.",
        variant: "destructive",
      });
    }
  };

  // Save data automatically when there are changes
  useEffect(() => {
    if (departments.length > 0) {
      saveData();
    }
  }, [departments]);

  return (
    <OrgChartContext.Provider
      value={{
        departments,
        addDepartment,
        addActivity,
        loadData,
        saveData,
        findDepartmentById,
        findDepartmentPath,
        findActivityById,
        findDepartmentByActivityId,
        listAllDepartments,
        listDepartmentsByType,
        getCEO,
      }}
    >
      {children}
    </OrgChartContext.Provider>
  );
}

export function useOrganograma() {
  const context = useContext(OrgChartContext);
  if (context === undefined) {
    throw new Error(
      "useOrganograma deve ser usado dentro de um OrganogramaProvider"
    );
  }
  return context;
}
