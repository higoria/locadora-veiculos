import { NavLink } from 'react-router-dom';

export interface NavbarProps { brand?: string }

const links = [
  ['/', 'Visão geral'], ['/marcas', 'Marcas'], ['/categorias', 'Categorias'],
  ['/modelos', 'Modelos'], ['/veiculos', 'Veículos'], ['/manutencoes', 'Manutenções'],
  ['/clientes', 'Clientes'], ['/locacoes', 'Locações'],
];

export function Navbar({ brand = 'LocaFrota' }: NavbarProps) {
  return <header className="site-header"><div className="container py-3">
    <div className="d-flex flex-wrap align-items-center gap-3">
      <NavLink to="/" className="brand text-decoration-none">{brand}</NavLink>
      <span className="text-white-50 small">Gestão de locações</span>
    </div>
    <nav className="d-flex flex-wrap gap-2 mt-3" aria-label="Menu principal">
      {links.map(([href, label]) => <NavLink key={href} to={href} end={href === '/'}
        className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`}>{label}</NavLink>)}
    </nav>
  </div></header>;
}
