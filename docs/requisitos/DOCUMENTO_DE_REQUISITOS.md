# Documento de Requisitos do Sistema CoinConut

Especificação de Requisitos de Software (SRS)
Versão 1.0
Data: 08 de outubro de 2026
Equipe CoinConut (projeto de hackathon)

---

## Sumário

1. Introdução
   1.1 Visão geral do documento
   1.2 Convenções, termos e abreviações
2. Descrição geral do sistema
   2.1 Objetivo do projeto
   2.2 Domínio do sistema
   2.3 Possíveis clientes
   2.4 Personas
   2.5 Recursos principais observados
   2.6 Escopo do sistema
3. Requisitos funcionais
4. Requisitos não funcionais
5. Histórias de usuário
6. Critérios de aceitação do produto
7. Critérios de validação dos requisitos (V&V)
8. Considerações finais
9. Referências

Obs.: a numeração de páginas do índice original (1. Introdução 3, 3. Requisitos funcionais 4 etc.) corresponde a exportação em PDF e não se aplica a esta versão em Markdown.

---

## 1. Introdução

### 1.1 Visão geral do documento

Este documento especifica os requisitos do sistema CoinConut, uma plataforma de logística reversa de casca de coco que conecta quem coleta (catadores, equipes de beach clubs e restaurantes) a quem transforma (indústrias de compostagem, briquetes e bioenergia), com rastreabilidade em blockchain e liquidação financeira via Pix.

O documento se destina a guiar o desenvolvimento, a homologação e a validação do produto mínimo viável (MVP), e atua como contrato de entendimento entre equipe técnica, usuários representativos e avaliadores do hackathon. Ele cobre: domínio e escopo do sistema, personas, requisitos funcionais e não funcionais, histórias de usuário, critérios de aceitação e o plano de verificação e validação (V&V).

Todo requisito possui um identificador estável (RF-nn, RNF-nn, HU-nn, CE-nn, VV-nn) para permitir rastreabilidade entre requisito, história de usuário, critério de aceitação e verificação.

### 1.2 Convenções, termos e abreviações

**Convenções de escrita**

- Requisitos são escritos na voz "O sistema deve ..." (obrigatório) ou "O sistema pode ..." (opcional).
- Prioridade usa a notação MoSCoW: Must (obrigatório para o MVP), Should (importante mas negociável), Could (desejável), Won't (fora do escopo desta versão).
- Identificadores: RF (requisito funcional), RNF (requisito não funcional), HU (história de usuário), CE (critério de aceitação), VV (critério de verificação e validação).
- Nomes de contratos, endpoints e variáveis aparecem em fonte monoespaçada.

**Glossário**

| Termo | Definição |
|---|---|
| Casca / lote | Resíduo orgânico de coco registrado na plataforma, com origem, peso e identificadores próprios |
| Catador | Pessoa física que coleta casca de coco e recebe por ela via Pix |
| Garçom | Funcionário de restaurante ou beach club que separa casca no estabelecimento e registra a deposição |
| Coletor / transportador | Responsável pelo transporte de lotes entre origem e destino (indústria) |
| Indústria | Compradora da casca: compostagem, fábrica de briquetes, bioenergia ou SAF |
| Pix | Sistema de pagamentos instantâneos do Banco Central do Brasil |
| PSP | Prestador de serviço de pagamento; neste projeto, a Efipay (Gerencianet) |
| Efipay / Efí | PSP utilizado para cash-out (saque ao catador) e cash-in (cobrança B2B) |
| cash-out | Pagamento da plataforma para a pessoa (saque do catador) |
| cash-in | Recebimento da indústria (cobrança com QR copia-e-cola) |
| txid | Identificador de transação/cobrança no ambiente Efipay |
| endToEndId | Identificador único de um Pix, usado como pixProof no contrato |
| webhook | Chamada HTTP automática da Efipay a nossa API quando um evento ocorre |
| HMAC | Assinatura criptográfica usada para autenticar o corpo do webhook |
| mTLS / .p12 | Autenticação mútua TLS com certificado, exigida pela Efipay |
| ORACLE_ROLE | Papel no contrato PaymentLedger que confirma pagamentos |
| PENDING / PAID | Estados do pagamento no PaymentLedger (aguardando / pago) |
| Sepolia | Rede de teste Ethereum onde roda o ambiente de homologação |
| Account Abstraction (AA) | Carteira abstraída que simplifica login para usuários não cripto |
| IoT | Internet das coisas: etiquetas NFC, balanças BLE, smart bins, totems RVM |
| NFC / BLE | Etiqueta por aproximação / protocolo Bluetooth Low Energy |
| RVM | Reverse Vending Machine, totem de recebimento com leitor |
| PNRS | Política Nacional de Resíduos Sólidos (Lei 12.305/2010) |
| RenovaBio | Programa nacional de incentivo à bioenergia (Decreto 9.809/2018) |
| CORSIA | Esquema de compensação de carbono da OACI para aviação |
| ISCC | International Sustainability and Carbon Certification |
| SAF | Sustainable Aviation Fuel (combustível de aviação sustentável) |
| ESG | Práticas ambientais, sociais e de governança |
| soulbound | Token não transferível, usado como selo de conformidade |
| LGPD | Lei Geral de Proteção de Dados (Lei 13.709/2018) |
| MVP | Produto mínimo viável |
| V&V | Verificação e validação |
| outbox | Padrão de fila persistente para garantir envio de eventos/pagamentos |

