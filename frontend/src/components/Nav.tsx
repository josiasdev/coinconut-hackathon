import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";

export function Nav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setMobileMenuOpen(false)}>
          <img src="/logo.jpeg" alt="COINCONUT Logo" className="h-9 sm:h-10 w-auto object-contain mix-blend-multiply" />
          <span className="font-display text-lg sm:text-xl tracking-tight">
            COIN<span className="text-gradient-gold font-bold">CONUT</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-7 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors" activeOptions={{ exact: true }} activeProps={{ className: "text-foreground font-medium" }}>
              Início
            </Link>
            <Link to="/transparencia" className="text-muted-foreground hover:text-foreground transition-colors" activeProps={{ className: "text-foreground font-medium" }}>
              Portal de Transparência
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
            >
              Entrar
            </Link>
          </div>
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <Link
            to="/login"
            className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Entrar
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-foreground hover:bg-secondary/60 transition-colors focus:outline-none"
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border/60 bg-background/95 backdrop-blur-2xl px-6 py-4 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm text-foreground hover:text-primary transition-colors font-medium"
            activeOptions={{ exact: true }}
          >
            Início
          </Link>
          <Link
            to="/transparencia"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm text-foreground hover:text-primary transition-colors font-medium"
          >
            Portal de Transparência
          </Link>
          <div className="pt-2 border-t border-border/40">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium"
            >
              Acessar Plataforma
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

