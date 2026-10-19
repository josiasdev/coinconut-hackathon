# Documentação dos Smart Contracts

Este documento provê uma visão detalhada dos Smart Contracts desenvolvidos para o ecossistema **COINCONUT**.

Todos os contratos foram desenvolvidos em Solidity v0.8.24 e utilizam a biblioteca OpenZeppelin para padronização e segurança (RBAC, ERCs, Reentrancy Guards).

---

## Estrutura de Contratos

### 1. `CocoAsset.sol` (O Resíduo Físico)
Representa o lote (Batch) de casca de coco do momento em que é coletado até se tornar um produto com valor de mercado.
- **Padrão:** ERC-1155.
- **Roles:** `FACTORY_ROLE`.
- **Mecânica Principal:** A função `advanceStage()` destrói o token no estágio atual (ex: Casca) e recria o token no estágio seguinte (ex: Fibra), garantindo que o rastreio da matéria não seja clonado.

### 2. `CoconutRegistry.sol` (Logística)
Responsável por autorizar pontos de coleta e mapear as transações entre o produtor rural e o ativo físico.
- **Roles:** Usa o padrão `Ownable` associado a uma lista branca de `authorizedOperators`.
- **Mecânica Principal:** `registerDelivery()`. Ao ser chamado pelo ponto de coleta, este contrato se comunica com o `CocoAsset` para cunhar a matéria e com o `PaymentLedger` para assinar o compromisso financeiro com o produtor.

### 3. `PaymentLedger.sol` (Financeiro / Oráculo)
Em vez de emitir um Token ERC-20 volátil, a plataforma trabalha com paridade 1:1 com o BRL via PIX off-chain. Este contrato é o fiador.
- **Roles:** `OPERATOR_ROLE` (pode criar cobranças), `ORACLE_ROLE` (pode confirmar pagamento).
- **Mecânica Principal:** A promessa de pagamento é iniciada em `PENDING`. Somente o Oráculo (conectado ao Banco Central/BaaS) pode chamar a função `confirmPayment(id, pixProof)` para liquidar o débito on-chain para `PAID`.

### 4. `BriquetteMarket.sol` (Marketplace B2B)
Ponto de saída do material para outras indústrias comprarem os blocos de resíduos processados.
- **Roles:** `FACTORY_ROLE` (quem lista).
- **Mecânica Principal:** A função `list()` disponibiliza o ativo. A função `buy()` efetua a compra, registra o pagamento no Ledger e engatilha a emissão do NFT de sustentabilidade para o comprador.

### 5. `SustainabilityNFT.sol` (Certificado ImpactLedger / Selo ESG)
O certificado de impacto ecológico gerado na cadeia. No frontend, ele é renderizado dinamicamente como "Trading Cards" que exibem atributos como "Redução de Descarte" e "Logística Reversa".
- **Padrão:** ERC-721 Soulbound.
- **Roles:** `MINTER_ROLE`.
- **Mecânica Principal:** O contrato sobrescreve a função de transferência `_update()` forçando um revert caso a transferência não seja uma cunhagem (Endereço 0). Isso torna o selo irrevogável e intransferível.

### 6. `CoinconutPaymaster.sol` (Gás Patrocinado & Login Social)
Permite abstração de conta (Account Abstraction via ERC-4337).
- **Mecânica:** Trabalhando em conjunto com carteiras geradas via Google/E-mail, o Paymaster isenta os pontos de coleta e catadores do pagamento de Gas Fees (Taxas da rede Ethereum), utilizando os fundos depositados via EntryPoint. Isso garante uma experiência Web2 sem atritos.

---

## Segurança e Edge Cases Tratados

Nossa bateria de testes cobre os seguintes cenários de segurança:
- **Restrição de Atores:** Somente pontos de coleta autorizados podem gerar recebíveis no Ledger.
- **Double-Spending Logístico:** Um lote não pode ter seu estágio avançado caso não exista ou já tenha sido convertido no produto final.
- **Intransferibilidade ESG:** O NFT de sustentabilidade falha caso alguém tente vendê-lo no mercado secundário (prevenindo que empresas "comprem" a reputação ambiental de terceiros).
- **Imutabilidade Financeira:** O valor financeiro de um `Delivery` é matematicamente fixado no instante do registro, prevenindo que alterações futuras no preço do quilo afetem as remunerações retroativas.