---

## 2. Descrição geral do sistema

### 2.1 Objetivo do projeto

**Objetivo geral:** transformar casca de coco descartada em recurso rastreável e líquido financeiramente, eliminando a queima e o enterramento ilegal da casca, por meio de uma plataforma que registra cada lote com origem verificada, confirma pagamentos instantâneos (Pix) e emite prova digital de conformidade ambiental.

**Objetivos específicos:**

1. Registrar de forma anti-fraude a origem, o peso e o destino de cada lote de casca, apoiando-se em dados de IoT (NFC, balança BLE, smart bins, totem RVM) e na assinatura digital da coleta.
2. Liquidar o pagamento ao catador em até 1 minuto após a confirmação da coleta, utilizando a rede Pix via Efipay.
3. Disponibilizar a casca a indústrias compradoras com custódia auditável em blockchain (Sepolia na homologação, Ethereum mainnet em produção).
4. Emitir evidências digitais de conformidade (PNRS, RenovaBio, CORSIA, ISCC) na forma de selos ESG não transferíveis e relatórios exportáveis.
5. Operar um modelo asset-light: a plataforma não compra, não armazena e não transporta a casca; ela orquestra, registra e liquida.

**Meta de negócio (indicativa para o MVP):** cadastrar 30 catadores, 10 estabelecimentos geradores, 2 indústrias compradoras e liquidar 100 pagamentos Pix de teste no ambiente sandbox durante a homologação.

### 2.2 Domínio do sistema

O domínio é a logística reversa de biomassa de coco, com duas cadeias reais cobertas pelo mesmo produto:

- **Cadeia litorânea (praia, ilhas e orla):** casca molhada e salgada, com destino compostagem e adubo, sob governança do PNRS.
- **Cadeia sertaneja / agroindustrial (Sousa e região):** casca seca e torrada, com destino briquetes, bioenergia e SAF, sob conformidade RenovaBio, CORSIA e ISCC.

**Fronteiras do domínio (o que pertence ao sistema):**

- Cadastro e identificação de pessoas (catadores, garçons, transportadores, indústrias, auditores).
- Identificação física dos lotes (etiqueta NFC, QR, balança, totem).
- Registro imutável de eventos de coleta, transporte e recebimento.
- Orquestração financeira: solicitação, execução e confirmação de Pix.
- Painéis e portais web (Coleta, Saque, Indústria).
- Emissão de conformidade: selos ESG e relatórios de custódia.

**Fronteiras externas (o sistema depende ou conversa com):**

- Rede Ethereum (Sepolia/mainnet) e carteiras dos usuários.
- Efipay (API Pix, webhook e certificado .p12).
- Dispositivos IoT: etiquetas NFC, balanças Bluetooth, smart bins e totems RVM.
- Hospedagem: Vercel (portais), Railway (API e banco Postgres).

### 2.3 Possíveis clientes

| Cliente | Necessidade atendida | Modelo |
|---|---|---|
| Catadores e cooperativas | Renda imediata por quilo coletado, sem burocracia | Grátis para o catador; liquidação via Pix |
| Restaurantes, beach clubs e conveniências | Descarte correto da casca, cumprimento do PNRS, reputação | SaaS mensal por unidade geradora |
| Indústrias de compostagem | Insumo constante com origem comprovada | Compra direta dos lotes (cash-in) |
| Fábricas de briquete, bioenergia e SAF | Matéria-prima rastreável para créditos e auditorias | Compra direta + assinatura de dados de custódia |
| Compradores de créditos ambientais (ESG) | Prova verificável de origem e impacto | Venda de créditos/selos |
| Poder público e órgãos ambientais | Evidência de descarte adequado e destaque de municípios | Relatorios públicos |
| Auditores e certificadoras (ISCC, RenovaBio) | Trilha de custódia imutável para certificação | Acesso leitura a trilha de auditoria |
| Avaliadores e jurados do hackathon | Demonstração completa do fluxo com dados reais de teste | Demo guiada |

### 2.4 Personas

**P1. João, 38 anos, catador do litoral (persona primária)**
Coleta casca em praias e orla. Usa smartphone intermediário, conectividade instável e pouca familiaridade com criptomoedas. Quer saber, em uma tela só, quantos quilos entregou e quanto vai cair no Pix. Meta: ter o dinheiro no mesmo dia. Frustração: burocracia, espera e aplicativos confusos.

