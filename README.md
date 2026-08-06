# Site da Florbela (florbelatv) — v2, com material real

Site estático (HTML/CSS/JS puro), montado a partir do material exportado do painel da Twitch (`florbelatv.zip`).

## O que já entrou com dado real

- Bio, trajetória (2013 → 2017 → hoje) e setup completo, extraídos do arquivo de descrições
- Links reais: Twitch, Facebook, Instagram, Twitter/X, TikTok, Discord
- Imagens reais: avatar, banner de perfil e os 6 painéis do canal (pasta `assets/`)
- Bloco "Apoie o canal" mencionando Nuuvem e Amazon

## O que ainda falta (procure por `TROCAR` no index.html)

1. **Link de afiliado da Nuuvem** — hoje o botão "Ver na Nuuvem" está com `href="#"`
2. **Link de afiliado da Amazon** — não veio uma URL no material, só a menção ao programa
3. **Agenda de lives** — o material não trouxe dias/horários fixos; a seção está marcada como pendente no site
4. **Imagem de capa (Open Graph)** — hoje aponta pra `assets/banner.png`; troque se quiser uma arte específica pra compartilhamento
5. **Confirmar com a Florbela** — tom do texto de bio, e se os 6 painéis da galeria são os que ela gostaria de destacar publicamente

## Observação sobre o texto de bio

O material original menciona que ela é mãe e cita nomes e idades dos filhos. Deixei essa parte fora do texto público do site por padrão, já que envolve dados de menores de idade — mantive só "professora de Artes" como toque pessoal. Se ela preferir incluir essa informação do jeito que estava, é só me avisar que eu ajusto.

## Publicar no Netlify

1. Manter `index.html`, `README.md`, `netlify.toml`, a pasta `assets/` e a pasta `netlify/functions/` juntos
2. Conectar um repositório Git pro deploy automático (necessário pra Netlify Functions funcionarem — o "arrastar pasta" do [app.netlify.com/drop](https://app.netlify.com/drop) não faz deploy de functions)
3. Configurar as variáveis de ambiente da Twitch (veja a seção abaixo) antes do primeiro deploy
4. Configurar domínio próprio depois, se quiser

## Status "ao vivo" (integração com a Twitch)

O badge `.nav-live` no cabeçalho consulta uma Netlify Function (`netlify/functions/twitch-status.js`) a cada 45s pra saber se o canal está ao vivo. O Client Secret da Twitch nunca aparece no front-end — ele só existe como variável de ambiente do lado do servidor (Netlify Function).

### 1. Criar o app na Twitch

1. Acesse [dev.twitch.tv/console](https://dev.twitch.tv/console) logado com a conta da Florbela (ou qualquer conta Twitch)
2. Vá em **Applications** → **Register Your Application**
3. Preencha:
   - **Name**: qualquer nome (ex: "Site florbelatv — status ao vivo")
   - **OAuth Redirect URLs**: qualquer URL https válida (ex: a URL final do site no Netlify, tipo `https://florbelatv.netlify.app`). O console da Twitch exige https aqui, mas esse campo nunca é usado no nosso caso — a function usa o fluxo *Client Credentials* (server-to-server), que não redireciona o navegador nem depende dessa URL
   - **Category**: "Website Integration"
4. Depois de criado, clique no app pra ver o **Client ID**
5. Clique em **New Secret** pra gerar o **Client Secret** — copie na hora, ele só é mostrado uma vez

### 2. Configurar as variáveis de ambiente no Netlify

1. No painel do site no Netlify, vá em **Site settings** → **Environment variables**
2. Adicione:
   - `TWITCH_CLIENT_ID` = o Client ID gerado acima
   - `TWITCH_CLIENT_SECRET` = o Client Secret gerado acima
   - `TWITCH_USER_LOGIN` = `florbelatv` (opcional — esse já é o valor padrão se a variável não for definida)
3. Faça um novo deploy (ou "Trigger deploy" manual) pra as variáveis passarem a valer

### 3. Testar localmente

1. Instale a Netlify CLI: `npm install -g netlify-cli`
2. Rode `netlify link` na raiz do projeto pra conectar com o site já criado no Netlify
3. Rode `netlify env:pull` pra baixar as variáveis configuradas no painel pra um `.env` local — ou copie `.env.example` pra `.env` e preencha manualmente
4. Rode `netlify dev` — isso sobe o site estático junto com as Functions em `http://localhost:8888`, com `/.netlify/functions/twitch-status` funcionando de verdade
5. Abra o site local e veja o badge mudar quando o canal estiver ao vivo (ou force um teste ficando ao vivo na Twitch)

## Stack

HTML/CSS/JS puro, sem build step. Fontes via Google Fonts (Cormorant Garamond + Karla). Uma Netlify Function (Node, sem dependências externas) faz o proxy seguro com a API da Twitch.
