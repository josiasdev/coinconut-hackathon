# Diagrama de Arquitetura Resumido — CoinConut (Pix + Custódia)

Versão enxuta para explicação rápida (pitch / alinhamento de equipe). A versão completa está em `diagrama_arquitetura_coinconut.md`.

**Leitura em 6 passos (mesmos nos dois ambientes):**
1. `registerDelivery` → `PaymentCreated` (PENDING) — on-chain, com dados IoT do lote
2. `POST /saque` (cash-out ao coletor/garçom/catador) ou `POST /cobrancas` (cash-in da Indústria) — off-chain
3. Efí `POST /v2/pix` (envia Pix) ou `POST /v2/cob` (gera QR copia-e-cola) — off-chain mTLS
4. `confirmPayment` / `confirmPurchase` pelo Signer `ORACLE_ROLE` — on-chain (`pixProof = endToEndId`)
5. Webhook Efí `POST {url}/pix?hmac=...` — assíncrono (HMAC + IP allowlist)
6. Evento `PaymentConfirmed` → UI

**Ambientes (mesmo código, só env vars mudam):**
- **TESTNET:** Sepolia + Efí Sandbox (`pix-h.api.efipay.com.br`, cobranças R$ 0,01–10,00 auto-confirmam) + Railway staging
- **MAINNET:** Ethereum + Efí Produção (`pix.api.efipay.com.br`, chave Pix real) + Railway prod

```mermaid
---
config:
  theme: base
  themeVariables:
    primaryColor: "#F0FDF4"
    primaryTextColor: "#14532D"
    primaryBorderColor: "#16A34A"
    lineColor: "#475569"
    fontFamily: "Inter, Helvetica, Arial, sans-serif"
  flowchart:
    curve: linear
    nodeSpacing: 45
    rankSpacing: 55
---
flowchart LR

ORIG["Camada Física + IoT<br/>NFC · balança BLE · smart bins · totem RVM<br/>App assina origem + peso + GPS (anti-fraude)"]
PORT["Portais — Vercel<br/>Coleta · Saque · Indústria<br/>React 19"]
BACK["Backend Oráculo — Railway<br/>API REST · Client Efí (OAuth2+mTLS)<br/>Signer ORACLE_ROLE · Worker · Postgres<br/>idempotência · outbox · retries"]
EFI["Efí Pix API<br/>sandbox ↔ produção"]
CHAIN["Blockchain<br/>Sepolia ↔ Ethereum mainnet<br/>PaymentLedger · Registry · CocoAsset<br/>Market · SustainabilityNFT"]
DEST["Destino e Conformidade<br/>compostagem/adubo (litoral · PNRS)<br/>briquetes/bioenergia/SAF (sertão · RenovaBio/CORSIA)<br/>custódia auditável · selos ESG"]

ORIG -->|"lote assinado"| PORT
PORT -->|"1"| CHAIN
PORT -->|"2"| BACK
BACK -->|"3"| EFI
BACK -->|"4"| CHAIN
EFI -.->|"5"| BACK
CHAIN -.->|"6"| PORT
CHAIN -->|"custódia"| DEST

classDef offchain fill:#F0FDF4,stroke:#16A34A,stroke-width:1px,color:#14532D
classDef onchain fill:#EFF6FF,stroke:#2563EB,stroke-width:1px,color:#1E3A8A
classDef external fill:#FFFBEB,stroke:#D97706,stroke-width:1px,color:#78350F
classDef actor fill:#FFFFFF,stroke:#0F172A,stroke-width:1px,color:#0F172A

class ORIG,PORT actor
class BACK offchain
class CHAIN,DEST onchain
class EFI external
```

Legenda de cores: branco = atores físicos · verde = off-chain/Railway · âmbar = Efí (infra externa) · azul = on-chain/marketplace · tracejado = assíncrono.
Segurança: `ORACLE_ROLE` só na wallet do backend · HMAC na URL do webhook + IP allowlist (34.193.116.226) · `.p12` só como secret · mTLS outgoing.
