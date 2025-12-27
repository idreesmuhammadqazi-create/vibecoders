export interface GitHubUser {
  id: number
  login: string
  avatar_url: string
  name: string
}

export interface Repository {
  id: number
  name: string
  full_name: string
  description: string
  url: string
  language: string
  stars: number
}

export interface CodeFunction {
  id: string
  name: string
  file: string
  line: number
  type: 'function' | 'class' | 'method'
  signature: string
  params: string[]
  returnType?: string
}

export interface FunctionUsage {
  functionId: string
  calledFrom: string[]
  usedIn: string[]
  context: string
}

export interface DependencyNode {
  id: string
  label: string
  type: 'file' | 'function'
  file?: string
}

export interface DependencyEdge {
  source: string
  target: string
  label?: string
}

export interface CodeExplanation {
  functionId: string
  how: string
  why: string
  usage: string
  cached: boolean
  timestamp: number
}

export interface FeatureMapping {
  feature: string
  files: string[]
  functions: string[]
  description: string
}

export interface CacheEntry {
  key: string
  value: any
  timestamp: number
  ttl: number
}
