import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Props = {
  label?: string;
  title?: string;
  description?: string;
  onDelete: () => Promise<unknown>;
  onDone?: () => Promise<void> | void;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "outline" | "ghost" | "destructive";
  iconOnly?: boolean;
  disabled?: boolean;
};

export function DeleteAction({
  label = "Excluir",
  title = "Excluir registro?",
  description = "Esta ação não pode ser desfeita.",
  onDelete,
  onDone,
  size = "sm",
  variant = "ghost",
  iconOnly = false,
  disabled = false,
}: Props) {
  const [pending, setPending] = useState(false);
  async function run() {
    setPending(true);
    try {
      await onDelete();
      toast.success("Registro excluído.");
      onDone?.();
    } catch (error: any) {
      toast.error(error?.message || "Não foi possível excluir o registro.");
    } finally {
      setPending(false);
    }
  }
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" size={iconOnly ? "icon" : size} variant={variant} disabled={disabled || pending} className="text-destructive hover:text-destructive">
          <Trash2 className={iconOnly ? "h-4 w-4" : "mr-1 h-4 w-4"}/>{iconOnly ? <span className="sr-only">{label}</span> : label}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => { void run(); }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {pending ? "Excluindo..." : "Excluir definitivamente"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
