"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListOrdered } from "lucide-react";
import type { TreeStep } from "@/lib/red-black-tree";

type ValueStatus = "inserted" | "deleted";

interface ValueWithStatus {
  value: number;
  status: ValueStatus;
  stepIndex: number;
}

interface SequenceDisplayProps {
  steps: TreeStep[];
  currentStep: number;
  className?: string;
  onGoToStep?: (step: number) => void;
}

export function SequenceDisplay({ steps, currentStep, className, onGoToStep }: SequenceDisplayProps) {
  const getSequenceWithStatus = (): ValueWithStatus[] => {
    const result: ValueWithStatus[] = [];

    const stepsToProcess = steps.slice(0, currentStep + 1);

    stepsToProcess.forEach((step, index) => {
      if (step.type === "insert") {
        const match = step.description.match(/Inserido nó (\d+)/);
        if (match) {
          const value = parseInt(match[1], 10);
          if (!isNaN(value)) {
            result.push({
              value,
              status: "inserted",
              stepIndex: index,
            });
          }
        }
      } else if (step.type === "delete") {
        const match = step.description.match(/Removido nó (\d+)/);
        if (match) {
          const value = parseInt(match[1], 10);
          if (!isNaN(value)) {
            result.push({
              value,
              status: "deleted",
              stepIndex: index,
            });
          }
        }
      }
    });

    return result;
  };

  const sequenceWithStatus = getSequenceWithStatus();

  return (
    <Card className={`p-4 ${className || ""}`}>
      <div className="flex items-center gap-3">
        <ListOrdered className="w-4 h-4 text-muted-foreground shrink-0" />
        <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
          <span className="text-sm font-semibold text-muted-foreground shrink-0">
            Sequência:
          </span>
          {sequenceWithStatus.length > 0 ? (
            <>
              {sequenceWithStatus.map((item, index) => {
                let badgeClassName = "font-mono";

                if (item.status === "deleted") {
                  badgeClassName += " bg-red-500/15 text-red-700 border-red-600/30";
                } else {
                  badgeClassName += " bg-green-500/15 text-green-700 border-green-600/30";
                }

                if (onGoToStep) {
                  badgeClassName += " cursor-pointer hover:opacity-80 transition-opacity";

                  if (item.stepIndex === currentStep) {
                    badgeClassName += " ring-2 ring-blue-500 ring-offset-1";
                  }
                }

                const isDelete = item.status === "deleted";

                return (
                  <React.Fragment key={`${item.value}-${index}`}>
                    <Badge
                      variant="outline"
                      className={badgeClassName}
                      onClick={() => onGoToStep?.(item.stepIndex)}
                      title={
                        onGoToStep
                          ? `${isDelete ? "Ir para remoção" : "Ir para inserção"} do valor ${item.value}`
                          : undefined
                      }
                    >
                      {item.value}
                    </Badge>
                    {index < sequenceWithStatus.length - 1 && (
                      <span className="text-muted-foreground/50">→</span>
                    )}
                  </React.Fragment>
                );
              })}
            </>
          ) : (
            <span className="text-sm text-muted-foreground italic">
              Nenhum valor inserido
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}

