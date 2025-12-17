"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { TreeVisualization } from "./tree-visualization";
import { PseudocodeDisplay } from "./pseudocode-display";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Maximize2,
  Minimize2,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
  Plus,
  Minus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { SequenceDisplay } from "./sequence-display";

interface PresentationModeProps {
  onExit: () => void;
  tree: any;
  nodePositions: any;
  currentStep: number;
  totalSteps: number;
  steps: any[];
  canGoNext: boolean;
  canGoPrevious: boolean;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;
  reset: () => void;
  onInsert: (value: number | number[]) => void;
  onRemove: (value: number) => boolean;
}

export function PresentationMode({
  onExit,
  tree,
  nodePositions,
  currentStep,
  totalSteps,
  steps,
  canGoNext,
  canGoPrevious,
  nextStep,
  previousStep,
  goToStep,
  reset,
  onInsert,
  onRemove,
}: PresentationModeProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1000);
  const [showStats, setShowStats] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const previousTotalStepsRef = useRef<number>(totalSteps);
  const shouldNavigateToNewOperationRef = useRef<boolean>(false);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      if (canGoNext) {
        nextStep();
      } else {
        setIsPlaying(false);
      }
    }, playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, canGoNext, nextStep, playbackSpeed]);

  // Detecta quando novos passos foram adicionados após inserção/remoção
  useEffect(() => {
    if (
      shouldNavigateToNewOperationRef.current &&
      totalSteps > previousTotalStepsRef.current
    ) {
      const firstStepOfNewOperation = previousTotalStepsRef.current;
      goToStep(firstStepOfNewOperation);
      shouldNavigateToNewOperationRef.current = false;
      previousTotalStepsRef.current = totalSteps;

      // Inicia a reprodução automaticamente após um pequeno delay
      // para garantir que a navegação aconteceu primeiro
      setTimeout(() => {
        if (firstStepOfNewOperation < totalSteps - 1) {
          setIsPlaying(true);
        }
      }, 50);
    } else if (
      totalSteps !== previousTotalStepsRef.current &&
      !shouldNavigateToNewOperationRef.current
    ) {
      previousTotalStepsRef.current = totalSteps;
    }
  }, [totalSteps, goToStep]);

  // Verificação adicional baseada nos steps para garantir detecção
  useEffect(() => {
    if (
      shouldNavigateToNewOperationRef.current &&
      steps.length > previousTotalStepsRef.current
    ) {
      const firstStepOfNewOperation = previousTotalStepsRef.current;
      goToStep(firstStepOfNewOperation);
      shouldNavigateToNewOperationRef.current = false;
      previousTotalStepsRef.current = steps.length;

      // Inicia a reprodução automaticamente após um pequeno delay
      setTimeout(() => {
        if (firstStepOfNewOperation < steps.length - 1) {
          setIsPlaying(true);
        }
      }, 50);
    }
  }, [steps.length, goToStep]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else if (canGoNext) {
      setIsPlaying(true);
    }
  };

  const handleReset = () => {
    reset();
    setIsPlaying(false);
  };

  const handleGoToStart = () => {
    goToStep(0);
    setIsPlaying(false);
  };

  const handleGoToEnd = () => {
    goToStep(totalSteps - 1);
    setIsPlaying(false);
  };

  const handleSpeedChange = (value: number[]) => {
    setPlaybackSpeed(value[0]);
  };

  const handleInsert = () => {
    if (!inputValue.trim()) return;
    const values = inputValue
      .split(/[,\s]+/)
      .map((v) => parseInt(v.trim(), 10))
      .filter((n) => !isNaN(n));
    if (values.length > 0) {
      // Salva o totalSteps atual antes de inserir
      // Isso garante que navegaremos para o primeiro passo da nova operação
      previousTotalStepsRef.current = totalSteps;
      shouldNavigateToNewOperationRef.current = true;
      // Insere os valores (a lógica da árvore não é afetada)
      // A reprodução será iniciada automaticamente após a navegação
      onInsert(values);
      setInputValue("");
    }
  };

  const handleRemove = () => {
    const value = parseInt(inputValue, 10);
    if (!isNaN(value)) {
      // Salva o totalSteps atual antes de remover
      // Isso garante que navegaremos para o primeiro passo da nova operação
      previousTotalStepsRef.current = totalSteps;
      shouldNavigateToNewOperationRef.current = true;
      // Remove o valor (a lógica da árvore não é afetada)
      // A reprodução será iniciada automaticamente após a navegação
      if (onRemove(value)) {
        setInputValue("");
      } else {
        // Se a remoção falhou, cancela a navegação
        shouldNavigateToNewOperationRef.current = false;
      }
    }
  };

  const currentStepData = steps[currentStep] || null;

  const getStepTypeColor = (type: string) => {
    switch (type) {
      case "insert":
        return "bg-green-100 text-green-800 border-green-200";
      case "delete":
        return "bg-red-100 text-red-800 border-red-200";
      case "recolor":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "rotate-left":
      case "rotate-right":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStepTypeLabel = (type: string) => {
    switch (type) {
      case "insert":
        return "Inserção";
      case "delete":
        return "Remoção";
      case "recolor":
        return "Recoloração";
      case "rotate-left":
        return "Rotação ←";
      case "rotate-right":
        return "Rotação →";
      case "initial":
        return "Inicial";
      default:
        return type;
    }
  };


  return (
    <div
      className={`fixed inset-0 z-50 bg-background ${
        isFullscreen ? "p-4" : "p-4"
      }`}
    >
      <div className="mb-4">
        <SequenceDisplay steps={steps} currentStep={currentStep} onGoToStep={goToStep} />
      </div>

      <div className="flex h-[calc(100vh-160px)] gap-4">
        <div className="flex-1">
          <Card className="h-full p-6">
            <TreeVisualization
              tree={tree}
              nodePositions={nodePositions}
              affectedNodes={currentStepData?.affectedNodes || []}
              currentStepType={currentStepData?.type}
            />
          </Card>
        </div>

        {showStats && (
          <div className="w-96 space-y-4">
            {currentStepData ? (
              <PseudocodeDisplay
                algorithm={currentStepData.algorithm}
                activeLines={currentStepData.activeLines || []}
                executedLines={currentStepData.executedLines || []}
                conditions={currentStepData.conditions || {}}
                comments={{}}
                showRotationAlgorithms={
                  currentStepData.algorithm === "left-rotate" ||
                  currentStepData.algorithm === "right-rotate"
                }
              />
            ) : (
              <PseudocodeDisplay
                algorithm="insert"
                activeLines={[]}
                executedLines={[]}
                conditions={{}}
                comments={{}}
                showRotationAlgorithms={false}
              />
            )}
          </div>
        )}
      </div>

      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[90%] max-w-4xl">
        <Card className="p-4 shadow-lg space-y-4">
          {/* Controles de inserção/remoção */}
          <div className="flex items-center gap-2">
            <Input
              placeholder="10, 20, 30..."
              value={inputValue}
              onChange={(e) =>
                setInputValue(e.target.value.replace(/[^0-9,\s-]/g, ""))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleInsert();
                }
              }}
              className="flex-1"
            />
            <Button onClick={handleInsert} size="sm" className="cursor-pointer">
              <Plus className="w-4 h-4 mr-2" /> Inserir
            </Button>
            <Button variant="destructive" onClick={handleRemove} size="sm" className="cursor-pointer">
              <Minus className="w-4 h-4 mr-2" /> Remover
            </Button>
          </div>

          {/* Controles de navegação */}
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleGoToStart}
                disabled={currentStep === 0}
                className="cursor-pointer"
              >
                <SkipBack className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={previousStep}
                disabled={!canGoPrevious}
                className="cursor-pointer"
              >
                <SkipBack className="w-4 h-4" />
              </Button>

              <Button
                variant={isPlaying ? "default" : "outline"}
                size="sm"
                onClick={handlePlayPause}
                disabled={!canGoNext && !isPlaying}
                className="cursor-pointer"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={nextStep}
                disabled={!canGoNext}
                className="cursor-pointer"
              >
                <SkipForward className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleGoToEnd}
                disabled={currentStep === totalSteps - 1}
                className="cursor-pointer"
              >
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2 min-w-[300px]">
              <span className="text-sm text-muted-foreground">Velocidade:</span>
              <Slider
                value={[playbackSpeed]}
                onValueChange={handleSpeedChange}
                max={3000}
                min={200}
                step={200}
                className="flex-1 cursor-pointer"
              />
              <span className="text-sm text-muted-foreground w-12">
                {playbackSpeed}ms
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStats(!showStats)}
                className="cursor-pointer"
              >
                {showStats ? "Ocultar Stats" : "Mostrar Stats"}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={toggleFullscreen}
                className="cursor-pointer"
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={onExit}
                className="cursor-pointer"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
