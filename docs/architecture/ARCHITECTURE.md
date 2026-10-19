# Arquitetura do COINCONUT

Este documento descreve a topologia e as decisões arquiteturais do projeto **COINCONUT**, submetido ao Hackathon Web3 RESTIC 29.

## 1. Visão Geral

O COINCONUT adota uma arquitetura descentralizada (DApp) com separação estrita de responsabilidades:
- **Camada de Consenso e Negócios (Blockchain):** Smart Contracts na rede Ethereum (Sepolia Testnet).
- **Camada de Apresentação e Interação (Frontend):** Single Page Application construída com React e Vite.
- **Armazenamento de Metadados:** IPFS / APIs de suporte para visualização de mídias (quando aplicável).

---

## 2. Diagrama Lógico de Atores

A plataforma é dividida em "Portais" (Views), garantindo que cada participante interaja apenas com a sua responsabilidade na cadeia logística.

### A. Produtor / Catador (O Início da Cadeia)
- Não precisa assinar transações complexas nem gerenciar carteiras. O acesso é feito via e-mail ou Google (Account Abstraction ERC-4337).
- Visualiza suas entregas validadas.
- Solicita o saque do valor em moeda fiduciária (BRL) via integração com o **Oráculo PIX**.
- **Contrato Principal Acessado (via Leitura):** `PaymentLedger`.

### B. Ponto de Coleta / Quiosque (O Validador)
- Acesso simplificado (Account Abstraction ERC-4337) sem atrito Web3.
- Funciona como um oráculo humano que confirma a entrega física da casca.
- Pesa o material e o sistema assina a transação na blockchain automaticamente via Paymaster.
- **Contratos Acessados:** `CoconutRegistry` (Registra Entrega) -> Gera tokens em `CocoAsset`.

### C. Indústria / Fábrica (A Transformação)
- Sincroniza os lotes recolhidos nos pontos de coleta.
- Avança o estágio do lote (`advanceBatchStage`), declarando que a casca virou Fibra, Substrato ou Briquete.
- Lista o produto no Mercado B2B (`BriquetteMarket`).
- Recebe a certificação ESG (`SustainabilityNFT`).

---

## 3. Modelo de Dados Descentralizado

### Ativos Tangíveis (Físicos)
O contrato `CocoAsset.sol` (ERC-1155) mapeia os estados físicos da casca do coco:
1. **Estágio 0:** Casca Recebida.
2. **Estágio 1:** Moida (Fibra).
3. **Estágio 2:** Briquete/Adubo.

### Ativos Intangíveis (Obrigações e Certificados)
- **Obrigação de Pagamento:** Ao entregar a casca, o Catador não recebe um "Token", mas sim um registro de obrigação em Reais (BRL) no `PaymentLedger.sol`. Essa obrigação transita de `PENDING` para `PAID` assim que a compensação fiat acontece off-chain.
- **Reputação Corporativa (ImpactLedger):** O impacto gerado pela fábrica não pode ser comprado secundariamente. Por isso, a plataforma emite um `SustainabilityNFT.sol` utilizando a mecânica **Soulbound** (intransferível), renderizado como Trading Cards dinâmicos com atributos de Logística Reversa e Impacto Socioambiental.

---

## 4. Tecnologias Empregadas

- **Linguagem de Smart Contracts:** Solidity (v0.8.24)
- **Framework de Blockchain:** Hardhat
- **Integração Web3:** Ethers.js v6
- **Frontend SPA:** React 19 + TypeScript + Vite
- **Roteamento Frontend:** TanStack Router (Typesafe)
- **Design System:** Tailwind CSS v4 + Framer Motion
- **Notificações:** Sonner (Toasts)

## 5. Próximos Passos (Evolução)
- Implementação real de um relayer Biconomy para o Paymaster (ERC-4337).
- Conexão do Oráculo com uma API de BaaS (Banking as a Service) como a Stark Bank ou Banco Central para automação definitiva dos PIX.
