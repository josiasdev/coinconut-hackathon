#!/usr/bin/env python3
"""
Gera o PDF "CoinConut — A casa do COCO": o diagrama de arquitetura cortado em
partes, cada parte explicada com linguagem de criança de 5 anos + nota técnica.

Como usar (a partir desta pasta):

    python3 -m venv .venv
    .venv/bin/pip install reportlab pillow
    .venv/bin/python gerar_pdf_explicativo.py

Saída:
    CoinConut_Arquitetura_Explicada.pdf
    partes/part_*.png  (os recortes do diagrama)
"""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.lib.utils import ImageReader
from reportlab.platypus import (
    Image as RLImage,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
)

BASE = Path(__file__).resolve().parent
SRC_PNG = BASE / "diagrama_arquitetura_resumido.png"
OUT_PDF = BASE / "CoinConut_Arquitetura_Explicada.pdf"
PARTES_DIR = BASE / "partes"

# Nomes e papéis das 6 caixas, na ordem em que aparecem no diagrama
# (esquerda → direita; na coluna do meio, de cima para baixo).
PARTES = [
    ("fisica", "Parte 1 — A parte de verdade (mundo real)"),
    ("portais", "Parte 2 — As três portas do site"),
    ("backend", "Parte 3 — O escritório invisível"),
    ("blockchain", "Parte 4 — O caderno que ninguém apaga"),
    ("efi", "Parte 5 — O banco que manda o Pix"),
    ("destino", "Parte 6 — A casca vira adubo e combustível"),
]

EXPLICACOES = {
    "fisica": {
        "crianca": (
            "Cê já viu aquela casquinha de coco que sobra depois que a gente bebe a água? "
            "Ela costuma virar lixo na praia. A CoinConut transforma essa casquinha num tesouro! "
            "Para o tesouro valer, a gente precisa saber de onde ele veio. Então cada balaio tem "
            "uma etiquetinha mágica (chamada NFC) que conta quem pegou, onde e quando. E a balança "
            "é tão esperta que ela manda o peso direto pro celular — ninguém consegue mentir o peso!"
        ),
        "tecnico": (
            "Origem validada por tags NFC, balança BLE, smart bins e totem RVM; o app assina "
            "origem + peso + GPS antes de qualquer registro on-chain (anti-fraude, sem digitação manual)."
        ),
    },
    "portais": {
        "crianca": (
            "É o site da CoinConut, feito de três portas. A primeira é pra quem coleta: registra o "
            "balaio cheio. A segunda é pra quem quer sacar o dinheirinho no Pix. A terceira é pra "
            "fábrica que compra a casca pra fazer as coisas. É tudo bem simples: apertar botão e pronto!"
        ),
        "tecnico": (
            "SPA React 19 na Vercel com três portais: Coleta, Saque e Indústria (Account Abstraction / "
            "acesso sem atrito Web3)."
        ),
    },
    "backend": {
        "crianca": (
            "Lá na nuvem tem um escritório que ninguém vê. Ele anota tudo num caderninho especial, "
            "conversa com o banco quando é hora de mandar o Pix e ainda guarda um lápis mágico que "
            "só ele pode usar pra confirmar pagamentos na blockchain. E ele é bem organizadinho: "
            "nunca anota a mesma coisa duas vezes, e se alguma coisa falhar, ele tenta de novo sozinho!"
        ),
        "tecnico": (
            "API REST no Railway + client Efí (OAuth2 + mTLS) + Signer ORACLE_ROLE + worker de "
            "retries/outbox + Postgres com idempotência por paymentId/txid."
        ),
    },
    "blockchain": {
        "crianca": (
            "É um caderno gigante, compartilhado por muitos computadores no mundo todo. Ninguém "
            "consegue apagar página nem rabiscar por cima. Cada lote de casca vira uma página nova: "
            "quanto pesou, quem entregou, se o Pix já foi pago. Se alguém tentar mentir, todo mundo "
            "vê na hora. É por isso que a gente confia nele!"
        ),
        "tecnico": (
            "Sepolia (teste) ↔ Ethereum mainnet (produção). PaymentLedger transita de PENDING para "
            "PAID com pixProof = endToEndId; Registry, CocoAsset, Market e SustainabilityNFT completam a suite."
        ),
    },
    "efi": {
        "crianca": (
            "O escritório não tem dinheiro dentro — ele fala com um banco de verdade, chamado Efí. "
            "Quando é hora de pagar, o banco manda o Pix pra chavinha da pessoa. Em modo de teste "
            "(sandbox), a gente brinca com centavos pra ver se tá tudo certo. Em modo de verdade "
            "(produção), sai o dinheiro mesmo!"
        ),
        "tecnico": (
            "Sandbox: pix-h.api.efipay.com.br (cobranças de R$ 0,01–10,00 auto-confirmam). Produção: "
            "pix.api.efipay.com.br com chave Pix real. Cash-out via POST /v2/pix; cash-in via POST /v2/cob (QR)."
        ),
    },
    "destino": {
        "crianca": (
            "A casca não fica no lixo! A de praia (molhadinha e salgada) vira adubo pras plantinhas. "
            "A de fazenda (sequinha) vira briquete e até combustível de avião! E a blockchain é a "
            "prova de verdade disso tudo — as fábricas mostram pro auditor que o que elas compraram "
            "mesmo veio da CoinConut."
        ),
        "tecnico": (
            "Dualidade: casca litorânea → compostagem/adubo (PNRS); casca agroindustrial de Sousa → "
            "briquetes/bioenergia/SAF (RenovaBio/CORSIA/ISCC). Custódia auditável e selos ESG soulbound."
        ),
    },
}

