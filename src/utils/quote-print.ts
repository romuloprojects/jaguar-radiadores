import { brl } from "@/utils/format";
import { authorizationLabel, datePt, paymentMethodLabel } from "@/utils/api-format";

function esc(value: unknown) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[c] as string);
}
function line(value: unknown, fallback = "—") { return esc(value || fallback); }
function qty(value: unknown) { return Number(value || 0).toLocaleString("pt-BR", { maximumFractionDigits: 2 }); }

export function buildQuotePrintHtml(args: { document: any; quote: any; qrDataUrl?: string | null }) {
  const d = args.document || {};
  const q = args.quote || {};
  const company = d.company || {};
  const customer = d.customer || q.customer || {};
  const vehicle = d.vehicle || q.vehicle || {};
  const pix = d.pix || {};
  const receivables = Array.isArray(q.receivables) ? q.receivables : [];
  const allItems = Array.isArray(d.items) && d.items.length ? d.items : (q.items || []);
  const services = allItems.filter((i: any) => (i.type || i.typeCode) === "service" || String(i.type || "").toLowerCase().includes("serv"));
  const parts = allItems.filter((i: any) => !services.includes(i));
  const logoRaw = company.logoUrl || "/images/jaguar-logo-source.jpg";
  const logo = /^(https?:|data:)/.test(logoRaw) ? logoRaw : (typeof window !== "undefined" ? new URL(logoRaw, window.location.origin).href : logoRaw);
  const methodCode = d.paymentTerms?.methodCode || q.paymentTerms?.methodCode;
  const total = Number(d.total ?? q.total ?? 0);
  const notes = d.notes || q.notes || "";

  const rows = [...services.map((i: any) => ({ ...i, _kind: "Serviço" })), ...parts.map((i: any) => ({ ...i, _kind: "Peça" }))];
  const itemRows = rows.length ? rows.map((i: any) => `
    <tr>
      <td class="kind ${i._kind === "Serviço" ? "service" : "part"}">${i._kind}</td>
      <td>${line(i.description)}</td>
      <td class="center">${qty(i.quantity)}</td>
      <td class="money">${brl(Number(i.unitPrice || 0))}</td>
      <td class="money bold">${brl(Number(i.total ?? (Number(i.quantity || 0) * Number(i.unitPrice || 0))))}</td>
    </tr>`).join("") : `<tr><td colspan="5" class="empty">Nenhum item informado.</td></tr>`;

  const paymentRows = receivables.length ? receivables.map((r: any) => `
    <div class="payment-pill">
      <span>${line(r.installment ?? r.number)}/${line(r.installmentCount ?? r.count)}</span>
      <b>${datePt(r.dueDate)}</b>
      <strong>${brl(Number(r.amount || 0))}</strong>
    </div>`).join("") : `<div class="payment-line"><span>Condição</span><b>${line(paymentMethodLabel(methodCode))}</b></div>`;

  const dueText = receivables.length
    ? receivables.map((r: any) => `${datePt(r.dueDate)} · ${brl(Number(r.amount || 0))}`).join("  |  ")
    : "Conforme combinado no atendimento";

  const pixBlock = pix.copyPaste ? `
    <div class="pix-layout">
      <div class="qr-wrap">${args.qrDataUrl ? `<img src="${esc(args.qrDataUrl)}" alt="QR Code PIX"/>` : `<div class="qr-placeholder">QR PIX</div>`}</div>
      <div class="pix-info">
        <h3>PIX</h3>
        <p><span>Favorecido</span><b>${line(pix.receiverName || company.tradeName || company.businessName)}</b></p>
        <p><span>Chave PIX</span><b>${line(pix.key)}</b></p>
        <p><span>Valor do orçamento</span><b>${brl(total)}</b></p>
        <small>Leia o QR Code ou use o Pix Copia e Cola. O pagamento deve ser confirmado no Financeiro.</small>
      </div>
      <div class="pix-copy"><span>PIX COPIA E COLA</span><code>${esc(pix.copyPaste)}</code></div>
    </div>` : `
    <div class="pix-layout pix-empty">
      <div class="qr-wrap"><div class="qr-placeholder">PIX</div></div>
      <div class="pix-info">
        <h3>PIX ainda não configurado</h3>
        <p>A chave PIX pode ser cadastrada posteriormente em <b>Configurações</b>.</p>
        <small>O orçamento continua válido e imprimível. Assim que a chave for cadastrada, o QR Code e o Pix Copia e Cola passam a aparecer automaticamente.</small>
      </div>
      <div class="note-box"><b>Observações</b><p>${line(notes, "Sem observações adicionais.")}</p></div>
    </div>`;

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${line(d.number || q.number || "Orçamento")}</title>
<style>
  @page{size:A4 portrait;margin:8mm}
  :root{--ink:#111216;--ink2:#1d1f24;--red:#d71920;--red-dark:#aa1117;--line:#d8dbe0;--soft:#f3f4f6;--muted:#6c727e}
  *{box-sizing:border-box} html,body{margin:0;padding:0} body{font-family:Arial,Helvetica,sans-serif;background:#eef0f3;color:#17191d;font-size:10px;line-height:1.32}
  .toolbar{position:fixed;z-index:20;top:12px;right:12px}.toolbar button{border:0;border-radius:8px;background:var(--red);color:white;font-weight:800;padding:10px 14px;box-shadow:0 4px 14px #0003;cursor:pointer}
  .sheet{width:194mm;min-height:281mm;margin:10mm auto;background:white;padding:8mm;border-radius:4mm;box-shadow:0 8px 36px #0002}
  .hero{background:var(--ink);color:white;border-radius:4mm;padding:6mm;display:grid;grid-template-columns:72mm 1fr;gap:8mm;align-items:center;position:relative;overflow:hidden}
  .hero:after{content:"";position:absolute;left:0;right:0;bottom:0;height:2.2mm;background:linear-gradient(90deg,var(--red),#ff4249,var(--red-dark))}
  .logo{width:68mm;height:31mm;object-fit:contain;object-position:left center;display:block}.company-lines{margin-top:2mm;color:#d0d2d7;font-size:8.7px;line-height:1.55}.hero-right{text-align:right}.hero-right h1{margin:0 0 1.5mm;font-size:21px;letter-spacing:.02em;line-height:1.08}.doc-meta{display:grid;grid-template-columns:1fr 38mm;gap:2mm;margin-top:4mm}.meta-box{background:#202228;border-radius:2.4mm;padding:2.2mm 3mm;text-align:left}.meta-box small{display:block;color:#9fa3ad;text-transform:uppercase;font-size:7.5px;letter-spacing:.05em}.meta-box b{display:block;font-size:11px;margin-top:.4mm}
  .section-title{background:var(--ink);color:#fff;border-radius:2mm;padding:2mm 3.5mm;margin:4mm 0 2mm;font-weight:900;font-size:10.5px;letter-spacing:.02em}.card{border:1px solid var(--line);border-radius:2.8mm;background:#fff;padding:3.2mm}.info-grid{display:grid;grid-template-columns:1.3fr .8fr .8fr;gap:3mm 6mm}.vehicle-grid{display:grid;grid-template-columns:.55fr .8fr 1fr 1.4fr;gap:3mm 6mm}.field.wide{grid-column:1/-1}.field span{display:block;color:#777d88;font-size:7.5px;font-weight:800;text-transform:uppercase;letter-spacing:.04em}.field b,.field p{display:block;margin:.7mm 0 0;font-size:9.8px}.field b{font-weight:800}.field p{font-weight:500}
  table{width:100%;border-collapse:collapse} thead th{background:#eef0f3;color:#686e78;font-size:7.6px;text-transform:uppercase;text-align:left;padding:2mm 2.5mm;border:1px solid var(--line)} tbody td{padding:2.1mm 2.5mm;border:1px solid var(--line);vertical-align:top}.kind{font-weight:900;width:19mm}.kind.service{color:#bf1a21}.kind.part{color:#b46c00}.center{text-align:center}.money{text-align:right;white-space:nowrap}.bold{font-weight:900}.empty{text-align:center;color:var(--muted);padding:5mm}
  .financial-row{display:grid;grid-template-columns:1.45fr .95fr;gap:3mm;margin-top:2.5mm}.summary{border:1px solid var(--line);border-radius:2.8mm;padding:3.2mm}.summary h3,.pay-card h3{margin:0 0 2mm;font-size:10px;text-transform:uppercase}.money-line{display:flex;justify-content:space-between;gap:8mm;padding:1mm 0;color:#6c727e}.money-line b{color:#26292f}.money-line.total{border-top:1px solid var(--line);margin-top:1.5mm;padding-top:2mm;font-size:11.5px;color:#17191d}.money-line.total strong{color:var(--red);font-size:16px}.pay-card{background:var(--ink);border-radius:2.8mm;padding:3.2mm;color:#fff}.pay-card .label{color:#9fa3ad;font-size:7.5px;text-transform:uppercase;display:block}.pay-card .method{font-size:11px;font-weight:900;margin:.5mm 0 2mm}.payment-pills{display:flex;flex-direction:column;gap:1mm}.payment-pill{display:grid;grid-template-columns:11mm 21mm 1fr;gap:1.5mm;align-items:center;font-size:7.7px;color:#d7d9df}.payment-pill strong{text-align:right;color:#fff}.payment-line{display:flex;justify-content:space-between}.due-summary{margin-top:2mm;color:#bfc3cb;font-size:7.5px}
  .pix-layout{border:1px solid var(--line);border-radius:2.8mm;padding:3.2mm;display:grid;grid-template-columns:29mm 1fr 66mm;gap:4mm;align-items:start}.qr-wrap{display:flex;align-items:center;justify-content:center}.qr-wrap img,.qr-placeholder{width:27mm;height:27mm}.qr-placeholder{border:1px dashed #a9adb5;border-radius:1.5mm;display:flex;align-items:center;justify-content:center;color:#7d828c;font-weight:900}.pix-info h3{font-size:10.5px;margin:0 0 2mm}.pix-info p{margin:1mm 0;display:flex;gap:2mm}.pix-info p span{color:#737985;min-width:22mm}.pix-info small{display:block;margin-top:2mm;color:#757b85}.pix-copy,.note-box{background:#f3f4f6;border-radius:2.2mm;padding:3mm;min-height:27mm}.pix-copy span,.note-box b{display:block;color:#686e78;font-size:7.5px;font-weight:900;text-transform:uppercase;margin-bottom:1.5mm}.pix-copy code{display:block;word-break:break-all;font-size:5.8px;line-height:1.25;color:#333}.note-box p{margin:0;color:#464a51;font-size:8.4px}.pix-empty{grid-template-columns:29mm 1fr 66mm}
  .auth-card{border:1px solid var(--line);border-radius:2.8mm;padding:3.5mm}.auth-text{font-size:9px}.auth-note{color:#777d88;font-size:8px;margin-top:1.2mm}.signatures{display:grid;grid-template-columns:1fr 1fr;gap:25mm;margin:12mm 5mm 1mm}.signature{border-top:1px solid #8e9299;text-align:center;padding-top:1.5mm;color:#747a84;font-size:8px}.footer{margin-top:4mm;color:#777d88;font-size:7.3px;display:flex;justify-content:space-between;gap:8mm;padding:0 2mm}.footer span:last-child{text-align:right}
  @media print{body{background:#fff}.toolbar{display:none}.sheet{width:auto;min-height:auto;margin:0;padding:0;border-radius:0;box-shadow:none}.hero,.section-title,.pay-card{-webkit-print-color-adjust:exact;print-color-adjust:exact}.section-title{break-after:avoid}.card,.financial-row,.pix-layout,.auth-card{break-inside:avoid}}
  @media screen and (max-width:820px){body{min-width:760px}.sheet{margin:8px auto}}
</style>
</head>
<body>
<div class="toolbar"><button onclick="window.print()">Imprimir / Salvar PDF</button></div>
<main class="sheet">
  <header class="hero">
    <div>
      <img class="logo" src="${esc(logo)}" alt="Jaguar Radiadores"/>
      <div class="company-lines">${line(company.phone || company.whatsapp)}${company.whatsapp && company.whatsapp !== company.phone ? ` · ${line(company.whatsapp)}` : ""}<br/>${line(company.address)}</div>
    </div>
    <div class="hero-right">
      <h1>ORÇAMENTO / ORDEM DE SERVIÇO</h1>
      <div class="doc-meta">
        <div class="meta-box"><small>Nº orçamento / OS</small><b>${line(d.number || q.number)}</b></div>
        <div class="meta-box"><small>Data</small><b>${datePt(d.issuedAt || q.date)}</b></div>
      </div>
    </div>
  </header>

  <div class="section-title">1. DADOS DO CLIENTE</div>
  <section class="card info-grid">
    <div class="field"><span>Cliente / Razão Social</span><b>${line(customer.name || customer.legalName)}</b></div>
    <div class="field"><span>CPF / CNPJ</span><p>${line(customer.document)}</p></div>
    <div class="field"><span>Responsável</span><p>${line(customer.responsible)}</p></div>
    <div class="field"><span>Telefone / WhatsApp</span><p>${line(customer.phone || customer.whatsapp)}</p></div>
    <div class="field wide"><span>Endereço</span><p>${line([customer.address, customer.city, customer.state].filter(Boolean).join(" · "))}</p></div>
  </section>

  <div class="section-title">2. VEÍCULO / EQUIPAMENTO E PROBLEMA RELATADO</div>
  <section class="card vehicle-grid">
    <div class="field"><span>Placa</span><b>${line(vehicle.plate)}</b></div>
    <div class="field"><span>Marca</span><p>${line(vehicle.brand)}</p></div>
    <div class="field"><span>Modelo</span><p>${line(vehicle.model)}</p></div>
    <div class="field"><span>Veículo / Equipamento</span><p>${line(vehicle.equipmentDescription || vehicle.type)}</p></div>
    <div class="field wide"><span>Problema / defeito relatado</span><p>${line(d.issueReported || q.issueReported)}</p></div>
  </section>

  <div class="section-title">3. SERVIÇOS E PEÇAS AUTORIZADOS</div>
  <table><thead><tr><th>Tipo</th><th>Descrição</th><th class="center">Qtd.</th><th class="money">Vlr. unit.</th><th class="money">Total</th></tr></thead><tbody>${itemRows}</tbody></table>
  <div class="financial-row">
    <section class="summary">
      <h3>Resumo financeiro</h3>
      <div class="money-line"><span>Subtotal serviços</span><b>${brl(Number(d.servicesSubtotal ?? q.servicesSubtotal ?? 0))}</b></div>
      <div class="money-line"><span>Subtotal peças</span><b>${brl(Number(d.partsSubtotal ?? q.partsSubtotal ?? 0))}</b></div>
      <div class="money-line"><span>Desconto</span><b>${brl(Number(d.discountAmount ?? q.discountAmount ?? 0))}</b></div>
      <div class="money-line total"><b>TOTAL GERAL</b><strong>${brl(total)}</strong></div>
    </section>
    <section class="pay-card">
      <h3>Pagamento</h3>
      <span class="label">Forma</span><div class="method">${line(paymentMethodLabel(methodCode))}</div>
      <div class="payment-pills">${paymentRows}</div>
      <div class="due-summary">Vencimentos: ${esc(dueText)}</div>
    </section>
  </div>

  <div class="section-title">4. PAGAMENTO, PIX E OBSERVAÇÕES</div>
  ${pixBlock}

  <div class="section-title">5. AUTORIZAÇÃO</div>
  <section class="auth-card">
    <div class="auth-text">Declaro estar ciente dos valores, itens e serviços descritos neste documento e autorizo a execução do atendimento.</div>
    <div class="auth-note">Autorização registrada no sistema: <b>${line(authorizationLabel(d.authorizationMethod || q.authorizationMethod))}</b>.</div>
    <div class="signatures"><div class="signature">Contratante / Cliente</div><div class="signature">Jaguar Radiadores</div></div>
  </section>

  <footer class="footer"><span>${line(company.tradeName || company.businessName || "Jaguar Radiadores")} · ${line(company.cnpj)}</span><span>${line(company.phone || company.whatsapp)} · ${line(company.address)}</span></footer>
</main>
</body></html>`;
}
