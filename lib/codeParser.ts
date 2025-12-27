import { CodeFunction, DependencyNode, DependencyEdge, FeatureMapping } from './types'

// Simple regex-based code parser for JavaScript/TypeScript
export class CodeParser {
  // Extract functions from code
  static extractFunctions(code: string, filePath: string): CodeFunction[] {
    const functions: CodeFunction[] = []
    
    // Function declaration pattern
    const functionPattern = /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\((.*?)\)/g
    // Arrow function pattern
    const arrowPattern = /(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\((.*?)\)\s*=>/g
    // Class method pattern
    const methodPattern = /(?:public|private|protected)?\s*(?:async\s+)?(\w+)\s*\((.*?)\)\s*{/g

    let match

    // Extract regular functions
    while ((match = functionPattern.exec(code)) !== null) {
      functions.push({
        id: `${filePath}:${match[1]}`,
        name: match[1],
        file: filePath,
        line: code.substring(0, match.index).split('\n').length,
        type: 'function',
        signature: `function ${match[1]}(${match[2]})`,
        params: this.parseParams(match[2]),
      })
    }

    // Extract arrow functions
    while ((match = arrowPattern.exec(code)) !== null) {
      functions.push({
        id: `${filePath}:${match[1]}`,
        name: match[1],
        file: filePath,
        line: code.substring(0, match.index).split('\n').length,
        type: 'function',
        signature: `const ${match[1]} = (${match[2]}) =>`,
        params: this.parseParams(match[2]),
      })
    }

    return functions
  }

  // Parse function parameters
  private static parseParams(paramString: string): string[] {
    if (!paramString.trim()) return []
    
    return paramString
      .split(',')
      .map(p => p.trim().split(':')[0].trim())
      .filter(p => p.length > 0)
  }

  // Extract imports/dependencies
  static extractDependencies(code: string, filePath: string): { imports: string[]; exports: string[] } {
    const imports: string[] = []
    const exports: string[] = []

    // Import pattern
    const importPattern = /import\s+(?:{([^}]+)}|(\w+))\s+from\s+['"]([^'"]+)['"]/g
    let match

    while ((match = importPattern.exec(code)) !== null) {
      const imported = match[1] || match[2]
      const source = match[3]
      imports.push(source)
    }

    // Export pattern
    const exportPattern = /export\s+(?:default\s+)?(?:function|const|class|interface)\s+(\w+)/g
    while ((match = exportPattern.exec(code)) !== null) {
      exports.push(match[1])
    }

    return { imports, exports }
  }

  // Build dependency graph
  static buildDependencyGraph(
    files: Map<string, string>,
    functions: CodeFunction[]
  ): { nodes: DependencyNode[]; edges: DependencyEdge[] } {
    const nodes: DependencyNode[] = []
    const edges: DependencyEdge[] = []
    const functionMap = new Map<string, CodeFunction>()

    // Create nodes for files
    files.forEach((_, filePath) => {
      nodes.push({
        id: filePath,
        label: filePath.split('/').pop() || filePath,
        type: 'file',
      })
    })

    // Create nodes for functions
    functions.forEach(func => {
      nodes.push({
        id: func.id,
        label: func.name,
        type: 'function',
        file: func.file,
      })
      functionMap.set(func.name, func)
    })

    // Create edges based on function calls
    files.forEach((code, filePath) => {
      const functionCallPattern = /(\w+)\s*\(/g
      let match

      while ((match = functionCallPattern.exec(code)) !== null) {
        const calledFunction = match[1]
        const func = functionMap.get(calledFunction)

        if (func) {
          edges.push({
            source: filePath,
            target: func.id,
            label: 'calls',
          })
        }
      }
    })

    return { nodes, edges }
  }

  // Map features to files
  static mapFeatures(files: Map<string, string>): FeatureMapping[] {
    const features: FeatureMapping[] = []
    const featureMap = new Map<string, Set<string>>()

    files.forEach((_, filePath) => {
      // Extract feature from file path
      const parts = filePath.split('/')
      let feature = 'root'

      if (parts.length > 1) {
        // Try to identify feature from directory structure
        if (parts[0] === 'src' || parts[0] === 'app') {
          feature = parts[1] || 'root'
        } else {
          feature = parts[0]
        }
      }

      if (!featureMap.has(feature)) {
        featureMap.set(feature, new Set())
      }

      featureMap.get(feature)!.add(filePath)
    })

    // Convert to FeatureMapping array
    featureMap.forEach((files, feature) => {
      features.push({
        feature,
        files: Array.from(files),
        functions: [],
        description: `${feature} feature`,
      })
    })

    return features
  }
}
