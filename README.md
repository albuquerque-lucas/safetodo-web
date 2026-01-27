# Tasks Django - Frontend

Frontend em React + Vite para o sistema de tarefas/equipes.

## Requisitos
- Node.js 18+ (recomendado)
- npm 9+ (ou pnpm/yarn)

## Instalação
```bash
cd react-todo
npm install
```

## Variáveis de ambiente
Por padrão, o frontend usa a API em `http://localhost:8000/api`.
Se precisar alterar, crie um arquivo `.env` na raiz do frontend:
```
VITE_API_BASE_URL=http://localhost:8000/api
```

## Como rodar localmente
```bash
npm run dev
```
Abra `http://localhost:5173`.

## Funcionalidades principais
- Login e rotas públicas/privadas.
- CRUD de tarefas com status, prioridade e equipe.
- CRUD de usuários.
- CRUD de equipes com membros e managers.
- Aba de tarefas por equipe.

## Observações
- A autenticação usa JWT (token salvo no `localStorage`).
- O menu lateral exibe links privados quando o usuário está logado.
- A lista de usuários para atribuição de tarefas é filtrada pela equipe selecionada.
