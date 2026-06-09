import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Globe, Leaf, Banknote, ShieldCheck, ExternalLink, Loader2, MapPin } from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { getRegistryContract, getPaymentLedgerContract } from "@/lib/web3/config";

export const Route = createFileRoute("/transparencia")({
  component: Transparencia,
});

function Transparencia() {
  const [kgReciclados, setKgReciclados] = useState<number | null>(null);
  const [dinheiroDistribuido, setDinheiroDistribuido] = useState<number | null>(null);
  const [pontosAtivos, setPontosAtivos] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPublicData() {
      try {
        // Conexão somente leitura usando um RPC público (não exige MetaMask)
        const publicProvider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");
        
        const registry = getRegistryContract(publicProvider);
        const ledger = getPaymentLedgerContract(publicProvider);

        // 1. Contar Pontos Ativos
        const cpCount = await registry.collectionPointCount();
        let activeCps = 0;
        for (let i = 1; i <= Number(cpCount); i++) {
          const cp = await registry.collectionPoints(i);
          if (cp.active) activeCps++;
        }
        setPontosAtivos(activeCps);

        // 2. Somar Kg Reciclados
        const dCount = await registry.deliveryCount();
        let totalGrams = 0;
        for (let i = 1; i <= Number(dCount); i++) {
          const d = await registry.deliveries(i);
          totalGrams += Number(d.weightGrams);
        }
        setKgReciclados(totalGrams / 1000);

        // 3. Somar Dinheiro Distribuído (PENDING e PAID)
        // O COINCONUT é rastreável: todo registro financeiro está no ledger
        const pCount = await ledger.paymentCount();
        let totalCents = 0;
        for (let i = 1; i <= Number(pCount); i++) {
          const p = await ledger.payments(i);
          totalCents += Number(p.amountCents);
        }
        setDinheiroDistribuido(totalCents / 100);

      } catch (err: any) {
        console.error("Erro ao buscar dados públicos:", err);
        setErrorMsg("Não foi possível carregar os dados da rede. O RPC pode estar congestionado.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchPublicData();
  }, []);

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-5xl mx-auto px-6 pt-28 pb-12">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-mono uppercase tracking-widest mb-4 border border-accent/20">
            <Globe className="size-3.5" /> Portal Explorer
          </div>
          <h1 className="font-display text-4xl md:text-6xl mb-6">
            Impacto <span className="text-gradient-gold italic">Auditável</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Os números abaixo são extraídos diretamente da blockchain Sepolia em tempo real.
            Nenhum servidor centralizado pode alterar ou falsificar esses dados.
            <br/><br/>
            <span className="text-sm italic opacity-70">
              *Nota: Os números apresentados nesta demonstração são meramente ilustrativos e utilizados apenas para fins de avaliação do Hackathon.
            </span>
          </p>
        </div>

        {errorMsg ? (
          <div className="text-center p-8 glass-card rounded-2xl border-red-500/20 bg-red-500/5 text-red-400">
            {errorMsg}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {/* Card Kg */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="glass-card rounded-2xl p-8 relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 size-32 rounded-full bg-moss/20 blur-3xl transition-transform group-hover:scale-150" />
              <Leaf className="size-8 text-moss mb-4" />
              <div className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-2">
                Volume Reciclado
              </div>
              <div className="font-display text-4xl md:text-5xl">
                {isLoading ? <Loader2 className="size-8 animate-spin text-muted-foreground" /> : `${kgReciclados?.toLocaleString("pt-BR")} kg`}
              </div>
              <div className="text-xs text-muted-foreground mt-3">
                De casca de coco transformada
              </div>
            </motion.div>

            {/* Card Financeiro */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="glass-card rounded-2xl p-8 relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 size-32 rounded-full bg-gold/20 blur-3xl transition-transform group-hover:scale-150" />
              <Banknote className="size-8 text-gold mb-4" />
              <div className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-2">
                Renda Distribuída
              </div>
              <div className="font-display text-4xl md:text-5xl">
                {isLoading ? <Loader2 className="size-8 animate-spin text-muted-foreground" /> : `R$ ${dinheiroDistribuido?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
              </div>
              <div className="text-xs text-muted-foreground mt-3">
                Pagos aos produtores rurais
              </div>
            </motion.div>

            {/* Card Rede */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="glass-card rounded-2xl p-8 relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 size-32 rounded-full bg-accent/20 blur-3xl transition-transform group-hover:scale-150" />
              <MapPin className="size-8 text-accent mb-4" />
              <div className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-2">
                Pontos de Coleta
              </div>
              <div className="font-display text-4xl md:text-5xl">
                {isLoading ? <Loader2 className="size-8 animate-spin text-muted-foreground" /> : pontosAtivos}
              </div>
              <div className="text-xs text-muted-foreground mt-3">
                Centros logísticos ativos na rede
              </div>
            </motion.div>
          </div>
        )}

        {/* Auditoria */}
        <div className="glass-card rounded-3xl p-8 md:p-12 text-center md:text-left flex flex-col md:flex-row items-center gap-8 border-gold/10">
          <div className="size-24 shrink-0 rounded-full bg-gradient-to-br from-gold/20 to-accent/20 grid place-items-center">
            <ShieldCheck className="size-10 text-gold" />
          </div>
          <div className="flex-1">
            <h3 className="font-display text-2xl mb-2">Governança Transparente</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              Qualquer governo, auditoria ou empresa financiadora (ESG) pode rodar o próprio nó (node) 
              da blockchain para verificar essas transações. Não precisamos de confiança ("Trustless"), precisamos de consenso.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="https://sepolia.etherscan.io/address/0xF6f39040a3dA724E466Eb31f9Da0EBc8Fc552E70" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-mono border border-border px-4 py-2 rounded-lg hover:border-gold/50 hover:text-gold transition">
                <ExternalLink className="size-3" /> Explorar Contrato Base
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
