# Projeto SENAC - Front-end de Gestão de Usuários

Este é um projeto front-end desenvolvido para o curso do SENAC, que demonstra a integração com uma API REST para gestão de usuários e visualização de tarefas associadas.

## Descrição

O projeto permite cadastrar, listar, editar e excluir usuários através de uma interface web simples. Além disso, é possível visualizar as tarefas de cada usuário, consumindo dados de uma API backend.

## Funcionalidades

- **Cadastro de Usuários**: Formulário para adicionar novos usuários com nome, e-mail, telefone, data de nascimento e senha.
- **Listagem de Usuários**: Tabela exibindo todos os usuários cadastrados.
- **Edição de Usuários**: Possibilidade de editar informações de usuários existentes.
- **Exclusão de Usuários**: Remoção de usuários com confirmação.
- **Visualização de Tarefas**: Ao selecionar um usuário, exibe todas as tarefas associadas a ele.

## Tecnologias Utilizadas

- **HTML5**: Estrutura da página web.
- **CSS3**: Estilização básica (inline no HTML).
- **JavaScript (ES6+)**: Lógica de interação com a API e manipulação do DOM.
- **Fetch API**: Para requisições HTTP assíncronas.

## Pré-requisitos

Antes de executar o projeto, certifique-se de ter:

- Um navegador web moderno (Chrome, Firefox, Edge, etc.).
- Uma API backend rodando localmente na porta 3000 (ou ajuste a URL no código).
- Conexão com a internet (se a API estiver hospedada remotamente).

## Como Rodar o Projeto

1. **Clone o repositório** (se aplicável):
   ```
   git clone https://github.com/wbuback/projeto-senac-front.git
   cd projeto-senac-front
   ```

2. **Abra o arquivo `index.html`** no seu navegador:
   - Clique duplo no arquivo `index.html` ou
   - Use um servidor local (recomendado para evitar problemas de CORS):
     - Instale o Node.js se não tiver.
     - Instale o `http-server` globalmente: `npm install -g http-server`
     - Execute: `http-server` na raiz do projeto.
     - Abra `http://localhost:8080` no navegador.

3. **Certifique-se de que a API backend está rodando**:
   - A API deve estar disponível em `http://localhost:3000`.
   - Endpoints esperados:
     - `GET /usuarios`: Lista todos os usuários.
     - `POST /usuarios`: Cria um novo usuário.
     - `PUT /usuarios/:id`: Atualiza um usuário existente.
     - `DELETE /usuarios/:id`: Exclui um usuário.
     - `GET /tarefas/usuario/:id`: Lista tarefas de um usuário específico.

## Estrutura do Projeto

```
projeto-senac-front/
├── index.html          # Página principal com formulário e listagem
├── js/
│   └── usuarios.js     # Lógica JavaScript para interações com a API
└── README.md           # Este arquivo
```

## Como Usar

1. **Cadastrar Usuário**:
   - Preencha o formulário com nome, e-mail, telefone, data de nascimento e senha.
   - Clique em "Salvar".

2. **Listar Usuários**:
   - A tabela é carregada automaticamente ao abrir a página.
   - Clique em "Atualizar Lista" para recarregar.

3. **Editar Usuário**:
   - Na tabela, clique em "Editar" ao lado do usuário desejado.
   - O formulário será preenchido com os dados atuais.
   - Faça as alterações e clique em "Atualizar Usuário".

4. **Excluir Usuário**:
   - Na tabela, clique em "Excluir" ao lado do usuário.
   - Confirme a exclusão na caixa de diálogo.

5. **Ver Tarefas de um Usuário**:
   - Na tabela, clique em "Ver Tarefas" ao lado do usuário.
   - Uma nova seção será exibida com a lista de tarefas.
   - Clique em "Voltar à Lista" para retornar.

## Detalhes Técnicos

- **API Integration**: O projeto usa a Fetch API para comunicação com o backend. Todas as operações (CRUD) são assíncronas.
- **Estado da Aplicação**: O estado é gerenciado através do DOM e variáveis globais no JavaScript.
- **Validação**: Campos obrigatórios são marcados com `required` no HTML.
- **Responsividade**: A interface é básica e pode precisar de ajustes CSS para dispositivos móveis.

## Possíveis Melhorias

- Adicionar estilos CSS externos para melhor aparência.
- Implementar validação mais robusta (ex.: verificar formato de e-mail).
- Adicionar paginação para listas grandes.
- Implementar autenticação se necessário.
- Melhorar tratamento de erros e feedback ao usuário.

## Contribuição

Este projeto é educacional. Para contribuir:

1. Faça um fork do repositório.
2. Crie uma branch para sua feature: `git checkout -b minha-feature`.
3. Commit suas mudanças: `git commit -m 'Adiciona minha feature'`.
4. Push para a branch: `git push origin minha-feature`.
5. Abra um Pull Request.

## Licença

Este projeto é para fins educacionais e não possui licença específica.