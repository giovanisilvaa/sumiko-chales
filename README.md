# Sumiko Chalés

Sistema web desenvolvido para gerenciar reservas, hospedagens e a organização dos chalés do **Sumiko Chalés**, localizado em Ubatuba, São Paulo.

O projeto foi criado para substituir o controle manual realizado por planilhas, permitindo que proprietários e zelador acompanhem as informações pelo computador ou celular.

## Objetivo

Centralizar o controle da pousada em um sistema simples, seguro e atualizado em tempo real.

O sistema permite acompanhar:

- Reservas;
- Chalés livres e ocupados;
- Entradas e saídas;
- Valores pagos;
- Saldo a receber no check-in;
- Situação da hospedagem;
- Histórico de operações.

## Estrutura dos chalés

O empreendimento possui dez chalés:

- **Parte de baixo:** chalés 1 a 5;
- **Parte de cima:** chalés 6 a 10;
- **Chalé 1:** residência do zelador, bloqueado para reservas;
- **Chalés 2 a 10:** disponíveis para hospedagem.

## Perfis e permissões

### Proprietário

Permissões:

- Cadastrar reservas;
- Consultar todas as reservas;
- Visualizar valores e pagamentos;
- Acompanhar check-in e check-out;
- Visualizar a situação dos chalés.

### Zelador

Permissões:

- Consultar reservas;
- Visualizar entradas e saídas;
- Confirmar check-in;
- Registrar o recebimento do saldo;
- Acompanhar a situação e a limpeza dos chalés.

## Funcionalidades implementadas

- Login com usuário e PIN numérico;
- Autenticação com Firebase;
- Alteração de PIN pelo próprio usuário;
- Sessão mantida no dispositivo;
- Painel responsivo para computador e celular;
- Separação dos chalés por localização;
- Cadastro de reservas;
- Cálculo automático do saldo;
- Formatação de telefone;
- Validação das datas de entrada e saída;
- Bloqueio de reservas conflitantes;
- Armazenamento no Cloud Firestore;
- Atualizações em tempo real;
- Resumo de chalés livres e ocupados;
- Contagem de entradas e saídas do dia;
- Visualização dos detalhes da reserva;
- Confirmação de check-in;
- Registro do recebimento do saldo pelo zelador;
- Controle de acesso com regras do Firestore.

## Próximas etapas

- Confirmação de check-out;
- Controle de limpeza;
- Edição e cancelamento de reservas;
- Calendário completo de ocupação;
- Histórico de alterações;
- Notificações no celular;
- Relatórios financeiros;
- Taxa de ocupação;
- Instalação como PWA;
- Publicação da versão final.

## Tecnologias utilizadas

- HTML5;
- CSS3;
- JavaScript;
- Vite;
- Firebase Authentication;
- Cloud Firestore;
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

Inicie o ambiente de desenvolvimento:

```bash
npm run dev
```

Acesse o endereço exibido pelo Vite no terminal.

## Segurança

O arquivo `.env.local` não deve ser enviado ao GitHub.

As operações no banco são protegidas por:

- Firebase Authentication;
- Regras de segurança do Firestore;
- Separação de permissões entre proprietário e zelador;
- Validação dos dados antes do salvamento.

Dados reais de hóspedes não devem ser utilizados em versões públicas de demonstração.

## Finalidade acadêmica

O Sumiko Chalés também é um projeto pessoal de aprendizado, desenvolvido durante o curso de **Análise e Desenvolvimento de Sistemas**.

O projeto permite aplicar conhecimentos de:

- Desenvolvimento front-end;
- Programação em JavaScript;
- Modelagem de dados;
- Autenticação;
- Banco de dados em nuvem;
- Controle de versões;
- Segurança de aplicações;
- Experiência do usuário.
