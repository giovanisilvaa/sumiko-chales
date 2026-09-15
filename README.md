# Sumiko Chalés

Sistema web desenvolvido para gerenciar reservas, hospedagens e a organização dos chalés do **Sumiko Chalés**, localizado em Ubatuba, São Paulo.

O projeto substitui o controle manual realizado por planilhas e permite que proprietários e zelador acompanhem as informações pelo computador ou celular.

## Sistema publicado

Acesse o sistema em:

https://sumiko-chales.web.app

## Objetivo

Centralizar o controle da pousada em um sistema simples, seguro, responsivo e atualizado em tempo real.

O sistema permite acompanhar:

- Reservas;
- Chalés livres, reservados e ocupados;
- Chalés aguardando limpeza;
- Entradas e saídas do dia;
- Valores pagos;
- Saldo a receber no check-in;
- Situação das hospedagens;
- Responsável por cada reserva.

## Estrutura dos chalés

O empreendimento possui dez chalés:

- **Parte de baixo:** chalés 1 a 5;
- **Parte de cima:** chalés 6 a 10;
- **Chalé 1:** residência do zelador, bloqueado para reservas;
- **Chalés 2 a 10:** disponíveis para hospedagem.

## Perfis e permissões

### Proprietários

Os proprietários podem:

- Cadastrar reservas;
- Definir o responsável pela reserva;
- Consultar todas as reservas;
- Pesquisar e filtrar reservas;
- Visualizar valores e pagamentos;
- Editar reservas;
- Cancelar reservas;
- Acompanhar check-in, check-out e limpeza;
- Visualizar a situação dos chalés.

### Zelador

O zelador pode:

- Consultar reservas;
- Pesquisar e filtrar reservas;
- Visualizar entradas e saídas;
- Confirmar check-in;
- Registrar o recebimento do saldo;
- Confirmar check-out;
- Controlar a situação de limpeza;
- Visualizar a ocupação dos chalés;
- Receber avisos de novas reservas enquanto o sistema estiver aberto.

## Funcionalidades implementadas

- Login com usuário e PIN numérico;
- Autenticação com Firebase;
- Alteração de PIN pelo próprio usuário;
- Sessão mantida no dispositivo;
- Controle de acesso por perfil;
- Painel responsivo para computador e celular;
- Separação dos chalés por localização;
- Cadastro de reservas;
- Identificação do responsável pela reserva;
- Cálculo automático do saldo;
- Formatação de telefone;
- Validação das datas de entrada e saída;
- Bloqueio de reservas conflitantes;
- Armazenamento no Cloud Firestore;
- Atualizações em tempo real;
- Resumo de chalés livres e indisponíveis;
- Contagem de entradas e saídas do dia;
- Lista geral de reservas;
- Pesquisa e filtros de reservas;
- Visualização dos detalhes da reserva;
- Edição e cancelamento de reservas;
- Confirmação de check-in;
- Registro do recebimento do saldo;
- Confirmação de check-out;
- Controle de limpeza dos chalés;
- Aviso visual e sonoro de novas reservas;
- Notificação do navegador para o zelador;
- Controle de acesso com regras do Firestore;
- Publicação no Firebase Hosting.

## Avisos de novas reservas

O zelador pode ativar os avisos pelo botão **Ativar avisos** disponível em seu painel.

Quando uma nova reserva é cadastrada, o sistema:

- Emite um aviso sonoro;
- Exibe um cartão com a nova reserva;
- Mostra uma notificação do navegador;
- Permite abrir os detalhes ao clicar no aviso.

Como o projeto utiliza o plano gratuito do Firebase, o sistema precisa estar aberto no navegador para receber esses avisos.

Cada navegador ou aparelho precisa conceder permissão para as notificações uma vez.

## Próximas etapas

Possíveis melhorias futuras:

- Calendário completo de ocupação;
- Relatórios financeiros;
- Indicadores de taxa de ocupação;
- Instalação do sistema como PWA;
- Notificações em segundo plano com o sistema fechado;
- Melhorias contínuas de acessibilidade e experiência do usuário.

## Tecnologias utilizadas

- HTML5;
- CSS3;
- JavaScript;
- Vite;
- Firebase Authentication;
- Cloud Firestore;
- Firebase Hosting;
- Git e GitHub.

## Executando o projeto

### Requisitos

- Node.js;
- npm;
- Visual Studio Code.

### Instalação

Clone o repositório:

```bash
git clone https://github.com/giovanisilvaa/sumiko-chales.git
```

Entre na pasta:

```bash
cd sumiko-chales
```

Instale as dependências:

```bash
npm install
```

Crie o arquivo `.env.local` na raiz do projeto:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Preencha as variáveis com a configuração do aplicativo web cadastrado no Firebase.

O arquivo `.env.local` não deve ser enviado ao GitHub.

Inicie o ambiente de desenvolvimento:

```bash
npm run dev
```

Acesse o endereço exibido pelo Vite no terminal, normalmente:

```text
http://localhost:5173
```

## Gerando a versão de produção

Execute:

```bash
npm run build
```

Os arquivos de produção serão gerados na pasta `dist`.

## Publicação no Firebase Hosting

Depois de gerar a versão de produção, publique com:

```bash
firebase deploy --only hosting
```

No Windows, caso o comando `firebase` não seja reconhecido, utilize:

```powershell
firebase.cmd deploy --only hosting
```

## Segurança

As operações do sistema são protegidas por:

- Firebase Authentication;
- Regras de segurança do Firestore;
- Separação de permissões entre proprietários e zelador;
- Validação dos dados antes do salvamento;
- Variáveis de configuração armazenadas localmente.

O arquivo `.env.local`, PINs e dados internos de autenticação não devem ser publicados no GitHub.

Dados reais de hóspedes não devem ser utilizados em versões públicas de demonstração.

## Finalidade acadêmica

O Sumiko Chalés também é um projeto pessoal de aprendizado, desenvolvido durante o curso de **Análise e Desenvolvimento de Sistemas**.

O projeto permite aplicar conhecimentos de:

- Desenvolvimento front-end;
- Programação em JavaScript;
- Modelagem de dados;
- Autenticação;
- Banco de dados em nuvem;
- Hospedagem de aplicações;
- Controle de versões;
- Segurança de aplicações;
- Experiência do usuário.