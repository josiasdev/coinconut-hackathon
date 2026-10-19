# COINCONUT — Guia de Contexto para Desenvolvedores (CONTEXT.md)

Este documento foi criado para ajudar novos desenvolvedores a entenderem a arquitetura, o fluxo de negócios e as tecnologias por trás do COINCONUT em seu estado final de MVP.

---

## Visão Geral da Arquitetura

O COINCONUT (Submissão ImpactLedger) é um DApp (Decentralized Application) focado na rastreabilidade e monetização da reciclagem da casca do coco. Ele une um **Frontend em React 19 (Vite)** com uma suíte de **Smart Contracts na rede Sepolia Testnet**.

A plataforma não foca apenas na rastreabilidade (onde o resíduo foi parar), mas também na **inclusão financeira e recompensa ESG**. Produtores rurais (catadores) são pagos instantaneamente via Oráculo PIX por resíduos que antes eram descartados, e fábricas ganham Certificados ImpactLedger (NFTs) ao comprarem matéria-prima com origem 100% atestada na Blockchain.

---

## Os Smart Contracts

Todo o fluxo logístico e financeiro da cadeia é controlado por um ecossistema de contratos construídos com Solidity.

### 1. `CocoAsset.sol` (O Ativo Físico)
- **Padrão:** ERC-1155.
- **Função:** Representa a casca de coco nos seus estágios: Estágio 0 (Casca Bruta) -> Estágio 1 (Fibra/Pó) e Estágio 2 (Briquete).

### 2. `CoconutRegistry.sol` (O Orquestrador Logístico)
- **Função:** Ponto de entrada principal da logística.
- O Agente de coleta chama `registerDelivery`, que emite o `CocoAsset` e cria uma promessa de pagamento no `PaymentLedger`. Possui funções como `advanceBatchStage`.

### 3. `PaymentLedger.sol` (O Livro Razão Financeiro)
- **Função:** Desacopla o token criptográfico da moeda fiduciária.
- Funciona como um "livro de fiado" on-chain, guardando obrigações no valor exato de BRL (em centavos). Status inicia como `PENDING`. Um oráculo do Banco Central (simulado) chama `confirmPayment` e muda o status para `PAID`, registrando o comprovante PIX.

### 4. `BriquetteMarket.sol` (O Marketplace B2B)
- **Função:** Permite que a Fábrica coloque o produto final à venda (`list()`) para parceiros B2B (`buy()`). 

### 5. `SustainabilityNFT.sol` (O Selo ESG)
- **Padrão:** ERC-721 "Soulbound" (Intransferível).
- **Função:** É o "Selo Dourado" da aplicação. Serve como prova irrevogável do mercado de que a empresa investiu em logística reversa sustentável.

---

## O Frontend (Vite + React)

O Frontend usa a estratégia de "Portais", isolando a experiência por tipo de usuário: Catador, Agente de Coleta e Indústria.

### Estrutura de Pastas e Rotas
- **`src/routes/__root.tsx`**: Rota base e layout (Nav, Footer).
- **`src/routes/login.tsx`**: Acesso simplificado (Account Abstraction ERC-4337). Remove a barreira do Web3 simulando login social (Google/E-mail).
- **`src/routes/dashboard.tsx`**: Portal do Catador (Produtor). Puxa o saldo total e histórico.
- **`src/routes/coleta.tsx`**: Tela do Ponto de Coleta (Quiosque). Pesa o material e cadastra o lote.
- **`src/routes/registrar.tsx`**: Tela da Indústria. Sincroniza lotes novos, faz o processamento (Avança Estágio) e lista o produto no Mercado. *Nota: Para efeitos de demonstração (Pitch), essa tela também emite o NFT ESG diretamente para a fábrica simulando a compra B2B final.*
- **`src/routes/esg.tsx`**: **Fator UAU!** Uma galeria visual premium no formato "Trading Cards" (Tiers Genesis, Esmeralda, etc.) que lê o saldo do contrato `SustainabilityNFT` e exibe os certificados ImpactLedger conquistados pela empresa.
- **`src/routes/saque.tsx`**: Tela do Produtor onde o valor do `PaymentLedger` é sacado. **Fator UAU:** Possui um botão "Admin: Simular Oráculo PIX" escondido no canto inferior, que atualiza a blockchain em tempo real chamando o `confirmPayment`.

---

## O Fluxo de Apresentação (Pitch / "Happy Path")

Para você testar toda a plataforma end-to-end e impressionar qualquer avaliador, siga exatamente este fluxo:

1. **Acesso Sem Atrito:** Na Home, clique em "Entrar". Selecione o perfil de Catador ou Ponto de Coleta e clique em "Continuar com Google". A carteira Web3 será gerada nos bastidores.
2. **Agente (A Coleta):** No portal de Ponto de Coleta, registre uma pesagem. O lote entrará na rede como `COLLECTED`.
3. **Fábrica (O Processamento):** Entre como Indústria. A tela sincronizará o lote recém-criado. Clique em Registrar Compra. A transação mudará o lote para `PROCESSED` e **emitirá automaticamente o seu Selo ImpactLedger**.
4. **Galeria ESG:** Ainda na tela da Indústria, clique em "Galeria ESG" (canto superior direito) para ver a galeria de Trading Cards NFT dinâmicos saltarem na tela!
4. **Produtor (O Oráculo PIX):** Acesse "Sou Catador" -> "Sacar via PIX". O valor daquela pesagem estará lá! Clique no botão oculto no rodapé "Admin: Simular Oráculo PIX". A transação será executada, o saldo zerará e os confetes cairão!

---

## Scripts Úteis

Se você fez um novo deploy na Sepolia e precisa rodar as configurações iniciais do MVP (como conceder Roles e cadastrar o Deployer como operador e minter):
```bash
# Seta as configurações básicas
npx hardhat run scripts/setup.js --network sepolia

# Atribui o papel de MINTER_ROLE ao deployer (necessário para a demonstração do ESG na Fábrica)
npx hardhat run scripts/grant_minter.js --network sepolia
```

**Desenvolvido para o Hackathon Web3 RESTIC 29.**
