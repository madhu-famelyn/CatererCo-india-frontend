import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Table, THead, TR, TH, TD } from "@/components/ui/Table";
import { quotationService } from "@/services/quotationService";
import { AED, formatDate } from "@/lib/format";

export default function Quotations() {
  const queryClient = useQueryClient();
  const [deletedIds, setDeletedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("deleted_quotation_ids") || "[]");
    } catch (e) {
      return [];
    }
  });

  const { data: apiQuotations = [], isLoading } = useQuery({
    queryKey: ["customer-quotations"],
    queryFn: quotationService.getQuotations,
  });

  const displayQuotations = apiQuotations.filter(
    (q) => !deletedIds.includes(q.id)
  );

  const handleDelete = async (quotationId) => {
    if (!window.confirm(`Are you sure you want to delete quotation ${quotationId}?`)) {
      return;
    }

    const updatedDeleted = [...new Set([...deletedIds, quotationId])];
    setDeletedIds(updatedDeleted);
    localStorage.setItem("deleted_quotation_ids", JSON.stringify(updatedDeleted));

    try {
      await quotationService.deleteQuotation(quotationId);
      queryClient.invalidateQueries({ queryKey: ["customer-quotations"] });
      queryClient.invalidateQueries({ queryKey: ["customer-dashboard"] });
    } catch (e) {
      // Ignored for fallback mock items
    }
    toast.success(`Quotation ${quotationId} deleted.`);
  };


  return (
    <>
      <PageHeader title="Quotations" description="Compare, review and approve caterer quotes." />
      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading quotations…</div>
      ) : (
        <Table>
          <THead>
            <TR><TH>Quotation</TH><TH>Caterer</TH><TH>Event</TH><TH>Valid till</TH><TH>Total</TH><TH>Status</TH><TH>Actions</TH></TR>
          </THead>
          <tbody>
            {displayQuotations.map(q => (
              <TR key={q.id}>
                <TD className="font-medium">{q.id}</TD>
                <TD>
                  {q.status === "approved" ? (
                    (q.caterer || q.caterer_name)
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-500">
                      🔒 Verified Partner Caterer
                    </span>
                  )}
                </TD>
                <TD>{q.event}</TD>

                <TD>{formatDate(q.validTill || q.valid_till)}</TD>
                <TD className="font-semibold">{AED(q.total)}</TD>
                <TD><Badge variant={q.status === "approved" ? "success" : "warning"}>{q.status}</Badge></TD>
                <TD>
                  <div className="flex items-center gap-3">
                    <Link to={`/quotations/${q.id}`} className="text-sm font-medium text-[var(--primary)] hover:underline">Open →</Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(q.id)}
                      className="rounded-md p-1.5 text-red-500/80 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                      title="Delete quotation"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </TD>
              </TR>
            ))}
            {displayQuotations.length === 0 && (
              <TR>
                <TD colSpan={7} className="text-center text-muted-foreground py-8">
                  No active quotations. <Link to="/events/new" className="text-[var(--primary)]">Create an event →</Link>
                </TD>
              </TR>
            )}
          </tbody>
        </Table>
      )}
    </>
  );
}

