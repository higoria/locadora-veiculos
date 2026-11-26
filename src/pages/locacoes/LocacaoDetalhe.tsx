import { useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { loadData, type DataSet } from '../../service/data';
import { pagamentoService } from '../../service/pagamentoService';
import { notaFiscalService } from '../../service/notaFiscalService';
import { newId } from '../../service/api';
import { pagamentoInicial, type FormaPagamento, type StatusPagamento } from '../../models/Pagamento';
import { notaFiscalInicial } from '../../models/NotaFiscal';
import { canIssueInvoice, currency, dateLabel, localDateTime, vehicleLabel } from '../../models/rules';
import { Card } from '../../components/Card';
import { Alert } from '../../components/Alert';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Table } from '../../components/Table';
import { Button } from '../../components/Button';

export function LocacaoDetalhe() {
  const { id } = useParams();
  const [db, setDb] = useState<DataSet | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [payment, setPayment] = useState({ ...pagamentoInicial,
    data:localDateTime().slice(0,10) });
  async function refresh() { setDb(await loadData()); }
  useEffect(() => { void refresh().catch((err: unknown) => setError(String(err))); }, [id]);
  const rental = db?.locacoes.find((r) => r.id === id);
  const customer = db?.clientes.find((c) => c.id === rental?.clienteId);
  const vehicle = db?.veiculos.find((v) => v.id === rental?.veiculoId);
  const contract = db?.contratos.find((r) => r.locacaoId === id);
  const inspections = db?.vistorias.filter((r) => r.locacaoId === id) || [];
  const payments = db?.pagamentos.filter((r) => r.locacaoId === id) || [];
  const invoice = db?.notasFiscais.find((r) => r.locacaoId === id);

  async function savePayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try {
      const latest = await loadData();
      const current = latest.locacoes.find((r) => r.id === id);
      if (!current || current.status === 'CANCELADA' || !id) throw new Error('Locação indisponível para pagamento.');
      if (!Number.isFinite(payment.valor) || payment.valor <= 0) throw new Error('O pagamento deve ser maior que zero.');
      await pagamentoService.criar({ ...payment, locacaoId:id });
      await refresh(); setPayment({ ...pagamentoInicial, data:localDateTime().slice(0,10) });
      setMessage('Pagamento registrado.');
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setBusy(false); }
  }

  async function issueInvoice() {
    setBusy(true); setError(''); setMessage('');
    try {
      const latest = await loadData();
      const current = latest.locacoes.find((r) => r.id === id);
      if (!current?.id || current.status !== 'FINALIZADA') throw new Error('Finalize a locação antes de emitir a nota.');
      if (!canIssueInvoice(current, latest)) throw new Error('Esta locação já possui uma nota fiscal.');
      await notaFiscalService.criar({ ...notaFiscalInicial, locacaoId:current.id,
        numero:`NF-${Date.now()}-${newId().slice(0,8)}`, serie:'1',
        dataEmissao:localDateTime().slice(0,10), valor:current.valorTotal });
      await refresh(); setMessage('Nota fiscal registrada.');
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setBusy(false); }
  }

  return <div className="container py-4 py-lg-5"><Link to="/locacoes">← Voltar às locações</Link>
    <div className="d-flex justify-content-between flex-wrap align-items-center gap-3 mt-3 mb-4">
      <div><span className="eyebrow">PROCESSO DE LOCAÇÃO</span><h1 className="h2 fw-bold mb-0">Detalhes da locação</h1></div>
      {rental?.status === 'ABERTA' && <Link className="btn btn-primary" to={`/locacoes/${id}/devolucao`}>Registrar devolução</Link>}
    </div>
    {error && <Alert type="danger" message={error} />}{message && <Alert type="success" message={message} />}
    {db && !rental && <Alert type="warning" message="Locação não encontrada." />}
    {rental && db && <div className="row g-3">
      <div className="col-lg-6"><Card title="Locação"><dl className="row mb-0">
        <dt className="col-5">Status</dt><dd className="col-7">{rental.status}</dd>
        <dt className="col-5">Cliente</dt><dd className="col-7">{customer?.nome || '—'}</dd>
        <dt className="col-5">Veículo</dt><dd className="col-7">{vehicle ? vehicleLabel(db,vehicle) : '—'}</dd>
        <dt className="col-5">Retirada</dt><dd className="col-7">{dateLabel(rental.dataRetirada)}</dd>
        <dt className="col-5">Prevista</dt><dd className="col-7">{dateLabel(rental.dataDevolucaoPrevista)}</dd>
        <dt className="col-5">Real</dt><dd className="col-7">{dateLabel(rental.dataDevolucaoReal)}</dd>
        <dt className="col-5">KM</dt><dd className="col-7">{rental.kmRetirada} → {rental.kmDevolucao ?? '—'}</dd>
        <dt className="col-5">Total</dt><dd className="col-7 fw-bold">{currency(rental.valorTotal)}</dd>
      </dl></Card></div>
      <div className="col-lg-6"><Card title="Contrato"><p>Número: <strong>{contract?.numero || 'Pendente'}</strong></p>
        <p>Emissão: {contract?.dataEmissao || '—'}</p><p className="mb-0">{contract?.termos}</p></Card></div>
      <div className="col-12"><Card title="Vistorias"><Table data={inspections} columns={[
        {title:'Tipo',render:(row)=>row.tipo},{title:'Data',render:(row)=>dateLabel(row.data)},
        {title:'KM',render:(row)=>row.km},{title:'Combustível',render:(row)=>row.nivelCombustivel},
        {title:'Observações',render:(row)=>row.observacoes || '—'},
      ]} /></Card></div>
      <div className="col-lg-7"><Card title="Pagamentos"><Table data={payments} columns={[
        {title:'Data',render:(row)=>row.data},{title:'Valor',render:(row)=>currency(row.valor)},
        {title:'Forma',render:(row)=>row.forma},{title:'Status',render:(row)=>row.status},
      ]} />
        {rental.status !== 'CANCELADA' && <form className="mt-4 border-top pt-4" onSubmit={(event) => { void savePayment(event); }}>
          <h3 className="h6 fw-bold">Novo pagamento</h3><div className="row">
          <div className="col-md-6"><Input label="Data" name="payDate" type="date" value={payment.data}
            required onChange={(value) => setPayment({...payment,data:value})} /></div>
          <div className="col-md-6"><Input label="Valor (R$)" name="payValue" type="number" min={0.01}
            step="0.01" required value={payment.valor} onChange={(value) => setPayment({...payment,valor:Number(value)})} /></div>
          <div className="col-md-6"><Select label="Forma" name="payType" value={payment.forma}
            options={['PIX','CARTAO','DINHEIRO','BOLETO'].map((s)=>({value:s,label:s}))}
            onChange={(value) => setPayment({...payment,forma:value as FormaPagamento})} /></div>
          <div className="col-md-6"><Select label="Status" name="payStatus" value={payment.status}
            options={['PENDENTE','PAGO','CANCELADO'].map((s)=>({value:s,label:s}))}
            onChange={(value) => setPayment({...payment,status:value as StatusPagamento})} /></div></div>
          <Button label="Adicionar pagamento" type="submit" disabled={busy} />
        </form>}</Card></div>
      <div className="col-lg-5"><Card title="Nota fiscal">{invoice ? <>
        <p>Número: <strong>{invoice.numero}</strong></p><p>Série: {invoice.serie}</p>
        <p>Emissão: {invoice.dataEmissao}</p><p className="h5">{currency(invoice.valor)}</p>
      </> : rental.status === 'FINALIZADA' ? <>
        <p className="text-muted">Ainda não emitida.</p>
        <Button label="Emitir nota fiscal" disabled={busy} onClick={() => { void issueInvoice(); }} />
      </> : <p className="text-muted">Disponível após a finalização.</p>}</Card></div>
    </div>}
  </div>;
}
