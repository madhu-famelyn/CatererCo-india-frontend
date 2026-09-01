import { useState, useEffect } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Send, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

export default function Messages() {
  const [caterersList, setCaterersList] = useState([]);
  const [activeCaterer, setActiveCaterer] = useState(null);
  const [messages, setMessages] = useState([
    { sender: "caterer", text: "Hi Layla, tasting on Aug 3 at 4 PM works for us." },
    { sender: "user", text: "Perfect — please add 2 vegetarian mains." },
    { sender: "caterer", text: "Noted. I'll update the menu draft." },
  ]);
  const [inputMsg, setInputMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCaterers() {
      try {
        const res = await api.get("/caterers");
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setCaterersList(res.data);
          setActiveCaterer(res.data[0]);
        }
      } catch (e) {
        console.error("Error loading caterers for messaging:", e);
      } finally {
        setLoading(false);
      }
    }
    loadCaterers();
  }, []);

  const handleSend = () => {
    if (!inputMsg.trim()) return;
    setMessages((prev) => [...prev, { sender: "user", text: inputMsg }]);
    setInputMsg("");
  };

  return (
    <>
      <PageHeader title="Messages" description="Chat directly with caterers about your events." />
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
          <Loader2 className="h-5 w-5 animate-spin text-[var(--primary)]" /> Loading conversations…
        </div>
      ) : caterersList.length > 0 ? (
        <Card className="grid min-h-[560px] grid-cols-1 overflow-hidden lg:grid-cols-[280px_1fr]">
          <div className="border-b border-border p-3 lg:border-b-0 lg:border-r space-y-1">
            {caterersList.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCaterer(c)}
                className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition ${
                  activeCaterer?.id === c.id ? "bg-[var(--primary)]/10 font-semibold border-l-2 border-[var(--primary)]" : "hover:bg-muted/50"
                }`}
              >
                <div className="h-9 w-9 rounded-full bg-[var(--primary)] text-white grid place-items-center text-xs font-bold shrink-0">
                  {(c.name || "C")[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{c.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{c.emirate || c.location || "Dubai"}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="flex flex-col">
            <div className="border-b border-border p-4">
              <div className="font-semibold">{activeCaterer?.name || "Caterer"}</div>
              <div className="text-xs text-emerald-600 font-medium">Online · usually replies in 15 min</div>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`max-w-md rounded-2xl p-3 text-sm ${
                    m.sender === "user"
                      ? "ml-auto bg-[var(--primary)] text-white font-medium shadow-sm"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {m.text}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 border-t border-border p-3">
              <Input
                placeholder="Type a message…"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <Button size="icon" onClick={handleSend}><Send className="h-4 w-4" /></Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="rounded-xl border border-border bg-surface p-8 text-center text-sm text-muted-foreground">
          No caterer conversations found.
        </div>
      )}
    </>
  );
}
