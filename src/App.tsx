import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { MarcaList } from './pages/marcas/MarcaList';
import { CategoriaList } from './pages/categorias/CategoriaList';
import { ModeloList } from './pages/modelos/ModeloList';
import { VeiculoList } from './pages/veiculos/VeiculoList';
import { VeiculoDetalhe } from './pages/veiculos/VeiculoDetalhe';
import { ManutencaoList } from './pages/manutencoes/ManutencaoList';
import { ClienteList } from './pages/clientes/ClienteList';
import { LocacaoList } from './pages/locacoes/LocacaoList';
import { LocacaoForm } from './pages/locacoes/LocacaoForm';
import { LocacaoDetalhe } from './pages/locacoes/LocacaoDetalhe';
import { DevolucaoForm } from './pages/locacoes/DevolucaoForm';

function App() {
  return <BrowserRouter><Navbar /><main><Routes>
    <Route path="/" element={<Home />} />
    <Route path="/marcas" element={<MarcaList />} />
    <Route path="/categorias" element={<CategoriaList />} />
    <Route path="/modelos" element={<ModeloList />} />
    <Route path="/veiculos" element={<VeiculoList />} />
    <Route path="/veiculos/:id" element={<VeiculoDetalhe />} />
    <Route path="/manutencoes" element={<ManutencaoList />} />
    <Route path="/clientes" element={<ClienteList />} />
    <Route path="/locacoes" element={<LocacaoList />} />
    <Route path="/locacoes/nova" element={<LocacaoForm />} />
    <Route path="/locacoes/:id" element={<LocacaoDetalhe />} />
    <Route path="/locacoes/:id/devolucao" element={<DevolucaoForm />} />
    <Route path="*" element={<div className="container py-5"><h1>Página não encontrada</h1></div>} />
  </Routes></main><footer className="container text-center text-muted small py-4">LocaFrota · Sistema de locação de veículos</footer></BrowserRouter>;
}
export default App;