FLUXO = [
    (
        "O balaio é pesado e a pesagem vira uma página nova no caderno da blockchain.",
        "registerDelivery → PaymentCreated (PENDING) — on-chain, com dados IoT do lote.",
    ),
    (
        "O site corre pro escritório: “Ora pagar essa pessoa!”",
        "POST /api/saque (cash-out) ou POST /api/cobrancas (cash-in) com assinatura da wallet.",
    ),
    (
        "O escritório conversa com o banco: “Manda o Pix, por favor!”",
        "Efí POST /v2/pix (envia) ou POST /v2/cob (gera QR copia-e-cola) — OAuth2 + mTLS.",
    ),
    (
        "Quando o Pix sai, o escritório escreve no caderno: “Pago!” — com o número do Pix como recibo.",
        "confirmPayment(paymentId, endToEndId) pelo Signer ORACLE_ROLE — pixProof = endToEndId.",
    ),
    (
        "O banco avisa o escritório quando o pagamento confirma — tipo um bilhetinho automático.",
        "Webhook POST {url}/pix?hmac=... — validação HMAC + IP allowlist; ack rápido e processamento assíncrono.",
    ),
    (
        "O site avisa a pessoa e até solta confete: “Pix enviado!”",
        "Evento PaymentConfirmed → UI (polling/escuta).",
    ),
]


# --------------------------------------------------------------------------- #
# Recorte do diagrama em 6 caixas (detecção por cor de preenchimento + tinta)
# --------------------------------------------------------------------------- #
# Cores de fill dos nós do diagrama resumido (com tolerância).
FILL_CORES = {
    "back": (240, 253, 244),   # offchain (verde clarinho)
    "efi": (255, 251, 235),    # externo (âmbar clarinho)
    "blue": (239, 246, 255),   # onchain (azul clarinho) — blockchain E destino
}