**P2. Mariana, 26 anos, garçom de beach club (persona secundária)**
Separa a casca dos clientes no contentor do estabelecimento. Precisa registrar a deposição em poucos toques, entre atendimentos. Quer reconhecimento pelo gesto correto (pontos/selo da casa). Frustração: qualquer processo com mais de 30 segundos.

**P3. Carlos, 45 anos, transportador / triador**
Leva os lotes da orla para a indústria. Precisa registrar saída e chegada com leitura de QR/NFC, sem parar o veículo por muito tempo. Quer prova de que entregou (comprovante no app). Frustração: perda de carga e discussões sobre quantidade entregue.

**P4. Ana, 34 anos, compradora de indústria de compostagem e briquetes**
Gerencia a compra de insumo e a conformidade. Quer filtrar lotes por quantidade, região e qualidade, comprar com QR copia-e-cola e baixar relatório de custódia para auditoria. Frustração: não ter prova documental da origem do que comprou.

**P5. Roberto, 50 anos, auditor ESG / certificador**
Não é usuário diário; acessa a plataforma em eventos de auditoria. Quer percorrer o lote do depósito a destinação, conferir assinaturas e exportar evidências. Frustração: dados em planilhas sem cadeia de custódia verificável.

**P6. Lucia, 30 anos, administradora da plataforma**
Gerencia usuários, chaves Pix, papéis (incluindo ORACLE_ROLE) e alternancia entre sandbox e produção. Quer observabilidade: fila de pagamentos, falhas de webhook e conciliação. Frustração: transações duplicadas e silencio após erros.

### 2.5 Recursos principais observados

1. Cadastro simples com carteira abstraída (Account Abstraction) e login sem atrito.
2. Identificação física do lote com etiqueta NFC, QR impresso e balança Bluetooth.
3. Registro anti-fraude: o app assina origem, peso, GPS e horário da coleta.
4. Livro de pagamentos em blockchain (PaymentLedger) com estados PENDING e PAID.
5. Liquidação Pix rápida via Efipay (cash-out ao catador).
6. Cobranca B2B com QR copia-e-cola (cash-in da indústria).
7. Webhook com HMAC e lista de IPs permitidos, com idempotência obrigatória.
8. Portais: Coleta, Saque e Indústria (React 19 na Vercel).
9. Marketplace de briquetes (BriquetteMarket) e selos ESG soulbound.
10. Trilha de auditoria exportável e consulta pública de rastreio por QR.

### 2.6 Escopo do sistema

#### 2.6.1 Escopo incluso (versão 1.0 / MVP)

- Cadastro, autenticação e gestão de papéis dos seis perfis.
- Registro de lotes com IoT de baixo custo (NFC + balança BLE) e QR manual como contingência.
- Contratos PaymentLedger, CoconutRegistry, CocoAsset, BriquetteMarket e SustainabilityNFT.
- Integração completa Pix pela Efipay: cash-out, cash-in e webhook, nos ambientes sandbox e produção.
- Backend no Railway (API REST, Signer ORACLE_ROLE, worker de retentativas, Postgres idempotente).
- Três portais web responsivos.
- Relatório de custódia e selo ESG por lote.
- Modo sandbox com cobranças automáticas de 0,01 a 10,00 reais.

#### 2.6.2 Exclusões de escopo (não fará parte da versão 1.0)

- Logística própria: veículos, galpões, compra e armazenamento de casca (modelo asset-light).
- Aplicativo nativo para iOS/Android; a versão 1.0 é web responsiva.
- Cotação de crédito de carbono em bolsa, negociação P2P de tokens e carteira de criptomoedas com custódia pela plataforma.
- Multi-idioma (versão 1.0 em português do Brasil) e multimoeda (apenas BRL via Pix).
- Modelagem preditiva de preços, roteirização otimizada de frota e marketplace de serviços de coleta.
- Emissão de notas fiscais eletrônicas pela plataforma (fica a cargo das partes, com apoio de dados exportáveis).
- KYC formal nível bancário, scoring de crédito e concessão de crédito ao catador.
- Suporte a outros PSPs além da Efipay.

#### 2.6.3 Restrições

- **Financeiro:** saques e cobranças exigem conta Efipay ativa, certificado .p12 e chaves Pix.
- **Regulatórias:** operação de produção depende de cadastro de chave Pix e de conformidade com o manual de segurança do Pix (HMAC, allowlist de IP, TLS).
- **Técnicas:** Ethereum mainnet impõe custo de gas por transação; o MVP confirma eventos em lote quando possível.
- **Dispositivos:** balanças e totems dependem de hardware disponível e pareamento Bluetooth no celular.
- **Rede:** regiões litorâneas com conectividade intermitente exigem operação offline com sincronização posterior.
- **Pessoas:** o usuário final não pode ser obrigado a entender blockchain; a abstração de carteira é obrigatória.
- **Tempo:** prazo de hackathon limita a profundidade de testes de carga e de homologação formal.

#### 2.6.4 Suposições

