# Diagrama de Arquitetura — CoinConut (Integração Pix + Cadeia de Custódia)

Arquitetura geral da CoinConut após o diagnóstico estratégico: a **integração real do Pix (Efí)** permanece o núcleo de liquidação, e ao redor dela a **camada física/IoT** que garante a qualidade do lote na origem e o **destino comercial dual** da biomassa.

Três linhas de leitura:
1. **Camada Física (topo):** origem da biomassa — Sertão agroindustrial (Sousa → SAF/bioenergia) e Litoral/quiosques (casca verde → compostagem) — com IoT (NFC, balança BLE, smart bins, totem RVM) e o App Móvel como oráculo físico assinado (anti-fraude, sem digitação manual).
2. **Plataforma (meio):** faixas **TESTNET** (Sepolia + Efí Sandbox + Railway staging) e **MAINNET** (Ethereum + Efí Produção + Railway prod). Mesmo código; mudam só as variáveis de ambiente.
3. **Destino e Conformidade (base):** compostagem/adubo (PNRS) no litoral, briquetes/bioenergia/SAF (RenovaBio/CORSIA) no sertão, com custódia auditável on-chain (selos ESG, anti-greenwashing).

Fluxos numerados (iguais nas duas faixas):
1. `registerDelivery` → `PaymentCreated` (PENDING) — on-chain, com dados IoT do lote (NFC + peso BLE + GPS)
2. `POST /api/saque` com assinatura da wallet — off-chain (beneficiário: coletor, garçom/equipe, catador ou transportador)
3. Efí `POST /v2/pix` (envio cash-out para a chave Pix) — off-chain mTLS
4. `confirmPayment(paymentId, endToEndId)` — on-chain (o `endToEndId` vira o `pixProof`)
5. Efí `POST /v2/cob` → QR Code copia-e-cola para a Indústria/Usina (cash-in, B2B) — off-chain
6. Webhook Efí `POST {url}/pix?hmac=...` (validação HMAC + IP allowlist) — assíncrono
7. `confirmPurchase` / `confirmPayment` — on-chain
8. Eventos `PaymentConfirmed` / `PaymentFailed` → UI (polling/escuta) — on-chain

MVP asset-light: a CoinConut não opera frota própria — integra balanças das agroindústrias e transportadoras já contratadas; inicia nos geradores de grande escala.

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
    nodeSpacing: 40
    rankSpacing: 45
---
flowchart TB

%% ========================= CAMADA FÍSICA =========================
subgraph FISICA[" "]
direction LR
subgraph FISICA_IN["CAMADA FISICA — Origem da Biomassa (oráculo humano + IoT)"]
direction LR
F_SERTAO["Sertão / Sousa<br/>agroindústrias · casca sepa<br/>→ briquetes · bioenergia · SAF"]
F_LITORAL["Litoral / Quiosques (João Pessoa)<br/>casca verde úmida · salitre<br/>→ compostagem · adubo organomineral"]
F_IOT["IoT na ponta<br/>tags NFC · balança BLE<br/>smart bins (LoRaWAN) · totem RVM"]
F_APP["App Móvel — Oráculo Físico<br/>handshake NFC + peso BLE + GPS<br/>assinatura anti-fraude (sem digitação)"]
F_SERTAO -->|"coleta agroindustrial (asset-light)"| F_APP
F_LITORAL -->|"coleta urbana · desvio de aterro"| F_APP
F_IOT -->|"telemetria · nível · rota"| F_APP
end
end

%% ========================= TESTNET =========================
subgraph TESTNET[" "]
direction LR
subgraph TESTNET_IN["TESTNET / HOMOLOGACAO — Sepolia + Efí Sandbox + Railway (staging)"]
direction LR
T_CAT["Portal Saque<br/>coletor · garçom/equipe · catador"]
T_COL["Portal Coleta<br/>quiosque · transportador"]
T_IND["Portal Indústria / Usina<br/>compra B2B · selo ESG"]
T_SPA["Frontend — Vercel<br/>DApp React 19<br/>VITE_PIX_MODE=<br/>sandbox"]
T_API["API REST — Railway<br/>POST /saque · POST /cobrancas<br/>POST /webhooks/efi · GET /pix/:id"]
T_CLIENT["Client Efí<br/>OAuth2 + mTLS (p12)"]
T_SIGN["Signer ORACLE_ROLE<br/>wallet dedicada"]
T_WORKER["Worker cron<br/>retry · expiração · reconciliação"]
T_DB[("Postgres<br/>pix_transactions · outbox<br/>idempotência")]
T_EFI["Efí Pix API — SANDBOX<br/>pix-h.api.efipay.com.br<br/>cobranças R$ 0,01–10,00<br/>auto-confirmadas"]
T_CHAIN["Blockchain — Sepolia<br/>CoconutRegistry · CocoAsset<br/>PaymentLedger · BriquetteMarket<br/>SustainabilityNFT"]
T_CAT -->|"abre o portal"| T_SPA
T_COL -->|"registra lote"| T_SPA
T_IND -->|"portal compra B2B"| T_SPA
T_SPA -->|"1"| T_CHAIN
T_SPA -->|"2"| T_API
T_API -->|"token OAuth2 + p12"| T_CLIENT
T_CLIENT -->|"3"| T_EFI
T_API -->|"4"| T_SIGN
T_SIGN -->|"status PAID"| T_CHAIN
T_API -->|"5"| T_EFI
T_EFI -.->|"6"| T_API
T_API --> T_DB
T_WORKER --> T_DB
T_WORKER -->|"7"| T_CHAIN
T_CHAIN -.->|"8"| T_SPA
end
end