def detectar_caixas(img: Image.Image):
    """Acha as 6 caixas do diagrama resumido.

    Caixas com fill colorido (backend, efí, blockchain, destino) são achadas pela
    cor do preenchimento. As caixas brancas (camada física, portais) são achadas
    pela tinta (borda + texto), filtradas por altura para ignorar labels de aresta.
    """
    rgb = img.convert("RGB")
    w, h = rgb.size
    px = rgb.load()

    tinta_col = [0] * w
    fill_col = {nome: [0] * w for nome in FILL_CORES}
    for y in range(0, h, 2):
        for x in range(w):
            r, g, b = px[x, y]
            if (255 - r) + (255 - g) + (255 - b) > 15:
                tinta_col[x] += 1
            for nome, (fr, fg, fb) in FILL_CORES.items():
                if abs(r - fr) <= 6 and abs(g - fg) <= 6 and abs(b - fb) <= 6:
                    fill_col[nome][x] += 1
                    break

    def corridas(soma, lim, min_larg):
        out, ini = [], None
        for i, v in enumerate(soma):
            if v >= lim and ini is None:
                ini = i
            elif v < lim and ini is not None:
                if i - ini >= min_larg:
                    out.append((ini, i))
                ini = None
        if ini is not None and len(soma) - ini >= min_larg:
            out.append((ini, len(soma)))
        return out

    def y_extent(x0, x1, cor=None, min_tinta_linha=50):
        """Linhas com tinta (ou de uma cor) dentro da faixa x, com padding."""
        linhas = []
        for y in range(0, h, 2):
            n = 0
            for x in range(x0, x1):
                r, g, b = px[x, y]
                if cor:
                    fr, fg, fb = cor
                    if abs(r - fr) <= 6 and abs(g - fg) <= 6 and abs(b - fb) <= 6:
                        n += 1
                elif (255 - r) + (255 - g) + (255 - b) > 15:
                    n += 1
            if n >= min_tinta_linha:
                linhas.append(y)
        if not linhas:
            return 0, h
        return max(0, linhas[0] - 35), min(h, linhas[-1] + 35)

    caixas = []

    # --- Caixas com fill colorido -------------------------------------------
    fills_back = corridas(fill_col["back"], 20, 100)
    fills_efi = corridas(fill_col["efi"], 20, 100)
    fills_blue = corridas(fill_col["blue"], 20, 100)
    if not (len(fills_back) == 1 and len(fills_efi) == 1 and len(fills_blue) == 2):
        return []  # diagrama não bate com o esperado
    x0, x1 = fills_back[0]
    y0, y1 = y_extent(x0, x1)
    caixas.append(("backend", x0 - 8, y0, x1 + 8, y1))
    x0, x1 = fills_efi[0]
    y0, y1 = y_extent(x0, x1, FILL_CORES["efi"])
    caixas.append(("efi", x0 - 8, y0, x1 + 8, y1))
    # blue aparece 2x: esquerda = blockchain, direita = destino
    (bx0, bx1), (dx0, dx1) = sorted(fills_blue)
    y0, y1 = y_extent(bx0, bx1, FILL_CORES["blue"])
    caixas.append(("blockchain", bx0 - 8, y0, bx1 + 8, y1))
    y0, y1 = y_extent(dx0, dx1, FILL_CORES["blue"])
    caixas.append(("destino", dx0 - 8, y0, dx1 + 8, y1))

    # --- Caixas brancas (camada física e portais) ---------------------------
    limite_fill = min(x0 for x0, _ in fills_back)
    candidatas = corridas(
        [v if x < limite_fill else 0 for x, v in enumerate(tinta_col)], 8, 100
    )
    brancas = []
    for x0, x1 in candidatas:
        y0, y1 = y_extent(x0, x1, min_tinta_linha=50)
        if y1 - y0 >= 250:  # descarta labels de aresta (~70px de altura)
            brancas.append((x0, y0, x1, y1))
    if len(brancas) != 2:
        return []
    (ox0, oy0, ox1, oy1), (sx0, sy0, sx1, sy1) = sorted(brancas)
    caixas.append(("fisica", ox0 - 6, oy0, ox1 + 6, oy1))
    caixas.append(("portais", sx0 - 6, sy0, sx1 + 6, sy1))

    # Ordem narrativa: esquerda→direita; empates (coluna do meio) de cima pra baixo.
    caixas.sort(key=lambda c: (c[1] // 200, c[2]))
    return caixas


def recortar_partes() -> list[Path]:
    if not SRC_PNG.exists():
        sys.exit(
            f"Não achei {SRC_PNG.name}. Gere primeiro o diagrama resumido (mmdc) nesta pasta."
        )
    img = Image.open(SRC_PNG)
    caixas = detectar_caixas(img)
    if len(caixas) != 6:
        sys.exit(
            f"Esperava 6 caixas no diagrama, achei {len(caixas)}. "
            "Confira se diagrama_arquitetura_resumido.png é a versão de 6 nós."
        )

    PARTES_DIR.mkdir(exist_ok=True)
    por_nome = {nome: rest for nome, *rest in caixas}  # nome -> [x0, y0, x1, y1]
    caminhos = []
    for nome, _titulo in PARTES:
        x0, y0, x1, y1 = por_nome[nome]
        pad = 12
        recorte = img.crop(
            (max(0, x0 - pad), max(0, y0 - pad), min(img.width, x1 + pad), min(img.height, y1 + pad))
        )
        destino = PARTES_DIR / f"part_{nome}.png"
        recorte.save(destino)
        caminhos.append(destino)
        print(f"  recorte {nome}: {recorte.width}x{recorte.height} px → {destino.name}")
    return caminhos


# --------------------------------------------------------------------------- #
# PDF
# --------------------------------------------------------------------------- #
VERDE = HexColor("#16A34A")
VERDE_CLARO = HexColor("#F0FDF4")
AZUL = HexColor("#2563EB")
CINZA = HexColor("#475569")


def estilos():
    base = getSampleStyleSheet()
    return {
        "titulo": ParagraphStyle(
            "titulo", parent=base["Title"], fontSize=26, leading=32, textColor=VERDE, spaceAfter=12
        ),
        "subtitulo": ParagraphStyle(
            "subtitulo", parent=base["Normal"], fontSize=13, leading=18, textColor=CINZA, alignment=1
        ),
        "h1": ParagraphStyle(
            "h1", parent=base["Heading1"], fontSize=15, leading=19, textColor=VERDE, spaceAfter=8
        ),
        "corpo": ParagraphStyle(
            "corpo", parent=base["Normal"], fontSize=11, leading=15, spaceAfter=8
        ),
        "crianca": ParagraphStyle(
            "crianca",
            parent=base["Normal"],
            fontSize=12,
            leading=17,
            backColor=VERDE_CLARO,
            borderPadding=10,
            borderColor=VERDE,
            borderWidth=1,
            borderRadius=6,
            spaceAfter=10,
        ),
        "tecnico": ParagraphStyle(
            "tecnico", parent=base["Normal"], fontSize=9.5, leading=13, textColor=CINZA, spaceAfter=6
        ),
        "passo": ParagraphStyle(
            "passo", parent=base["Normal"], fontSize=11, leading=15, leftIndent=12, spaceAfter=8
        ),
    }


def imagem_cabivel(caminho: Path, largura_max: float, altura_max: float) -> RLImage:
    """Cria uma figura reportlab que cabe em largura_max × altura_max (escala proporcional)."""
    w, h = ImageReader(str(caminho)).getSize()
    escala = min(largura_max / w, altura_max / h)
    return RLImage(str(caminho), width=w * escala, height=h * escala)


def montar_pdf(caminhos: list[Path]) -> None:
    st = estilos()
    doc = SimpleDocTemplate(
        str(OUT_PDF),
        pagesize=A4,
        leftMargin=1.8 * cm,
        rightMargin=1.8 * cm,
        topMargin=1.6 * cm,
        bottomMargin=1.6 * cm,
        title="CoinConut — A casa do COCO",
    )
    L, A = A4
    largura_util = L - doc.leftMargin - doc.rightMargin
    story = []

    # ---- Capa ----
    story.append(Spacer(1, 1.2 * cm))
    story.append(Paragraph("A casa do COCO", st["titulo"]))
    story.append(Paragraph(
        "Como a CoinConut funciona — explicado como se a gente tivesse 5 anos", st["subtitulo"]
    ))
    story.append(Spacer(1, 0.8 * cm))
    story.append(Paragraph(
        "A CoinConut pega casquinha de coco que viraria lixo, transforma em tesouro rastreado "
        "e ainda faz o Pix cair na hora certa na mão de quem coletou. Este PDF mostra o mapa "
        "(o diagrama) cortado em 6 pedacinhos, e cada pedacinho tem sua explicação.",
        st["corpo"],
    ))
    story.append(Spacer(1, 0.6 * cm))
    story.append(imagem_cabivel(SRC_PNG, largura_util, 7 * cm))
    story.append(PageBreak())

    # ---- O caminho do dinheiro ----
    story.append(Paragraph("O caminho da casquinha, passo a passo", st["h1"]))
    story.append(Paragraph(
        "É assim que uma pesagem vira um Pix na mão da pessoa:", st["corpo"]
    ))
    for i, (kid, tec) in enumerate(FLUXO, 1):
        story.append(Paragraph(f"<b>{i}.</b> {kid}", st["passo"]))
        story.append(Paragraph(f"<i>No técnico:</i> {tec}", st["tecnico"]))
    story.append(PageBreak())

    # ---- Uma página por parte ----
    for caminho, (nome, titulo) in zip(caminhos, PARTES):
        exp = EXPLICACOES[nome]
        story.append(Paragraph(titulo, st["h1"]))
        story.append(imagem_cabivel(caminho, largura_util, 9.5 * cm))
        story.append(Spacer(1, 0.3 * cm))
        story.append(Paragraph(f"<b>Se a gente tivesse 5 anos:</b> {exp['crianca']}", st["crianca"]))
        story.append(Paragraph(f"<b>No mundo dos adultos (técnico):</b> {exp['tecnico']}", st["tecnico"]))
        story.append(PageBreak())

    # ---- Resumo ----
    story.append(Paragraph("Resumo — o que a gente aprendeu", st["h1"]))
    story.append(Paragraph(
        "<b>Pra criança:</b> a CoinConut é um detetive esperto. Ele anota cada casquinha num "
        "caderno que não pode ser apagado e faz o Pix cair na hora certa pra quem coletou.",
        st["crianca"],
    ))
    story.append(Paragraph(
        "<b>Pra adulto:</b> middleware de logística reversa — IoT na ponta (NFC/BLE), "
        "PaymentLedger on-chain (PENDING→PAID, pixProof=endToEndId), liquidação Pix via Efí "
        "(sandbox → produção), backend oráculo no Railway e custódia auditável para "
        "RenovaBio/CORSIA.",
        st["tecnico"],
    ))
    story.append(Spacer(1, 0.4 * cm))
    story.append(Paragraph(
        "Arquivos desta pasta: <i>diagrama_arquitetura_resumido.png</i> (mapa completo), "
        "<i>diagrama_arquitetura.png</i> (versão detalhada TESTNET/MAINNET) e "
        "<i>partes/</i> (os recortes usados aqui).",
        st["tecnico"],
    ))

    doc.build(story)


def main() -> None:
    print(f"Lendo {SRC_PNG.name}…")
    caminhos = recortar_partes()
    print("Montando o PDF…")
    montar_pdf(caminhos)
    print(f"Pronto! PDF gerado em: {OUT_PDF}")


if __name__ == "__main__":
    main()
