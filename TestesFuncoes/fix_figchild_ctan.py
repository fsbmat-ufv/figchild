#!/usr/bin/env python3
from pathlib import Path
import re
import zipfile
import sys

NEW_DATE = "2026/11/08"
NEW_VERSION = "3.1.3"
PACKAGE = "figchild"
FILES_TO_NORMALIZE = ["README.md", "figchild.sty", "figchild.tex", "capa.tex"]


def read_text_no_bom(path: Path) -> str:
    return path.read_text(encoding="utf-8-sig", newline="")


def write_lf_no_bom(path: Path, text: str) -> None:
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    path.write_text(text, encoding="utf-8", newline="\n")


def update_copyrights(text: str) -> str:
    text = re.sub(r"(?i)(%?\s*Copyright\s+)2021\s+by", r"\g<1>2021-2026 by", text)
    text = re.sub(r"(?i)(%?\s*Copyright\s+)2022\s+by", r"\g<1>2022-2026 by", text)
    text = re.sub(r"(?i)(Copyright\s+2021\s*[-–—]+\s*)202[0-5]", r"\g<1>2026", text)
    text = re.sub(r"(?i)(Copyright\s+2022\s*[-–—]+\s*)202[0-5]", r"\g<1>2026", text)
    return text


def update_sty(text: str) -> str:
    text = update_copyrights(text)
    pattern = re.compile(r"(\\ProvidesPackage\{figchild\}\[)([^\]]*)(\])")
    text, n = pattern.subn(
        rf"\g<1>{NEW_DATE} Package for creating activities for children version {NEW_VERSION}\g<3>",
        text,
        count=1,
    )
    if n != 1:
        print("AVISO: não encontrei exatamente uma linha \\ProvidesPackage{figchild}[...] em figchild.sty")
    return text


def update_tex(text: str) -> str:
    """Atualiza o que fala da versão ATUAL, e só isso.

    As versões antigas que aparecem no documento são de três tipos, e só um
    deles pode ser mexido:

      1. o histórico, em comentários como "%Version 3.1.1 (2025/06/04)" --
         é registro do passado e não muda;
      2. afirmações de fato, como "Since version 3.1.2 applies optional TikZ
         arguments only once" -- dizem QUANDO um comportamento começou, e
         viram mentira se forem renumeradas;
      3. a versão corrente, na folha de rosto e no título da seção de
         novidades -- esta sim muda.

    Por isso nada aqui é substituído de forma ampla. Cada troca é ancorada
    no lugar exato, e ao histórico se ACRESCENTA uma linha.
    """
    text = update_copyrights(text)

    # Folha de rosto: a linha que contém apenas "version X.Y.Z".
    text, n_versao = re.subn(
        r"(?mi)^(\s*)version\s+\d+\.\d+\.\d+\s*$",
        rf"\g<1>version {NEW_VERSION}",
        text,
    )

    # Folha de rosto: a linha que contém apenas uma data. Os comentários do
    # histórico têm texto antes da data, então não casam com isto.
    text, n_data = re.subn(
        r"(?m)^(\s*)20\d{2}/\d{2}/\d{2}\s*$",
        rf"\g<1>{NEW_DATE}",
        text,
    )

    # Título da seção de novidades.
    text, n_secao = re.subn(
        r"(?i)(\\section\*\{News:\s*Version\s+)\d+\.\d+\.\d+(\})",
        rf"\g<1>{NEW_VERSION}\g<2>",
        text,
    )

    # Histórico: acrescenta a linha desta versão depois da última já listada.
    historico = list(re.finditer(r"(?m)^%\s*Version\s+\d+\.\d+\.\d+\s*\([^)]*\)\s*$", text))
    ja_listada = any(NEW_VERSION in m.group(0) for m in historico)
    if historico and not ja_listada:
        fim = historico[-1].end()
        text = text[:fim] + f"\n%Version {NEW_VERSION} ({NEW_DATE})" + text[fim:]

    # Recomendação do CTAN: evitar \today na documentação.
    text = text.replace(r"\today", NEW_DATE)

    print(f"  figchild.tex: versão na folha de rosto {n_versao}x, data {n_data}x, "
          f"seção de novidades {n_secao}x, histórico "
          f"{'acrescentado' if historico and not ja_listada else 'inalterado'}")
    return text


def update_readme(text: str) -> str:
    text = update_copyrights(text)
    text, n = re.subn(
        r"(?mi)^(\*\*Current version:\*\*\s*v)\d+\.\d+\.\d+",
        rf"\g<1>{NEW_VERSION}",
        text,
    )
    print(f"  README.md: linha 'Current version' {n}x")
    return text


def normalize_generic(text: str) -> str:
    return update_copyrights(text)


# O ZIP do CTAN leva só o pacote, a documentação e o que ela precisa para
# compilar. Antes, o rglob levava a pasta .git inteira, os arquivos do
# RStudio e os scripts daqui.
PASTAS_FORA = {".git", ".Rproj.user", "TestesFuncoes"}
ARQUIVOS_FORA = {"figchild.zip", ".RData", ".Rhistory", ".gitignore", "figchild.Rproj"}
SUFIXOS_FORA = {
    ".aux", ".bbl", ".bcf", ".blg", ".fdb_latexmk", ".fls", ".idx", ".ilg",
    ".ind", ".lof", ".log", ".lot", ".nav", ".out", ".snm", ".synctex",
    ".gz", ".toc", ".vrb", ".xdv", ".tmp",
}


def deve_ficar_de_fora(relativo: Path) -> bool:
    if set(relativo.parts[:-1]) & PASTAS_FORA:
        return True
    if relativo.name in ARQUIVOS_FORA:
        return True
    if relativo.suffix.lower() in SUFIXOS_FORA:
        return True
    return False


def main() -> None:
    root = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path.cwd().resolve()
    if root.name != PACKAGE:
        print(f"AVISO: a pasta atual não se chama '{PACKAGE}'. O ZIP terá a pasta superior '{PACKAGE}/' mesmo assim.")

    found = []
    missing = []
    for name in FILES_TO_NORMALIZE:
        path = root / name
        if not path.exists():
            missing.append(name)
            continue
        text = read_text_no_bom(path)
        if name == "figchild.sty":
            text = update_sty(text)
        elif name == "figchild.tex":
            text = update_tex(text)
        elif name == "README.md":
            text = update_readme(text)
        else:
            text = normalize_generic(text)
        write_lf_no_bom(path, text)
        found.append(name)

    zip_path = root.parent / "figchild.zip"
    incluidos = []
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for path in sorted(root.rglob("*")):
            if not path.is_file():
                continue
            relativo = path.relative_to(root)
            if deve_ficar_de_fora(relativo):
                continue
            arcname = Path(PACKAGE) / relativo
            zf.write(path, arcname.as_posix())
            incluidos.append(arcname.as_posix())

    print("")
    print(f"Arquivos no ZIP ({len(incluidos)}):")
    for nome in incluidos:
        print("   ", nome)

    print("Arquivos corrigidos:", ", ".join(found) if found else "nenhum")
    if missing:
        print("Arquivos não encontrados:", ", ".join(missing))
    print("ZIP criado em:", zip_path)
    print("Verifique se o ZIP contém caminhos começando por figchild/ antes de enviar ao CTAN.")


if __name__ == "__main__":
    main()
