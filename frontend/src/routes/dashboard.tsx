import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { Sprout, Factory, Package, ArrowUpRight, Activity, Leaf, Banknote, TrendingUp, Wifi, Loader2, Wallet } from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { useWeb3 } from "@/hooks/useWeb3";
import { getPaymentLedgerContract, getRegistryContract } from "@/lib/web3/config";
import { useEffect } from "react";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

// ── Dados mockados ─────────────────────────────────────────────────────────────

const produtorData = {
  nome: "Maria das Graças",
  saldo: 340.80,
  kgMes: 142,
  bonusVerde: 28.00,
  entregas: [
    { data: "28/mai", local: "Ponto Pindoretama, CE", kg: 80, valor: 192.00, status: "certificado" },
    { data: "21/mai", local: "Ponto Cascavel, CE", kg: 62, valor: 148.80, status: "certificado" },
    { data: "14/mai", local: "Ponto Pacajus, CE", kg: 45, valor: 108.00, status: "certificado" },
    { data: "07/mai", local: "Ponto Pindoretama, CE", kg: 90, valor: 216.00, status: "certificado" },
  ],
};

// Limpamos os mocks do agente e fábrica, pois eles têm telas próprias agora

// ── Componentes auxiliares ─────────────────────────────────────────────────────

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
      <div className={`absolute -top-10 -right-10 size-36 rounded-full ${color} opacity-20 blur-2xl`} />
      <div className="relative">
        <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="mt-3 font-display text-3xl">{value}</div>
        {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
      </div>
    </div>
  );
}

// ── Views por papel ────────────────────────────────────────────────────────────

function ProdutorView() {
  const { account, signer, connectWallet, isConnecting } = useWeb3();
  const [saldoReal, setSaldoReal] = useState<number | null>(null);
  const [kgReal, setKgReal] = useState<number | null>(null);
  const [entregasReais, setEntregasReais] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!signer || !account) return;
      setIsLoading(true);
      try {
        const ledger = getPaymentLedgerContract(signer);
        const registry = getRegistryContract(signer);

        // Busca Saldo
        const pIds = await ledger.getSupplierPayments(account);
        let totalCents = 0;
        for (let i = 0; i < pIds.length; i++) {
          const payment = await ledger.payments(pIds[i]);
          if (Number(payment.status) === 0) totalCents += Number(payment.amountCents);
        }
        setSaldoReal(totalCents / 100);

        // Busca Entregas
        const dIds = await registry.getSupplierDeliveries(account);
        let totalKg = 0;
        const entregas = [];
        // Pega as últimas 5
        const start = Math.max(0, dIds.length - 5);
        for (let i = dIds.length - 1; i >= start; i--) {
          const d = await registry.deliveries(dIds[i]);
          const kg = Number(d.weightGrams) / 1000;
          totalKg += kg;
          
          const date = new Date(Number(d.timestamp) * 1000);
          entregas.push({
            data: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
            local: `Ponto #${d.collectionPointId}`,
            kg: kg,
            valor: Number(d.amountCents) / 100,
            status: "certificado"
          });
        }
        setKgReal(totalKg);
        setEntregasReais(entregas);
      } catch (err) {
        console.error("Erro ao buscar dados do produtor:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [signer, account]);

  const d = produtorData;
  
  // Se estiver conectado, usa dados reais. Senão, usa os mockados para demonstração.
  const isReal = !!account;
  const saldoFinal = isReal && saldoReal !== null ? saldoReal : d.saldo;
  const kgFinal = isReal && kgReal !== null ? kgReal : d.kgMes;
  const entregasFinais = isReal && entregasReais.length > 0 ? entregasReais : d.entregas;

  return (
    <div>
      <div className="flex items-start sm:items-end justify-between flex-col sm:flex-row gap-4 mb-8">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-accent mb-2">Sua conta</div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl">Olá, <span className="text-gradient-gold italic">{isReal ? "Produtor(a)" : d.nome}</span> 👋</h1>
          {!isReal && (
            <button onClick={connectWallet} disabled={isConnecting} className="mt-3 text-xs flex items-center gap-2 text-muted-foreground hover:text-gold transition border border-border px-3 py-1.5 rounded-full">
              {isConnecting ? <Loader2 className="size-3 animate-spin"/> : <Wallet className="size-3"/>}
              Conectar carteira para dados reais
            </button>
          )}
        </div>
        <Link to="/saque" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-primary text-primary-foreground font-medium gold-glow">
          Sacar via PIX <ArrowUpRight className="size-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <StatCard label={isReal && isLoading ? "Carregando..." : "Disponível para saque"} value={`R$ ${saldoFinal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} sub="Clique em 'Sacar via PIX'" color="bg-gradient-to-br from-gold to-coconut" />
        <StatCard label={isReal && isLoading ? "Carregando..." : "Entregas on-chain"} value={`${kgFinal} kg`} sub="de casca certificada" color="bg-gradient-to-br from-moss to-accent" />
        <StatCard label="Bônus Verde" value={`R$ ${d.bonusVerde.toFixed(2)}`} sub="Sustentabilidade acumulada" color="bg-gradient-to-br from-accent to-moss" />
      </div>

      <div className="glass-card rounded-2xl p-5 sm:p-6">
        <h2 className="font-display text-lg sm:text-xl mb-5 flex items-center gap-2">
          <Leaf className="size-4 text-accent" /> 
          Suas entregas recentes {isReal && <span className="text-[10px] font-mono px-2 py-0.5 bg-accent/20 text-accent rounded uppercase">Ao vivo na rede</span>}
        </h2>
        <div className="space-y-2">
          {entregasFinais.map((e, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl hover:bg-secondary/40 transition border border-transparent hover:border-border">
              <div>
                <div className="text-sm font-medium">{e.local}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{e.data} · {e.kg} kg</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">R$ {e.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
                <div className="text-xs text-accent mt-0.5">✓ Certificado</div>
              </div>
            </motion.div>
          ))}
          {isReal && entregasFinais.length === 0 && !isLoading && (
            <div className="text-center py-6 text-sm text-muted-foreground italic">Nenhuma entrega registrada ainda.</div>
          )}
        </div>
      </div>
    </div>
  );
}



// ── Componente principal ────────────────────────────────────────────────────────

function Dashboard() {
  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        <ProdutorView />
      </main>
      <Footer />
    </div>
  );
}
