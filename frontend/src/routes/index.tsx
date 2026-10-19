import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowRight, Sprout, Factory, Building2, Shield, Zap, Leaf, MapPin } from "lucide-react";
import heroImg from "../../../assets/hero-coconut.webp";
import briquettesImg from "../../../assets/briquettes.jpg";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/")({
  component: Landing,
});

const actors = [
  {
    icon: Sprout,
    name: "Produtor",
    role: "Entrega a casca de coco nos pontos de coleta e recebe o pagamento direto via PIX.",
    detail: "Sem cadastro complicado, sem taxa",
    color: "from-moss to-accent",
  },
  {
    icon: Factory,
    name: "Fábrica",
    role: "Compra a matéria-prima certificada e transforma em fibras, substrato, pó e briquetes ecológicos.",
    detail: "Rastreabilidade total da origem",
    color: "from-coconut to-gold",
  },
  {
    icon: Building2,
    name: "Compradora",
    role: "Adquire briquetes com certificado de origem sustentável e impacto social.",
    detail: "Produto com selo auditável",
    color: "from-primary to-primary",
  },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <Nav />

      {/* Hero */}
      <section className="relative pt-24 md:pt-32 pb-16 md:pb-24 overflow-hidden grain">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-16 items-center">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display text-4xl sm:text-5xl md:text-7xl leading-[1.05] md:leading-[0.95] tracking-tight"
            >
              A casca do coco<br />
              gera <span className="text-gradient-gold italic">renda real.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-4 md:mt-6 text-base sm:text-lg text-muted-foreground max-w-xl"
            >
              Do produtor no campo à fábrica de fibras, pó e briquetes o pagamento chega via PIX,
              a logística é rastreada e o produtor não paga nenhuma taxa.
              Tudo em <span className="text-foreground">uma única operação</span>.
            </motion.p>

            <div className="mt-8 md:mt-12 grid grid-cols-3 gap-3 sm:gap-6 max-w-lg">
              {[
                { k: "R$ 0", l: "custo para o produtor" },
                { k: "PIX", l: "pagamento imediato" },
                { k: "100%", l: "rastreável" },
              ].map((s, i) => (
                <motion.div
                  key={s.l}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.1 }}
                  className="p-3 sm:p-0 rounded-xl bg-secondary/30 sm:bg-transparent"
                >
                  <div className="font-display text-2xl sm:text-3xl text-gradient-gold">{s.k}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground mt-1 uppercase tracking-wider leading-snug">{s.l}</div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9 }}
            className="relative aspect-square rounded-3xl overflow-hidden glass-card"
          >
            <img src={heroImg} alt="Produtor separando casca de coco em ponto de coleta no Ceará" className="w-full h-full object-cover" width={1024} height={1024} />
          </motion.div>
        </div>
      </section>

      {/* Atores */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="max-w-2xl mb-10 md:mb-14">
          <div className="text-xs font-mono uppercase tracking-widest text-accent mb-3">Como funciona</div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl">Três participantes,<br />uma cadeia conectada.</h2>
          <p className="mt-4 text-muted-foreground text-sm sm:text-base">Cada entrega é registrada, cada pagamento é rastreado, cada briquete tem origem certificada.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {actors.map((a, i) => (
            <motion.div
              key={a.name}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="glass-card rounded-2xl p-6 sm:p-7 hover:border-gold/30 transition group"
            >
              <div className={`size-12 rounded-xl bg-gradient-to-br ${a.color} grid place-items-center mb-5`}>
                <a.icon className="size-6 text-background" strokeWidth={2} />
              </div>
              <div className="font-display text-xl sm:text-2xl">{a.name}</div>
              <p className="text-sm text-muted-foreground mt-2">{a.role}</p>
              <div className="mt-6 pt-5 border-t border-border/50 text-xs text-accent">
                {a.detail}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Fluxo da transformação */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="relative aspect-[4/5] rounded-3xl overflow-hidden glass-card order-2 lg:order-1"
          >
            <img src={briquettesImg} alt="Briquetes de coco sendo produzidos em fábrica brasileira" className="w-full h-full object-cover" loading="lazy" width={1024} height={1024} />
          </motion.div>
          <div className="order-1 lg:order-2">
            <div className="text-xs font-mono uppercase tracking-widest text-accent mb-3">O resíduo vira matéria-prima</div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl leading-tight">
              A fábrica transforma,<br />
              <span className="text-gradient-gold italic">o sistema registra.</span>
            </h2>
            <p className="mt-4 md:mt-6 text-muted-foreground text-base sm:text-lg">
              O Brasil é o 5º maior produtor de coco do mundo e o Ceará é o 2º maior estado produtor.
              Quando a fábrica transforma a casca em fibra, pó, chip ou briquete, a plataforma registra
              automaticamente a conversão do ativo e garante a rastreabilidade da origem ao produto final.
            </p>

            <div className="mt-8 md:mt-10 space-y-3">
              <FlowRow label="Casca de coco" amount="-1.000 kg" type="entrada" />
              <FlowRow label="Fibra, Pó e Chip de coco" amount="+450 kg" type="saida" />
              <FlowRow label="Pagamento" amount="R$ 3.200,00" type="pago" />
            </div>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {[
            { icon: Shield, t: "Login simples", d: "Acesso por e-mail ou Google. Sem senhas complexas, sem aplicativos extras." },
            { icon: Zap, t: "Zero custo para o produtor", d: "A plataforma absorve todos os custos operacionais. Produtor recebe o valor integral." },
            { icon: Leaf, t: "Bônus sustentabilidade", d: "Produtores que mantêm entregas regulares recebem bonificação automática." },
          ].map((f) => (
            <div key={f.t} className="glass-card rounded-2xl p-6 sm:p-7">
              <f.icon className="size-5 text-gold mb-4" />
              <div className="font-display text-lg sm:text-xl">{f.t}</div>
              <p className="text-sm text-muted-foreground mt-2">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="glass-card rounded-3xl p-8 sm:p-12 md:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-moss/10" />
          <div className="relative">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl">Pronto para começar?</h2>
            <p className="text-muted-foreground mt-4 text-sm sm:text-base max-w-xl mx-auto">
              Acesse a plataforma e veja como funciona — simule uma entrega de casca
              ou uma compra pela fábrica.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-primary text-primary-foreground font-medium gold-glow hover:scale-[1.02] transition"
              >
                Acessar a Plataforma
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function FlowRow({ label, amount, type }: { label: string; amount: string; type: "entrada" | "saida" | "pago" }) {
  const colors = {
    entrada: "text-amber-600 border-amber-600/30 bg-amber-600/10",
    saida: "text-accent border-accent/30 bg-accent/5",
    pago: "text-gold border-gold/30 bg-gold/5",
  } as const;
  const labels = { entrada: "baixa", saida: "produzido", pago: "pago" } as const;
  return (
    <div className="flex items-center justify-between p-4 rounded-xl glass-card">
      <span className="text-muted-foreground text-sm">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-sm">{amount}</span>
        <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase tracking-widest border ${colors[type]}`}>{labels[type]}</span>
      </div>
    </div>
  );
}
