# LocaFrota - sistema de locação de veículos

**Aluno:** Higor Souza  
**Tecnologias:** React, TypeScript, Vite, React Router, Bootstrap, Fetch API e JSON Server.

Aplicação para administrar cadastros de marcas, categorias, modelos, veículos, manutenções e clientes. Também gerencia a abertura e a devolução de locações, contrato, vistorias, pagamentos e nota fiscal simulada. A API REST de demonstração usa as 11 coleções do `db.json`.

## Executar

Requer Node.js compatível com a versão do Vite indicada em `package.json` (este projeto foi verificado com Node 24).

```bash
npm install
npm run server
```

Em outro terminal:

```bash
npm run dev
```

Abra o endereço informado pelo Vite, normalmente `http://localhost:5173`. A API funciona em `http://localhost:3001`. Também é possível definir `VITE_API_URL` para outro endereço da API. Execute `npm run build` para verificar a tipagem e gerar a versão de produção.

## Organização

```text
src/
  components/   Button, Input, Select, TextArea, Table, Modal, Alert, Navbar, Card
  models/       interfaces e valores iniciais de todas as 11 entidades
  pages/        painel, cadastros, detalhes, abertura e devolução
  service/      cliente HTTP tipado e serviço REST por entidade
db.json         dados de exemplo em todas as coleções
```

## Fluxo e regras implementadas

1. Cadastrar marca e categoria; depois modelo, veículo e cliente. Placa, chassi, CPF e CNH não se repetem.
2. Abrir locação para veículo disponível e cliente com CNH válida, com devolução prevista posterior à retirada. O valor previsto considera cada período de até 24 horas como uma diária. Contrato e vistoria de retirada são criados na abertura.
3. Registrar quantos pagamentos forem necessários com valor, data, forma e status.
4. Finalizar com data e quilometragem de devolução válidas. A vistoria é criada, o valor é recalculado e o KM do veículo é atualizado.
5. Emitir uma única nota fiscal simulada, somente para locação finalizada.
6. Consultar locações por cliente e status, detalhes completos e situação da frota. Veículos em manutenção são identificados pelas manutenções com status `EM_ANDAMENTO`.
7. Impedir a exclusão de registros que tenham dependentes; a interface informa o motivo. Locações abertas podem ser canceladas, preservando o histórico.

Os dados de exemplo são fictícios. JSON Server é uma API simulada sem transações ou regras de integridade no servidor: as validações estão na aplicação e não protegem alterações externas simultâneas no `db.json`. A nota fiscal exibida é somente um registro acadêmico, sem emissão fiscal real.

## Verificação

`npm run build` verifica TypeScript e produz o bundle. `npm test` verifica as regras de disponibilidade, datas, CNH, quilometragem, unicidade, nota fiscal e dependências. O fluxo de navegação foi conferido em navegador com abertura, contrato, vistoria, dois pagamentos, devolução com recálculo e nota fiscal. O `db.json` incluído no projeto permanece com os dados iniciais de demonstração.
