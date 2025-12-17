export enum NodeColor {
  RED = "red",
  BLACK = "black",
}

export interface TreeNode {
  value: number
  color: NodeColor
  left: TreeNode | null
  right: TreeNode | null
  parent: TreeNode | null
  id: string
}

export interface TreeStep {
  id: string
  description: string
  type: "insert" | "delete" | "recolor" | "rotate-left" | "rotate-right" | "initial"
  affectedNodes: string[]
  tree: TreeNode | null
  meta?: any
  branchPath: string[]
  algorithm: "insert" | "insert-fixup" | "delete" | "delete-fixup" | "left-rotate" | "right-rotate"
  activeLines: number[]
  executedLines: number[]
  conditions: { [lineNumber: number]: boolean }
}

export class RedBlackTree {
  private root: TreeNode | null = null
  private steps: TreeStep[] = []
  private nodeIdCounter = 0
  private currentRootOp: 'insert' | 'delete' | null = null

  constructor() {
    this.addStep("initial", "Árvore inicializada vazia", [], "insert", [], [], {}, [], { rootOp: 'initial' })
  }

  private createNode(value: number): TreeNode {
    return {
      value,
      color: NodeColor.RED,
      left: null,
      right: null,
      parent: null,
      id: `node-${++this.nodeIdCounter}`,
    }
  }

  private addStep(
    type: TreeStep["type"],
    description: string,
    affectedNodes: string[],
    algorithm: TreeStep["algorithm"],
    activeLines: number[],
    executedLines: number[],
    conditions: { [lineNumber: number]: boolean },
    branchPath: string[],
    meta?: any
  ): void {
    this.steps.push({
      id: `step-${this.steps.length}`,
      description,
      type,
      affectedNodes,
      tree: this.cloneTree(this.root),
      meta,
      branchPath,
      algorithm,
      activeLines,
      executedLines,
      conditions,
    })
  }

  private cloneTree(node: TreeNode | null): TreeNode | null {
    if (!node) return null

    const cloned: TreeNode = {
      value: node.value,
      color: node.color,
      left: null,
      right: null,
      parent: null,
      id: node.id,
    }

    cloned.left = this.cloneTree(node.left)
    cloned.right = this.cloneTree(node.right)

    if (cloned.left) cloned.left.parent = cloned
    if (cloned.right) cloned.right.parent = cloned

    return cloned
  }

  private rotateLeft(node: TreeNode): void {
    const rightChild = node.right!
    node.right = rightChild.left

    if (rightChild.left) {
      rightChild.left.parent = node
    }

    rightChild.parent = node.parent

    if (!node.parent) {
      this.root = rightChild
    } else if (node === node.parent.left) {
      node.parent.left = rightChild
    } else {
      node.parent.right = rightChild
    }

    rightChild.left = node
    node.parent = rightChild

    this.addStep(
      "rotate-left",
      `Rotação à esquerda no nó ${node.value}`,
      [node.id, rightChild.id],
      "left-rotate",
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
      [1, 2, 5, 9, 12, 13],
      {
        3: rightChild.left !== null,
        6: !node.parent,
        8: node.parent ? node === node.parent.left : false
      },
      [],
      {
        rootOp: this.currentRootOp || 'insert',
        parentSide: rightChild.parent ? (rightChild.parent.left === rightChild ? 'left' : 'right') : null,
      }
    )
  }

  private rotateRight(node: TreeNode): void {
    const leftChild = node.left!
    node.left = leftChild.right

    if (leftChild.right) {
      leftChild.right.parent = node
    }

    leftChild.parent = node.parent

    if (!node.parent) {
      this.root = leftChild
    } else if (node === node.parent.right) {
      node.parent.right = leftChild
    } else {
      node.parent.left = leftChild
    }

    leftChild.right = node
    node.parent = leftChild

    this.addStep(
      "rotate-right",
      `Rotação à direita no nó ${node.value}`,
      [node.id, leftChild.id],
      "right-rotate",
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
      [1, 2, 5, 9, 12, 13],
      {
        3: leftChild.right !== null,
        6: !node.parent,
        8: node.parent ? node === node.parent.right : false
      },
      [],
      {
        rootOp: this.currentRootOp || 'insert',
        parentSide: leftChild.parent ? (leftChild.parent.left === leftChild ? 'left' : 'right') : null,
      }
    )
  }

