"use client"

import { useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"

interface PseudocodeLine {
  number: number
  code: string
  isActive?: boolean
  isExecuted?: boolean
  condition?: boolean
  comment?: string
}

interface PseudocodeDisplayProps {
  algorithm: 'insert' | 'insert-fixup' | 'left-rotate' | 'right-rotate' | 'delete' | 'delete-fixup'
  activeLines?: number[]
  executedLines?: number[]
  conditions?: { [lineNumber: number]: boolean }
  comments?: { [lineNumber: number]: string }
  showRotationAlgorithms?: boolean
}

const algorithms = {
  insert: {
    title: "RB-INSERT(T, z)",
    lines: [
      { number: 1, code: "y = T.nil" },
      { number: 2, code: "x = T.root" },
      { number: 3, code: "while x != T.nil" },
      { number: 4, code: "  y = x" },
      { number: 5, code: "  if z.key < x.key" },
      { number: 6, code: "    x = x.left" },
      { number: 7, code: "  else" },
      { number: 8, code: "    x = x.right" },
      { number: 9, code: "z.p = y" },
      { number: 10, code: "if y == T.nil" },
      { number: 11, code: "  T.root = z" },
      { number: 12, code: "elseif z.key < y.key" },
      { number: 13, code: "  y.left = z" },
      { number: 14, code: "else" },
      { number: 15, code: "  y.right = z" },
      { number: 16, code: "z.left = T.nil" },
      { number: 17, code: "z.right = T.nil" },
      { number: 18, code: "z.color = RED" },
      { number: 19, code: "RB-INSERT-FIXUP(T, z)" }
    ]
  },
  'insert-fixup': {
    title: "RB-INSERT-FIXUP(T, z)",
    lines: [
      { number: 1, code: "while z.p.color == RED" },
      { number: 2, code: "  if z.p == z.p.p.left" },
      { number: 3, code: "    y = z.p.p.right" },
      { number: 4, code: "    if y.color == RED" },
      { number: 5, code: "      z.p.color = BLACK" },
      { number: 6, code: "      y.color = BLACK" },
      { number: 7, code: "      z.p.p.color = RED" },
      { number: 8, code: "      z = z.p.p" },
      { number: 9, code: "    else" },
      { number: 10, code: "      if z == z.p.right" },
      { number: 11, code: "        z = z.p" },
      { number: 12, code: "        LEFT-ROTATE(T, z)" },
      { number: 13, code: "      z.p.color = BLACK" },
      { number: 14, code: "      z.p.p.color = RED" },
      { number: 15, code: "      RIGHT-ROTATE(T, z.p.p)" },
      { number: 16, code: "  else" },
      { number: 17, code: "    y = z.p.p.left" },
      { number: 18, code: "    if y.color == RED" },
      { number: 19, code: "      z.p.color = BLACK" },
      { number: 20, code: "      y.color = BLACK" },
      { number: 21, code: "      z.p.p.color = RED" },
      { number: 22, code: "      z = z.p.p" },
      { number: 23, code: "    else" },
      { number: 24, code: "      if z == z.p.left" },
      { number: 25, code: "        z = z.p" },
      { number: 26, code: "        RIGHT-ROTATE(T, z)" },
      { number: 27, code: "      z.p.color = BLACK" },
      { number: 28, code: "      z.p.p.color = RED" },
      { number: 29, code: "      LEFT-ROTATE(T, z.p.p)" },
      { number: 30, code: "T.root.color = BLACK" }
    ]
  },
  'left-rotate': {
    title: "LEFT-ROTATE(T, x)",
    lines: [
      { number: 1, code: "y = x.right" },
      { number: 2, code: "x.right = y.left" },
      { number: 3, code: "if y.left != T.nil" },
      { number: 4, code: "  y.left.p = x" },
      { number: 5, code: "y.p = x.p" },
      { number: 6, code: "if x.p == T.nil" },
      { number: 7, code: "  T.root = y" },
      { number: 8, code: "elseif x == x.p.left" },
      { number: 9, code: "  x.p.left = y" },
      { number: 10, code: "else" },
      { number: 11, code: "  x.p.right = y" },
      { number: 12, code: "y.left = x" },
      { number: 13, code: "x.p = y" }
    ]
  },
  'right-rotate': {
    title: "RIGHT-ROTATE(T, y)",
    lines: [
      { number: 1, code: "x = y.left" },
      { number: 2, code: "y.left = x.right" },
      { number: 3, code: "if x.right != T.nil" },
      { number: 4, code: "  x.right.p = y" },
      { number: 5, code: "x.p = y.p" },
      { number: 6, code: "if y.p == T.nil" },
      { number: 7, code: "  T.root = x" },
      { number: 8, code: "elseif y == y.p.right" },
      { number: 9, code: "  y.p.right = x" },
      { number: 10, code: "else" },
      { number: 11, code: "  y.p.left = x" },
      { number: 12, code: "x.right = y" },
      { number: 13, code: "y.p = x" }
    ]
  },
  delete: {
    title: "RB-DELETE(T, z)",
    lines: [
      { number: 1, code: "y = z" },
      { number: 2, code: "y-original-color = y.color" },
      { number: 3, code: "if z.left == T.nil" },
      { number: 4, code: "  x = z.right" },
      { number: 5, code: "  RB-Transplant(T, z, z.right)" },
      { number: 6, code: "elseif z.right == T.nil" },
      { number: 7, code: "  x = z.left" },
      { number: 8, code: "  RB-Transplant(T, z, z.left)" },
      { number: 9, code: "else y = Tree-Minimum(z.right)" },
      { number: 10, code: "  y-original-color = y.color" },
      { number: 11, code: "  x = y.right" },
      { number: 12, code: "  if y != z.right" },
      { number: 13, code: "    RB-Transplant(T, y, y.right)" },
      { number: 14, code: "    y.right = z.right" },
      { number: 15, code: "    y.right.p = y" },
      { number: 16, code: "else x.p = y" },
      { number: 17, code: "  RB-Transplant(T, z, y)" },
      { number: 18, code: "  y.left = z.left" },
      { number: 19, code: "  y.left.p = y" },
      { number: 20, code: "  y.color = z.color" },
      { number: 21, code: "if y-original-color == BLACK" },
      { number: 22, code: "  RB-Delete-Fixup(T, x)" }
    ]
  },
  'delete-fixup': {
    title: "RB-DELETE-FIXUP(T, x)",
    lines: [
      { number: 1, code: "while x != T.root and x.color == BLACK" },
      { number: 2, code: "  if x == x.p.left" },
      { number: 3, code: "    w = x.p.right" },
      { number: 4, code: "    if w.color == RED" },
      { number: 5, code: "      w.color = BLACK" },
      { number: 6, code: "      x.p.color = RED" },
      { number: 7, code: "      LEFT-ROTATE(T, x.p)" },
      { number: 8, code: "      w = x.p.right" },
      { number: 9, code: "    if w.left.color == BLACK and w.right.color == BLACK" },
      { number: 10, code: "      w.color = RED" },
      { number: 11, code: "      x = x.p" },
      { number: 12, code: "    else" },
      { number: 13, code: "      if w.right.color == BLACK" },
      { number: 14, code: "        w.left.color = BLACK" },
      { number: 15, code: "        w.color = RED" },
      { number: 16, code: "        RIGHT-ROTATE(T, w)" },
      { number: 17, code: "        w = x.p.right" },
      { number: 18, code: "      w.color = x.p.color" },
      { number: 19, code: "      x.p.color = BLACK" },
      { number: 20, code: "      w.right.color = BLACK" },
      { number: 21, code: "      LEFT-ROTATE(T, x.p)" },
      { number: 22, code: "      x = T.root" },
      { number: 23, code: "  else" },
      { number: 24, code: "    w = x.p.left" },
      { number: 25, code: "    if w.color == RED" },
      { number: 26, code: "      w.color = BLACK" },
      { number: 27, code: "      x.p.color = RED" },
      { number: 28, code: "      RIGHT-ROTATE(T, x.p)" },
      { number: 29, code: "      w = x.p.left" },
      { number: 30, code: "    if w.right.color == BLACK and w.left.color == BLACK" },
      { number: 31, code: "      w.color = RED" },
      { number: 32, code: "      x = x.p" },
      { number: 33, code: "    else" },
      { number: 34, code: "      if w.left.color == BLACK" },
      { number: 35, code: "        w.right.color = BLACK" },
      { number: 36, code: "        w.color = RED" },
      { number: 37, code: "        LEFT-ROTATE(T, w)" },
      { number: 38, code: "        w = x.p.left" },
      { number: 39, code: "      w.color = x.p.color" },
      { number: 40, code: "      x.p.color = BLACK" },
      { number: 41, code: "      w.left.color = BLACK" },
      { number: 42, code: "      RIGHT-ROTATE(T, x.p)" },
      { number: 43, code: "      x = T.root" },
      { number: 44, code: "x.color = BLACK" }
    ]
  }
}

export function PseudocodeDisplay({
  algorithm,
  activeLines = [],
  executedLines = [],
  conditions = {},
  comments = {},
  showRotationAlgorithms = false
}: PseudocodeDisplayProps) {
  const algorithmData = algorithms[algorithm]
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (
      algorithm === 'insert-fixup' &&
      activeLines.length === 1 &&
      activeLines[0] === 30 &&
      scrollContainerRef.current
    ) {
      const LINE_HEIGHT = 22
      const lineIndex = 29
      const scrollTop = lineIndex * LINE_HEIGHT - 50

      scrollContainerRef.current.scrollTo({
        top: scrollTop,
        behavior: 'smooth'
      })
    }
  }, [algorithm, activeLines])

  const getLineStyle = (lineNumber: number) => {
    if (activeLines.includes(lineNumber)) {
      return "bg-green-100 border-green-500 text-green-900"
    }
    if (executedLines.includes(lineNumber)) {
      return "bg-blue-50 text-blue-800"
    }
    return "text-gray-700"
  }

  const getConditionBadge = (lineNumber: number) => {
    if (conditions[lineNumber] !== undefined) {
      const isTrue = !!conditions[lineNumber]
      const base = "ml-auto text-[10px] leading-none font-medium px-1.5 py-0.5 rounded border"
      const color = isTrue
        ? "bg-green-500/15 text-green-700 border-green-600/30"
        : "bg-red-500/15 text-red-700 border-red-600/30"
      return (
        <span className={`${base} ${color}`}>
          {isTrue ? "True" : "False"}
        </span>
      )
    }
    return null
  }

  const getComment = (lineNumber: number) => {
    if (comments[lineNumber]) {
      return (
        <div className="mt-1 text-xs text-gray-600 italic">
          {comments[lineNumber]}
        </div>
      )
    }
    return null
  }

  const renderAlgorithm = (alg: string, title: string, lines: any[]) => {
    const getIndentLevel = (code: string) => {
      const match = code.match(/^(\s*)/);
      return match ? Math.floor(match[1].length / 2) : 0;
    }

    const getBlockType = (code: string) => {
      const trimmed = code.trim();
      if (trimmed.startsWith('if ')) return 'if';
      if (trimmed.startsWith('else')) return 'else';
      if (trimmed.startsWith('while ')) return 'while';
      if (trimmed.startsWith('for ')) return 'for';
      return 'normal';
    }

    const getBlockColor = (blockType: string) => {
      switch (blockType) {
        case 'if': return 'bg-blue-400';
        case 'else': return 'bg-green-400';
        case 'while': return 'bg-purple-400';
        case 'for': return 'bg-orange-400';
        default: return 'bg-gray-300';
      }
    }

    const LINE_HEIGHT = 22;
    const TAB_WIDTH = 16;

    const levels = lines.map((l: any) => getIndentLevel(l.code));

    type Block = { level: number; start: number; end: number; colorClass: string };
    const blocks: Block[] = [];
    for (let i = 0; i < lines.length; i++) {
      const type = getBlockType(lines[i].code);
      if (type === 'normal') continue;
      const level = levels[i] + 1;
      let end = i;
      for (let j = i + 1; j < lines.length; j++) {
        if (levels[j] <= levels[i]) { end = j - 1; break; }
        end = j;
      }
      if (end >= i + 1) {
        blocks.push({ level, start: i + 1, end, colorClass: getBlockColor(type) });
      }
    }

    return (
      <div className="space-y-0.5 font-mono text-xs">
        <h4 className="font-semibold text-sm mb-1">{title}</h4>
        <div className="grid grid-cols-[2rem_1fr] gap-2">
          <div>
            {lines.map((line: any) => (
              <div key={`n-${line.number}`} style={{ height: LINE_HEIGHT }} className="flex items-center justify-end text-gray-500 text-xs">
                {line.number}
              </div>
            ))}
          </div>
          <div className="relative">
            <div className="absolute inset-0 pointer-events-none">
              {blocks.map((b, idx) => (
                <div key={`b-${idx}`} className="absolute" style={{ left: b.level * TAB_WIDTH, top: b.start * LINE_HEIGHT, height: (b.end - b.start + 1) * LINE_HEIGHT }}>
                  <div className={`absolute left-0 top-0 bottom-0 w-px ${b.colorClass}`}></div>
                  <div className={`absolute left-0 top-0 w-2 h-px ${b.colorClass}`}></div>
                  <div className={`absolute left-0 bottom-0 w-2 h-px ${b.colorClass}`}></div>
                </div>
              ))}
            </div>
            <div>
              {lines.map((line: any, idx: number) => (
                <div key={line.number} style={{ height: LINE_HEIGHT }} className={`px-2 rounded flex items-center ${getLineStyle(line.number)}`}>
                  <pre className="text-xs whitespace-pre-wrap font-mono" style={{ paddingLeft: levels[idx] * TAB_WIDTH + 4 }}>
                    {line.code.trimStart()}
                  </pre>
                  {getConditionBadge(line.number)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="p-3 h-full flex flex-col">
      <div className="flex-shrink-0">
        <h3 className="font-semibold text-base mb-2">{algorithmData.title}</h3>
      </div>
      
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        <div className="space-y-1">
          {renderAlgorithm(algorithm, algorithmData.title, algorithmData.lines)}
          
          {showRotationAlgorithms && (algorithm === 'insert-fixup') && (
            <div className="mt-3 space-y-2">
              <div className="border-t pt-2">
                {renderAlgorithm('left-rotate', 'LEFT-ROTATE(T, x)', algorithms['left-rotate'].lines)}
              </div>
              <div className="border-t pt-2">
                {renderAlgorithm('right-rotate', 'RIGHT-ROTATE(T, y)', algorithms['right-rotate'].lines)}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex-shrink-0 mt-2 text-xs text-gray-500">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-100 border border-green-500 rounded"></div>
            <span className="text-xs">Ativa</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-50 border border-blue-300 rounded"></div>
            <span className="text-xs">Executada</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
