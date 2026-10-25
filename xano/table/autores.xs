table "autores" {
    auth = true
    schema {
        int id
        text nome_autor
        text livro_id
    }

    index = [
         { type: "primary", field: [{name: "id"}] }
    ]
    guid = "NpuOEyhwON0Nrw1zA-aTnAPcswA"
}