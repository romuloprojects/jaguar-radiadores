import { createFileRoute } from "@tanstack/react-router";
import { Building2, CreditCard, Save, Settings, SlidersHorizontal, UserCog } from "lucide-react";
import { InternalPage, SectionPanel } from "@/components/InternalPage";
import { PageHeader } from "@/components/ui-helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/configuracoes")({ component: SettingsPage });

function SettingsPage() {
  return (
    <InternalPage>
      <PageHeader title="Configurações" subtitle="Parâmetros visuais da futura estrutura administrativa. Nesta etapa, nenhuma alteração é persistida." icon={Settings} right={<Button><Save className="mr-2 h-4 w-4"/>Salvar alterações</Button>} />
      <div className="grid gap-4 xl:grid-cols-2">
        <SectionPanel title="Dados da empresa" subtitle="Informações que serão reutilizadas nos documentos gerados" icon={Building2}>
          <div className="form-grid"><label className="form-field xl:col-span-2"><span>Razão social / nome</span><Input defaultValue="Jaguar Radiadores"/></label><label className="form-field"><span>CNPJ</span><Input placeholder="00.000.000/0001-00"/></label><label className="form-field"><span>Telefone</span><Input defaultValue="(43) 99625-5524"/></label><label className="form-field xl:col-span-2"><span>Endereço</span><Input defaultValue="PR 151 (Trevo) - Distrito Industrial - Jaguariaíva - PR"/></label></div>
        </SectionPanel>
        <SectionPanel title="PIX e formas de pagamento" subtitle="Dados padrão para orçamento e cobrança" icon={CreditCard}>
          <div className="form-grid"><label className="form-field"><span>Tipo de chave PIX</span><Input defaultValue="CNPJ"/></label><label className="form-field"><span>Chave PIX</span><Input placeholder="Configurar posteriormente"/></label><label className="form-field xl:col-span-2"><span>Nome do recebedor</span><Input defaultValue="Jaguar Radiadores"/></label></div>
        </SectionPanel>
        <SectionPanel title="Preferências operacionais" subtitle="Regras previstas para o fluxo de atendimento" icon={SlidersHorizontal}>
          <div className="settings-lines"><div><span><b>Reservar estoque ao aprovar orçamento</b><small>Evita venda duplicada de peças já comprometidas.</small></span><Switch defaultChecked/></div><div><span><b>Dar baixa na conclusão</b><small>Movimenta o estoque quando o serviço for finalizado.</small></span><Switch defaultChecked/></div><div><span><b>Permitir aprovação verbal</b><small>Registra responsável, data e forma da aprovação.</small></span><Switch defaultChecked/></div></div>
        </SectionPanel>
        <SectionPanel title="Usuários e permissões" subtitle="Estrutura prevista para a integração futura de autenticação" icon={UserCog}>
          <div className="record-card"><div><b>Lucas</b><span>Administrador</span></div><Button variant="outline" size="sm">Editar</Button></div><div className="record-card mt-2"><div><b>Atendimento</b><span>Perfil operacional demonstrativo</span></div><Button variant="outline" size="sm">Editar</Button></div>
        </SectionPanel>
      </div>
    </InternalPage>
  );
}
