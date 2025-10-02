export type T_Message = {
  role: 'system' | 'user' | 'assistant'
  content: string
  reasoning?: string
}

export const ReasoningEfforts = ['minimal', 'low', 'medium', 'high'] as const
export type T_ReasoningEffort = (typeof ReasoningEfforts)[number]
