"use client";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ApproveButtons } from "./approve-buttons";
import { ChevronDown } from "lucide-react";

export type PendingDoc = {
  id: string;
  type: string;
  number: string | null;
  fileUrl: string;
};

export type PendingUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  docs: PendingDoc[];
};

export function PendingSubmissions({ users }: { users: PendingUser[] }) {
  if (users.length === 0) {
    return (
      <Card className="mt-3">
        <CardContent className="p-8 text-center text-muted-foreground">
          All caught up. No pending documents.
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="mt-3 space-y-3">
      {users.map((u) => (
        <PendingUserCard key={u.id} user={u} />
      ))}
    </div>
  );
}

function PendingUserCard({ user }: { user: PendingUser }) {
  // Default open when a single user is the only one pending feels heavy, so
  // start collapsed; the count chip tells the admin how many docs await.
  const [open, setOpen] = useState(false);

  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full text-left"
      >
        <div className="flex items-center gap-3 p-4">
          <Avatar src={user.avatarUrl} name={user.name} size={40} />
          <div className="min-w-0 flex-1">
            <div className="font-medium truncate">{user.name}</div>
            <div className="text-xs text-muted-foreground truncate">
              {user.email}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
              {user.docs.length} pending
            </span>
            <ChevronDown
              className={
                "h-5 w-5 text-muted-foreground transition-transform " +
                (open ? "rotate-180" : "")
              }
            />
          </div>
        </div>
      </button>

      {open && (
        <CardContent className="border-t bg-muted/20 p-4 space-y-4">
          {user.docs.map((d) => (
            <div key={d.id} className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <Badge>{d.type.replace(/_/g, " ")}</Badge>
                {d.number && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Document number: </span>
                    <span className="font-mono break-all">{d.number}</span>
                  </p>
                )}
              </div>
              <a
                href={d.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="block mt-3"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={d.fileUrl}
                  alt="document"
                  className="max-h-64 w-full rounded-lg border bg-muted object-contain"
                />
              </a>
              <ApproveButtons id={d.id} />
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  );
}
