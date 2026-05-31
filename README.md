# Projeto Dashboard com IA — Google Antigravity 

> Projeto desenvolvido durante a **Sprint PrograMaria: IA no Trabalho** com uso de **Vibe Coding** assistido por IA — Google Antigravity IDE.

<br>

## 📌 Sobre o projeto

**Por onde começo?** é um dashboard pessoal de produtividade desenvolvido para ser a **primeira tela aberta no início do dia de trabalho**. Em vez de abrir e-mails ou redes sociais sem foco, a proposta é simples: antes de qualquer outra aba, defina suas prioridades.

O dashboard reúne, em uma única interface, as principais informações e ferramentas para organizar o dia — tudo funcionando **100% no navegador**, sem back-end e sem necessidade de login.

<br>

## ✨ Funcionalidades

| Módulo | Descrição |
|---|---|
| ✅ **Tarefas do dia** | Lista de tarefas com checkbox, barra de progresso e persistência automática via `localStorage` |
| 🎯 **Metas da semana** | Metas editáveis em linha, marcáveis como concluídas e salvas automaticamente |
| 📝 **Notas rápidas** | Área de texto livre com salvamento automático com debounce (sem perder nada) |
| 📧 **E-mails da semana** | Gráfico de barras com volume de e-mails recebidos por dia (Chart.js) |
| 📅 **Agenda semanal** | Visualização da semana atual com eventos categorizados por tipo (Reunião, Tarefa, TO DO) |
| 🕐 **Relógio em tempo real** | Relógio digital atualizado a cada segundo com data por extenso em português |

<br>

## 🚀 Demo

Abra o arquivo `index.html` diretamente no navegador — sem dependências de servidor.

```bash
# Clone o repositório
git clone https://github.com/ana-maria-silva/sprint-programaria-ia-no-trabalho.git

# Abra no navegador
open index.html   # macOS
start index.html  # Windows
```

<br>

## 🛠️ Tecnologias e Ferramentas

### Linguagens

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)

### Bibliotecas & APIs

| Tecnologia | Uso |
|---|---|
| [Chart.js 4.4](https://www.chartjs.org/) | Gráfico de barras dos e-mails da semana |
| [Google Fonts — Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) | Tipografia principal (títulos e labels) |
| [Google Fonts — Inter](https://fonts.google.com/specimen/Inter) | Tipografia de corpo (textos e inputs) |
| `localStorage` (Web API nativa) | Persistência de tarefas, metas e notas sem back-end |

### Ferramentas de Desenvolvimento

| Ferramenta | Função |
|---|---|
| [Google Antigravity IDE](https://idx.google.com/) | Ambiente de desenvolvimento com IA — Vibe Coding |
| Git + GitHub | Versionamento e publicação do código |

<br>

## 🗂️ Estrutura do Projeto

```
sprint-programaria-ia-no-trabalho/
│
├── index.html      # Estrutura HTML — header, grid, cards, footer
├── style.css       # Estilização completa — design system, tokens, responsividade
├── script.js       # Lógica JavaScript — relógio, tarefas, metas, notas, agenda, gráfico
└── README.md       # Documentação do projeto
```

<br>

## 🎨 Design

O visual do dashboard foi inspirado no portfólio pessoal **[anamaria.dev.br](https://www.anamaria.dev.br)** e segue a mesma linguagem visual:

- 🖤 Fundo preto puro com textura de dot-grid
- 🩵 Cor primária `#00F0FF` — ciano neon com glow effects
- 🔤 Tipografia **Space Grotesk** (títulos) + **Inter** (corpo)
- 📐 Bordas nítidas sem border-radius (estilo sharp/editorial)
- ✨ Micro-animações em hover, entrada de elementos e barra de progresso
- 📱 Layout responsivo para tablet e mobile

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

## 👩‍💻 Autora

### Ana Maria Silva

[![Portfolio](https://img.shields.io/badge/Portfólio-anamaria.dev.br-00F0FF?style=flat-square&logoColor=black)](https://www.anamaria.dev.br)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-anamariasilva-0A66C2?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/anamariasilva)
[![GitHub](https://img.shields.io/badge/GitHub-ana--maria--silva-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/ana-maria-silva)

Analista de TI · Cientista da Computação · Desenvolvedora Front-end  
Embaixadora PrograMaria · Alura Star · Criadora de conteúdo · Palestrante

<br>

---

<p align="center">Feito com 💙 durante a Sprint PrograMaria · IA no Trabalho</p>
