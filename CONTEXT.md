# Salão de Festas - App de Controle de Condomínio

## Objetivo

App mobile-first para controle de uso dos salões de festa do condomínio. O vigilante faz check-in ao entrar no salão (registrando o inventário) e checkout ao sair (registrando o estado final). Um relatório de diferenças é enviado por email via Resend.

---

## Stack Tecnológica

| Camada        | Tecnologia                                |
|---------------|-------------------------------------------|
| Framework     | Next.js 16 (App Router)                   |
| UI            | React 19 + Tailwind CSS 4                 |
| Banco de Dados | SQLite (dev) via Prisma ORM              |
| Autenticação  | Better Auth (email + senha)               |
| Email         | Resend                                    |
| Linguagem     | TypeScript                                |

---

## Fluxo Principal

```
Vigilante faz login
       ↓
Dashboard mostra salões disponíveis / sessões ativas
       ↓
Seleciona um salão → Inicia Check-in
       ↓
Preenche inventário inicial (cadeiras, pratos, talheres, etc.)
  → Pode usar template do último checkout como ponto de partida
       ↓
[Festa acontece]
       ↓
Vigilante retorna → Inicia Checkout no mesmo salão
       ↓
Preenche inventário final para cada item
       ↓
Sistema calcula diferenças (checkin vs checkout)
       ↓
SINCRONIZA com servidor → Envia email com relatório
```

---

## Arquitetura de Arquivos

```
app-latest/
├── CONTEXT.md                         # Este arquivo
├── .env.local                         # Variáveis de ambiente
├── prisma/
│   └── schema.prisma                  # Esquema do banco de dados
├── lib/
│   ├── prisma.ts                      # Singleton do Prisma Client
│   ├── auth.ts                        # Configuração do Better Auth (servidor)
│   ├── auth-client.ts                 # Cliente do Better Auth (browser)
│   └── resend.ts                      # Configuração do Resend + lógica de email
├── app/
│   ├── layout.tsx                     # Root layout
│   ├── page.tsx                       # Redirect para /dashboard ou /login
│   ├── globals.css
│   ├── api/
│   │   └── auth/
│   │       └── [...all]/route.ts      # Better Auth handler
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   └── login/page.tsx             # Tela de login
│   └── (app)/
│       ├── layout.tsx                 # Layout com navegação inferior (mobile)
│       ├── dashboard/page.tsx         # Lista de salões + sessões ativas
│       ├── halls/
│       │   └── [hallId]/
│       │       ├── checkin/page.tsx   # Formulário de check-in
│       │       └── checkout/page.tsx  # Formulário de checkout
│       ├── sessions/
│       │   ├── page.tsx              # Histórico de sessões
│       │   └── [sessionId]/page.tsx  # Detalhes da sessão / relatório
│       └── admin/
│           ├── page.tsx              # Painel admin
│           ├── halls/page.tsx        # Gerenciar salões
│           ├── users/page.tsx        # Gerenciar vigilantes
│           └── emails/page.tsx       # Gerenciar emails de relatório
├── actions/
│   ├── sessions.ts                   # Server Actions: checkin, checkout
│   └── admin.ts                      # Server Actions: halls, users, emails
└── components/
    ├── InventoryForm.tsx              # Formulário dinâmico de inventário
    ├── SessionCard.tsx                # Card de sessão ativa
    └── DiffTable.tsx                  # Tabela de diferenças checkin/checkout
```

---

## Esquema do Banco de Dados

### Entidades Principais

- **User** — vigilantes e administradores (gerenciado pelo Better Auth)
- **Hall** — salões de festa (nome, descrição)
- **HallSession** — sessão de uso de um salão (check-in/checkout)
- **SessionItem** — item de inventário com quantidade no check-in e checkout
- **ReportEmail** — emails que recebem os relatórios

### Relações

```
Hall (1) → (N) HallSession
User (1) → (N) HallSession
HallSession (1) → (N) SessionItem
```

---

## Regras de Negócio

1. **Múltiplos salões simultâneos**: Cada salão tem sua própria sessão ativa independente.
2. **Template do último checkout**: No check-in, o sistema busca o último checkout do mesmo salão e pré-preenche os itens e quantidades.
3. **Sync no checkout**: O check-in pode ser feito offline (estado local), mas o checkout sincroniza tudo com o servidor.
4. **Relatório por email**: Enviado via Resend ao finalizar o checkout, contendo:
   - Nome do salão, vigilante, data/hora
   - Tabela de itens: nome | qtd. check-in | qtd. checkout | diferença
   - Observações (se houver)
5. **Papéis**:
   - `ADMIN`: gerencia salões, usuários e emails de relatório
   - `GUARD`: faz check-in e checkout

---

## Variáveis de Ambiente Necessárias

```env
DATABASE_URL="file:./dev.db"
BETTER_AUTH_SECRET="<segredo-aleatorio-32-chars>"
BETTER_AUTH_URL="http://localhost:3000"
RESEND_API_KEY="re_xxxxxxxxxxxx"
REPORT_FROM_EMAIL="relatorios@seudominio.com"
```

---

## Decisões de Design

- **Mobile-first**: Layout otimizado para telas de smartphone (vigilante usa celular)
- **Navegação inferior**: Bottom nav bar com Dashboard, Sessões, Admin
- **Sem PWA complexo**: Checkin e checkout são operações rápidas com conexão; o foco offline fica no formulário de checkout (dados em state local até submit)
- **SQLite em dev**: Fácil para rodar localmente; troca para PostgreSQL em produção alterando `DATABASE_URL` e `provider` no schema
