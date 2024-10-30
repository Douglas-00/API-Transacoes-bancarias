# Desafio API Transações

Este é um projeto de API de um sistema bancário desenvolvido com NestJS e Prisma, projetado para gerenciar transações bancárias, incluindo depósito, saque e transferência entre contas. Ele suporta múltiplas transações concorrentes, garantindo a integridade do saldo das contas.

## Pré-requisitos

Antes de começar, você precisa ter instalado:

- [Node.js](https://nodejs.org/en/download/)
- [MySQL](https://dev.mysql.com/downloads/installer/)
- [Git](https://git-scm.com/downloads)

## Instalação

Siga os passos abaixo para configurar o projeto localmente:

### 1. Clone o repositório

Abra o terminal e execute o comando:

```bash
git clone https://github.com/seu-usuario/seu-repositorio.git
```

### 2. Navegue até o diretório do projeto

```bash
cd seu-repositorio
```

### 3. Instale as dependências

Use o npm ou o yarn para instalar as dependências do projeto:

```bash
npm install
# ou
yarn install
```

### 4. Configure o banco de dados

1. Crie um banco de dados no MySQL chamado `banco_transacoes`.
2. Configure a variável de ambiente `DATABASE_URL` no arquivo `.env`, localizado na raiz do projeto:

   ```
   DATABASE_URL="mysql://usuario:senha@localhost:3306/banco_transacoes"
   ```

   Substitua `usuario`, `senha` e `banco_transacoes` pelas informações correspondentes ao seu banco de dados MySQL.

### 5. Executar Migrações do Prisma

Para criar as tabelas no banco de dados, execute:

```bash
npx prisma migrate dev --name init
```

Isso criará a estrutura inicial das tabelas no banco de dados, conforme definido no arquivo `schema.prisma`.

### 6. Gerar o Client do Prisma

Gere o client Prisma para interagir com o banco de dados:

```bash
npx prisma generate
```

### 7. Iniciar o Servidor

Após configurar o banco de dados e o Prisma, inicie o servidor NestJS:

```bash
npm run start
```

A API estará rodando em [http://localhost:3000](http://localhost:3000).

## Rotas da API

Abaixo estão as principais rotas para criar contas e realizar transações:

### 1. Criar uma Conta

- **Endpoint**: `POST /account`
- **Exemplo de Requisição**:

  ```json
  {
    "number": "123456",
    "initialBalance": 1000
  }
  ```

- **Resposta Esperada**:
  ```json
  {
    "id": 1,
    "statusCode": 201,
    "message": "Account created successfully!"
  }
  ```

### 2. Criar uma Transação

- **Endpoint**: `POST /transaction`
- **Exemplo de Requisição**:

  ```json
  {
    "type": "DEPOSIT",
    "amount": 500,
    "accountId": 1
  }
  ```

- **Resposta Esperada**:
  ```json
  {
    "id": 1,
    "statusCode": 201,
    "message": "Transaction processed successfully!"
  }
  ```

### Testes de Concorrência

Para simular transações concorrentes, você pode usar ferramentas como [Postman](https://www.postman.com/downloads/) ou [Artillery](https://artillery.io/).

### 8. Executar Testes Automatizados

Para rodar testes automatizados (se houver), use:

```bash
npm run test
```

## Ferramentas e Tecnologias Utilizadas

- **NestJS**: Framework para construção de aplicações Node.js escaláveis.
- **Prisma**: ORM moderno para interagir com o banco de dados.
- **MySQL**: Banco de dados relacional.
- **TypeScript**: Superset do JavaScript para desenvolvimento com tipagem estática.

## Contribuição

Sinta-se à vontade para contribuir com este projeto. Faça um fork, crie uma branch e envie um pull request com suas melhorias!

## Contato

Em caso de dúvidas ou sugestões, entre em contato:

- Email: seu-email@example.com
- GitHub: [seu-usuario](https://github.com/seu-usuario)

## Licença

Este projeto está sob a licença MIT.