- Catadores possuem smartphone Android ou iOS com câmera e Bluetooth.
- A Efipay fornece sandbox estável e emite certificado .p12 ao projeto em tempo hábil.
- Indústrias compradoras aceitam receber evidências digitais em substituição a papel.
- A rede Sepolia espelha o comportamento de mainnet para os contratos usados.
- Pesos de referência (R$ 2,00 a R$ 3,00 por contentor, preços por quilo) são definidos pelo operador e configuráveis.
- O Signer mantém saldo de gas suficiente em mainnet e sua chave nunca é exposta.
- Não há obrigação de integração com ERP dos clientes na versão 1.0.

---

## 3. Requisitos funcionais

### 3.1 Identidade, acesso e papéis

| ID | Requisito | Prioridade |
|---|---|---|
| RF-01 | O sistema deve permitir cadastro de usuário com e-mail, nome, perfil e, quando aplicável, carteira Ethereum, utilizando Account Abstraction para não exigir do usuário a frase semente. | Must |
| RF-02 | O sistema deve autenticar usuários com sessão segura (token) e expiração configurável, com revogação imediata após logout. | Must |
| RF-03 | O sistema deve diferenciar os papéis: catador, garçom, transportador, indústria, auditor e administrador, aplicando autorização por papel em toda rota. | Must |
| RF-04 | O sistema deve manter o mapeamento entre usuário e endereço Ethereum para atribuir ORACLE_ROLE apenas ao Signer oficial da plataforma. | Must |
| RF-05 | O sistema pode convidar usuários por código/convite para vincular estabelecimento (garçom a um beach club, indústria a um contrato). | Should |

### 3.2 Coleta e identificação física (IoT)

| ID | Requisito | Prioridade |
|---|---|---|
| RF-06 | O sistema deve registrar um lote de casca com: origem (GPS ou ponto fixo), peso, horário, coletor responsável e indústria destino prevista. | Must |
| RF-07 | O sistema deve suportar pareamento de etiqueta NFC ao lote, leitura por aproximação e reemissão de QR de contingência quando a etiqueta falhar. | Must |
| RF-08 | O sistema deve consumir o peso de balança Bluetooth (BLE) sem digitação manual, sinalizando ao usuário a leitura concluída. | Should |
| RF-09 | O sistema deve assinar digitalmente o conjunto origem + peso + GPS + horário antes de qualquer registro on-chain, para prevenir adulteração posterior. | Must |
| RF-10 | O sistema deve operar com conectividade intermitente: fila de eventos locais e sincronização automática ao recuperar rede, sem perda nem duplicidade. | Should |
| RF-11 | O sistema deve aceitar registro manual de lote (sem IoT) como caminho de contingência, marcado como origem "manual" na trilha. | Could |

### 3.3 Registro em blockchain

| ID | Requisito | Prioridade |
|---|---|---|
| RF-12 | O sistema deve registrar cada lote no CoconutRegistry com hash dos dados de coleta, mantendo consulta por identificador do lote. | Must |
| RF-13 | O sistema deve criar o pagamento no PaymentLedger com estado inicial PENDING, vinculado ao lote, ao valor e ao beneficiário (catador). | Must |
| RF-14 | O sistema deve transicionar PENDING para PAID somente via confirmPayment(paymentId, pixProof) executado por conta com ORACLE_ROLE, sendo pixProof igual ao endToEndId recebido da Efipay. | Must |
| RF-15 | O sistema deve registrar eventos de transporte e recebimento (saída e chegada) no livro de rastreio, com ator, horário e assinatura. | Should |
| RF-16 | O sistema deve emitir SustainabilityNFT (soulbound) de conformidade ao indústria que conclui o recebimento com trilha completa. | Should |
| RF-17 | O sistema deve publicar preços e disponibilidade de lotes no BriquetteMarket para compra pela indústria. | Could |
| RF-18 | O sistema deve expor consulta pública de rastreio por QR do lote, sem exigir login, mostrando apenas dados não sensíveis. | Should |

### 3.4 Pagamentos Pix (Efipay)

| ID | Requisito | Prioridade |
|---|---|---|
| RF-19 | O sistema deve autenticar na API Efipay com OAuth2 (client_credentials), Basic Auth e certificado .p12 (mTLS), renovando o token antes do vencimento. | Must |
| RF-20 | O sistema deve executar cash-out (POST /v2/pix) após solicitação de saque do catador, validando saldo/limite e chave Pix de destino. | Must |
| RF-21 | O sistema deve gerar cobrança cash-in (POST /v2/cob) com QR copia-e-cola para a indústria, com vencimento e identificador (txid) único. | Must |
| RF-22 | O sistema deve receber o webhook da Efipay (POST para /pix), validar a assinatura HMAC na URL e a lista de IPs permitidos, e responder rápido (ack) antes do processamento pesado. | Must |
| RF-23 | O sistema deve ser idempotente em todos os pontos financeiros: a mesma chave de idempotência (paymentId ou txid) nunca gera dois efeitos. | Must |
| RF-24 | O sistema deve manter fila outbox com retentativas progressivas (timeout de 60 s, até 9 tentativas) para envio e conciliação de operações Pix. | Must |
| RF-25 | O sistema deve manter o Signer com ORACLE_ROLE capaz de chamar confirmPayment somente após confirmação efetiva do Pix (webhook ou consulta). | Must |
| RF-26 | O sistema deve operar em dois ambientes configuráveis por variáveis de ambiente: sandbox (pix-h) e produção (pix.api), sem alteração de código. | Must |
| RF-27 | O sistema deve expor ao administrador o painel de conciliação: pagamentos PENDING, tentativas, falhas e reconciliação automática. | Should |