  private fixInsert(node: TreeNode): void {
    let iteration = 0
    while (node.parent && node.parent.color === NodeColor.RED) {
      iteration++
      if (!node.parent.parent) {
        break
      }

      if (node.parent === node.parent.parent.left) {
        const uncle = node.parent.parent.right

        if (uncle && uncle.color === NodeColor.RED) {
          node.parent.color = NodeColor.BLACK
          uncle.color = NodeColor.BLACK
          node.parent.parent.color = NodeColor.RED
          this.addStep(
            "recolor",
            `Recoloração: pai ${node.parent.value} e tio ${uncle.value} ficam pretos, avô ${node.parent.parent.value} fica vermelho`,
            [node.parent.id, uncle.id, node.parent.parent.id],
            "insert-fixup",
            [5, 6, 7, 8],
            [1, 2, 3, 4],
            {
              1: true,
              2: true,
              4: true
            },
            ["while-loop", "if-parent-left", "if-uncle-red"],
            { rootOp: this.currentRootOp || 'insert', case: 'uncle-red', parentSide: 'left' }
          )
          const oldNode = node.value
          node = node.parent.parent
        } else {
          if (node === node.parent.right) {
            node = node.parent
            this.addStep(
              "recolor",
              `Preparando rotação esquerda (triângulo)`,
              [node.id],
              "insert-fixup",
              [11, 12],
              [1, 2, 3, 4, 9, 10],
              {
                1: true,
                2: true,
                4: false,
                10: true
              },
              ["while-loop", "if-parent-left", "else-uncle-not-red", "if-triangle"],
              {
                rootOp: this.currentRootOp || 'insert',
                case: 'triangle',
                parentSide: 'left'
              }
            )
            this.rotateLeft(node)
          }
          const parent = node.parent!
          const grandparent = parent.parent!

          if (!grandparent) {
            break
          }

          parent.color = NodeColor.BLACK
          grandparent.color = NodeColor.RED
          this.addStep(
            "recolor",
            `Recoloração: pai ${parent.value} fica preto, avô ${grandparent.value} fica vermelho`,
            [parent.id, grandparent.id],
            "insert-fixup",
            [13, 14, 15],
            [1, 2, 3, 4, 9],
            {
              1: true,
              2: true,
              4: false
            },
            ["while-loop", "if-parent-left", "else-uncle-not-red", "after-triangle"],
            { rootOp: this.currentRootOp || 'insert', case: 'line', parentSide: 'left' }
          )
          this.rotateRight(grandparent)
        }
      } else {
        const uncle = node.parent.parent.left

        if (uncle && uncle.color === NodeColor.RED) {
          node.parent.color = NodeColor.BLACK
          uncle.color = NodeColor.BLACK
          node.parent.parent.color = NodeColor.RED
          this.addStep(
            "recolor",
            `Recoloração: pai ${node.parent.value} e tio ${uncle.value} ficam pretos, avô ${node.parent.parent.value} fica vermelho`,
            [node.parent.id, uncle.id, node.parent.parent.id],
            "insert-fixup",
            [19, 20, 21, 22],
            [1, 2, 16, 17, 18],
            {
              1: true,
              2: false,
              18: true
            },
            ["while-loop", "else-parent-right", "if-uncle-red"],
            { rootOp: this.currentRootOp || 'insert', case: 'uncle-red', parentSide: 'right' }
          )
          const oldNode = node.value
          node = node.parent.parent
        } else {
          if (node === node.parent.left) {
            node = node.parent
            this.addStep(
              "recolor",
              `Preparando rotação direita (triângulo)`,
              [node.id],
              "insert-fixup",
              [25, 26],
              [1, 2, 16, 17, 18, 23, 24],
              {
                1: true,
                2: false,
                18: false,
                24: true
              },
              ["while-loop", "else-parent-right", "else-uncle-not-red", "if-triangle"],
              {
                rootOp: this.currentRootOp || 'insert',
                case: 'triangle',
                parentSide: 'right'
              }
            )
            this.rotateRight(node)
          }
          const parent = node.parent!
          const grandparent = parent.parent!

          if (!grandparent) {
            console.error(`[DEBUG fixInsert] ERRO: grandparent é null no CASO 3!`)
            break
          }

          parent.color = NodeColor.BLACK
          grandparent.color = NodeColor.RED
          this.addStep(
            "recolor",
            `Recoloração: pai ${parent.value} fica preto, avô ${grandparent.value} fica vermelho`,
            [parent.id, grandparent.id],
            "insert-fixup",
            [27, 28, 29],
            [1, 2, 16, 17, 18, 23],
            {
              1: true,
              2: false,
              18: false
            },
            ["while-loop", "else-parent-right", "else-uncle-not-red", "after-triangle"],
            { rootOp: this.currentRootOp || 'insert', case: 'line', parentSide: 'right' }
          )
          this.rotateLeft(grandparent)
        }
      }
    }

    if (this.root && this.root.color === NodeColor.RED) {
      this.root.color = NodeColor.BLACK
      this.addStep(
        "recolor",
        "Raiz recolorida para preto",
        [this.root.id],
        "insert-fixup",
        [30],
        [],
        {},
        ["after-while"],
        {
          rootOp: this.currentRootOp || 'insert'
        }
      )
    }
  }

