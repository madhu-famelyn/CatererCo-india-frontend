import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Table, THead, TR, TH, TD } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { catererService } from "@/services/catererService";
import { menuService } from "@/services/menuService";
import { AED } from "@/lib/format";
import { Trash2 } from "lucide-react";

export default function Dishes() {
  const qc = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ["my-caterer-profile"],
    queryFn: catererService.getMyProfile,
  });

  const catererId = profile?.id;

  const { data: menu = {}, isLoading } = useQuery({
    queryKey: ["caterer-menu", catererId],
    queryFn: () => menuService.getMenu(catererId),
    enabled: Boolean(catererId),
  });

  const deleteMutation = useMutation({
    mutationFn: (itemId) => menuService.deleteDish(catererId, itemId),
    onSuccess: () => {
      toast.success("Dish removed");
      qc.invalidateQueries(["caterer-menu", catererId]);
    },
  });

  const rows = Object.entries(menu).flatMap(([cat, items]) =>
    items.map((i) => ({ ...i, cat }))
  );

  return (
    <>
      <PageHeader
        title="Dishes"
        description="Your master dish catalogue."
      />
      <Table>
        <THead>
          <TR>
            <TH>Dish</TH>
            <TH>Category</TH>
            <TH>Cuisine</TH>
            <TH>Type</TH>
            <TH>Price</TH>
            <TH>Status</TH>
            <TH></TH>
          </TR>
        </THead>
        <tbody>
          {isLoading ? (
            <TR>
              <TD colSpan={7} className="text-center py-6 text-muted-foreground">Loading dishes…</TD>
            </TR>
          ) : rows.length === 0 ? (
            <TR>
              <TD colSpan={7} className="text-center py-8 text-muted-foreground">
                No dishes in master catalogue yet. Go to <strong>Menu</strong> tab to add dishes.
              </TD>
            </TR>
          ) : (
            rows.map((r) => (
              <TR key={r.id}>
                <TD className="font-medium">{r.name}</TD>
                <TD className="capitalize">{r.cat}</TD>
                <TD>
                  <span className="inline-flex items-center rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-xs font-semibold text-[var(--primary)] border border-[var(--primary)]/20">
                    {r.cuisine || "Indian"}
                  </span>
                </TD>
                <TD>{r.veg ? "Veg" : "Non-veg"}</TD>
                <TD>{AED(r.price)}</TD>
                <TD><Badge variant="success">Available</Badge></TD>
                <TD>
                  <button
                    onClick={() => deleteMutation.mutate(r.id)}
                    className="rounded-md p-1.5 hover:bg-muted text-[var(--danger)] transition"
                    title="Delete dish"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </TD>
              </TR>
            ))
          )}
        </tbody>
      </Table>
    </>
  );
}
