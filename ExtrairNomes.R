library(stringr)

# Leitura do arquivo
arquivo_sty <- "Nomes.sty"
conteudo <- readLines(arquivo_sty)

# Regex final ajustado: pegar só o que está nas primeiras { } depois do \newcommand
padrao <- "^\\\\newcommand\\{(\\\\[^}]+)\\}"

# Usar str_match para capturar o grupo
resultado <- str_match(conteudo, padrao)

# O grupo capturado fica na segunda coluna do resultado
nomes_figuras <- na.omit(resultado[, 2])

# Para remover o atributo de "na.action"
nomes_figuras <- as.character(nomes_figuras)

# Mostrar resultado final sem metadata
print(nomes_figuras)
cat(nomes_figuras, sep="\n")

