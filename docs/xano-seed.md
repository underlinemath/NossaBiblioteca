# Carga de demonstração e integração Xano

O script `scripts/xano-seed.mjs` cria ou reutiliza uma massa identificada por
`XANO_TEST_PREFIX`. Ele não usa acesso direto às tabelas: todas as escritas e
leituras passam pelos grupos de API Xano. Inclui categorias, autores, livros,
`livros_autores`, exemplares, um leitor autenticado, reserva, empréstimo e item
de empréstimo. O bibliotecário é uma conta existente fornecida pelo operador;
senhas e tokens nunca são gravados no repositório nem no relatório.

## Configuração

Defina estas variáveis no ambiente do terminal que executará o comando ou no
arquivo local `.env.local` (ignorado pelo Git). As variáveis já definidas no
terminal têm precedência sobre o arquivo:

| Variável | Uso |
| --- | --- |
| `XANO_AUTH_BASE_URL` | URL-base completa do grupo Xano de autenticação |
| `XANO_ADMIN_BASE_URL` | URL-base completa do grupo de administração |
| `XANO_CATALOG_BASE_URL` | URL-base completa do grupo de catálogo |
| `XANO_CIRCULATION_BASE_URL` | URL-base completa do grupo de circulação |
| `XANO_LIBRARIAN_EMAIL` / `XANO_LIBRARIAN_PASSWORD` | Credenciais de uma conta bibliotecária no ambiente-alvo |
| `XANO_TEST_READER_EMAIL` / `XANO_TEST_READER_PASSWORD` | Conta de leitor dedicada à integração; é criada no primeiro uso e autenticada nas reexecuções |
| `XANO_TEST_PREFIX` | Identificador exclusivo do conjunto, de 3 a 24 caracteres alfanuméricos, `_` ou `-` |
| `XANO_REPORT_PATH` | Opcional: caminho relativo ao projeto para acrescentar um relatório JSON sem segredos |

As quatro URLs devem apontar para o mesmo workspace/ambiente Xano e para os
grupos correspondentes (`nossabiblioteca-auth`, `-administracao`, `-catalogo`
e `-circulacao`). Não use o endereço de produção para a massa de validação.
Se uma configuração obrigatória estiver ausente ou o prefixo for inválido, o
script falha antes de enviar qualquer requisição.

## Execução e política de dados

Com Node.js 18 ou superior, execute:

```sh
node scripts/xano-seed.mjs
```

O repositório contém o endereço do workspace de desenvolvimento para os grupos
Xano. O arquivo `.env.local` pode receber esses endereços e o prefixo; somente
as credenciais de bibliotecário e leitor precisam ser fornecidas localmente.

O script consulta as chaves naturais antes de criar: nome prefixado para
categorias/autores, ISBN prefixado para livros, código prefixado para
exemplares e conta configurada para o leitor. Verifica os IDs de categoria,
as associações autor-livro, o `livro_id` dos exemplares, a associação da
reserva e a transição do exemplar no empréstimo. Uma repetição usa os registros
encontrados e não tenta excluir dados.

**Limpeza:** não há limpeza automática. As APIs atuais não fornecem exclusão
segura e completa para todas as entidades relacionadas. Para remover a massa,
use um workspace descartável ou faça a limpeza manual no Xano, filtrando
exclusivamente pelo prefixo e respeitando a ordem inversa dos vínculos. Nunca
execute exclusão ampla como parte da validação.

O relatório registra horário, prefixo, contagens por tabela e método/rota/status
HTTP. Não inclui corpos, cabeçalhos, e-mails, senhas, tokens nem URLs-base.
