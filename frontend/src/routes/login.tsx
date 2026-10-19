import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Sprout, MapPin, Factory, ArrowRight, Loader2, Wallet } from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { useWeb3 } from "@/hooks/useWeb3";
import { toast } from "sonner";
import { motion } from "motion/react";

export const Route = createFileRoute("/login")({
  component: Login,
});

type Role = "coletor" | "ponto_coleta" | "industria" | null;

const roles = [
  {
    id: "coletor" as Role,
    title: "Coletor",
    description: "Acompanhe suas entregas e receba pagamentos",
    icon: Sprout,
    route: "/dashboard",
  },
  {
    id: "ponto_coleta" as Role,
    title: "Ponto de Coleta",
    description: "Registre o recebimento de cascas de coco",
    icon: MapPin,
    route: "/coleta",
  },
  {
    id: "industria" as Role,
    title: "Indústria",
    description: "Certifique lotes e autorize pagamentos",
    icon: Factory,
    route: "/registrar",
  },
];

function Login() {
  const { account, isConnecting, connectWallet } = useWeb3();
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const router = useRouter();

  async function handleLogin() {
    if (!selectedRole) {
      toast.error("Por favor, selecione um perfil para entrar.");
      return;
    }

    const target = roles.find(r => r.id === selectedRole);
    if (!target) return;

    // Tenta conectar wallet em segundo plano se disponível, mas não bloqueia a entrada
    if (!account && typeof window !== "undefined" && (window as any).ethereum) {
      try {
        connectWallet();
      } catch {
        // Modo teste sem bloquear
      }
    }

    toast.success(`Entrando como ${target.title}`);
    setTimeout(() => {
      router.navigate({ to: target.route });
    }, 400);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 pt-24 sm:pt-28 pb-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          <div className="text-center mb-8 sm:mb-10">
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl mb-3">
              Acesso <span className="text-gradient-gold italic">Simples</span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Sem senhas complexas. Escolha seu perfil e entre com seu e-mail ou Google.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-5 sm:p-8 md:p-10 space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`p-5 rounded-2xl border text-left transition-all ${
                    selectedRole === role.id
                      ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                      : "border-border bg-secondary/30 hover:border-primary/40 hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <role.icon className={`size-8 mb-4 ${selectedRole === role.id ? "text-primary" : "opacity-70"}`} />
                  <h3 className={`font-display text-lg mb-1 ${selectedRole === role.id ? "text-foreground" : ""}`}>
                    {role.title}
                  </h3>
                  <p className="text-xs opacity-70 leading-relaxed">
                    {role.description}
                  </p>
                </button>
              ))}
            </div>

            <div className="pt-6 border-t border-border/50 max-w-sm mx-auto w-full">
              <div className="space-y-4">
                <input 
                  type="email" 
                  placeholder="Seu e-mail profissional" 
                  className="w-full px-4 py-3.5 rounded-xl border border-border bg-background focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  onClick={handleLogin}
                  disabled={!selectedRole}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-medium hover:scale-[1.02] transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  Continuar com E-mail
                </button>
                
                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-border"></div>
                  <span className="flex-shrink-0 mx-4 text-[10px] text-muted-foreground uppercase tracking-widest font-medium">ou</span>
                  <div className="flex-grow border-t border-border"></div>
                </div>

                <button
                  onClick={handleLogin}
                  disabled={!selectedRole}
                  className="w-full inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl border border-border bg-background text-foreground font-medium hover:bg-secondary/50 hover:scale-[1.02] transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <svg className="size-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continuar com Google
                </button>
              </div>
              
              <p className="text-center text-xs text-muted-foreground mt-6 leading-relaxed">
                Ambiente de testes liberado com Account Abstraction (ERC-4337).<br/>Escolha o perfil e acesse instantaneamente.
              </p>
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
