export type T_Room = {
  uuid: string;
  name: string;
  messages: T_Message[];
  config: {
    model: string;
  };
  modify: number;
};

export type T_Message = {
  role: 'system' | 'user' | 'assistant';
  content: string;
  reasoning?: string;
  tokens?: number;
};

export const ReasoningEfforts = ['minimal', 'low', 'medium', 'high'] as const;
export type T_ReasoningEffort = (typeof ReasoningEfforts)[number];
