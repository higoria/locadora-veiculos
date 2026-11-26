import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { contratoService } from '../../service/contratoService';
import { loadData, type DataSet } from '../../service/data';
import { locacaoService } from '../../service/locacaoService';
import { vistoriaService } from '../../service/vistoriaService';
import { newId } from '../../service/api';
import { calcularValorLocacao, locacaoInicial } from '../../models/Locacao';
import { contratoInicial } from '../../models/Contrato';
import { vistoriaInicial, type NivelCombustivel } from '../../models/Vistoria';
import { categoryRate, currency, localDateTime, rentalDays, validLicense,
  vehicleLabel, vehicleStatus } from '../../models/rules';
import { Card } from '../../components/Card';
import { Alert } from '../../components/Alert';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { TextArea } from '../../components/TextArea';

const fuelOptions = ['VAZIO', '1/4', '1/2', '3/4', 'CHEIO'].map((x) => ({ value:x, label:x }));

export function LocacaoForm() {
  const navigate = useNavigate();
  const [db, setDb] = useState<DataSet | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...locacaoInicial, dataRetirada:localDateTime(),
    dataDevolucaoPrevista:localDateTime(1) });
  const [fuel, setFuel] = useState<NivelCombustivel>('CHEIO');
  const [notes, setNotes] = useState('');
  useEffect(() => { void loadData().then(setDb).catch((err: unknown) => setError(String(err))); }, []);
  let estimate: number | null = null;
  if (db && form.veiculoId) {
    try { estimate = calcularValorLocacao(rentalDays(form.dataRetirada, form.dataDevolucaoPrevista), categoryRate(db, form.veiculoId)); }
    catch { estimate = null; }
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError('');
    let createdId: string | undefined;
    let contractId: string | undefined;
    try {
      const fresh = await loadData();
      const customer = fresh.clientes.find((c) => c.id === form.clienteId);
      const vehicle = fresh.veiculos.find((v) => v.id === form.veiculoId);
      if (!customer || !vehicle) throw new Error('Selecione cliente e veículo válidos.');
      if (vehicleStatus(fresh, vehicle.id || '') !== 'DISPONÍVEL') throw new Error('Veículo já locado ou em manutenção.');
      if (!validLicense(customer, form.dataRetirada)) throw new Error('A CNH estará vencida na data de retirada.');
      if (!Number.isFinite(form.kmRetirada) || form.kmRetirada < vehicle.kmRodado)
        throw new Error(`KM de retirada deve ser pelo menos ${vehicle.kmRodado}.`);
      const amount = calcularValorLocacao(rentalDays(form.dataRetirada, form.dataDevolucaoPrevista), categoryRate(fresh, vehicle.id || ''));
      const rental = await locacaoService.criar({ ...form, status:'ABERTA', valorTotal:amount });
      createdId = rental.id;
      if (!createdId) throw new Error('A API não retornou o ID da locação.');
      const contract = await contratoService.criar({ ...contratoInicial,
        numero:`CTR-${Date.now()}-${newId().slice(0, 8)}`, dataEmissao:localDateTime().slice(0,10),
        termos:`Locação do veículo ${vehicle.placa}. Diária de ${currency(categoryRate(fresh,vehicle.id || ''))}.`,
        locacaoId:createdId });
      contractId = contract.id;
      await vistoriaService.criar({ ...vistoriaInicial, tipo:'RETIRADA', data:form.dataRetirada,
        km:form.kmRetirada, nivelCombustivel:fuel, observacoes:notes, locacaoId:createdId });
      navigate(`/locacoes/${createdId}`);
    } catch (err) {
      if (contractId) await contratoService.excluir(contractId).catch(() => undefined);
      if (createdId) await locacaoService.excluir(createdId).catch(() => undefined);
      setError(err instanceof Error ? err.message : String(err));
    } finally { setSaving(false); }
  }
  return <div className="container py-4 py-lg-5"><Link to="/locacoes">← Voltar às locações</Link>
    <h1 className="h2 fw-bold mt-3">Nova locação</h1>
    {error && <Alert type="danger" message={error} />}
    <Card title="Dados da locação e vistoria de retirada"><form onSubmit={(event) => { void save(event); }}>
      <div className="row"><div className="col-md-6"><Select label="Cliente" name="clienteId" required
        value={form.clienteId} onChange={(value) => setForm({ ...form, clienteId:value })}
        options={(db?.clientes || []).map((c) => ({ value:c.id || '', label:c.nome }))} /></div>
        <div className="col-md-6"><Select label="Veículo disponível" name="veiculoId" required
          value={form.veiculoId} onChange={(value) => setForm({ ...form, veiculoId:value })}
          options={(db?.veiculos || []).filter((v) => db && vehicleStatus(db,v.id || '') === 'DISPONÍVEL')
            .map((v) => ({ value:v.id || '', label:db ? vehicleLabel(db,v) : v.placa }))} /></div>
        <div className="col-md-6"><Input label="Retirada" name="retirada" type="datetime-local" required
          value={form.dataRetirada} onChange={(value) => setForm({ ...form, dataRetirada:value })} /></div>
        <div className="col-md-6"><Input label="Devolução prevista" name="prevista" type="datetime-local" required
          value={form.dataDevolucaoPrevista} onChange={(value) => setForm({ ...form, dataDevolucaoPrevista:value })} /></div>
        <div className="col-md-6"><Input label="KM da retirada" name="km" type="number" required min={0}
          value={form.kmRetirada} onChange={(value) => setForm({ ...form, kmRetirada:Number(value) })} /></div>
        <div className="col-md-6"><Select label="Combustível na retirada" name="fuel" required
          value={fuel} onChange={(value) => setFuel(value as NivelCombustivel)} options={fuelOptions} /></div>
      </div><TextArea label="Observações da vistoria" name="notes" value={notes} onChange={setNotes} />
      <p className="fw-semibold">Valor previsto: {estimate === null ? 'Escolha veículo e período válidos' : currency(estimate)}</p>
      <Button label={saving ? 'Registrando...' : 'Registrar locação'} type="submit" disabled={saving} />
    </form></Card>
  </div>;
}
