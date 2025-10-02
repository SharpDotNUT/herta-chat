export interface T_Model {
  id: string
  canonical_slug: string
  hugging_face_id: string
  name: string
  created: number
  description: string
  context_length: number
  architecture: Architecture
  pricing: Pricing
  top_provider: TopProvider
  per_request_limits: null
  supported_parameters: string[]
  default_parameters: DefaultParameters
}

interface Architecture {
  modality: string
  input_modalities: string[]
  output_modalities: string[]
  tokenizer: string
  instruct_type: string | null
}

interface Pricing {
  prompt: string
  completion: string
  request: string
  image: string
  web_search: string
  internal_reasoning: string
  input_cache_read?: string
  input_cache_write?: string
}

interface TopProvider {
  context_length: number
  max_completion_tokens: number | null
  is_moderated: boolean
}

interface DefaultParameters {
  temperature: number | null
  top_p: number | null
  frequency_penalty: number | null
}