  private debugTreeState(label: string): void {
    const validation = this.validateTree()
    if (!validation.isValid) {
      console.error(`[DEBUG ${label}] ÁRVORE INVÁLIDA:`, validation.violations)
      this.debugPrintTree()
    } else {
      console.log(`[DEBUG ${label}] Árvore válida`)
    }
  }

  private debugPrintTree(): void {
    //console.log('[DEBUG Tree Structure]')
    const printNode = (node: TreeNode | null, indent: string = '', isLast: boolean = true): void => {
      if (!node) return
      const marker = isLast ? '└── ' : '├── '
      const colorIcon = node.color === NodeColor.RED ? '🔴' : '⚫'
    //  console.log(`${indent}${marker}${colorIcon} ${node.value} (${node.color})`)
      const childIndent = indent + (isLast ? '    ' : '│   ')
      if (node.right) {
        printNode(node.right, childIndent, !node.left)
      }
      if (node.left) {
        printNode(node.left, childIndent, true)
      }
    }
    if (this.root) {
      printNode(this.root)
    } else {
      console.log('(vazia)')
    }
  }

  insert(value: number): void {
    this.currentRootOp = 'insert'
    const newNode = this.createNode(value)

    if (!this.root) {
      this.root = newNode
      this.root.color = NodeColor.BLACK
      this.addStep(
        "insert",
        `Inserido nó ${value} como raiz (preto)`,
        [newNode.id],
        "insert",
        [10, 11, 16, 17, 18],
        [1, 2, 3, 9],
        {
          10: true
        },
        ["if-empty-tree"],
        { rootOp: 'insert', isRoot: true }
      )
      this.currentRootOp = null
      const validation = this.validateTree()
      if (!validation.isValid) {
        console.error('Árvore inválida após inserção:', validation.violations)
      }
      return
    }

    let current = this.root
    let parent: TreeNode | null = null

    while (current) {
      parent = current
      if (value < current.value) {
        current = current.left!
      } else if (value > current.value) {
        current = current.right!
      } else {
        this.currentRootOp = null
        return
      }
    }

    if (!parent) {
      this.root = newNode
    } else {
      newNode.parent = parent
      if (value < parent.value) {
        parent.left = newNode
      } else {
        parent.right = newNode
      }
    }

    const direction = parent && value < parent.value ? 'left' : 'right'
    this.addStep(
      "insert",
      `Inserido nó ${value} (vermelho)${parent ? ` como filho de ${parent.value}` : ' como raiz'}`,
      [newNode.id],
      "insert",
      [16, 17, 18, 19],
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13],
      {
        3: true,
        5: direction === 'left',
        10: false,
        12: direction === 'left'
      },
      direction === 'left' ? ["after-while", "elseif-left"] : ["after-while", "else-right"],
      {
        rootOp: 'insert',
        direction,
        isRoot: false,
      }
    )

