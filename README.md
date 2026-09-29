# Estacas Pro

Sistema completo para planejamento e controle de entregas de estacas de concreto armado, otimizado para deploy na Vercel e banco de dados Supabase.

## Arquitetura e Tecnologias
- **Next.js 14+ (App Router)**
- **React & TypeScript**
- **Tailwind CSS**
- **Supabase** (PostgreSQL)
- **Vercel** (Deploy)
- **Lucide Icons**

## Como Configurar e Rodar Localmente

1. **Instalar Dependências**
   ```bash
   npm install
   ```

2. **Configurar Supabase**
   - Crie um projeto no [Supabase](https://supabase.com/).
   - Execute o script SQL encontrado em `supabase/migrations/20260929000000_initial_schema.sql` no SQL Editor do Supabase para criar as tabelas e políticas necessárias.
   - Obtenha a URL e a Anon Key do projeto em *Project Settings -> API*.

3. **Variáveis de Ambiente**
   - Copie o arquivo `.env.example` para `.env.local`:
     ```bash
     cp .env.example .env.local
     ```
   - Preencha com as suas chaves do Supabase:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=sua-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
     ```

4. **Rodar o Servidor de Desenvolvimento**
   ```bash
   npm run dev
   ```
   Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

## Testes

Os testes para as regras de negócio de cálculo de capacidade e divisão de entregas estão localizados em `src/lib/calculations.test.ts`.

Para executar os testes:
```bash
npm test
```
*(Nota: Configure o Jest ou Vitest se desejar rodar a suíte localmente)*

## Deploy na Vercel

1. Crie uma conta na [Vercel](https://vercel.com/).
2. Importe o repositório do projeto.
3. Adicione as variáveis de ambiente `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` nas configurações do projeto na Vercel.
4. Clique em Deploy.

## Estrutura do Projeto

- `src/app/` - Páginas e layout (Dashboard, Planejamento, etc)
- `src/lib/` - Regras de negócio isoladas, funções utilitárias e client do Supabase
- `supabase/migrations/` - Scripts SQL para o banco de dados
