"use client";

import { ChevronRight, ChevronDown } from "lucide-react";

interface NodeItemProps {
  label: string;
  description?: string;
  expanded?: boolean;
  onClick?: () => void;
  level: 1 | 2 | 3;
  isLeaf?: boolean;
}

export default function NodeItem({
  label,
  description,
  expanded,
  onClick,
  level,
  isLeaf = false,
}: NodeItemProps) {
  // Configurações de estilo baseadas no nível
  const getLevelStyles = () => {
    switch (level) {
      case 1: // Setor
        return {
          container: "bg-primary/10 hover:bg-primary/15 border-primary/30",
          text: "font-semibold text-primary-foreground",
        };
      case 2: // Cargo
        return {
          container:
            "bg-secondary/10 hover:bg-secondary/15 border-secondary/30",
          text: "font-medium text-secondary-foreground",
        };
      case 3: // Atividade
        return {
          container: "bg-muted hover:bg-muted/80 border-muted-foreground/30",
          text: "text-muted-foreground",
        };
    }
  };

  const styles = getLevelStyles();

  return (
    <div
      className={`flex items-start border rounded-md p-3 transition-colors ${
        styles.container
      } ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      {!isLeaf && onClick && (
        <div className="mr-2 mt-0.5">
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      )}
      <div className="flex-1">
        <div className={`${styles.text}`}>{label}</div>
        {description && (
          <div className="text-xs text-muted-foreground mt-1">
            {description}
          </div>
        )}
      </div>
    </div>
  );
}
