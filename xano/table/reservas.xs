table "reservas" {
  schema {
    int id
    int leitor_id
    int livro_id?
    int exemplar_id?
    date data_reserva = today
    text modalidade
    text situacao
    timestamp created_at?=now
    timestamp updated_at?=now
  }

  index = [
    { type: "primary", field: [{ name: "id" }] },
    { type: "btree", field: [{ name: "leitor_id" }] },
    { type: "btree", field: [{ name: "livro_id" }] },
    { type: "btree", field: [{ name: "exemplar_id" }] }
  ]
}
