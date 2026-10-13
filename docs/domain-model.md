# Modelo de domínio: NossaBiblioteca

## Objetivo

Descrever as entidades e os relacionamentos necessários para controlar o acervo, os leitores, as reservas, os empréstimos e as devoluções.

## Entidades

### Leitor

Representa a pessoa que consulta livros, realiza reservas e participa de empréstimos.

- `id`
- `nome`
- `email`
- `telefone`
- `status`

### Bibliotecário

Representa o usuário responsável pelas operações administrativas da biblioteca.

- `id`
- `nome`
- `credenciais`
- `permissões`

### Livro

Representa o título catalogado, independentemente da quantidade de exemplares físicos.

- `id`
- `título`
- `autor`
- `isbn`
- `descrição`
- `categoria_id`

### Categoria

Classifica os livros do acervo.

- `id`
- `nome`

### Exemplar

Representa uma unidade física de um livro que pode ser reservada ou emprestada.

- `id`
- `livro_id`
- `código`
- `situação`

### Reserva

Registra a intenção de um leitor de utilizar um livro ou exemplar disponível.

- `id`
- `leitor_id`
- `livro_id` ou `exemplar_id`
- `data_reserva`
- `modalidade`
- `situação`

### Empréstimo

Representa a operação de empréstimo realizada por um leitor.

- `id`
- `leitor_id`
- `data_emprestimo`

### Item do empréstimo

Relaciona cada exemplar físico ao empréstimo e controla a devolução individual. Um empréstimo deve conter pelo menos um item.

- `id`
- `emprestimo_id`
- `exemplar_id`
- `data_prevista_devolução`
- `data_efetiva_devolução`
- `situação`

## Relacionamentos

- Uma `Categoria` pode possuir muitos `Livros`; cada `Livro` pertence a uma `Categoria`.
- Um `Livro` pode possuir muitos `Exemplares`; cada `Exemplar` pertence a um `Livro`.
- Um `Leitor` pode possuir muitas `Reservas`; cada `Reserva` pertence a um `Leitor`.
- Um `Leitor` pode possuir muitos `Empréstimos`; cada `Empréstimo` pertence a um `Leitor`.
- Um `Empréstimo` deve possuir um ou mais `Itens do empréstimo`.
- Cada `Item do empréstimo` referencia um único `Exemplar`.
- Um `Exemplar` pode aparecer em vários itens ao longo do tempo, mas não pode estar em dois empréstimos ativos simultaneamente.

## Regras de integridade

- Cada leitor possui um identificador único.
- Cada exemplar possui uma situação de disponibilidade atualizada pelo sistema.
- Um exemplar indisponível não pode ser emprestado simultaneamente a outro leitor.
- A data efetiva de devolução permanece vazia enquanto o item não for devolvido.
- Cada item pode ser devolvido independentemente dos demais itens do mesmo empréstimo.
- O empréstimo é considerado concluído quando todos os seus itens tiverem sido devolvidos.
- Somente bibliotecários podem cadastrar livros, leitores e exemplares e registrar devoluções.
- As decisões sobre reservas de livros indisponíveis, prazo de empréstimo, renovação, exclusão ou inativação de livros e múltiplos bibliotecários ainda estão pendentes.