### 3.5 Portais e experiência

| ID | Requisito | Prioridade |
|---|---|---|
| RF-28 | O sistema deve disponibilizar o portal Coleta com cadastro de lote, leitura NFC/QR e status do envio em até 3 toques. | Must |
| RF-29 | O sistema deve disponibilizar o portal Saque com saldo disponível, solicitação de saque Pix, histórico de pagamentos e comprovante (endToEndId). | Must |
| RF-30 | O sistema deve disponibilizar o portal Indústria com busca e filtros de lotes (região, quantidade, qualidade, data), compra e histórico. | Must |
| RF-31 | O sistema deve notificar o usuário sobre mudanças de estado (lote aceito, pagamento confirmado, cobrança liquidada) por e-mail ou push in-app. | Should |
| RF-32 | O sistema deve exibir ao garçom confirmação visual de depósito em menos de 30 s, com contagem do contentor do dia. | Must |
| RF-33 | O sistema deve exportar relatório de custódia (CSV e PDF) com trilha completa de um lote ou de um período. | Must |

### 3.6 Gestão da plataforma

| ID | Requisito | Prioridade |
|---|---|---|
| RF-34 | O sistema deve registrar trilha de auditoria (quem, o que, quando, de onde) para toda ação administrativa sensível. | Must |
| RF-35 | O sistema deve permitir ao administrador ativar/desativar usuários, ajustar preços por quilo e configurar limites de saque. | Must |
| RF-36 | O sistema deve expor indicadores operacionais: lotes/dia, quilos/dia, pagamentos líquidos e tempo médio do lote ao Pix. | Should |
| RF-37 | O sistema deve manter ambientes separados (homologação em Sepolia + sandbox; produção em mainnet + Efipay produção) com dados isolados. | Must |
| RF-38 | O sistema deve revogar ORACLE_ROLE de qualquer endereço fora do Signer oficial em inicialização de produção (o setup atual concede ao deployer). | Must |

---

## 4. Requisitos não funcionais

### 4.1 Desempenho

| ID | Requisito | Critério |
|---|---|---|
| RNF-01 | Tempo de resposta da API em operações comuns | p95 menor que 800 ms |
| RNF-02 | Latência do fluxo saque solicitado até resposta da Efipay | p95 menor que 3 s, excluindo tempo do banco |
| RNF-03 | Renderização dos portais (First Contentful Paint) | menor que 2,5 s em 4G |
| RNF-04 | Suporte a picos do MVP | 100 usuários simultâneos sem degradação relevante |

### 4.2 Segurança

| ID | Requisito | Critério |
|---|---|---|
| RNF-05 | Todo o tráfego usa TLS 1.2 ou superior; a Efipay exige mTLS com .p12 | sem exceções |
| RNF-06 | Nenhuma chave secreta (Efipay, Signer, banco) em código ou frontend | variáveis de ambiente / cofre |
| RNF-07 | Webhook autenticado por HMAC e allowlist de IP | rejeição de payload inválido |
| RNF-08 | ORACLE_ROLE somente no Signer oficial; revisão de permissões em todo deploy | checklist obrigatório |
| RNF-09 | Proteção contra replay, duplicidade e corrida em endpoints financeiros | idempotência + trava por chave |
| RNF-10 | Senhas e tokens guardados com hashing/criptografia adequados | sem texto puro no banco |
| RNF-11 | Rate limiting nos endpoints públicos e no webhook | política configurável |
| RNF-12 | Revisão de dependências e SAST na pipeline de build | zero vulnerabilidades críticas |

### 4.3 Disponibilidade e confiabilidade

| ID | Requisito | Critério |
|---|---|---|
| RNF-13 | Disponibilidade anual da API no MVP | 99,0% (janelas de manutenção comunicadas) |
| RNF-14 | Nenhum pagamento executado mais de uma vez | 0 duplicidades em homologação |
| RNF-15 | Recuperação após falha | retomada automática da outbox sem perda |
| RNF-16 | Backups do banco Postgres | diário com retenção de 30 dias, restauração testada |

### 4.4 Usabilidade e acessibilidade

