export function TopBar() {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand__name">react-d3-tree</span>
        <span className="brand__ver">v{__RD3T_VERSION__}</span>
      </div>
      <nav className="topbar__nav" aria-label="Links">
        <a href={`${import.meta.env.BASE_URL}docs/`}>API docs</a>
        <a href="https://github.com/bkrem/react-d3-tree">GitHub</a>
      </nav>
    </header>
  );
}