%% ========================= MAINNET =========================
subgraph MAINNET[" "]
direction LR
subgraph MAINNET_IN["MAINNET / PRODUCAO — Ethereum + Efí Produção + Railway (prod)"]
direction LR
M_CAT["Portal Saque<br/>coletor · garçom/equipe · catador"]
M_COL["Portal Coleta<br/>quiosque · transportador"]
M_IND["Portal Indústria / Usina<br/>compra B2B · selo ESG"]
M_SPA["Frontend — Vercel<br/>DApp React 19<br/>VITE_PIX_MODE=<br/>production"]
M_API["API REST — Railway (prod)<br/>POST /saque · POST /cobrancas<br/>POST /webhooks/efi · GET /pix/:id"]
M_CLIENT["Client Efí<br/>OAuth2 + mTLS (p12 produção)"]
M_SIGN["Signer ORACLE_ROLE<br/>wallet dedicada · gás ETH"]
M_WORKER["Worker cron<br/>retry · expiração · reconciliação"]
M_DB[("Postgres<br/>pix_transactions · outbox<br/>idempotência")]
M_EFI["Efí Pix API — PRODUCAO<br/>pix.api.efipay.com.br<br/>conta Efí com chave Pix real"]
M_CHAIN["Blockchain — Ethereum mainnet<br/>suite completa de contratos (redeploy)<br/>Paymaster patrocinando gás"]
M_CAT -->|"abre o portal"| M_SPA
M_COL -->|"registra lote"| M_SPA
M_IND -->|"portal compra B2B"| M_SPA
M_SPA -->|"1"| M_CHAIN
M_SPA -->|"2"| M_API
M_API -->|"token OAuth2 + p12"| M_CLIENT
M_CLIENT -->|"3"| M_EFI
M_API -->|"4"| M_SIGN
M_SIGN -->|"status PAID"| M_CHAIN
M_API -->|"5"| M_EFI
M_EFI -.->|"6"| M_API
M_API --> M_DB
M_WORKER --> M_DB
M_WORKER -->|"7"| M_CHAIN
M_CHAIN -.->|"8"| M_SPA
end
end

%% ========================= DESTINO E CONFORMIDADE =========================
subgraph DESTINO[" "]
direction LR
subgraph DESTINO_IN["DESTINO E CONFORMIDADE"]
direction LR
D_COMP["Compostagem · adubo organomineral<br/>litoral — desvio de aterro (PNRS)"]
D_SAF["Briquetes · bioenergia · SAF<br/>sertão — RenovaBio · CORSIA · ISCC"]
D_ESG["Custódia auditável on-chain<br/>selos ESG · anti-greenwashing<br/>créditos de carbono · Book and Claim"]
D_ESG -.->|"direciona"| D_COMP
D_ESG -.->|"direciona"| D_SAF
end
end

%% ========================= LEGENDA =========================
subgraph LEG[" "]
direction LR
subgraph LEG_IN["Legenda"]
direction LR
L1["Mesmos fluxos numerados 1–8 nas duas faixas. Beneficiário do cash-out (2–4): coletor, garçom/equipe (Pix simbólico por contentor), catador ou transportador."]
L2["Cores: verde = off-chain / HTTP · azul = on-chain · âmbar = mercado/infra externa · cinza = banco de dados · branco = atores físicos · tracejado = assíncrono"]
L4["Segurança: HMAC na URL do webhook + IP allowlist (34.193.116.226) · idempotência por paymentId / txid · outbox para retries · ORACLE_ROLE só na wallet do backend (nunca no browser) · certificado .p12 apenas como secret · mTLS outgoing garantido · peso/origem assinados no app (anti-fraude)"]
end
end

%% ---- encadeamento vertical das 5 linhas + fluxos de contexto entre linhas ----
FISICA ==>|"lote assinado"| TESTNET
FISICA ==>|"lote assinado"| MAINNET
TESTNET ==>|"custódia"| DESTINO
MAINNET ==>|"custódia"| DESTINO
TESTNET ~~~ MAINNET ~~~ LEG

%% ========================= ESTILO =========================
classDef offchain fill:#F0FDF4,stroke:#16A34A,stroke-width:1px,color:#14532D
classDef onchain fill:#EFF6FF,stroke:#2563EB,stroke-width:1px,color:#1E3A8A
classDef external fill:#FFFBEB,stroke:#D97706,stroke-width:1px,color:#78350F
classDef store fill:#F8FAFC,stroke:#64748B,stroke-width:1px,color:#0F172A
classDef actor fill:#FFFFFF,stroke:#0F172A,stroke-width:1px,color:#0F172A
classDef note fill:#F1F5F9,stroke:#94A3B8,stroke-width:1px,color:#334155

class F_SERTAO,F_LITORAL,T_CAT,T_COL,T_IND,M_CAT,M_COL,M_IND actor
class F_IOT,F_APP,T_API,T_CLIENT,T_WORKER,M_API,M_CLIENT,M_WORKER offchain
class T_SIGN,M_SIGN,D_ESG onchain
class T_DB,M_DB store
class T_EFI,M_EFI,T_CHAIN,M_CHAIN,D_COMP,D_SAF external
class L1,L2,L4 note
```
