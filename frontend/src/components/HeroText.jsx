export default function HeroText() {
  return (
    <div className="relative select-none">
      <p className="font-display font-light text-6xl md:text-7xl tracking-tight leading-[0.95] text-hey-glow bg-clip-text text-transparent bg-gradient-to-b from-white to-ink-secondary/70">
        Hey,
      </p>

      <div className="relative mt-1 w-fit">
        <h1 className="font-display font-bold text-7xl md:text-8xl tracking-tight leading-[0.95] text-harsh-glow bg-clip-text text-transparent bg-gradient-to-r from-accent-violet via-accent-blue to-accent-violet">
          I&rsquo;m Harsh
        </h1>

        <span className="light-streak absolute -bottom-3 left-0 h-px w-2/3" />
      </div>

      <p className="mt-6 font-body text-sm md:text-base text-ink-secondary tracking-wide border-l-2 border-accent-purple/70 pl-3">
        AI Engineer&nbsp;&nbsp;|&nbsp;&nbsp;Problem
        Solver&nbsp;&nbsp;|&nbsp;&nbsp;Builder
      </p>
    </div>
  );
}
