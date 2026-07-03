import logo from "../assets/logo.png";

export function Logo({ size = 56, withName = false }: { size?: number; withName?: boolean }) {
  return (
    <span className="brand" aria-label="Aarambh AI">
      <img src={logo} alt="Aarambh AI logo" width={size} height={size} />
      {withName ? <span className="brand-name">Aarambh AI</span> : null}
    </span>
  );
}
