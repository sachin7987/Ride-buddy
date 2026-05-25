"use client";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { cn, formatTime } from "@/lib/utils";

type Message = {
  id: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  createdAt: string;
};

export function Chat({
  rideId,
  otherUserId,
  otherUserName,
  otherUserAvatar,
}: {
  rideId: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar?: string | null;
}) {
  const { data: session } = useSession();
  const myId = (session?.user as any)?.id as string | undefined;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function load() {
    const res = await fetch(
      `/api/messages?rideId=${rideId}&with=${otherUserId}`,
      { cache: "no-store" }
    );
    if (res.ok) {
      const data = await res.json();
      setMessages(data.messages);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rideId, otherUserId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    const text = input.trim();
    setInput("");
    setBusy(true);
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rideId, toUserId: otherUserId, content: text }),
    });
    setBusy(false);
    if (res.ok) {
      const { message } = await res.json();
      setMessages((m) => [...m, message]);
    }
  }

  return (
    <div className="flex flex-col rounded-xl border bg-muted/30">
      <div
        ref={scrollRef}
        className="flex-1 overflow-auto p-4 space-y-3 max-h-80"
      >
        {messages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-6">
            Send a message to {otherUserName.split(" ")[0]} to coordinate pickup.
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.fromUserId === myId;
            return (
              <div
                key={m.id}
                className={cn(
                  "flex items-end gap-2",
                  mine ? "justify-end" : "justify-start"
                )}
              >
                {!mine && (
                  <Avatar src={otherUserAvatar} name={otherUserName} size={28} />
                )}
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-3 py-2 text-sm",
                    mine
                      ? "bg-brand-500 text-white rounded-br-sm"
                      : "bg-card border rounded-bl-sm"
                  )}
                >
                  <div>{m.content}</div>
                  <div
                    className={cn(
                      "mt-0.5 text-[10px]",
                      mine ? "text-white/70" : "text-muted-foreground"
                    )}
                  >
                    {formatTime(m.createdAt)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      <form onSubmit={send} className="flex gap-2 border-t p-3 bg-card rounded-b-xl">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Message ${otherUserName.split(" ")[0]}…`}
          autoComplete="off"
        />
        <Button
          type="submit"
          variant="gradient"
          size="icon"
          loading={busy}
          disabled={!input.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
