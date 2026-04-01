# TODO

## Mapa de testes — core

### actions/admin.ts

#### Halls
- [x] `createHall` — cria salão com dados válidos
- [x] `createHall` — rejeita nome vazio ou acima de 100 chars
- [x] `createHall` — rejeita se usuário não for admin
- [x] `toggleHall` — alterna active de true para false e vice-versa
- [x] `toggleHall` — lança erro se salão não existir
- [x] `toggleHall` — rejeita ID inválido (não-cuid)
- [x] `getActiveHalls` — retorna apenas salões com active=true

#### Usuários
- [x] `createUser` — cria usuário, seta mustChangePassword=true e dispara e-mail
- [x] `createUser` — rejeita nome < 2 chars ou e-mail inválido
- [x] `createUser` — rejeita se já existir usuário com mesmo e-mail
- [x] `setUserRole` — altera role para admin ou guard
- [x] `setUserRole` — rejeita role inválida
- [x] `setUserRole` — rejeita se chamado por não-admin

#### E-mails de relatório
- [x] `addReportEmail` — cria novo e-mail de relatório
- [x] `addReportEmail` — reativa e-mail existente em vez de duplicar (upsert)
- [x] `addReportEmail` — rejeita e-mail inválido
- [x] `toggleReportEmail` — alterna active
- [x] `toggleReportEmail` — lança erro se registro não existir

#### Bootstrap
- [x] `createInitialAdmin` — cria admin quando banco está vazio
- [x] `createInitialAdmin` — lança erro se já existir algum usuário

---

### actions/sessions.ts

#### Check-in
- [x] `checkinAction` — cria HallSession com status=open e itens associados
- [x] `checkinAction` — rejeita se salão não existir ou estiver inativo
- [x] `checkinAction` — rejeita se já houver sessão aberta para o salão
- [x] `checkinAction` — rejeita se usuário não estiver autenticado

#### Check-out
- [x] `checkoutAction` — fecha sessão, salva checkoutQty de cada item
- [x] `checkoutAction` — envia e-mail de relatório para destinatários ativos
- [x] `checkoutAction` — rejeita se sessão não existir ou já estiver fechada
- [x] `checkoutAction` — rejeita se guard tentar fechar sessão de outro guard (sem ser admin)

#### Consultas
- [x] `getLastCheckoutItems` — retorna itens do último checkout do salão
- [x] `getLastCheckoutItems` — retorna null se salão nunca teve checkout

---

### actions/account.ts

- [x] `changeFirstLoginPassword` — altera senha e limpa mustChangePassword
- [x] `changeFirstLoginPassword` — rejeita se senhas não coincidirem
- [x] `changeFirstLoginPassword` — rejeita se usuário não estiver autenticado

---

### lib/schemas (validação pura, sem I/O)

- [x] `ChangePasswordSchema` — rejeita confirm diferente de newPassword
- [x] `ChangePasswordSchema` — rejeita newPassword < 8 chars
- [x] `CreateHallSchema` — rejeita nome vazio
- [x] `CreateUserSchema` — rejeita e-mail malformado
- [x] `CreateInitialAdminSchema` — rejeita password < 8 chars

---

## GitHub Action — CI de testes
- [x] Criar `.github/workflows/test.yml`
- [x] Rodar testes no push/PR para main
- [x] Subir PostgreSQL como service container no workflow
- [x] Rodar `prisma migrate deploy` antes dos testes
- [x] Configurar secrets: DATABASE_URL, BETTER_AUTH_SECRET, RESEND_API_KEY (mock)
