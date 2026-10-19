import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import {
  Smartphone,
  Mail,
  Hash,
  CreditCard,
  Check,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Wallet,
} from "lucide-react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { useWeb3 } from "@/hooks/useWeb3";
import { getPaymentLedgerContract } from "@/lib/web3/config";

export const Route = createFileRoute("/saque")({
  component: Saque,
});

type PixType = "cpf" | "telefone" | "email" | "aleatoria";
type Stage = "idle" | "confirmando" | "processando" | "concluido";

const pixTypes: { key: PixType; label: string; icon: React.ElementType; placeholder: string }[] = [
  { key: "cpf", label: "CPF", icon: CreditCard, placeholder: "000.000.000-00" },
  { key: "telefone", label: "Telefone", icon: Smartphone, placeholder: "+55 (85) 99999-9999" },
  { key: "email", label: "E-mail", icon: Mail, placeholder: "seu@email.com" },
  { key: "aleatoria", label: "Aleatória", icon: Hash, placeholder: "Chave aleatória" },
];

function Saque() {
  const { account, signer, isConnecting, connectWallet } = useWeb3();
  const [pixType, setPixType] = useState<PixType>("cpf");
  const [pixKey, setPixKey] = useState("");
  const [stage, setStage] = useState<Stage>("idle");
  const [saldoCents, setSaldoCents] = useState<number | null>(null);
  const [pendingPaymentsIds, setPendingPaymentsIds] = useState<number[]>([]);
  const [isSimulatingOracle, setIsSimulatingOracle] = useState(false);

  // Carrega o saldo real pendente do PaymentLedger
  useEffect(() => {
    async function fetchBalance() {
      if (!signer || !account) return;
      try {
        const ledger = getPaymentLedgerContract(signer);
        const pIds = await ledger.getSupplierPayments(account);
        
        let totalCents = 0;
        const pendings = [];
        
        for (let i = 0; i < pIds.length; i++) {
          const payment = await ledger.payments(pIds[i]);
          // status 0 = PENDING
          if (Number(payment.status) === 0) {
            totalCents += Number(payment.amountCents);
            pendings.push(Number(pIds[i]));
          }
        }
        
        setSaldoCents(totalCents);
        setPendingPaymentsIds(pendings);
      } catch (err) {
        console.error("Erro ao buscar saldo:", err);
      }
    }
    fetchBalance();
  }, [signer, account, stage]);

  const saldoBRL = saldoCents !== null ? saldoCents / 100 : 0;
  const [amount, setAmount] = useState("");

  // Atualiza o input de amount quando o saldo carregar
  useEffect(() => {
    if (saldoBRL > 0) setAmount(saldoBRL.toFixed(2));
  }, [saldoBRL]);

  const amountNum = parseFloat(amount) || 0;
  const isValid = pixKey.length > 3 && amountNum > 0 && amountNum <= saldoBRL;
  const selected = pixTypes.find((p) => p.key === pixType)!;

  function handlePixKeyChange(value: string) {
    if (pixType === "cpf") {
      let v = value.replace(/\D/g, "").slice(0, 11);
      v = v.replace(/(\d{3})(\d)/, "$1.$2");
      v = v.replace(/(\d{3})(\d)/, "$1.$2");
      v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
      setPixKey(v);
    } else if (pixType === "telefone") {
      let v = value.replace(/\D/g, "").slice(0, 11);
      v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
      v = v.replace(/(\d{5})(\d)/, "$1-$2");
      setPixKey(v);
    } else {
      setPixKey(value);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    
    setStage("confirmando");
    const tId = toast.loading("Verificando limites e dados do PIX...", { description: "Conectando ao sistema bancário" });
    await new Promise((r) => setTimeout(r, 1500));
    
    setStage("processando");
    toast.loading("Processando transferência via PIX...", { id: tId, description: "Aguarde alguns segundos" });
    await new Promise((r) => setTimeout(r, 2500));
    
    setStage("concluido");
    toast.success("PIX enviado com sucesso!", { id: tId });
    
    // Dispara a chuva de confetes
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFE175', '#A5E289', '#FFFFFF']
    });
  }

  async function simulateOracle() {
    if (!signer || pendingPaymentsIds.length === 0) return;
    try {
      setIsSimulatingOracle(true);
      const ledger = getPaymentLedgerContract(signer);
      const tId = toast.loading("Oráculo PIX: Confirmando pagamentos on-chain...", { description: "Chamando ledger.confirmPayment()" });
      
      // Confirma todos os pagamentos pendentes passando o Comprovante (pixProof)
      for (const pId of pendingPaymentsIds) {
        const tx = await ledger.confirmPayment(pId, "COMPROVANTE_PIX_PITCH_DEMO");
        await tx.wait();
      }
      
      toast.success("Oráculo PIX: Status atualizado para PAID!", { id: tId });
      setStage("concluido");
      setSaldoCents(0);
      setPendingPaymentsIds([]);
      setAmount("");
      
      confetti({
        particleCount: 200,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#FFE175', '#A5E289', '#FFFFFF']
      });
    } catch (err: any) {
      console.error(err);
      toast.error("Oráculo PIX falhou: " + (err.reason || err.message));
    } finally {
      setIsSimulatingOracle(false);
    }
  }

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-12">
        <div className="text-xs font-mono uppercase tracking-widest text-accent mb-3">
          Saque · Produtor
        </div>
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl mb-6 sm:mb-10">
          Receber <span className="text-gradient-gold italic">via PIX</span>
        </h1>

        <AnimatePresence mode="wait">
          {stage !== "concluido" ? (
            <motion.div key="form" className="space-y-5">

              {/* Saldo */}
              <div className="glass-card rounded-2xl p-5 sm:p-7 relative overflow-hidden">
                <div className="absolute -top-12 -right-12 size-40 rounded-full bg-gradient-to-br from-gold to-coconut opacity-20 blur-2xl" />
                <div className="relative">
                  {!account ? (
                    <div className="py-6 text-center">
                      <Wallet className="size-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                      <p className="text-sm text-muted-foreground mb-4">Conecte sua carteira para ver seu saldo on-chain</p>
                      <button onClick={connectWallet} disabled={isConnecting} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-secondary border border-border text-sm hover:bg-secondary/80 transition">
                        {isConnecting ? <Loader2 className="size-4 animate-spin"/> : "Conectar MetaMask"}
                      </button>
                    </div>
                  ) : saldoCents === null ? (
                    <div className="py-6 flex items-center gap-3 text-muted-foreground">
                      <Loader2 className="size-5 animate-spin" />
                      <span className="text-sm">Lendo livro razão na blockchain...</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">
                        Disponível para saque
                      </div>
                      <div className="font-display text-3xl sm:text-5xl text-gradient-gold mt-2">
                        R$ {saldoBRL.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-xs text-muted-foreground mt-3">
                        Referente a {pendingPaymentsIds.length} entrega(s) certificada(s) pendente(s)
                      </div>
                    </>
                  )}
                </div>
              </div>

              <form onSubmit={submit} className={`space-y-5 ${!account || saldoBRL === 0 ? "opacity-50 pointer-events-none" : ""}`}>
                {/* Tipo de chave */}
                <div className="glass-card rounded-2xl p-5 sm:p-7">
                  <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground block mb-4">
                    Tipo de chave PIX
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                    {pixTypes.map((p) => (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => {
                          setPixType(p.key);
                          setPixKey("");
                        }}
                        className={`p-2.5 sm:p-3 rounded-xl border text-center text-xs sm:text-sm transition ${
                          pixType === p.key
                            ? "border-gold/60 bg-gold/5 text-foreground font-medium"
                            : "border-border bg-secondary/30 text-muted-foreground hover:border-border/80"
                        }`}
                      >
                        <p.icon className="size-4 mx-auto mb-1.5" />
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder={selected.placeholder}
                    value={pixKey}
                    onChange={(e) => handlePixKeyChange(e.target.value)}
                    className="w-full bg-secondary/40 border border-border rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-gold/60 transition"
                  />
                </div>

                {/* Valor */}
                <div className="glass-card rounded-2xl p-5 sm:p-7">
                  <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground block mb-3">
                    Valor a sacar
                  </label>
                  <div className="flex items-center gap-3">
                    <span className="font-display text-xl sm:text-2xl text-muted-foreground">R$</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      step="0.01"
                      min="1"
                      max={saldoBRL}
                      className="flex-1 bg-secondary/40 border border-border rounded-xl px-4 py-3.5 font-display text-2xl focus:outline-none focus:border-gold/60 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setAmount(saldoBRL.toFixed(2))}
                      className="text-xs font-medium text-gold hover:underline"
                    >
                      Tudo
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!isValid || stage !== "idle"}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-primary text-primary-foreground font-medium gold-glow hover:scale-[1.01] transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {stage !== "idle" ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Processando...
                    </>
                  ) : (
                    <>
                      Confirmar saque <ArrowRight className="size-4" />
                    </>
                  )}
                </button>
                <p className="text-xs text-muted-foreground text-center -mt-2">
                  Sem taxas · Prazo estimado: até 10 minutos
                </p>
              </form>

              {/* Steps de progresso */}
              <AnimatePresence>
                {stage !== "idle" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-2xl p-6 space-y-4"
                  >
                    <StepRow done={(["processando", "concluido"] as string[]).includes(stage)} active={stage === "confirmando"} label="Confirmando sua identidade" />
                    <StepRow done={(stage as string) === "concluido"} active={stage === "processando"} label="Enviando para o banco" />
                    <StepRow done={false} active={false} label="PIX na sua conta" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-2xl p-10 text-center"
            >
              <div className="size-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-accent/20 to-gold/10 border border-accent/30 grid place-items-center">
                <CheckCircle2 className="size-10 text-accent" />
              </div>
              <h2 className="font-display text-3xl mb-2">PIX a caminho!</h2>
              <p className="text-muted-foreground mb-1">Você vai receber</p>
              <p className="font-display text-4xl text-gradient-gold mb-2">
                R$ {amountNum.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-muted-foreground mb-8">
                na chave <span className="text-foreground">{pixKey}</span> · em até 10 minutos
              </p>
              <div className="text-xs font-mono text-muted-foreground">
                Comprovante #{Math.random().toString(36).substring(2, 10).toUpperCase()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      

      <Footer />
    </div>
  );
}

function StepRow({ done, active, label }: { done: boolean; active: boolean; label: string }) {
  return (
    <div className="flex items-center gap-4">
      <div
        className={`size-8 rounded-full grid place-items-center shrink-0 border transition ${
          done
            ? "bg-accent/20 border-accent text-accent"
            : active
              ? "bg-gold/10 border-gold/60 text-gold"
              : "bg-secondary/40 border-border text-muted-foreground"
        }`}
      >
        {done ? (
          <Check className="size-4" />
        ) : active ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <span className="size-1.5 rounded-full bg-current" />
        )}
      </div>
      <span className={`text-sm ${done || active ? "text-foreground" : "text-muted-foreground"}`}>
        {label}
      </span>
    </div>
  );
}
