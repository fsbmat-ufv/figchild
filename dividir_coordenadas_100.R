# Carregar o pacote stringr
library(stringr)

arquivo_entrada <- "figchildGrande.sty"
arquivo_saida <- "figchild_dividido.sty"

# Leitura do arquivo
linhas <- readLines(arquivo_entrada)

# Função de substituição usando stringr
linhas_divididas <- lapply(linhas, function(texto) {
  str_replace_all(texto, "(-?\\d*\\.?\\d+)", function(x) {
    as.character(as.numeric(x) / 100)
  })
})

# Salvar resultado
writeLines(unlist(linhas_divididas, use.names=FALSE), arquivo_saida)

cat("Arquivo processado e salvo em:", arquivo_saida, "\n")
