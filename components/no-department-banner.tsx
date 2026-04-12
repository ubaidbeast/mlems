"use client";

import { AlertTriangle, ShieldAlert } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const NoDepartmentBanner = () => {
    return (
        <Card className="mb-8 overflow-hidden border-amber-500/30 bg-linear-to-br from-amber-500/15 via-orange-500/10 to-background shadow-sm">
            <CardContent className="p-0">
                <div className="flex flex-col gap-4 border-l-4 border-amber-500 p-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-700 ring-1 ring-amber-500/20">
                            <AlertTriangle className="size-6" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-lg font-semibold text-foreground">No Department Assigned</h2>
                                <Badge variant="secondary" className="bg-amber-500/15 text-amber-800 hover:bg-amber-500/15">
                                    Restricted access
                                </Badge>
                            </div>
                            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                                Your account does not have a department yet, so dashboard data and transaction tools are unavailable.
                                Ask an administrator to assign your department role to restore access.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-800 ring-1 ring-amber-500/20">
                        <ShieldAlert className="size-4" />
                        Admin action required
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
