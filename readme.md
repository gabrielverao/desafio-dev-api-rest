# Desafio Dock - Conta Digital

> Importante: esta aplicação foi desenvolvida com foco em avaliação técnica. Em um ambiente real, adotar uma arquitetura baseada em microsserviços requer análise criteriosa de diversos fatores como:
> - Escalabilidade
> - Custo de infraestrutura
> - Quantidade de requisições por segundo
> - Equipe envolvida
> - Complexidade do domínio

> O projeto foi desenvolvido prioritariamente em português devido à natureza do domínio, que envolve o gerenciamento de contas digitais e transações financeiras. Evita-se forçar traduções não consistentes, garantindo que os termos utilizados sejam mais claros e compreensíveis dentro do contexto financeiro.

### Tecnologias e Padrões Utilizados

- NEST
- TypeORM
- RabbitMQ
- PostgreSQL
- MongoDb
- Microsserviços (Monorepo)
- Clean Arch
- DDD
- Docker Compose
- Swagger

### Observações

- Não implementei migrations automáticas para maior simplicidade.
- A validação de CPF é feita de forma simplificada, sem consulta complexa ou fontes externas.
- Parâmetros sensíveis e de ambiente estão embutidos diretamente no código para facilitar testes locais. Em produção, esses dados seriam controlados por variáveis de ambiente (ENV) com segurança e versionamento apropriado.

## Microsserviços Disponíveis

O projeto segue uma arquitetura baseada em microsserviços, onde cada domínio é isolado em seu próprio contexto, facilitando escalabilidade, testes e manutenção.

### Portador (portador)
Responsável pela gestão dos portadores da conta digital Dock.

**Funcionalidades:**
- Criar novo portador
- Remover portador (soft delete)
- Buscar portador por CPF

### Conta (conta)
Gerencia as contas digitais vinculadas aos portadores.

**Funcionalidades:**
- Criar conta com base no CPF do portador
- Consultar dados da conta (número, agência, saldo)
- Encerrar conta
- Bloquear e desbloquear conta

### Transação (transacao)
Responsável pelas operações financeiras da conta digital.

**Funcionalidades:**
- Realizar depósito
- Realizar saque

### Comunicação assíncrona entre os Microsserviços

- Evento: portador.criado
- Emitido quando um novo portador é criado.
- Consumido pelo microserviço conta, que cria automaticamente a conta vinculada ao CPF informado.

- Evento: transacao.criada
- Emitido ao realizar uma transação (saque ou depósito).
- Consumido por:
-- Conta: atualiza o saldo da conta correspondente.
-- Extrato: armazena a transação em uma coleção MongoDB para consulta futura.

-OBS: É simulado lançamento de eventos em todos use cases

### Comunicação síncrona entre os Microsserviços

- conta -> portador: Verifica se um CPF existe antes de criar a conta
- transacao -> conta: Valida se a operação (saque ou depósito) pode ser realizada (saldo, bloqueio, limite diário)


## Como Rodar o Projeto

### Pré-requisitos

Antes de começar, você precisa ter instalado:

- [Node.js](https://nodejs.org/) v18+
- [Yarn](https://classic.yarnpkg.com/lang/en/docs/install/)
- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/)
- Git

---

### 📦 1. Clonar o projeto

```bash
git clone https://github.com/gabrielverao/desafio-dev-api-rest
cd dock-desafio
```

---

###  2. Instalar as dependências

```bash
yarn install
```

---

###  3. Subir os containers (RabbitMQ, PostgreSQL e MongoDB)

```bash
docker compose up -d
```

---

### 4. Rodar os testes unitários

```bash
# Testes por microsserviço
yarn test:portador
yarn test:conta
yarn test:transacao

# Ou rodar via script unico
yarn test:all

```

---

###  5. Rodar os microsserviços em modo dev

```bash
# Em terminais separados ou com ferramentas como tmux/VSCode split

# Porta 3000
yarn start:portador:dev

# Porta 3001
yarn start:conta:dev

# Porta 3002
yarn start:transacao:dev

# Ou rodar via script unico
yarn start:all
```




---

###  6. Acessar documentação Swagger

Após subir os microsserviços, acesse no navegador:

| Microsserviço | Porta | Swagger URL                     |
|---------------|-------|----------------------------------|
| Portador      | 3000  | http://localhost:3000/swagger   |
| Conta         | 3001  | http://localhost:3001/swagger   |
| Transação     | 3002  | http://localhost:3002/swagger   |

> Use o Swagger para testar todos os endpoints públicos e acompanhar os fluxos de criação de portador, conta e transações.