| ID | Requisito | Critério |
|---|---|---|
| RNF-17 | Fluxo de coleta completo em até 3 toques | validado com 5 usuários reais |
| RNF-18 | Interfaces compreendidas sem treinamento formal | 80% de tarefas concluídas sem ajuda |
| RNF-19 | Contraste, alvo de toque e leitura de texto | WCAG 2.1 nível AA nos fluxos críticos |
| RNF-20 | Dispositivos mínimos | Android 10+, iOS 15+, Chrome/Firefox/Safari atuais |
| RNF-21 | Modo de baixa conectividade com feedback claro de pendências | nunca sem estado visível |

### 4.5 Conformidade legal e regulatória

| ID | Requisito | Critério |
|---|---|---|
| RNF-22 | Tratamento de dados pessoais conforme LGPD | base legal e mínimo necessário |
| RNF-23 | Dados financeiros conforme manual de segurança do Pix | HMAC, allowlist, log de eventos |
| RNF-24 | Evidências atendem a PNRS e apoiam RenovaBio, CORSIA e ISCC | relatório de custódia aprovado em revisão |
| RNF-25 | Publicação de política de privacidade e termos de uso acessíveis | links nos portais |

### 4.6 Operação, escalabilidade e manutenibilidade

| ID | Requisito | Critério |
|---|---|---|
| RNF-26 | Deploy reproduzível por variáveis de ambiente | mesma config roda sandbox e produção |
| RNF-27 | Observabilidade | logs estruturados, métricas de fila e alertas de falha Pix |
| RNF-28 | Versionamento de contratos | endereços registrados por rede, sem upgrade silencioso |
| RNF-29 | Custo de gas controlado | confirmações em lote quando a taxa estiver alta |
| RNF-30 | Estrutura de testes | cobertura mínima de 70% no backend e suíte E2E do fluxo Pix |

---

## 5. Histórias de usuário

Formato de cada história: Carta (quem é o que quer), Conversa (diálogo que revela a necessidade durante a interação com o sistema) e Confirmação (evidência observável de que a necessidade foi atendida).

**HU-01 | Catador cadastra lote com etiqueta NFC**
- Carta: Como catador, quero cadastrar um lote de casca lendo a etiqueta NFC, para que minha coleta fique registrada sem digitar dados.
- Conversa: Durante a interação com o sistema, o catador aproxima o celular da etiqueta do balaio, vê o peso chegar da balança e percebe que não precisou escrever nada.
- Confirmação: O catador ve o lote criado com origem, peso, horário e seu nome, e recebe um comprovante com o QR do lote.

**HU-02 | Garçom registra depósito no contentor**
- Carta: Como garçom, quero registrar a deposição da casca em poucos toques, para não atrasar meu atendimento.
- Conversa: Durante o serviço, o garçom abre o portal, escolhe o contentor e confirma; o sistema mostra a contagem do dia e agradecimento.
- Confirmação: O depósito aparece no painel do estabelecimento em menos de 30 segundos, contabilizado no total do dia.

**HU-03 | Catador solicita saque Pix**
- Carta: Como catador, quero solicitar o saque do saldo para a minha chave Pix, para receber o dinheiro na hora.
- Conversa: Ao abrir o portal Saque, o catador vê o saldo, digita o valor, confirma e o sistema informa que o Pix foi solicitado.
- Confirmação: O catador recebe o Pix na conta e encontra o comprovante com endToEndId no histórico.

**HU-04 | Pagamento confirmado uma única vez**
- Carta: Como a plataforma, devemos confirmar o pagamento no contrato apenas uma vez, para nunca pagar em dobro.
- Conversa: Quando o webhook da Efipay chega repetido por retransmissão, o sistema reconhece a idempotência e não gera nova confirmação.
- Confirmação: O PaymentLedger mostra exatamente uma transição de PENDING para PAID para aquele paymentId, com log da duplicata descartada.

**HU-05 | Indústria compra um lote**
- Carta: Como compradora de indústria, quero buscar lotes por região e quantidade e comprar via QR copia-e-cola, para abastecer minha planta com origem comprovada.
- Conversa: Ana filtra lotes em Sousa com 500 kg, escolhe um, paga com o QR do banco e o sistema avisa "cobrança liquidada".
- Confirmação: O lote muda para recebido, o catador correspondente recebe o saque, e Ana baixa o relatório de custódia.

**HU-06 | Auditor percorre a cadeia de custódia**
- Carta: Como auditor, quero rastrear um lote do depósito a destinação, para emitir meu parecer.
- Conversa: Roberto lê o QR do lote, ve a sequência de eventos assinados (coleta, transporte, recebimento, pagamento) e procura inconsistências.
- Confirmação: O relatório exportado contém a trilha completa com hashes e o sistema não encontrou lacunas.

**HU-07 | Transportador registra saída e chegada**
- Carta: Como transportador, quero registrar a saída e a chegada de um lote lendo o QR, para ter prova da entrega.
- Conversa: No embarque, Carlos escaneia o lote e o app confirma a saída; na indústria, repete a leitura e ve "entrega confirmada".
- Confirmação: Os dois eventos aparecem na trilha com horário, local e assinatura, e o comprovante fica disponível no app.

