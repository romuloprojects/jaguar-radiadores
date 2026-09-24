import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  FileText,
  PackagePlus,
  Plus,
  Search,
  Trash2,
  UserRound,
  Wrench,
} from "lucide-react";
import { useMemo, useState } from "react";
import { InternalPage, StatusPill } from "@/components/InternalPage";
import { PageHeader } from "@/components/ui-helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { customers, stockItems } from "@/data/mock/jaguar";
import { brl } from "@/utils/format";
import type { QuoteItem } from "@/types/jaguar";

export const Route = createFileRoute("/orcamentos_/novo")({ component: NewQuotePage });

const stepLabels = ["Cliente", "Veículo", "Itens", "Pagamento", "Revisão"];

function NewQuotePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [customerId, setCustomerId] = useState(customers[0].id);
  const customer = customers.find((c) => c.id === customerId) ?? customers[0];
  const [vehicleId, setVehicleId] = useState(customer.vehicles[0]?.id ?? "");
  const vehicle = customer.vehicles.find((v) => v.id === vehicleId) ?? customer.vehicles[0];
  const [items, setItems] = useState<QuoteItem[]>([
    {
      id: "s-1",
      type: "Serviço",
      description: "Limpeza química do radiador",
      quantity: 1,
      unitPrice: 350,
    },
    {
      id: "s-2",
      type: "Serviço",
      description: "Solda especial em alumínio",
      quantity: 1,
      unitPrice: 180,
    },
    {
      id: "p-1",
      type: "Peça",
      description: "Colmeia modelo XYZ",
      quantity: 1,
      unitPrice: 1250,
      stockAvailable: 3,
    },
    {
      id: "p-2",
      type: "Peça",
      description: "Conexão superior",
      quantity: 2,
      unitPrice: 45,
      stockAvailable: 12,
    },
  ]);
  const [discount, setDiscount] = useState(0);
  const [payment, setPayment] = useState("PIX");
  const [approval, setApproval] = useState("Verbal");
  const [notes, setNotes] = useState("Radiador com vazamento na parte superior.");
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    [items],
  );
  const total = Math.max(0, subtotal - discount);

  function next() {
    setStep((v) => Math.min(4, v + 1));
  }
  function back() {
    setStep((v) => Math.max(0, v - 1));
  }
  function remove(id: string) {
    setItems((list) => list.filter((item) => item.id !== id));
  }
  function addService() {
    setItems((list) => [
      ...list,
      {
        id: `s-${Date.now()}`,
        type: "Serviço",
        description: "Novo serviço",
        quantity: 1,
        unitPrice: 0,
      },
    ]);
  }
  function addPart() {
    const p = stockItems[0];
    setItems((list) => [
      ...list,
      {
        id: `p-${Date.now()}`,
        type: "Peça",
        description: p.description,
        quantity: 1,
        unitPrice: p.salePrice,
        stockAvailable: p.current - p.reserved,
      },
    ]);
  }

  return (
    <InternalPage>
      <PageHeader
        title="Novo Orçamento / Atendimento"
        subtitle="Preencha as informações essenciais e gere o atendimento com rapidez."
        icon={FileText}
      />
      <div className="quote-stepper">
        {stepLabels.map((label, index) => (
          <div
            key={label}
            className={`quote-step ${index === step ? "is-active" : ""} ${index < step ? "is-done" : ""}`}
          >
            <span>{index < step ? <Check className="h-3.5 w-3.5" /> : index + 1}</span>
            <b>{label}</b>
          </div>
        ))}
      </div>

      <section className="panel quote-workspace">
        {step === 0 && (
          <div className="quote-step-content">
            <StepTitle
              icon={UserRound}
              title="Dados do cliente"
              subtitle="Busque um cliente já cadastrado ou preencha um novo solicitante."
            />
            <div className="relative max-w-2xl">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Buscar por nome, telefone ou CPF/CNPJ..." />
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {customers.slice(0, 4).map((c) => (
                <button
                  key={c.id}
                  className={`select-card ${customerId === c.id ? "is-selected" : ""}`}
                  onClick={() => {
                    setCustomerId(c.id);
                    setVehicleId(c.vehicles[0]?.id ?? "");
                  }}
                >
                  <div>
                    <b>{c.name}</b>
                    <span>{c.document}</span>
                  </div>
                  <small>{c.phone}</small>
                </button>
              ))}
            </div>
            <div className="form-grid">
              <label className="form-field">
                <span>Cliente PF ou PJ</span>
                <Input
                  value={customer.kind === "PJ" ? "Pessoa Jurídica" : "Pessoa Física"}
                  readOnly
                />
              </label>
              <label className="form-field">
                <span>CPF / CNPJ</span>
                <Input value={customer.document} readOnly />
              </label>
              <label className="form-field">
                <span>Inscrição</span>
                <Input value={customer.registration ?? ""} placeholder="Opcional" readOnly />
              </label>
              <label className="form-field">
                <span>Telefone</span>
                <Input value={customer.phone} readOnly />
              </label>
              <label className="form-field">
                <span>Responsável</span>
                <Input value={customer.responsible ?? ""} placeholder="Opcional" readOnly />
              </label>
              <label className="form-field xl:col-span-2">
                <span>Endereço</span>
                <Input
                  value={`${customer.address}, ${customer.city} - ${customer.state}`}
                  readOnly
                />
              </label>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="quote-step-content">
            <StepTitle
              icon={Wrench}
              title="Dados do veículo / equipamento"
              subtitle="Selecione um veículo já vinculado ou informe os dados do atendimento atual."
            />
            <div className="grid gap-3 md:grid-cols-2">
              {customer.vehicles.map((v) => (
                <button
                  key={v.id}
                  className={`select-card ${vehicleId === v.id ? "is-selected" : ""}`}
                  onClick={() => setVehicleId(v.id)}
                >
                  <div>
                    <b>{[v.brand, v.model].filter(Boolean).join(" ") || v.type}</b>
                    <span>{v.plate ?? "Sem placa"}</span>
                  </div>
                  <small>{v.type}</small>
                </button>
              ))}
            </div>
            <div className="form-grid">
              <label className="form-field">
                <span>Placa</span>
                <Input value={vehicle?.plate ?? ""} readOnly />
              </label>
              <label className="form-field">
                <span>Marca</span>
                <Input value={vehicle?.brand ?? ""} readOnly />
              </label>
              <label className="form-field">
                <span>Modelo</span>
                <Input value={vehicle?.model ?? ""} readOnly />
              </label>
              <label className="form-field xl:col-span-3">
                <span>Observações do atendimento</span>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Descreva o problema relatado ou observações importantes."
                />
              </label>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="quote-step-content">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <StepTitle
                icon={PackagePlus}
                title="Peças e serviços"
                subtitle="Monte o orçamento com itens livres e peças vinculadas ao estoque."
              />
              <div className="flex gap-2">
                <Button variant="outline" onClick={addService}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar serviço
                </Button>
                <Button onClick={addPart}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar peça
                </Button>
              </div>
            </div>
            <div className="data-table-wrap border">
              <table className="data-table quote-items-table min-w-[760px]">
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Descrição</th>
                    <th>Qtd.</th>
                    <th>Valor unit.</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <StatusPill
                          label={item.type}
                          tone={item.type === "Peça" ? "warning" : "info"}
                        />
                      </td>
                      <td>
                        <Input
                          value={item.description}
                          onChange={(e) =>
                            setItems((list) =>
                              list.map((i) =>
                                i.id === item.id ? { ...i, description: e.target.value } : i,
                              ),
                            )
                          }
                        />
                        {item.stockAvailable != null && (
                          <small className="mt-1 block text-muted-foreground">
                            Disponível: {item.stockAvailable}
                          </small>
                        )}
                      </td>
                      <td>
                        <Input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) =>
                            setItems((list) =>
                              list.map((i) =>
                                i.id === item.id ? { ...i, quantity: Number(e.target.value) } : i,
                              ),
                            )
                          }
                        />
                      </td>
                      <td>
                        <Input
                          type="number"
                          min={0}
                          value={item.unitPrice}
                          onChange={(e) =>
                            setItems((list) =>
                              list.map((i) =>
                                i.id === item.id ? { ...i, unitPrice: Number(e.target.value) } : i,
                              ),
                            )
                          }
                        />
                      </td>
                      <td className="font-semibold">{brl(item.quantity * item.unitPrice)}</td>
                      <td>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Remover ${item.description}`}
                          className="text-destructive"
                          onClick={() => remove(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="quote-totals">
              <div>
                <span>Subtotal</span>
                <b>{brl(subtotal)}</b>
              </div>
              <div>
                <span>Desconto</span>
                <Input
                  type="number"
                  min={0}
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                />
              </div>
              <div className="is-total">
                <span>Total geral</span>
                <b>{brl(total)}</b>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="quote-step-content">
            <StepTitle
              icon={CircleDollarSign}
              title="Pagamento"
              subtitle="Escolha a condição comercial. O PIX definitivo será gerado pela integração futura."
            />
            <div className="grid gap-4 xl:grid-cols-[.8fr_1.2fr_1fr]">
              <div className="option-panel">
                <h3>Forma de pagamento</h3>
                <RadioGroup value={payment} onValueChange={setPayment} className="mt-4 space-y-3">
                  {[
                    "PIX",
                    "Dinheiro",
                    "Cartão de débito",
                    "Cartão de crédito",
                    "Transferência",
                    "Boleto",
                    "A prazo (parcelado)",
                  ].map((p) => (
                    <label key={p} className="radio-line">
                      <RadioGroupItem value={p} />
                      <span>{p}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>
              <div className="option-panel pix-panel">
                <h3>Pagamento via PIX</h3>
                <div className="mock-qr">
                  <div className="mock-qr__grid">
                    {Array.from({ length: 81 }).map((_, i) => (
                      <i key={i} className={(i * 7 + (i % 5)) % 3 === 0 ? "on" : ""} />
                    ))}
                  </div>
                </div>
                <b>{brl(total)}</b>
                <small>QR Code ilustrativo · dados reais serão configurados no backend.</small>
                <Button variant="outline" className="mt-3 w-full">
                  Copiar código PIX
                </Button>
              </div>
              <div className="option-panel">
                <h3>Condição</h3>
                <RadioGroup defaultValue="avista" className="mt-4 space-y-3">
                  <label className="radio-line">
                    <RadioGroupItem value="avista" />
                    <span>À vista</span>
                  </label>
                  <label className="radio-line">
                    <RadioGroupItem value="parcelado" />
                    <span>Parcelado</span>
                  </label>
                </RadioGroup>
                <div className="mt-5">
                  <span className="form-label">Aprovação do cliente</span>
                  <div className="segmented-control mt-2 flex-wrap">
                    {["Verbal", "WhatsApp", "Assinatura", "Outro"].map((a) => (
                      <button
                        key={a}
                        className={approval === a ? "is-active" : ""}
                        onClick={() => setApproval(a)}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="quote-step-content">
            <StepTitle
              icon={Check}
              title="Revisão"
              subtitle="Confira as informações antes de gerar o documento ou iniciar o atendimento."
            />
            <div className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
              <div className="space-y-4">
                <div className="review-card">
                  <h3>Cliente</h3>
                  <p>
                    <b>{customer.name}</b>
                  </p>
                  <span>
                    {customer.document} · {customer.phone}
                  </span>
                  <span>
                    {customer.address}, {customer.city} - {customer.state}
                  </span>
                </div>
                <div className="review-card">
                  <h3>Veículo / equipamento</h3>
                  <p>
                    <b>
                      {[vehicle?.brand, vehicle?.model].filter(Boolean).join(" ") || vehicle?.type}
                    </b>
                  </p>
                  <span>
                    {vehicle?.plate
                      ? `Placa ${vehicle.plate}`
                      : "Veículo/equipamento sem placa informada"}
                  </span>
                  <span>{notes}</span>
                </div>
                <div className="review-card">
                  <h3>Itens</h3>
                  {items.map((item) => (
                    <div key={item.id} className="review-line">
                      <span>
                        {item.quantity}× {item.description}
                      </span>
                      <b>{brl(item.quantity * item.unitPrice)}</b>
                    </div>
                  ))}
                </div>
              </div>
              <div className="review-summary">
                <div>
                  <span>Subtotal</span>
                  <b>{brl(subtotal)}</b>
                </div>
                <div>
                  <span>Desconto</span>
                  <b>{brl(discount)}</b>
                </div>
                <div className="is-total">
                  <span>Total geral</span>
                  <b>{brl(total)}</b>
                </div>
                <hr />
                <div>
                  <span>Pagamento</span>
                  <b>{payment}</b>
                </div>
                <div>
                  <span>Aprovação</span>
                  <b>{approval}</b>
                </div>
                <div className="mt-4 space-y-2">
                  <Button variant="outline" className="w-full">
                    Salvar rascunho
                  </Button>
                  <Button variant="outline" className="w-full">
                    Gerar PDF
                  </Button>
                  <Button className="w-full" onClick={() => void navigate({ to: "/orcamentos" })}>
                    Finalizar e ir para orçamentos
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="quote-actions">
          <Button asChild variant="ghost">
            <Link to="/orcamentos">Cancelar</Link>
          </Button>
          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="outline" onClick={back}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Voltar
              </Button>
            )}
            {step < 4 && (
              <Button onClick={next}>
                Próximo
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </section>
    </InternalPage>
  );
}

function StepTitle({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: typeof UserRound;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="step-title">
      <span>
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}
