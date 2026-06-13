"use client";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { ChevronDown, FileText } from "lucide-react";

export type DecisionDoc = {
  id: string;
  type: string;
  status: string; // PENDING | APPROVED | REJECTED
  reviewedAt: string | null;
  createdAt: string;
  number: string | null;
  fileUrl: string;
};

export type DecisionUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  kycStatus: string;
  lastDecisionAt: string | null;
  docs: DecisionDoc[];
};

function statusVariant(status: string) {
  if (status === "APPROVED" || status === "VERIFIED") return "success" as const;
  if (status === "REJECTED") return "destructive" as const;
  return "secondary" as const;
}

export function RecentDecisions({ users }: { users: DecisionUser[] }) {
  if (users.length === 0) {
    return (
      <Card className="mt-3">
        <CardContent className="p-6 text-center text-muted-foreground">
          No decisions yet.
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="mt-3 space-y-2">
      {users.map((u) => (
        <UserDecisionCard key={u.id} user={u} />
      ))}
    </div>
  );
}

function UserDecisionCard({ user }: { user: DecisionUser }) {
  const [open, setOpen] = useState(false);

  const approved = user.docs.filter((d) => d.status === "APPROVED").length;
  const rejected = user.docs.filter((d) => d.status === "REJECTED").length;
  const pending = user.docs.filter((d) => d.status === "PENDING").length;

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
            {/* Compact summary chips — wrap on small screens */}
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {approved > 0 && (
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                  {approved} approved
                </span>
              )}
              {pending > 0 && (
                <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                  {pending} pending
                </span>
              )}
              {rejected > 0 && (
                <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-700">
                  {rejected} rejected
                </span>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Badge variant={statusVariant(user.kycStatus)} className="hidden sm:inline-flex">
              {user.kycStatus}
            </Badge>
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
        <CardContent className="border-t bg-muted/20 p-4 pt-3">
          <ul className="space-y-2">
            {user.docs.map((d) => (
              <li
                key={d.id}
                className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-lg border bg-card px-3 py-2"
              >
                <a
                  href={d.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-w-0 items-center gap-2 text-sm hover:underline"
                >
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{d.type.replace(/_/g, " ")}</span>
                </a>
                <div className="flex items-center gap-2">
                  <Badge variant={statusVariant(d.status)}>{d.status}</Badge>
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                    {d.reviewedAt
                      ? formatDate(d.reviewedAt)
                      : formatDate(d.createdAt)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      )}
    </Card>
  );
}
