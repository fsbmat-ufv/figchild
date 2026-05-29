#!/usr/bin/env python3
from pathlib import Path
import re
import zipfile
import sys

NEW_DATE = "2026/05/29"
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
    text = update_copyrights(text)
    # Atualiza datas antigas no formato do LaTeX package date quando aparecerem na documentação.
    text = re.sub(r"20\d{2}/\d{2}/\d{2}", NEW_DATE, text)
    # Atualiza menções do tipo version 3.1.2, Version 3.1.2, v3.1.2 etc.
    text = re.sub(r"(?i)(\bversion\s+)[0-9]+\.[0-9]+\.[0-9]+", rf"\g<1>{NEW_VERSION}", text)
    text = re.sub(r"(?i)(\bv)[0-9]+\.[0-9]+\.[0-9]+", rf"\g<1>{NEW_VERSION}", text)
    # Recomendação do CTAN: evitar \today na documentação.
    text = text.replace(r"\today", NEW_DATE)
    return text


def normalize_generic(text: str) -> str:
    return update_copyrights(text)


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
        else:
            text = normalize_generic(text)
        write_lf_no_bom(path, text)
        found.append(name)

    zip_path = root.parent / "figchild.zip"
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for path in sorted(root.rglob("*")):
            if path.is_file() and path.name != "figchild.zip":
                arcname = Path(PACKAGE) / path.relative_to(root)
                zf.write(path, arcname.as_posix())

    print("Arquivos corrigidos:", ", ".join(found) if found else "nenhum")
    if missing:
        print("Arquivos não encontrados:", ", ".join(missing))
    print("ZIP criado em:", zip_path)
    print("Verifique se o ZIP contém caminhos começando por figchild/ antes de enviar ao CTAN.")


if __name__ == "__main__":
    main()
