# GymTrack 🏋️‍♂️⚡

GymTrack é uma aplicação web mobile-first focada no registro e acompanhamento de evolução de cargas em treinos de musculação. Com um design escuro e premium (estética neon/dark mode), proporciona uma experiência de usuário limpa, direta e visualmente atraente.

## 🚀 Funcionalidades

- **Autenticação Segura:** Login e Cadastro com E-mail e Senha (Firebase Auth).
- **Dashboard Personalizado:** Painel inicial que exibe gráficos de progressão de carga utilizando Chart.js, além de dar boas-vindas com o nome do usuário.
- **Registro de Treinos:** Adicione treinos preenchendo Exercício, Peso (kg), Séries, Repetições e uma descrição opcional.
- **Histórico Completo:** Visualize todos os seus treinos passados, com filtros rápidos por pesquisa de texto ou tipo de exercício.
- **Edição e Exclusão:** Gerencie livremente os registros, com capacidade de editar entradas incorretas ou excluí-las.
- **Armazenamento em Nuvem:** Todos os dados são salvos e vinculados à sua conta através do Google Firebase Firestore.

## 🛠️ Tecnologias Utilizadas

- **Frontend:** HTML5, CSS3 Vanilla (sem frameworks, seguindo metodologias modernas e CSS Variables) e JavaScript (ES6+ Modular).
- **Gráficos:** [Chart.js](https://www.chartjs.org/) (Carregado via CDN assíncrona).
- **Backend & Banco de Dados:** [Firebase](https://firebase.google.com/) (Auth, Firestore).
- **Arquitetura Visual:** Mobile-first design, layout fluido com componentes UI construídos de forma programática para evitar problemas de segurança (XSS).

## 📁 Estrutura do Projeto

```text
GymTracker/
├── index.html           # Página inicial (Autenticação / Dashboard)
├── treino.html          # View de inserção e edição de treinos
├── historico.html       # View de histórico e pesquisa de treinos
├── firebase.json        # Arquivo de mapeamento de deploy do Firebase
├── firestore.rules      # Regras de segurança rigorosas do Banco de Dados
├── assets/
│   └── img/
│       └── bg.png       # Imagem premium de fundo
├── css/
│   ├── reset.css        # Limpeza de formatação padrão dos browsers
│   ├── var.css          # Design System (Cores, Fontes, Tamanhos)
│   └── skin.css         # Estilos estruturais e de interface
└── js/
    ├── firebase-config.js # Credenciais e inicialização do Firebase SDK
    ├── utils.js         # Lógica de banco de dados, auth e formatadores (DRY)
    ├── views.js         # Construtor dinâmico do DOM (Segurança e Reuso)
    └── main.js          # Arquivo central, rotas, controle de estado e gráficos
```

## ⚙️ Como Configurar (Desenvolvedores)

1. Clone o repositório.
2. Certifique-se de ter um projeto criado no [Firebase Console](https://console.firebase.google.com/).
3. Ative os provedores **Authentication (E-mail/Senha)** e **Firestore Database**.
4. Configure as regras do Firestore utilizando o conteúdo do arquivo `firestore.rules`.
5. Hospede localmente utilizando qualquer servidor local de sua preferência (ex: Extensão Live Server do VSCode). Nenhuma compilação ou empacotador de módulos (como Webpack) é estritamente necessário.