    //console.log(`[DEBUG insert] Antes de fixInsert para ${value}`)
    
    this.fixInsert(newNode)
    
    const validation = this.validateTree()
    if (!validation.isValid) {
      console.error(`[DEBUG insert] ÁRVORE INVÁLIDA após inserção de ${value}`)
      console.error(`[DEBUG insert] Violações:`, JSON.stringify(validation.violations, null, 2))
      this.debugPrintTree()
      this.addStep(
        "recolor",
        `ERRO: Árvore inválida após inserção de ${value}`,
        [],
        "insert-fixup",
        [],
        [],
        {},
        ["error"],
        {
          rootOp: 'insert',
          isError: true,
          violations: validation.violations
        }
      )
    } else {
      this.addStep(
        "recolor",
        `Árvore válida após inserção de ${value}`,
        [],
        "insert-fixup",
        [30],
        [],
        {},
        ["final-state"],
        {
          rootOp: 'insert',
          finalState: true
        }
      )
    }

    this.currentRootOp = null
  }

  private findNode(value: number): TreeNode | null {
    let current = this.root
    while (current) {
      if (value === current.value) {
        return current
      } else if (value < current.value) {
        current = current.left
      } else {
        current = current.right
      }
    }
    return null
  }

  private findMin(node: TreeNode): TreeNode {
    while (node.left) {
      node = node.left
    }
    return node
  }

  private fixDelete(node: TreeNode | null, parent: TreeNode | null, isLeftChild: boolean): void {
    while (node !== this.root && (node == null || node.color === NodeColor.BLACK)) {
      if (!parent) {
        break
      }

      if (isLeftChild) {
        let sibling = parent.right
        if (!sibling) {
          break
        }

        if (sibling.color === NodeColor.RED) {
          sibling.color = NodeColor.BLACK
          parent.color = NodeColor.RED
          this.addStep(
            "recolor",
            `Recoloração: irmão ${sibling.value} fica preto, pai ${parent.value} fica vermelho`,
            [sibling.id, parent.id],
            "delete-fixup",
            [5, 6, 7, 8],
            [1, 2, 3, 4],
            {
              1: true,
              2: true,
              4: true
            },
            ["while-loop", "if-left", "if-sibling-red"],
            { rootOp: 'delete', isLeftChild: true, siblingColor: 'RED' }
          )
          this.rotateLeft(parent)
          sibling = parent.right
          if (!sibling) break
        }

        if ((!sibling.left || sibling.left.color === NodeColor.BLACK) &&
            (!sibling.right || sibling.right.color === NodeColor.BLACK)) {
          sibling.color = NodeColor.RED
          this.addStep(
            "recolor",
            `Recoloração: irmão ${sibling.value} fica vermelho`,
            [sibling.id],
            "delete-fixup",
            [10, 11],
            [1, 2, 3, 9],
            {
              1: true,
              2: true,
              9: true
            },
            ["while-loop", "if-left", "if-both-children-black"],
            { rootOp: 'delete', isLeftChild: true, bothChildrenBlack: true }
          )
          node = parent
          parent = node.parent
          isLeftChild = parent ? (node === parent.left) : false
        } else {
          if (!sibling.right || sibling.right.color === NodeColor.BLACK) {
            if (sibling.left) sibling.left.color = NodeColor.BLACK
            sibling.color = NodeColor.RED
            this.addStep(
              "recolor",
              `Recoloração: sobrinho esquerdo fica preto, irmão ${sibling.value} fica vermelho`,
              [sibling.left?.id || '', sibling.id],
              "delete-fixup",
              [14, 15, 16, 17],
              [1, 2, 3, 9, 12, 13],
              {
                1: true,
                2: true,
                9: false,
                13: true
              },
              ["while-loop", "if-left", "else-not-both-black", "if-right-black"],
              { rootOp: 'delete', isLeftChild: true, rightChildBlack: true }
            )
            this.rotateRight(sibling)
            sibling = parent.right
            if (!sibling) break
          }

          sibling.color = parent.color
          parent.color = NodeColor.BLACK
          if (sibling.right) sibling.right.color = NodeColor.BLACK
          this.addStep(
            "recolor",
            `Recoloração final: irmão ${sibling.value} herda cor do pai, pai fica preto, sobrinho direito fica preto`,
            [sibling.id, parent.id, sibling.right?.id || ''],
            "delete-fixup",
            [18, 19, 20, 21, 22],
            [1, 2, 3, 9, 12],
            {
              1: true,
              2: true,
              9: false
            },
            ["while-loop", "if-left", "else-not-both-black", "final-recolor"],
            { rootOp: 'delete', isLeftChild: true }
          )
          this.rotateLeft(parent)
          node = this.root
          parent = null
        }
      } else {
        let sibling = parent.left
        if (!sibling) {
          break
        }

        if (sibling.color === NodeColor.RED) {
          sibling.color = NodeColor.BLACK
          parent.color = NodeColor.RED
          this.addStep(
            "recolor",
            `Recoloração: irmão ${sibling.value} fica preto, pai ${parent.value} fica vermelho`,
            [sibling.id, parent.id],
            "delete-fixup",
            [26, 27, 28, 29],
            [1, 2, 23, 24, 25],
            {
              1: true,
              2: false,
              25: true
            },
            ["while-loop", "else-right", "if-sibling-red"],
            { rootOp: 'delete', isLeftChild: false, siblingColor: 'RED' }
          )
          this.rotateRight(parent)
          sibling = parent.left
          if (!sibling) break
        }

        if ((!sibling.left || sibling.left.color === NodeColor.BLACK) &&
            (!sibling.right || sibling.right.color === NodeColor.BLACK)) {
          sibling.color = NodeColor.RED
          this.addStep(
            "recolor",
            `Recoloração: irmão ${sibling.value} fica vermelho`,
            [sibling.id],
            "delete-fixup",
            [31, 32],
            [1, 2, 23, 24, 30],
            {
              1: true,
              2: false,
              30: true
            },
            ["while-loop", "else-right", "if-both-children-black"],
            { rootOp: 'delete', isLeftChild: false, bothChildrenBlack: true }
          )
          node = parent
          parent = node.parent
          isLeftChild = parent ? (node === parent.left) : false
        } else {
          if (!sibling.left || sibling.left.color === NodeColor.BLACK) {
            if (sibling.right) sibling.right.color = NodeColor.BLACK
            sibling.color = NodeColor.RED
            this.addStep(
              "recolor",
              `Recoloração: sobrinho direito fica preto, irmão ${sibling.value} fica vermelho`,
              [sibling.right?.id || '', sibling.id],
              "delete-fixup",
              [35, 36, 37, 38],
              [1, 2, 23, 24, 30, 33, 34],
              {
                1: true,
                2: false,
                30: false,
                34: true
              },
              ["while-loop", "else-right", "else-not-both-black", "if-left-black"],
              { rootOp: 'delete', isLeftChild: false, leftChildBlack: true }
            )
            this.rotateLeft(sibling)
            sibling = parent.left
            if (!sibling) break
          }

          sibling.color = parent.color
          parent.color = NodeColor.BLACK
          if (sibling.left) sibling.left.color = NodeColor.BLACK
          this.addStep(
            "recolor",
            `Recoloração final: irmão ${sibling.value} herda cor do pai, pai fica preto, sobrinho esquerdo fica preto`,
            [sibling.id, parent.id, sibling.left?.id || ''],
            "delete-fixup",
            [39, 40, 41, 42, 43],
            [1, 2, 23, 24, 30, 33],
            {
              1: true,
              2: false,
              30: false
            },
            ["while-loop", "else-right", "else-not-both-black", "final-recolor"],
            { rootOp: 'delete', isLeftChild: false }
          )
          this.rotateRight(parent)
          node = this.root
          parent = null
        }
      }
    }

    if (node) {
      node.color = NodeColor.BLACK
      this.addStep(
        "recolor",
        `Nó ${node.value} recolorido para preto`,
        [node.id],
        "delete-fixup",
        [44],
        [],
        {},
        ["after-while"],
        { rootOp: 'delete' }
      )
    }

    if (this.root && this.root.color === NodeColor.RED) {
      this.root.color = NodeColor.BLACK
      this.addStep(
        "recolor",
        "Raiz recolorida para preto",
        [this.root.id],
        "delete-fixup",
        [44],
        [],
        {},
        ["after-while-root"],
        { rootOp: 'delete', isRoot: true }
      )
    }
  }

  delete(value: number): boolean {
    this.currentRootOp = 'delete'
    const nodeToDelete = this.findNode(value)
    if (!nodeToDelete) {
      return false
    }

    let nodeToFix: TreeNode | null = null
    let originalColor = nodeToDelete.color

    if (!nodeToDelete.left) {
      nodeToFix = nodeToDelete.right
      const parentAfter = nodeToDelete.parent
      const isLeftChild = parentAfter ? (nodeToDelete === parentAfter.left) : false
      this.transplant(nodeToDelete, nodeToDelete.right)
      this.addStep(
        "delete",
        `Removido nó ${value}`,
        [nodeToDelete.id],
        "delete",
        [3, 4, 5],
        [1, 2],
        {
          3: true
        },
        ["if-no-left"],
        {
          rootOp: 'delete',
          hasLeftChild: !!nodeToDelete.left,
          hasRightChild: !!nodeToDelete.right,
          originalColor: originalColor === NodeColor.BLACK ? 'BLACK' : 'RED'
        }
      )
      if (originalColor === NodeColor.BLACK) {
        this.fixDelete(nodeToFix, parentAfter, isLeftChild)
      }

      const validation = this.validateTree()
      if (!validation.isValid) {
        console.error('Árvore inválida após deleção:', validation.violations)
        this.addStep(
          "recolor",
          `ERRO: Árvore inválida após deleção de ${value}`,
          [],
          "delete",
          [],
          [],
          {},
          ["error"],
          {
            rootOp: 'delete',
            isError: true,
            violations: validation.violations
          }
        )
      } else {
        this.addStep(
          "recolor",
          `Árvore válida após deleção de ${value}`,
          [],
          "delete",
          [21, 22],
          [],
          {
            21: originalColor === NodeColor.BLACK
          },
          ["final-state"],
          {
            rootOp: 'delete',
            finalState: true
          }
        )
      }

      this.currentRootOp = null
      return true
    } else if (!nodeToDelete.right) {
      nodeToFix = nodeToDelete.left
      const parentAfter = nodeToDelete.parent
      const isLeftChild = parentAfter ? (nodeToDelete === parentAfter.left) : false
      this.transplant(nodeToDelete, nodeToDelete.left)
      this.addStep(
        "delete",
        `Removido nó ${value}`,
        [nodeToDelete.id],
        "delete",
        [6, 7, 8],
        [1, 2, 3],
        {
          3: false,
          6: true
        },
        ["elseif-no-right"],
        {
          rootOp: 'delete',
          hasLeftChild: !!nodeToDelete.left,
          hasRightChild: !!nodeToDelete.right,
          originalColor: originalColor === NodeColor.BLACK ? 'BLACK' : 'RED'
        }
      )
      if (originalColor === NodeColor.BLACK) {
        this.fixDelete(nodeToFix, parentAfter, isLeftChild)
      }

      const validation = this.validateTree()
      if (!validation.isValid) {
        console.error('Árvore inválida após deleção:', validation.violations)
        this.addStep(
          "recolor",
          `ERRO: Árvore inválida após deleção de ${value}`,
          [],
          "delete",
          [],
          [],
          {},
          ["error"],
          {
            rootOp: 'delete',
            isError: true,
            violations: validation.violations
          }
        )
      } else {
        this.addStep(
          "recolor",
          `Árvore válida após deleção de ${value}`,
          [],
          "delete",
          [21, 22],
          [],
          {
            21: originalColor === NodeColor.BLACK
          },
          ["final-state"],
          {
            rootOp: 'delete',
            finalState: true
          }
        )
      }

      this.currentRootOp = null
      return true
    } else {
      const successor = this.findMin(nodeToDelete.right)
      originalColor = successor.color
      nodeToFix = successor.right

      const isSuccessorChild = successor.parent === nodeToDelete
      let parentForFix: TreeNode | null
      let isLeftChildFix = false

      if (isSuccessorChild) {

        parentForFix = successor
        isLeftChildFix = false
        if (nodeToFix) {
          nodeToFix.parent = successor
        }
      } else {
        parentForFix = successor.parent!
        isLeftChildFix = successor === parentForFix.left
        
        this.transplant(successor, successor.right)
        
        successor.right = nodeToDelete.right
        if (successor.right) {
          successor.right.parent = successor
        }
        
      }

      this.transplant(nodeToDelete, successor)
      successor.left = nodeToDelete.left
      if (successor.left) {
        successor.left.parent = successor
      }
      successor.color = nodeToDelete.color

      this.addStep(
        "delete",
        `Removido nó ${value}`,
        [nodeToDelete.id],
        "delete",
        isSuccessorChild ? [9, 10, 11, 16, 17, 18, 19, 20] : [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
        [1, 2, 3],
        {
          3: false,
          6: false,
          12: !isSuccessorChild
        },
        isSuccessorChild ? ["else-two-children", "if-successor-child"] : ["else-two-children", "else-successor-not-child"],
        {
          rootOp: 'delete',
          hasLeftChild: !!nodeToDelete.left,
          hasRightChild: !!nodeToDelete.right,
          isSuccessorChild,
          originalColor: originalColor === NodeColor.BLACK ? 'BLACK' : 'RED'
        }
      )

      if (originalColor === NodeColor.BLACK) {
        this.fixDelete(nodeToFix, parentForFix, isLeftChildFix)
      }

      const validation = this.validateTree()
      if (!validation.isValid) {
        console.error('Árvore inválida após deleção:', validation.violations)
        this.addStep(
          "recolor",
          `ERRO: Árvore inválida após deleção de ${value}`,
          [],
          "delete",
          [],
          [],
          {},
          ["error"],
          {
            rootOp: 'delete',
            isError: true,
            violations: validation.violations
          }
        )
      } else {
        this.addStep(
          "recolor",
          `Árvore válida após deleção de ${value}`,
          [],
          "delete",
          [21, 22],
          [],
          {
            21: originalColor === NodeColor.BLACK
          },
          ["final-state"],
          {
            rootOp: 'delete',
            finalState: true
          }
        )
      }

      this.currentRootOp = null
      return true
    }
  }

  private transplant(u: TreeNode, v: TreeNode | null): void {
    if (!u.parent) {
      this.root = v
    } else if (u === u.parent.left) {
      u.parent.left = v
    } else {
      u.parent.right = v
    }
    if (v) {
      v.parent = u.parent
    }
  }

  search(value: number): TreeNode | null {
    return this.findNode(value)
  }

  getSteps(): TreeStep[] {
    return this.steps
  }

  getRoot(): TreeNode | null {
    return this.root
  }

  reset(): void {
    this.root = null
    this.steps = []
    this.nodeIdCounter = 0
    this.addStep("initial", "Árvore resetada", [], "insert", [], [], {}, [], {})
  }

  generateRandomValues(count = 5): number[] {
    const values: number[] = []
    const used = new Set<number>()

    while (values.length < count) {
      const value = Math.floor(Math.random() * 100) + 1
      if (!used.has(value)) {
        used.add(value)
        values.push(value)
      }
    }

    return values
  }

  getTreeAtStep(stepIndex: number): TreeNode | null {
    if (stepIndex < 0 || stepIndex >= this.steps.length) {
      return null
    }
    return this.steps[stepIndex].tree
  }

  calculateNodePositions(node: TreeNode | null, x = 0, y = 0, spacing = 100): Map<string, { x: number; y: number }> {
    const positions = new Map<string, { x: number; y: number }>()

    if (!node) return positions

    const calculateSubtreeWidth = (n: TreeNode | null): number => {
      if (!n) return 0
      return 1 + calculateSubtreeWidth(n.left) + calculateSubtreeWidth(n.right)
    }

    const positionNodes = (n: TreeNode | null, currentX: number, currentY: number, levelSpacing: number): number => {
      if (!n) return currentX

      const leftWidth = calculateSubtreeWidth(n.left)
      const nodeX = currentX + leftWidth * levelSpacing

      positions.set(n.id, { x: nodeX, y: currentY })

      let nextX = currentX
      nextX = positionNodes(n.left, nextX, currentY + 80, levelSpacing * 0.7)
      nextX = positionNodes(n.right, nodeX + levelSpacing, currentY + 80, levelSpacing * 0.7)

      return nextX
    }

    positionNodes(node, x, y, spacing)
    return positions
  }

  validateTree(): { isValid: boolean; violations: string[] } {
    const violations: string[] = []

    if (!this.root) {
      return { isValid: true, violations: [] }
    }

    if (this.root.color !== NodeColor.BLACK) {
      violations.push(`Raiz deve ser preta, mas é ${this.root.color}`)
    }

    let expectedBlackHeight = -1

    const validateNode = (node: TreeNode | null, blackCount: number, path: string = "root"): number => {
      if (!node) {
        if (expectedBlackHeight === -1) {
          expectedBlackHeight = blackCount
        } else if (blackCount !== expectedBlackHeight) {
          violations.push(`Altura preta inconsistente: esperado ${expectedBlackHeight}, encontrado ${blackCount} no caminho ${path}`)
        }
        return blackCount
      }

      if (node.color === NodeColor.RED) {
        if (node.left && node.left.color === NodeColor.RED) {
          violations.push(`Nó vermelho ${node.value} tem filho esquerdo vermelho ${node.left.value}`)
        }
        if (node.right && node.right.color === NodeColor.RED) {
          violations.push(`Nó vermelho ${node.value} tem filho direito vermelho ${node.right.value}`)
        }
      }

      const newBlackCount = node.color === NodeColor.BLACK ? blackCount + 1 : blackCount

      const leftBlackHeight = validateNode(node.left, newBlackCount, `${path}->left(${node.left?.value || 'null'})`)
      const rightBlackHeight = validateNode(node.right, newBlackCount, `${path}->right(${node.right?.value || 'null'})`)

      if (leftBlackHeight !== rightBlackHeight) {
        violations.push(`Nó ${node.value}: alturas pretas diferentes (esquerda: ${leftBlackHeight}, direita: ${rightBlackHeight})`)
      }

      return leftBlackHeight
    }

    validateNode(this.root, 0)

    return {
      isValid: violations.length === 0,
      violations,
    }
  }
}
