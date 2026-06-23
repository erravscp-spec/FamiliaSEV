# O Nosso Cantinho 🌿

Dashboard privado para acompanhar a gravidez, lista de compras do bebé, calendário e finanças do casal.

## Passo 1 — Criar o projeto no Firebase

1. Vai a [console.firebase.google.com](https://console.firebase.google.com) e clica em **"Adicionar projeto"**.
2. Dá um nome (ex: `nosso-cantinho`) e segue os passos (podes desativar o Google Analytics, não é preciso).
3. Quando o projeto estiver criado, no menu lateral esquerdo:
   - Clica em **Build > Authentication** → "Get started" → escolhe o método **"Email/Password"** → ativa.
   - Depois vai ao separador **"Users"** e clica **"Add user"** — cria o email e palavra-passe que vocês vão partilhar para entrar no site.
   - Clica em **Build > Firestore Database** → "Create database" → escolhe modo **produção** → escolhe a localização **europe-west** (mais próximo de Portugal).

4. Depois de criada a base de dados, vai ao separador **"Rules"** dentro do Firestore e substitui o conteúdo pelo ficheiro `firestore.rules` que está neste projeto. Clica **"Publish"**.

5. Volta a **Definições do projeto** (ícone de engrenagem no topo) → em "As tuas apps" clica no ícone `</>` (Web) → dá um nome à app → "Registar app".
6. Vai aparecer um bloco de código com `firebaseConfig = { apiKey: ..., authDomain: ..., ... }`. **Copia esse bloco.**

## Passo 2 — Colar a configuração no projeto

Abre o ficheiro `src/firebase.js` e substitui os valores `"COLA_AQUI"` pelos valores reais que copiaste no passo anterior.

## Passo 3 — Subir para o GitHub

```bash
cd dashboard-bebe
git init
git add .
git commit -m "Primeira versão do dashboard"
```

No GitHub, cria um novo repositório (pode ser privado) chamado, por exemplo, `dashboard-bebe`. Depois:

```bash
git remote add origin https://github.com/O-TEU-USERNAME/dashboard-bebe.git
git branch -M main
git push -u origin main
```

⚠️ **Importante:** se deres outro nome ao repositório (diferente de `dashboard-bebe`), tens de editar a linha `base:` no ficheiro `vite.config.js` para corresponder ao nome exato.

## Passo 4 — Ativar o GitHub Pages

1. No repositório no GitHub, vai a **Settings > Pages**.
2. Em "Build and deployment" → "Source", escolhe **"GitHub Actions"**.
3. O ficheiro `.github/workflows/deploy.yml` já está incluído neste projeto — ele vai publicar o site automaticamente sempre que fizeres `git push` para a branch `main`.
4. Depois do primeiro push, espera 1-2 minutos e o site fica disponível em:
   `https://O-TEU-USERNAME.github.io/dashboard-bebe/`

## Passo 5 — Usar no dia a dia

- Entram os dois com o mesmo email/palavra-passe que criaste no Passo 1.
- Na primeira vez, cada um escolhe o seu nome (Eduardo/Sara) — isto só serve para identificar quem registou cada despesa, fica guardado no telemóvel/computador de cada um.
- Qualquer alteração (marcar item como comprado, adicionar despesa, etc.) aparece em tempo real para os dois.

## Desenvolvimento local (opcional)

Se quiseres testar no teu computador antes de publicar:

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`

## Estrutura do projeto

```
src/
  firebase.js       → configuração da ligação ao Firebase
  App.jsx           → navegação principal entre separadores
  components/
    Login.jsx        → ecrã de entrada
    Gravidez.jsx      → contagem de dias + notas/marcos
    Checklist.jsx     → lista de compras do bebé
    Calendario.jsx    → calendário de eventos
    Financas.jsx      → receitas e despesas mensais
```