**HU-08 | Administradora alterna ambientes**
- Carta: Como administradora, quero alternar entre sandbox e produção por configuração, para testar sem risco.
- Conversa: Lucia alterna a variável de ambiente, reinicia o serviço e o sistema passa a apontar para a Efipay de teste, sem mudar código.
- Confirmação: O painel mostra o ambiente ativo e uma cobrança de teste de 0,01 real é liquidada no sandbox.

**HU-09 | Indústria emite relatório ESG**
- Carta: Como indústria, quero gerar um relatório ESG do período, para apresentar a clientes e certificadores.
- Conversa: Ana seleciona o mês, o sistema consolida quilos, destinos e créditos, e apresenta o selo soulbound do período.
- Confirmação: O relatório (PDF/CSV) é gerado com os totais conferidos com a trilha de custódia.

**HU-10 | Pessoa consulta rastreabilidade pública**
- Carta: Como qualquer pessoa, quero escanear o QR de um produto com casca rastreada, para ver a origem dele.
- Conversa: O usuário abre o link público, vê a linha do tempo do lote e a nota de conformidade, sem precisar criar conta.
- Confirmação: A página pública carrega em menos de 2,5 s e exibe origem, eventos e selo, sem expor dados sensíveis.

---

## 6. Critérios de aceitação do produto

O produto é considerado aceito quando todos os critérios abaixo forem demonstrados em ambiente de homologação (Sepolia + Efipay sandbox), com evidência gravada ou documentada.

| ID | Critério de aceitação | Evidência |
|---|---|---|
| CE-01 | Fluxo completo cash-out: coleta registrada, pagamento criado (PENDING), saque solicitado, Pix confirmado pela Efipay e contraparte transicionada para PAID com endToEndId | Vídeo ou log da demo + estado do contrato |
| CE-02 | Fluxo completo cash-in: cobrança gerada com QR, pagamento da indústria liquidado, lote marcado como recebido | Log da API + estado no portal |
| CE-03 | Webhook inválido (HMAC errado ou IP fora da allowlist) é rejeitado; webhook repetido não duplica efeito | Relatório de testes de segurança |
| CE-04 | Registro anti-fraude: alteração manual do peso após assinatura invalida o aceite do lote | Teste negativo documentado |
| CE-05 | Coleta com rede intermitente: evento offline sincroniza sem duplicar | Log da fila local |
| CE-06 | Os três portais operam em celular e desktop nos navegadores-alvo sem quebra de layout | Checklist de matriz de compatibilidade |
| CE-07 | Relatório de custódia exportado contém trilha completa de um lote de ponta a ponta | Arquivo PDF/CSV de exemplo |
| CE-08 | Painel administrativo lista PENDING, falhas e permite reenvio controlado | Capturas + log |
| CE-09 | Nenhuma secreta presente no repositório nem no bundle do frontend | Saída de varredura de segurança |
| CE-10 | 100% das histórias de usuário marcadas como validadas pelo respectivo persona (ou justificadas) | Matriz HU aceita |
| CE-11 | Cobertura de testes do backend >= 70% e suíte E2E do fluxo Pix verde | Relatório de cobertura |
| CE-12 | Requisitos não funcionais críticos (RNF-05 a RNF-09, RNF-14) verificados sem exceção | Checklist de V&V assinado |

---

## 7. Critérios de validação dos requisitos (V&V)

### 7.1 Verificação (estamos construindo o produto certo internamente?)

| ID | Atividade | Método | Saída esperada | Quando |
|---|---|---|---|---|
| VV-01 | Revisão do documento de requisitos | Inspeção estruturada com checklist (ambiguidade, completude, rastreabilidade, consistência) | Lista de defeitos com severidade e correções | Antes do início do desenvolvimento |
| VV-02 | Revisão de arquitetura e contratos contra os RF | Walkthrough técnico RF por RF | Registro de aderência ou justificativa de desvio | Após o design |
| VV-03 | Revisão de código | Pull request com mínimo 1 revisor + checagem automática | Aprovação obrigatória antes do merge | Sempre |
| VV-04 | Testes unitários | Suíte automatizada (lógica de negócios, idempotência, validação HMAC) | >= 70% de cobertura | Contínuo |
| VV-05 | Testes de integração | Chamadas a Efipay em sandbox, banco, contratos em Sepolia | Contratos de API válidos | Contínuo |
| VV-06 | Testes ponta a ponta (E2E) | Fluxos cash-out e cash-in automatizados | Suíte verde em pipeline | Contínuo |
| VV-07 | Testes de segurança | Varredura de dependências, SAST, teste de webhook inválido, busca por segredos | Zero vulnerabilidades críticas | A cada release |
| VV-08 | Análise de cobertura de requisitos | Cada RF mapeado a pelo menos um teste ou revisão | Matriz RF-verificação completa | Antes da aceitação |

### 7.2 Validação (o produto atende a necessidade real do usuário?)

