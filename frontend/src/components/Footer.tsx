export function Footer() {
  return (
    <footer className="border-t border-border/50 mt-20 sm:mt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <img src="/logo.jpeg" alt="COINCONUT Logo" className="h-7 sm:h-8 w-auto object-contain mix-blend-multiply" />
            <span className="font-display font-semibold text-foreground">COINCONUT</span>
          </div>
          <span className="opacity-60 hidden sm:inline">·</span>
          <span className="opacity-70">Da casca ao pagamento, rastreado.</span>
        </div>
      </div>
    </footer>
  );
}
