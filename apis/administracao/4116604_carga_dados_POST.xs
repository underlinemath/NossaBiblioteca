// Executa a carga inicial de dados reais e simulação de empréstimos
// Entrada opcional para indicar se deve reiniciar as tabelas
query carga_dados verb=POST {
  api_group = "administracao"

  input {
    bool reset_tabelas?
  }

  stack {
    // Trunca tabelas em ordem reversa se solicitado
    conditional {
      if ($input.reset_tabelas) {
        db.truncate itens_emprestimos {
          reset = true
        }
      
        db.truncate reservas {
          reset = true
        }
      
        db.truncate emprestimos {
          reset = true
        }
      
        db.truncate exemplares {
          reset = true
        }
      
        db.truncate livros_autores {
          reset = true
        }
      
        db.truncate livros {
          reset = true
        }
      
        db.truncate autores {
          reset = true
        }
      
        db.truncate leitores {
          reset = true
        }
      
        db.truncate categorias {
          reset = true
        }
      }
    }
  
    // Lista de categorias temáticas
    var $categorias_dados {
      value = [
        {nome: "Literatura Brasileira"}
        {nome: "Ficção Científica"}
        {nome: "Fantasia"}
        {nome: "Distopia"}
        {nome: "Romance"}
        {nome: "História"}
        {nome: "Tecnologia"}
        {nome: "Filosofia"}
      ]
    }
  
    // Insere as categorias
    foreach ($categorias_dados) {
      each as $cat {
        db.get categorias {
          field_name = "nome"
          field_value = $cat.nome
        } as $cat_existente
      
        conditional {
          if ($cat_existente == null) {
            db.add categorias {
              data = {nome: $cat.nome}
            } as $nova_cat
          }
        }
      }
    }
  
    // Lista de autores reais
    var $autores_dados {
      value = [
        {nome_autor: "Neil Gaiman"}
        {nome_autor: "Terry Pratchett"}
        {nome_autor: "Erich Gamma"}
        {nome_autor: "Richard Helm"}
        {nome_autor: "Ralph Johnson"}
        {nome_autor: "John Vlissides"}
        {nome_autor: "Machado de Assis"}
        {nome_autor: "Clarice Lispector"}
        {nome_autor: "George Orwell"}
        {nome_autor: "Gabriel García Márquez"}
        {nome_autor: "J.R.R. Tolkien"}
        {nome_autor: "Isaac Asimov"}
        {nome_autor: "Aldous Huxley"}
        {nome_autor: "Yuval Noah Harari"}
        {nome_autor: "Conceição Evaristo"}
        {nome_autor: "Robert C. Martin"}
      ]
    }
  
    // Insere os autores
    foreach ($autores_dados) {
      each as $autor {
        db.get autores {
          field_name = "nome_autor"
          field_value = $autor.nome_autor
        } as $autor_existente
      
        conditional {
          if ($autor_existente == null) {
            db.add autores {
              data = {nome_autor: $autor.nome_autor}
            } as $novo_autor
          }
        }
      }
    }
  
    // Lista de livros reais com 1 ou mais autores
    var $livros_dados {
      value = [
        {
          titulo        : "Belas Maldições"
          categoria_nome: "Fantasia"
          autor_texto   : "Neil Gaiman, Terry Pratchett"
          autores       : ["Neil Gaiman", "Terry Pratchett"]
          isbn          : "9788551001592"
          descricao     : "O fim do mundo está próximo, mas um anjo e um demônio tentam evitar o Apocalipse porque se afeiçoaram à vida na Terra."
        }
        {
          titulo        : "Padrões de Projetos: Soluções Reutilizáveis de Software Orientado a Objetos"
          categoria_nome: "Tecnologia"
          autor_texto   : "Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides"
          autores       : ["Erich Gamma", "Richard Helm", "Ralph Johnson", "John Vlissides"]
          isbn          : "9788573076103"
          descricao     : "Clássico da computação sobre os 23 padrões de projeto essenciais para a engenharia de software orientado a objetos."
        }
        {
          titulo        : "Dom Casmurro"
          categoria_nome: "Literatura Brasileira"
          autor_texto   : "Machado de Assis"
          autores       : ["Machado de Assis"]
          isbn          : "9788535914849"
          descricao     : "Narrado por Bento Santiago, examina memórias do amor de infância com Capitu e suas agonizantes suspeitas de traição."
        }
        {
          titulo        : "A Hora da Estrela"
          categoria_nome: "Literatura Brasileira"
          autor_texto   : "Clarice Lispector"
          autores       : ["Clarice Lispector"]
          isbn          : "9788532508126"
          descricao     : "A história comovente da migrante alagoana Macabéa vivendo no Rio de Janeiro, narrada pelo escritor fictício Rodrigo S.M."
        }
        {
          titulo        : "1984"
          categoria_nome: "Distopia"
          autor_texto   : "George Orwell"
          autores       : ["George Orwell"]
          isbn          : "9788535914840"
          descricao     : "Distopia clássica sobre vigilância onipresente do Grande Irmão, manipulação histórica e controle totalitário da mente."
        }
        {
          titulo        : "A Revolução dos Bichos"
          categoria_nome: "Distopia"
          autor_texto   : "George Orwell"
          autores       : ["George Orwell"]
          isbn          : "9788535909555"
          descricao     : "Fábula satírica sobre uma revolução animal em uma fazenda que gradualmente degenera em uma tirania implacável."
        }
        {
          titulo        : "Cem Anos de Solidão"
          categoria_nome: "Romance"
          autor_texto   : "Gabriel García Márquez"
          autores       : ["Gabriel García Márquez"]
          isbn          : "9788501012074"
          descricao     : "A epopeia mágica da família Buendía e da fundação à destruição do vilarejo de Macondo no realismo mágico latino-americano."
        }
        {
          titulo        : "O Senhor dos Anéis: A Sociedade do Anel"
          categoria_nome: "Fantasia"
          autor_texto   : "J.R.R. Tolkien"
          autores       : ["J.R.R. Tolkien"]
          isbn          : "9788595084759"
          descricao     : "Frodo Bolseiro inicia sua jornada com a Sociedade do Anel para destruir o Um Anel nas chamas da Montanha da Perdição."
        }
        {
          titulo        : "Fundação"
          categoria_nome: "Ficção Científica"
          autor_texto   : "Isaac Asimov"
          autores       : ["Isaac Asimov"]
          isbn          : "9788576570660"
          descricao     : "Hari Seldon desenvolve a psico-história para guiar a humanidade durante a inevitável queda do Império Galáctico."
        }
        {
          titulo        : "Admirável Mundo Novo"
          categoria_nome: "Distopia"
          autor_texto   : "Aldous Huxley"
          autores       : ["Aldous Huxley"]
          isbn          : "9788525056009"
          descricao     : "Sociedade futurista onde a estabilidade social é garantida por manipulação genética, condicionamento psicológico e a droga soma."
        }
        {
          titulo        : "Sapiens: Uma Breve História da Humanidade"
          categoria_nome: "História"
          autor_texto   : "Yuval Noah Harari"
          autores       : ["Yuval Noah Harari"]
          isbn          : "9788525432186"
          descricao     : "Revoluções cognitiva, agrícola e científica que permitiram a um primata insignificante tornar-se a força dominante da Terra."
        }
        {
          titulo        : "Ponciá Vicêncio"
          categoria_nome: "Literatura Brasileira"
          autor_texto   : "Conceição Evaristo"
          autores       : ["Conceição Evaristo"]
          isbn          : "9788534705592"
          descricao     : "Trajetória de Ponciá Vicêncio em busca de sua identidade, memória ancestral e superação da exclusão social."
        }
        {
          titulo        : "Código Limpo: Habilidades Práticas do Agile Software"
          categoria_nome: "Tecnologia"
          autor_texto   : "Robert C. Martin"
          autores       : ["Robert C. Martin"]
          isbn          : "9788576082675"
          descricao     : "Princípios, padrões e práticas essenciais para a escrita de software profissional, limpo, compreensível e manutenível."
        }
      ]
    }
  
    // Insere livros e associações com autores
    foreach ($livros_dados) {
      each as $livro_item {
        db.get categorias {
          field_name = "nome"
          field_value = $livro_item.categoria_nome
        } as $cat_reg
      
        db.get livros {
          field_name = "isbn"
          field_value = $livro_item.isbn
        } as $livro_reg
      
        var $livro_id {
          value = 0
        }
      
        conditional {
          if ($livro_reg == null) {
            db.add livros {
              data = {
                categoria_id: $cat_reg.id
                titulo      : $livro_item.titulo
                autor       : $livro_item.autor_texto
                isbn        : $livro_item.isbn
                descricao   : $livro_item.descricao
                ativo       : true
              }
            } as $novo_livro
          
            var.update $livro_id {
              value = $novo_livro.id
            }
          }
        
          else {
            var.update $livro_id {
              value = $livro_reg.id
            }
          }
        }
      
        // Associa cada autor ao livro na tabela livros_autores
        foreach ($livro_item.autores) {
          each as $autor_nome_assoc {
            db.get autores {
              field_name = "nome_autor"
              field_value = $autor_nome_assoc
            } as $autor_reg
          
            conditional {
              if ($autor_reg != null) {
                db.query livros_autores {
                  where = $db.livros_autores.livro_id == $livro_id && $db.livros_autores.autor_id == $autor_reg.id
                  return = {type: "exists"}
                } as $assoc_existe
              
                conditional {
                  if (!$assoc_existe) {
                    db.add livros_autores {
                      data = {livro_id: $livro_id, autor_id: $autor_reg.id}
                    } as $nova_assoc
                  }
                }
              }
            }
          }
        }
      }
    }
  
    // Lista de exemplares físicos para os livros
    var $exemplares_dados {
      value = [
        {isbn: "9788551001592", codigo: "EX-BELAS-01", situacao: "disponivel", disponivel: true}
        {isbn: "9788551001592", codigo: "EX-BELAS-02", situacao: "emprestado", disponivel: false}
        {isbn: "9788573076103", codigo: "EX-DPAT-01", situacao: "emprestado", disponivel: false}
        {isbn: "9788573076103", codigo: "EX-DPAT-02", situacao: "disponivel", disponivel: true}
        {isbn: "9788535914849", codigo: "EX-DOMCAS-01", situacao: "disponivel", disponivel: true}
        {isbn: "9788535914849", codigo: "EX-DOMCAS-02", situacao: "disponivel", disponivel: true}
        {isbn: "9788532508126", codigo: "EX-HEST-01", situacao: "disponivel", disponivel: true}
        {isbn: "9788532508126", codigo: "EX-HEST-02", situacao: "disponivel", disponivel: true}
        {isbn: "9788535914840", codigo: "EX-1984-01", situacao: "disponivel", disponivel: true}
        {isbn: "9788535914840", codigo: "EX-1984-02", situacao: "emprestado", disponivel: false}
        {isbn: "9788535909555", codigo: "EX-REV-01", situacao: "disponivel", disponivel: true}
        {isbn: "9788535909555", codigo: "EX-REV-02", situacao: "disponivel", disponivel: true}
        {isbn: "9788501012074", codigo: "EX-CEM-01", situacao: "disponivel", disponivel: true}
        {isbn: "9788501012074", codigo: "EX-CEM-02", situacao: "disponivel", disponivel: true}
        {isbn: "9788595084759", codigo: "EX-SDA-01", situacao: "disponivel", disponivel: true}
        {isbn: "9788595084759", codigo: "EX-SDA-02", situacao: "disponivel", disponivel: true}
        {isbn: "9788576570660", codigo: "EX-FUND-01", situacao: "emprestado", disponivel: false}
        {isbn: "9788576570660", codigo: "EX-FUND-02", situacao: "disponivel", disponivel: true}
        {isbn: "9788525056009", codigo: "EX-ADM-01", situacao: "emprestado", disponivel: false}
        {isbn: "9788525056009", codigo: "EX-ADM-02", situacao: "disponivel", disponivel: true}
        {isbn: "9788525432186", codigo: "EX-SAP-01", situacao: "emprestado", disponivel: false}
        {isbn: "9788525432186", codigo: "EX-SAP-02", situacao: "disponivel", disponivel: true}
        {isbn: "9788534705592", codigo: "EX-PON-01", situacao: "emprestado", disponivel: false}
        {isbn: "9788534705592", codigo: "EX-PON-02", situacao: "disponivel", disponivel: true}
        {isbn: "9788576082675", codigo: "EX-CLEAN-01", situacao: "emprestado", disponivel: false}
        {isbn: "9788576082675", codigo: "EX-CLEAN-02", situacao: "disponivel", disponivel: true}
      ]
    }
  
    // Insere os exemplares
    foreach ($exemplares_dados) {
      each as $ex_item {
        db.get exemplares {
          field_name = "codigo"
          field_value = $ex_item.codigo
        } as $ex_reg
      
        conditional {
          if ($ex_reg == null) {
            db.get livros {
              field_name = "isbn"
              field_value = $ex_item.isbn
            } as $livro_para_ex
          
            conditional {
              if ($livro_para_ex != null) {
                db.add exemplares {
                  data = {
                    livro_id  : $livro_para_ex.id
                    codigo    : $ex_item.codigo
                    situacao  : $ex_item.situacao
                    disponivel: $ex_item.disponivel
                  }
                } as $novo_ex
              }
            }
          }
        }
      }
    }
  
    // Lista de muitos leitores
    var $leitores_dados {
      value = [
        {
          nome    : "Ana Paula Silva"
          email   : "ana.silva@email.com"
          senha   : "senha_segura_123"
          telefone: "(11) 98765-4321"
          status  : "ativo"
        }
        {
          nome    : "Bruno Santos"
          email   : "bruno.santos@email.com"
          senha   : "senha_segura_123"
          telefone: "(21) 98765-1122"
          status  : "ativo"
        }
        {
          nome    : "Camila Rodrigues"
          email   : "camila.rodrigues@email.com"
          senha   : "senha_segura_123"
          telefone: "(31) 98765-3344"
          status  : "ativo"
        }
        {
          nome    : "Diego Fernandes"
          email   : "diego.fernandes@email.com"
          senha   : "senha_segura_123"
          telefone: "(41) 98765-5566"
          status  : "ativo"
        }
        {
          nome    : "Eduardo Lima"
          email   : "eduardo.lima@email.com"
          senha   : "senha_segura_123"
          telefone: "(51) 98765-7788"
          status  : "ativo"
        }
        {
          nome    : "Fernanda Souza"
          email   : "fernanda.souza@email.com"
          senha   : "senha_segura_123"
          telefone: "(61) 98765-9900"
          status  : "ativo"
        }
        {
          nome    : "Gabriel Costa"
          email   : "gabriel.costa@email.com"
          senha   : "senha_segura_123"
          telefone: "(71) 98765-2233"
          status  : "ativo"
        }
        {
          nome    : "Helena Martins"
          email   : "helena.martins@email.com"
          senha   : "senha_segura_123"
          telefone: "(81) 98765-4455"
          status  : "ativo"
        }
        {
          nome    : "Igor Ribeiro"
          email   : "igor.ribeiro@email.com"
          senha   : "senha_segura_123"
          telefone: "(85) 98765-6677"
          status  : "ativo"
        }
        {
          nome    : "Juliana Almeida"
          email   : "juliana.almeida@email.com"
          senha   : "senha_segura_123"
          telefone: "(91) 98765-8899"
          status  : "ativo"
        }
        {
          nome    : "Lucas Pereira"
          email   : "lucas.pereira@email.com"
          senha   : "senha_segura_123"
          telefone: "(27) 98765-0011"
          status  : "ativo"
        }
        {
          nome    : "Mariana Carvalho"
          email   : "mariana.carvalho@email.com"
          senha   : "senha_segura_123"
          telefone: "(48) 98765-2244"
          status  : "ativo"
        }
      ]
    }
  
    // Insere os leitores
    foreach ($leitores_dados) {
      each as $leitor_item {
        db.get leitores {
          field_name = "email"
          field_value = $leitor_item.email
        } as $leitor_reg
      
        conditional {
          if ($leitor_reg == null) {
            db.add leitores {
              data = {
                nome    : $leitor_item.nome
                email   : $leitor_item.email
                senha   : $leitor_item.senha
                telefone: $leitor_item.telefone
                status  : $leitor_item.status
              }
            } as $novo_leitor
          }
        }
      }
    }
  
    // Simulação de muitos empréstimos (históricos concluídos e ativos)
    var $emprestimos_simulados {
      value = [
        {
          leitor_email       : "ana.silva@email.com"
          exemplar_codigo    : "EX-DOMCAS-01"
          situacao_emprestimo: "finalizado"
          situacao_item      : "devolvido"
          data_prevista      : "2025-02-15"
          data_efetiva       : "2025-02-14"
          situacao_exemplar  : "disponivel"
          disponivel_exemplar: true
        }
        {
          leitor_email       : "bruno.santos@email.com"
          exemplar_codigo    : "EX-1984-01"
          situacao_emprestimo: "finalizado"
          situacao_item      : "devolvido"
          data_prevista      : "2025-02-20"
          data_efetiva       : "2025-02-19"
          situacao_exemplar  : "disponivel"
          disponivel_exemplar: true
        }
        {
          leitor_email       : "camila.rodrigues@email.com"
          exemplar_codigo    : "EX-CEM-01"
          situacao_emprestimo: "finalizado"
          situacao_item      : "devolvido"
          data_prevista      : "2025-02-25"
          data_efetiva       : "2025-02-23"
          situacao_exemplar  : "disponivel"
          disponivel_exemplar: true
        }
        {
          leitor_email       : "diego.fernandes@email.com"
          exemplar_codigo    : "EX-SDA-01"
          situacao_emprestimo: "finalizado"
          situacao_item      : "devolvido"
          data_prevista      : "2025-03-01"
          data_efetiva       : "2025-02-28"
          situacao_exemplar  : "disponivel"
          disponivel_exemplar: true
        }
        {
          leitor_email       : "eduardo.lima@email.com"
          exemplar_codigo    : "EX-HEST-01"
          situacao_emprestimo: "finalizado"
          situacao_item      : "devolvido"
          data_prevista      : "2025-03-05"
          data_efetiva       : "2025-03-04"
          situacao_exemplar  : "disponivel"
          disponivel_exemplar: true
        }
        {
          leitor_email       : "fernanda.souza@email.com"
          exemplar_codigo    : "EX-BELAS-02"
          situacao_emprestimo: "ativo"
          situacao_item      : "ativo"
          data_prevista      : "2025-04-10"
          data_efetiva       : "2025-04-10"
          situacao_exemplar  : "emprestado"
          disponivel_exemplar: false
        }
        {
          leitor_email       : "gabriel.costa@email.com"
          exemplar_codigo    : "EX-DPAT-01"
          situacao_emprestimo: "ativo"
          situacao_item      : "ativo"
          data_prevista      : "2025-04-12"
          data_efetiva       : "2025-04-12"
          situacao_exemplar  : "emprestado"
          disponivel_exemplar: false
        }
        {
          leitor_email       : "helena.martins@email.com"
          exemplar_codigo    : "EX-1984-02"
          situacao_emprestimo: "ativo"
          situacao_item      : "ativo"
          data_prevista      : "2025-04-15"
          data_efetiva       : "2025-04-15"
          situacao_exemplar  : "emprestado"
          disponivel_exemplar: false
        }
        {
          leitor_email       : "igor.ribeiro@email.com"
          exemplar_codigo    : "EX-FUND-01"
          situacao_emprestimo: "ativo"
          situacao_item      : "ativo"
          data_prevista      : "2025-04-18"
          data_efetiva       : "2025-04-18"
          situacao_exemplar  : "emprestado"
          disponivel_exemplar: false
        }
        {
          leitor_email       : "juliana.almeida@email.com"
          exemplar_codigo    : "EX-ADM-01"
          situacao_emprestimo: "ativo"
          situacao_item      : "ativo"
          data_prevista      : "2025-04-20"
          data_efetiva       : "2025-04-20"
          situacao_exemplar  : "emprestado"
          disponivel_exemplar: false
        }
        {
          leitor_email       : "lucas.pereira@email.com"
          exemplar_codigo    : "EX-SAP-01"
          situacao_emprestimo: "ativo"
          situacao_item      : "ativo"
          data_prevista      : "2025-04-22"
          data_efetiva       : "2025-04-22"
          situacao_exemplar  : "emprestado"
          disponivel_exemplar: false
        }
        {
          leitor_email       : "mariana.carvalho@email.com"
          exemplar_codigo    : "EX-CLEAN-01"
          situacao_emprestimo: "ativo"
          situacao_item      : "ativo"
          data_prevista      : "2025-04-25"
          data_efetiva       : "2025-04-25"
          situacao_exemplar  : "emprestado"
          disponivel_exemplar: false
        }
        {
          leitor_email       : "ana.silva@email.com"
          exemplar_codigo    : "EX-PON-01"
          situacao_emprestimo: "ativo"
          situacao_item      : "ativo"
          data_prevista      : "2025-04-28"
          data_efetiva       : "2025-04-28"
          situacao_exemplar  : "emprestado"
          disponivel_exemplar: false
        }
      ]
    }
  
    // Insere empréstimos simulados e atualiza exemplares
    foreach ($emprestimos_simulados) {
      each as $emp_sim {
        db.get leitores {
          field_name = "email"
          field_value = $emp_sim.leitor_email
        } as $leitor_emp
      
        db.get exemplares {
          field_name = "codigo"
          field_value = $emp_sim.exemplar_codigo
        } as $exemplar_emp
      
        conditional {
          if ($leitor_emp != null && $exemplar_emp != null) {
            db.query itens_emprestimos {
              where = $db.itens_emprestimos.exemplar_id == $exemplar_emp.id && $db.itens_emprestimos.situacao == $emp_sim.situacao_item
              return = {type: "exists"}
            } as $item_existente
          
            conditional {
              if (!$item_existente) {
                db.add emprestimos {
                  data = {
                    leitor_id      : $leitor_emp.id
                    data_emprestimo: now
                    situacao       : $emp_sim.situacao_emprestimo
                  }
                } as $novo_emp
              
                db.add itens_emprestimos {
                  data = {
                    emprestimo_id          : $novo_emp.id
                    exemplar_id            : $exemplar_emp.id
                    data_prevista_devolucao: $emp_sim.data_prevista
                    data_efetiva_devolucao : $emp_sim.data_efetiva
                    situacao               : $emp_sim.situacao_item
                  }
                } as $novo_item
              
                db.edit exemplares {
                  field_name = "id"
                  field_value = $exemplar_emp.id
                  data = {
                    disponivel: $emp_sim.disponivel_exemplar
                    situacao  : $emp_sim.situacao_exemplar
                    updated_at: now
                  }
                } as $ex_atualizado
              }
            }
          }
        }
      }
    }
  
    // Diagnóstico e contagem remota de todas as tabelas
    db.query categorias {
      return = {type: "count"}
    } as $cnt_categorias
  
    db.query autores {
      return = {type: "count"}
    } as $cnt_autores
  
    db.query livros {
      return = {type: "count"}
    } as $cnt_livros
  
    db.query livros_autores {
      return = {type: "count"}
    } as $cnt_livros_autores
  
    db.query exemplares {
      return = {type: "count"}
    } as $cnt_exemplares
  
    db.query leitores {
      return = {type: "count"}
    } as $cnt_leitores
  
    db.query emprestimos {
      return = {type: "count"}
    } as $cnt_emprestimos
  
    db.query itens_emprestimos {
      return = {type: "count"}
    } as $cnt_itens_emprestimos
  
    db.query exemplares {
      where = $db.exemplares.disponivel == true
      return = {type: "count"}
    } as $cnt_exemplares_disponiveis
  
    db.query exemplares {
      where = $db.exemplares.disponivel == false
      return = {type: "count"}
    } as $cnt_exemplares_emprestados
  }

  response = {
    sucesso          : true
    mensagem         : "Carga de dados executada com sucesso!"
    resumo_tabelas   : ```
      {
        categorias       : $cnt_categorias
        autores          : $cnt_autores
        livros           : $cnt_livros
        livros_autores   : $cnt_livros_autores
        exemplares       : $cnt_exemplares
        leitores         : $cnt_leitores
        emprestimos      : $cnt_emprestimos
        itens_emprestimos: $cnt_itens_emprestimos
      }
      ```
    status_exemplares: ```
      {
        disponiveis: $cnt_exemplares_disponiveis
        emprestados: $cnt_exemplares_emprestados
      }
      ```
  }
}