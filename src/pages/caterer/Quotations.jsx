import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { quotationService } from "@/services/quotationService";
import { AED } from "@/lib/format";

const tabs = ["Pending", "Approved", "Rejected"];

export default function CatererQuotations() {
  const [tab, setTab] = useState("Pending");
  const [editingId, setEditingId] = useState(null);
  const [newTotal, setNewTotal] = useState("");
  const qc = useQueryClient();

  const { data: quotations = [], isLoading } = useQuery({
    queryKey: ["caterer-quotations", tab.toLowerCase()],
    queryFn: () => quotationService.getQuotations({ status: tab.toLowerCase() }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => quotationService.updateQuotation(id, data),
    onSuccess: () => {
      toast.success("Quotation price updated!");
      setEditingId(null);
      qc.invalidateQueries(["caterer-quotations"]);
    },
    onError: () => toast.error("Failed to update quotation price"),
  });

  const approveMutation = useMutation({
    mutationFn: quotationService.approveQuotation,
    onSuccess: () => { toast.success("Quotation approved & sent to customer!"); qc.invalidateQueries(["caterer-quotations"]); },
    onError: () => toast.error("Failed to approve quotation"),
  });

  const rejectMutation = useMutation({
    mutationFn: quotationService.rejectQuotation,
    onSuccess: () => { toast.success("Quotation rejected"); qc.invalidateQueries(["caterer-quotations"]); },
    onError: () => toast.error("Failed to reject quotation"),
  });

  return (
    <>
      <PageHeader title="Quotation approval center" description="Review incoming requests, adjust prices, and send tailored quotes." />
      
      <div className="mb-4 flex gap-1 rounded-lg border border-border bg-surface p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md px-4 py-1.5 text-sm transition-all ${tab === t ? "gradient-primary text-primary-foreground font-semibold" : "text-muted-foreground hover:text-foreground"}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {isLoading && <div className="text-sm text-muted-foreground">Loading quotations…</div>}

        {quotations.map((q) => (
          <Card key={q.id} className="p-5">
            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <div className="text-sm font-semibold">{q.id}</div>
                  <Badge variant={q.status === "approved" ? "success" : q.status === "rejected" ? "danger" : "warning"}>
                    {q.status}
                  </Badge>
                </div>
                <div className="mt-1 text-lg font-display">{q.event} · {q.guests} guests</div>
                <div className="text-xs text-muted-foreground mt-0.5">Valid till: {q.valid_till || "N/A"}</div>
              </div>

              <div className="text-right">
                {editingId === q.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={newTotal}
                      onChange={(e) => setNewTotal(e.target.value)}
                      placeholder="New total AED"
                      className="w-36 h-9 text-sm"
                    />
                    <Button
                      size="sm"
                      disabled={updateMutation.isPending}
                      onClick={() => updateMutation.mutate({ id: q.id, data: { total: parseFloat(newTotal) } })}
                    >
                      Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="font-display text-2xl font-bold">{AED(q.total)}</div>
                    {q.status === "pending" && (
                      <div className="mt-2 flex flex-wrap gap-2 md:justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => { setEditingId(q.id); setNewTotal(q.total); }}
                        >
                          Adjust price
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          disabled={rejectMutation.isPending}
                          onClick={() => rejectMutation.mutate(q.id)}
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          disabled={approveMutation.isPending}
                          onClick={() => approveMutation.mutate(q.id)}
                        >
                          Approve & send
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}

        {!isLoading && quotations.length === 0 && (
          <Card className="text-center py-12 text-muted-foreground">
            No {tab.toLowerCase()} quotations found.
          </Card>
        )}
      </div>
    </>
  );
}
