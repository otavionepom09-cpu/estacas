export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      clientes: {
        Row: {
          id: string
          nome: string
          documento: string | null
          telefone: string | null
          email: string | null
          endereco: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          documento?: string | null
          telefone?: string | null
          email?: string | null
          endereco?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          documento?: string | null
          telefone?: string | null
          email?: string | null
          endereco?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      obras: {
        Row: {
          id: string
          cliente_id: string
          nome: string
          endereco: string | null
          cidade: string | null
          observacoes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cliente_id: string
          nome: string
          endereco?: string | null
          cidade?: string | null
          observacoes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cliente_id?: string
          nome?: string
          endereco?: string | null
          cidade?: string | null
          observacoes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      configuracoes_caminhao: {
        Row: {
          id: string
          nome: string
          largura_util_cm: number
          comprimento_util_cm: number
          ativo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          largura_util_cm: number
          comprimento_util_cm: number
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          largura_util_cm?: number
          comprimento_util_cm?: number
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      tipos_estaca: {
        Row: {
          id: string
          nome: string
          diametro_cm: number
          ativo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          diametro_cm: number
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          diametro_cm?: number
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      pedidos: {
        Row: {
          id: string
          cliente_id: string
          obra_id: string
          tipo_estaca_id: string
          quantidade_solicitada: number
          capacidade_por_caminhao: number
          quantidade_entregas: number
          status: string
          observacoes: string | null
          diametro_utilizado: number
          largura_utilizada: number
          comprimento_utilizado: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cliente_id: string
          obra_id: string
          tipo_estaca_id: string
          quantidade_solicitada: number
          capacidade_por_caminhao: number
          quantidade_entregas: number
          status?: string
          observacoes?: string | null
          diametro_utilizado: number
          largura_utilizada: number
          comprimento_utilizado: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cliente_id?: string
          obra_id?: string
          tipo_estaca_id?: string
          quantidade_solicitada?: number
          capacidade_por_caminhao?: number
          quantidade_entregas?: number
          status?: string
          observacoes?: string | null
          diametro_utilizado?: number
          largura_utilizada?: number
          comprimento_utilizado?: number
          created_at?: string
          updated_at?: string
        }
      }
      entregas: {
        Row: {
          id: string
          pedido_id: string
          numero_entrega: number
          quantidade_estacas: number
          data_prevista: string | null
          data_entrega: string | null
          status: string
          observacoes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pedido_id: string
          numero_entrega: number
          quantidade_estacas: number
          data_prevista?: string | null
          data_entrega?: string | null
          status?: string
          observacoes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          pedido_id?: string
          numero_entrega?: number
          quantidade_estacas?: number
          data_prevista?: string | null
          data_entrega?: string | null
          status?: string
          observacoes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
