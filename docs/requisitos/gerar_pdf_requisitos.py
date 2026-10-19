#!/usr/bin/env python3
"""
Gera o PDF do Documento de Requisitos CoinConut a partir do Markdown.

Pipeline: pandoc (Markdown -> HTML) + xhtml2pdf (HTML -> PDF), tudo rodando
com o venv do projeto.

Uso (de qualquer pasta):

    docs/diagrams/arquitetura/.venv/bin/python docs/requisitos/gerar_pdf_requisitos.py

Saida: docs/requisitos/DOCUMENTO_DE_REQUISITOS.pdf

Dependencias (ja instaladas no venv):
    docs/diagrams/arquitetura/.venv/bin/pip install xhtml2pdf
O binario `pandoc` precisa estar no PATH (apt install pandoc).
"""

from __future__ import annotations

import re
import shutil
import subprocess
import sys
from pathlib import Path

BASE = Path(__file__).resolve().parent
MD = BASE / "DOCUMENTO_DE_REQUISITOS.md"
OUT = BASE / "DOCUMENTO_DE_REQUISITOS.pdf"

CSS = """
@page {
  size: A4;
  margin: 1.7cm 1.6cm 1.9cm 1.6cm;
}
body {
  font-family: Helvetica, Arial, sans-serif;
  font-size: 10pt;
  line-height: 1.35;
  color: #1e293b;
}
h1 {
  font-size: 19pt;
  color: #16A34A;
  text-align: center;
  margin-top: 4pt;
  margin-bottom: 4pt;
  padding-bottom: 6pt;
  border-bottom: 1.5pt solid #16A34A;
}
h2 {
  font-size: 13.5pt;
  color: #16A34A;
  margin-top: 14pt;
  margin-bottom: 6pt;
  padding-bottom: 3pt;
  border-bottom: 0.8pt solid #86efac;
}
h3 {
  font-size: 11.5pt;
  color: #15803d;
  margin-top: 10pt;
  margin-bottom: 4pt;
}
h4 {
  font-size: 10.5pt;
  color: #15803d;
  margin-top: 8pt;
  margin-bottom: 3pt;
}
p {
  margin-top: 3pt;
  margin-bottom: 3pt;
  text-align: justify;
}
table {
  width: 100%;
  font-size: 8.2pt;
  margin-top: 6pt;
  margin-bottom: 8pt;
}
th {
  background-color: #F0FDF4;
  color: #166534;
  border: 0.6pt solid #94a3b8;
  padding: 3pt 4pt;
  text-align: left;
}
td {
  border: 0.6pt solid #94a3b8;
  padding: 3pt 4pt;
  vertical-align: top;
}
ul, ol {
  margin-top: 3pt;
  margin-bottom: 4pt;
  padding-left: 16pt;
}
li {
  margin-bottom: 2pt;
  text-align: justify;
}
strong {
  color: #0f172a;
}
hr {
  border: none;
  border-top: 0.7pt solid #cbd5e1;
  margin: 10pt 0;
}
a {
  color: #2563EB;
}
code {
  font-family: Courier, monospace;
  font-size: 9pt;
  background-color: #f1f5f9;
}
"""


def md_para_html(md: Path) -> str:
    if not shutil.which("pandoc"):
        sys.exit("pandoc nao encontrado no PATH (apt install pandoc).")
    res = subprocess.run(
        ["pandoc", "-f", "gfm", "-t", "html", str(md)],
        capture_output=True,
        text=True,
        check=True,
    )
    html = res.stdout
    # Quebra de linha em URLs longas (somente o texto visivel, nao o href).
    def quebra_url(m: re.Match) -> str:
        texto = m.group(2).replace("/", "/\u200b").replace(".", ".\u200b")
        return m.group(1) + texto + m.group(3)

    html = re.sub(r"(<a [^>]*>)(.*?)(</a>)", quebra_url, html, flags=re.S)
    return html


def main() -> None:
    corpo = md_para_html(MD)
    documento = (
        "<!DOCTYPE html><html><head><meta charset='utf-8'>"
        f"<style>{CSS}</style></head><body>{corpo}</body></html>"
    )

    from xhtml2pdf import pisa

    with open(OUT, "wb") as destino:
        status = pisa.CreatePDF(documento, dest=destino, encoding="utf-8")
    if status.err:
        sys.exit("Falha ao gerar o PDF (erros do xhtml2pdf).")
    print(f"PDF gerado: {OUT}")


if __name__ == "__main__":
    main()
