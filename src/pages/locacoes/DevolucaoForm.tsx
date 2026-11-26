import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { loadData, type DataSet } from '../../service/data';
import { locacaoService } from '../../service/locacaoService';
import { veiculoService } from '../../service/veiculoService';
import { vistoriaService } from '../../service/vistoriaService';
import type { NivelCombustivel } from '../../models/Vistoria';
import { vistoriaInicial } from '../../models/Vistoria';
import { calcularValorLocacao } from '../../models/Locacao';
import { assertReturnKm, categoryRate, currency, localDateTime, rentalDays } from '../../models/rules';
import { Card } from '../../components/Card';
import { Alert } from '../../components/Alert';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { TextArea } from '../../components/TextArea';

const fuelOptions = ['VAZIO','1/4','1/2','3/4','CHEIO'].map((s) => ({value:s,label:s}));

export function DevolucaoForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [db, setDb] = useState<DataSet | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [date, setDate] = useState(localDateTime());
  const [km, setKm] = useState(0);
  const [fuel, setFuel] = useState<NivelCombustivel>('CHEIO');
  const [notes, setNotes] = useState('');
  useEffect(() => { void loadData().then((latest) => {
    setDb(latest);
    const rental = latest.locacoes.find((r) => r.id === id);
    setKm(rental?.kmRetirada || 0);
  }).catch((err: unknown) => setError(String(err))); }, [id]);
  const rental = db?.locacoes.find((r) => r.id === id);
  let total: number | null = null;
  if (rental && db) {
    try { total = calcularValorLocacao(rentalDays(rental.dataRetirada, date), categoryRate(db, rental.veiculoId)); }
    catch { total = null; }
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError('');
    let inspectionId: string | undefined;
    let updatedRental = false;
    let originalRental: typeof rental;
    try {
      const fresh = await loadData();
      originalRental = fresh.locacoes.find((r) => r.id === id);
      if (!originalRental || !id || originalRental.status !== 'ABERTA') throw new Error('Locação aberta não encontrada.');
      if (fresh.vistorias.some((v) => v.locacaoId === id && v.tipo === 'DEVOLUCAO'))
        throw new Error('Esta locação já possui vistoria de devolução.');
      const vehicle = fresh.veiculos.find((v) => v.id === originalRental?.veiculoId);
      if (!vehicle?.id) throw new Error('Veículo não encontrado.');
      assertReturnKm(km, originalRental.kmRetirada, vehicle.kmRodado);
      const amount = calcularValorLocacao(rentalDays(originalRental.dataRetirada, date), categoryRate(fresh, vehicle.id));
      const inspection = await vistoriaService.criar({ ...vistoriaInicial, tipo:'DEVOLUCAO',
        locacaoId:id, data:date, km, nivelCombustivel:fuel, observacoes:notes });
      inspectionId = inspection.id;
      await locacaoService.atualizar(id, { ...originalRental, status:'FINALIZADA',
        dataDevolucaoReal:date, kmDevolucao:km, valorTotal:amount });
      updatedRental = true;
      await veiculoService.atualizar(vehicle.id, { ...vehicle, kmRodado:km });
      navigate(`/locacoes/${id}`);
    } catch (err) {
      if (updatedRental && originalRental && id) await locacaoService.atualizar(id, originalRental).catch(() => undefined);
      if (inspectionId) await vistoriaService.excluir(inspectionId).catch(() => undefined);
      setError(err instanceof Error ? err.message : String(err));
    } finally { setSaving(false); }
  }
  return <div className="container py-4 py-lg-5"><Link to={`/locacoes/${id}`}>← Voltar à locação</Link>
    <h1 className="h2 fw-bold mt-3">Registrar devolução</h1>
    {error && <Alert type="danger" message={error} />}
    {db && !rental && <Alert type="warning" message="Locação não encontrada." />}
    {rental && rental.status !== 'ABERTA' && <Alert type="warning" message="Esta locação não está aberta." />}
    {rental?.status === 'ABERTA' && <Card title="Vistoria de devolução e valor final">
      <form onSubmit={(event) => { void save(event); }}><div className="row">
        <div className="col-md-6"><Input label="Data e hora da devolução real" name="real" type="datetime-local"
          value={date} required onChange={setDate} /></div>
        <div className="col-md-6"><Input label="KM na devolução" name="kmDevolucao" type="number"
          value={km} required min={rental.kmRetirada} onChange={(value) => setKm(Number(value))} /></div>
        <div className="col-md-6"><Select label="Nível de combustível" name="fuelReturn" value={fuel}
          options={fuelOptions} required onChange={(value) => setFuel(value as NivelCombustivel)} /></div>
      </div><TextArea label="Observações" name="returnNotes" value={notes} onChange={setNotes} />
      <p className="fw-semibold">Valor final: {total === null ? 'Data inválida' : currency(total)}</p>
      <Button label={saving ? 'Finalizando...' : 'Finalizar locação'} disabled={saving} type="submit" />
    </form></Card>}
  </div>;
}