| ID | Atividade | Método | Saída esperada | Quando |
|---|---|---|---|---|
| VV-09 | Revisão com stakeholders | Apresentação do documento e do protótipo com registro de decisões | Minuta aprovada com pendências listadas | Início e fim do projeto |
| VV-10 | Prototipagem navegável | Validação dos três portais com personas convidadas | Ajustes priorizados | Após a primeira UI |
| VV-11 | Teste de usabilidade | 5 participantes executam as tarefas das HU com observação | >= 80% de sucesso sem ajuda (RNF-18) | Antes da aceitação |
| VV-12 | Homologação operacional | Execução do CE-01 ao CE-12 em sandbox com dados realistas | Relatório de aceitação assinado | Antes da demo final |
| VV-13 | Validação de conformidade | Revisão do relatório de custódia por persona auditor (P5) | Parecer de aderência a PNRS/RenovaBio/CORSIA/ISCC | Antes da aceitação |
| VV-14 | Pos-entrega | Coleta de feedback na demo e registro de melhorias | Backlog versionado 1.1 | Após a entrega |

### 7.3 Matriz de rastreabilidade resumida

| Grupo de RF | Histórias associadas | Verificação | Validação |
|---|---|---|---|
| RF-01 a RF-05 (identidade) | HU-01, HU-08 | VV-04, VV-05 | VV-10, VV-11 |
| RF-06 a RF-11 (coleta IoT) | HU-01, HU-02, HU-07 | VV-04, VV-06 | VV-11 |
| RF-12 a RF-18 (blockchain) | HU-04, HU-05, HU-06, HU-10 | VV-05, VV-06 | VV-12, VV-13 |
| RF-19 a RF-27 (Pix Efipay) | HU-03, HU-04, HU-05, HU-08 | VV-05, VV-06, VV-07 | VV-12 |
| RF-28 a RF-33 (portais) | HU-02, HU-03, HU-05, HU-09 | VV-06, VV-08 | VV-10, VV-11 |
| RF-34 a RF-38 (gestão) | HU-06, HU-08, HU-09 | VV-03, VV-07 | VV-13 |
| RNF (todos os grupos) | Todas | VV-04 a VV-08 | VV-11, VV-12 |

**Saída da V&V:** relatório de conformidade indicando, para cada RF e RNF, o método aplicado, o resultado (aprovado/reprovado) e as ações corretivas. A aceitação exige zero defeitos abertos de severidade crítica e alta.

---

## 8. Considerações finais

Este documento estabelece a base de entendimento do produto CoinConut para o ciclo de hackathon: domínio e escopo delimitados, requisitos identificados e rastreáveis, histórias de usuário no formato Carta, Conversa e Confirmação, critérios de aceitação objetivos e um plano de V&V executável com os recursos disponíveis.

Decisões registradas: PSP escolhido: a Efipay; backend próprio em Railway com Postgres; cobertura integral de cash-out e cash-in; diagrama de arquitetura entregue em versões completa e resumida; e o PDF pedagógico "A casa do COCO" como material de comunicação com público não técnico.

Riscos principais a monitorar: emissão e validade do certificado .p12, custo de gas em mainnet, confiabilidade do webhook (HMAC e allowlist) e a experiência de usuários com baixa conectividade. Recomenda-se revisar este documento após a homologação em sandbox e antes da virada para produção, atualizando identificadores e critérios conforme o produto evoluir.

---

## 9. Referências

1. Banco Central do Brasil. Manual de Segurança e Regras de Certificação do Pix. Disponível em: https://www.bcb.gov.br/estabilidadefinanceira/pix
2. Efipay. Documentação da API Pix (cob, pix, webhook, certificado .p12). Disponível em: https://dev.efipay.com.br/
3. Brasil. Lei nº 12.305/2010. Política Nacional de Resíduos Sólidos (PNRS).
4. Brasil. Decreto nº 9.809/2018. Regulamenta a Renovabio.
5. Brasil. Lei nº 13.709/2018. Lei Geral de Proteção de Dados Pessoais (LGPD).
6. OACI. CORSIA: Carbon Offsetting and Reduction Scheme for International Aviation.
7. ISCC. International Sustainability and Carbon Certification. Disponível em: https://iscc-system.org/
8. Ethereum Foundation. Documentação do protocolo e da rede Sepolia. Disponível em: https://ethereum.org/
9. OpenZeppelin. Padrões de contratos inteligentes e controle de acesso (Roles). Disponível em: https://docs.openzeppelin.com/
10. W3C. Web Content Accessibility Guidelines (WCAG) 2.1.
11. Projeto CoinConut. Documento de Arquitetura (docs/architecture/ARCHITECTURE.md).
12. Projeto CoinConut. Documento de Smart Contracts (docs/smart_contracts).
13. Projeto CoinConut. Diagramas de caso de uso, sequência e classes (docs/diagrams).
14. Projeto CoinConut. Diagnóstico Estratégico, Técnico e Operacional (documento da equipe).
