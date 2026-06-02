# Ana Maria Silva — Dashboard com IA

> Projeto desenvolvido durante a **Sprint PrograMaria: IA no Trabalho** com uso de **Vibe Coding** assistido por IA — Google Antigravity IDE.

<br>

## 💻 Sobre o projeto

**Por onde começo?** é um dashboard pessoal de produtividade criado para ser a **primeira tela aberta no início do dia de trabalho**. A proposta é simples: antes de abrir qualquer outra aba, defina suas prioridades.

O dashboard reúne, em uma única interface, as principais informações e ferramentas para organizar o dia — tudo funcionando **100% no navegador**, sem back-end. Com a conexão opcional à conta Google, os dados de **Gmail** e **Google Calendar** são exibidos em tempo real diretamente no dashboard.

<br>

## 🌐 Demo ao vivo

🔗 **[ana-maria-silva.github.io/projeto-dashboard-ia](https://ana-maria-silva.github.io/projeto-dashboard-ia/)**

<br>

## ✨ Funcionalidades

| Módulo | Descrição | Dados |
|---|---|---|
| ✅ **Tarefas do dia** | Lista com checkbox, barra de progresso e persistência automática | `localStorage` |
| 🎯 **Metas da semana** | Metas editáveis em linha, marcáveis como concluídas | `localStorage` |
| 📝 **Notas rápidas** | Área de texto livre com salvamento automático | `localStorage` |
| 📧 **E-mails da semana** | Gráfico de barras com volume de e-mails recebidos por dia | Gmail API (real) / mock |
| 📅 **Agenda semanal** | Semana navegável com eventos categorizados por tipo | Google Calendar API (real) / mock |
| 🕐 **Relógio em tempo real** | Relógio digital atualizado a cada segundo com data em português | — |
| 🔔 **Lembrete do dia** | Strip com tarefas pendentes e eventos do dia atual | Integrado |
| 👤 **Perfil do usuário** | Avatar e nome da conta Google após login | Google OAuth |

<br>

## 🔗 Integração com a API do Google

O dashboard conecta-se a **duas APIs do Google** por meio do **OAuth 2.0** (fluxo implícito, sem back-end):

### Como funciona o fluxo de autenticação

```
Usuário clica em "Entrar com Google"
        ↓
Google Identity Services (GIS) abre popup OAuth
        ↓
Usuário autoriza os escopos solicitados
        ↓
GIS retorna um Access Token temporário
        ↓
Token é usado para chamar Gmail API e Google Calendar API
        ↓
Dados reais aparecem no dashboard
```

### APIs utilizadas

| API | Escopo | O que exibe |
|---|---|---|
| **Gmail API** | `gmail.readonly` | Contagem de e-mails recebidos por dia na semana |
| **Google Calendar API** | `calendar.readonly` | Eventos da semana (reuniões, tarefas, TO DOs) |
| **Google People API** | `openid`, `profile`, `email` | Nome e foto de perfil do usuário |

### Comportamento sem login

Quando o usuário **não está autenticado**, o dashboard exibe dados de exemplo (mock) em todos os módulos, funcionando normalmente com:
- Dados fictícios de e-mails no gráfico
- Agenda de exemplo com reuniões pré-definidas
- Tarefas e notas salvas no `localStorage`

### Configuração do Client ID OAuth

O projeto usa um **Client ID** criado no [Google Cloud Console](https://console.cloud.google.com/). Para o login funcionar em um domínio, ele precisa estar nas **Origens JavaScript autorizadas** do Client ID:

```
# Desenvolvimento local
http://localhost:8000

# GitHub Pages (produção)
https://ana-maria-silva.github.io
```

<br>

## 🛠️ Tecnologias e Ferramentas

### Linguagens

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)

### Bibliotecas & APIs

| Tecnologia | Versão | Uso |
|---|---|---|
| [Chart.js](https://www.chartjs.org/) | 4.4.0 | Gráfico de barras dos e-mails da semana |
| [Google Identity Services](https://developers.google.com/identity) | — | OAuth 2.0 — autenticação sem back-end |
| [Gmail API](https://developers.google.com/gmail/api) | v1 | Contagem de e-mails reais por dia |
| [Google Calendar API](https://developers.google.com/calendar) | v3 | Eventos reais da semana |
| [Google Fonts — Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) | — | Tipografia de títulos e labels |
| [Google Fonts — Inter](https://fonts.google.com/specimen/Inter) | — | Tipografia de corpo e inputs |
| `localStorage` (Web API nativa) | — | Persistência de tarefas, metas e notas |

### Ferramentas de Desenvolvimento

| Ferramenta | Função |
|---|---|
| [Google Antigravity IDE](https://idx.google.com/) | Ambiente de desenvolvimento com IA — Vibe Coding |
| [Google Cloud Console](https://console.cloud.google.com/) | Gerenciamento de APIs e credenciais OAuth |
| Git + GitHub | Versionamento e publicação do código |
| GitHub Pages | Hospedagem estática da aplicação |

<br>

## 🗂️ Estrutura do Projeto

```
projeto-dashboard-ia/
│
├── index.html      # Estrutura HTML — overlays, header, grid, cards, footer
├── style.css       # Estilização completa — design system, tokens, responsividade, animações
├── script.js       # Lógica JavaScript — auth Google, APIs, relógio, tarefas, metas, agenda
└── README.md       # Documentação do projeto
```

### Separação de responsabilidades

O projeto foi estruturado seguindo o princípio de **separação de responsabilidades** (Separation of Concerns):

- **`index.html`** — apenas estrutura semântica, sem estilos inline ou scripts embutidos
- **`style.css`** — todo o visual, animações e responsividade em um único arquivo organizado por seções
- **`script.js`** — toda a lógica de negócio, autenticação e manipulação de dados

Essa separação facilita a manutenção, legibilidade e colaboração no projeto, além de seguir as boas práticas de desenvolvimento web.

<br>

## 🌐 Design

O visual do dashboard foi inspirado no portfólio pessoal **[anamaria.dev.br](https://www.anamaria.dev.br)** e segue a mesma linguagem visual:

- 🖤 Fundo preto puro com textura de dot-grid
- 🩵 Cor primária `#00F0FF` — ciano neon com glow effects
- 🔤 Tipografia **Space Grotesk** (títulos) + **Inter** (corpo)
- 📐 Bordas nítidas com border-radius mínimo (estilo sharp/editorial)
- ✨ Micro-animações em hover, entrada de elementos e barra de progresso
- 📱 Layout responsivo para tablet e mobile

<br>

## 🚀 Evolução do projeto — etapas realizadas

### Etapa 1 — Estrutura inicial (Vibe Coding com IA)

O projeto começou com um único arquivo `index.html` gerado via **Vibe Coding** no Google Antigravity IDE. Essa versão inicial incluía HTML, CSS e JavaScript todos embutidos em um único arquivo, com funcionalidades básicas de tarefas, metas, notas e um gráfico de e-mails com dados fictícios.

### Etapa 2 — Separação de arquivos

O código foi reorganizado em três arquivos independentes:

- Todo o CSS foi extraído para `style.css`
- Todo o JavaScript foi extraído para `script.js`
- O `index.html` passou a referenciar os arquivos externos

Essa refatoração tornou o código mais legível, organizado e profissional.

### Etapa 3 — Integração com a API do Google (dados reais)

Foi implementada a autenticação OAuth 2.0 via **Google Identity Services** (GIS), permitindo que o dashboard acesse dados reais:

- **Gmail API**: busca a contagem de e-mails recebidos por dia para a semana selecionada
- **Google Calendar API**: carrega eventos reais (reuniões, tarefas, eventos de dia inteiro) com navegação entre semanas
- **Perfil do usuário**: exibe nome e foto da conta Google autenticada no header

O fluxo é totalmente **client-side** — nenhum dado é enviado a um servidor externo além das próprias APIs do Google.

### Etapa 4 — Melhorias visuais e personalizações

- **Background tech animado** na tela de login: canvas com 70 partículas conectadas em azul escuro, grade de perspectiva em movimento e 15 símbolos de tecnologia flutuantes (`{ }`, `</>`, `fn()`, `AI`, `SQL`, `API`, `λ`, `∞`, etc.)
- **Paleta de azul escuro** (`#020b18` → `#061428`) substituindo o preto puro no overlay de login
- **Today Strip**: barra de lembrete diário com tarefas pendentes e eventos do dia atual
- **Navegação entre semanas**: botões para navegar para semanas anteriores e futuras na agenda e no gráfico de e-mails
- **Badge de dados reais**: indicador visual quando os dados do Gmail e Calendar são reais
- **Estado de carregamento**: feedback visual (shimmer) enquanto os dados da API são carregados
- Atualização do título da página e identidade visual do card de login

<br>

## ▶️ Como executar localmente

```bash
# Clone o repositório
git clone https://github.com/ana-maria-silva/projeto-dashboard-ia.git

# Acesse a pasta
cd projeto-dashboard-ia

# Abra com um servidor local (necessário para o OAuth funcionar)
# Opção 1 — Python
python -m http.server 8000

# Opção 2 — Node.js
npx serve .

# Acesse no navegador
# http://localhost:8000
```

> ⚠️ **Abrir o arquivo diretamente** (`file://`) **não funciona para o login Google** — o OAuth exige um servidor HTTP. Use um dos comandos acima.

<br>

## ⚙️ Configuração do Google Cloud (para usar suas próprias credenciais)

Caso queira configurar o projeto com suas próprias credenciais do Google:

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um projeto (ou use um existente)
3. Ative as APIs:
   - **Gmail API**
   - **Google Calendar API**
   - **Google People API**
4. Em **APIs e Serviços → Credenciais**, crie um **Client ID OAuth 2.0** do tipo *Aplicativo da Web*
5. Adicione as **Origens JavaScript autorizadas**:
   ```
   http://localhost:8000
   https://seu-usuario.github.io
   ```

<br>

## 📚 Contexto — Sprint PrograMaria: IA no Trabalho

Este projeto foi desenvolvido como **projeto prático** da Sprint PrograMaria de IA no Trabalho, uma iniciativa de aprendizado acelerado voltada para profissionais que querem aplicar inteligência artificial no dia a dia de trabalho.

**Conteúdos abordados na Sprint:**

- 📖 Fundamentos de IA Generativa
- 💬 Prompting e uso prático no trabalho
- ⚙️ Automação de tarefas e fluxos com IA
- 🔌 Desenvolvimento com APIs e agentes
- 📈 Escala, automação e governança
- 🛡️ Governança, riscos e responsabilidade em IA

**Mentoria:** Gabriela Surita ([@gabisurita](https://github.com/gabisurita)) — Engenheira de pesquisa na Google DeepMind.

> 🔗 [Sprint PrograMaria IA no Trabalho](https://vamosjuntes.programaria.org/sprint-ia-no-trabalho)

<br>

## Autora

### Ana Maria Silva

[![Portfolio](https://img.shields.io/badge/Portfólio-anamaria.dev.br-00F0FF?style=flat-square&logoColor=black)](https://www.anamaria.dev.br)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-anamariasilva-0A66C2?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/anamariasilva)
[![GitHub](https://img.shields.io/badge/GitHub-ana--maria--silva-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/ana-maria-silva)

Analista de TI · Cientista da Computação · Desenvolvedora Front-end  
Embaixadora PrograMaria · Alura Star · Criadora de conteúdo · Palestrante

<br>

---

<p align="center">Feito com 💙 durante a Sprint PrograMaria · IA no Trabalho</p>
