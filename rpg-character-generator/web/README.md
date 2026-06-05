# RPG Character Generator — Web Frontend

Interface web para o sistema de geração paralela de personagens de RPG (D&D 5e), desenvolvida com **React + Vite + TypeScript**.

## Telas

| Tela | Descrição |
|---|---|
| **Formulário** | Escolha nome, classe, raça e cores do personagem |
| **Loading** | Anel arcano animado enquanto o backend processa |
| **Ficha** | Exibe avatar, atributos base e derivados do personagem |

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | React 18 |
| Build | Vite 5 |
| Linguagem | TypeScript 5 |
| Fontes | Cinzel + Crimson Text (Google Fonts) |
| Estilo | CSS puro (variáveis, animações, responsivo) |

## Estrutura

```
web/
├── src/
│   ├── App.tsx                  # Máquina de estados: form → loading → ficha
│   ├── main.tsx                 # Entry point
│   ├── index.css                # Tema RPG completo
│   ├── vite-env.d.ts            # Tipos do Vite
│   ├── services/
│   │   └── api.ts               # createCharacter / getStatus / getAvatarUrl
│   └── components/
│       ├── CharacterForm.tsx    # Formulário de criação
│       ├── LoadingScreen.tsx    # Animação arcana + polling
│       └── CharacterSheet.tsx  # Ficha completa do personagem
├── index.html
├── vite.config.ts               # Proxy das rotas da API
├── package.json
└── tsconfig.json
```

## Instalação e execução

```bash
# 1. Entrar na pasta
cd rpg-character-generator/web

# 2. Instalar dependências
npm install

# 3. Iniciar o servidor de desenvolvimento
npm run dev
```

Acesse **http://localhost:3000** no navegador.

## Modo Demo

Não é necessário o backend rodando para visualizar a interface. No formulário, clique em:

> **🎭 Ver Demo (sem backend)**

O app simula o fluxo completo com dados fictícios (loading animado por 4s → ficha de personagem de exemplo).

## Conexão com o Backend

O Vite proxy redireciona automaticamente as chamadas da API durante o desenvolvimento:

| Rota | Destino |
|---|---|
| `/gerar-personagem` | `http://localhost:5000` |
| `/status/<id>` | `http://localhost:5000` |
| `/avatar/<id>` | `http://localhost:5000` |

Para usar com backend real, suba o Docker Compose na raiz do projeto:

```bash
cd rpg-character-generator
docker-compose up --scale worker=4
```

## Variáveis de ambiente

Crie um arquivo `.env` na pasta `web/` (opcional):

```env
# Deixe vazio para usar o proxy do Vite (padrão em desenvolvimento)
# Em produção coloque o URL completo da API
VITE_API_URL=
```

## Build de produção

```bash
npm run build
```

Os arquivos estáticos são gerados em `web/dist/` e podem ser servidos por qualquer servidor (nginx, Vercel, etc.).

## Classes disponíveis

| Classe | Ícone | Requisito |
|---|---|---|
| Guerreiro | ⚔️ | FOR ≥ 13 |
| Mago | 🔮 | INT ≥ 13 |
| Arqueiro | 🏹 | DES ≥ 13 |
| Ladino | 🗡️ | DES ≥ 12 e INT ≥ 11 |
| Clérigo | ✝️ | SAB ≥ 13 |

## Raças disponíveis

| Raça | Ícone |
|---|---|
| Humano | 👤 |
| Elfo | 🧝 |
| Anão | ⛏️ |
| Halfling | 🍀 |
| Tiefling | 😈 |

## Atributos exibidos na ficha

**Base** (rolagem 4d6, descarta o menor):
`FOR` · `DES` · `INT` · `CON` · `SAB` · `CAR`

**Derivados** (calculados em paralelo via `billiard.Pool` no worker):

| Atributo | Ícone |
|---|---|
| Dano | ⚔️ |
| Defesa | 🛡️ |
| Chance Crítica | 💥 |
| Velocidade de Ataque | ⚡ |
