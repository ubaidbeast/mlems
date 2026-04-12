"use client";

import { useMemo, useState, useTransition } from "react";
import { Loader2, Mail, Plus } from "lucide-react";
import { toast } from "sonner";

import { assignDepartmentToUser } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SendInvitationDialog } from "@/features/invitations/components/send-invitation-dialog";

const NO_DEPARTMENT_VALUE = "__none__";

type UserDepartmentRow = {
    id: string;
    clerkId: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    departmentId: string | null;
    departmentName: string | null;
};

type DepartmentOption = {
    id: string;
    name: string;
};

type Props = {
    users: UserDepartmentRow[];
    departments: DepartmentOption[];
};

type PendingAssignment = {
    userId: string;
    userName: string;
    departmentId: string | null;
    departmentName: string;
};

const getUserName = (user: UserDepartmentRow) => {
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();

    if (fullName.length > 0) {
        return fullName;
    }

    return user.email ?? user.clerkId;
};

export const UsersDepartmentsManager = ({ users, departments }: Props) => {
    const [rows, setRows] = useState(users);
    const [selectedDepartments, setSelectedDepartments] = useState<Record<string, string>>(() => {
        const initialState: Record<string, string> = {};

        for (const user of users) {
            initialState[user.id] = user.departmentId ?? NO_DEPARTMENT_VALUE;
        }

        return initialState;
    });
    const [pendingAssignment, setPendingAssignment] = useState<PendingAssignment | null>(null);
    const [invitationDialogOpen, setInvitationDialogOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const departmentsById = useMemo(() => {
        return new Map(departments.map((department) => [department.id, department.name]));
    }, [departments]);

    const openConfirmation = (user: UserDepartmentRow) => {
        const selectedValue = selectedDepartments[user.id] ?? NO_DEPARTMENT_VALUE;
        const selectedDepartmentId = selectedValue === NO_DEPARTMENT_VALUE ? null : selectedValue;

        if (selectedDepartmentId === user.departmentId) {
            toast.info("No changes to save for this user");
            return;
        }

        const selectedDepartmentName =
            selectedDepartmentId === null
                ? "No department"
                : departmentsById.get(selectedDepartmentId) ?? "Unknown department";

        setPendingAssignment({
            userId: user.id,
            userName: getUserName(user),
            departmentId: selectedDepartmentId,
            departmentName: selectedDepartmentName,
        });
    };

    const onConfirmAssignment = () => {
        if (!pendingAssignment) {
            return;
        }

        startTransition(async () => {
            const result = await assignDepartmentToUser({
                userId: pendingAssignment.userId,
                departmentId: pendingAssignment.departmentId,
            });

            if (result.error) {
                toast.error(result.error);
                return;
            }

            setRows((currentRows) => {
                return currentRows.map((row) => {
                    if (row.id !== pendingAssignment.userId) {
                        return row;
                    }

                    return {
                        ...row,
                        departmentId: pendingAssignment.departmentId,
                        departmentName: pendingAssignment.departmentId
                            ? pendingAssignment.departmentName
                            : null,
                    };
                });
            });

            toast.success(
                pendingAssignment.departmentId
                    ? `Department assigned to ${pendingAssignment.userName}`
                    : `Department cleared for ${pendingAssignment.userName}`,
            );

            setPendingAssignment(null);
        });
    };

    return (
        <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
            <Card className="border-none drop-shadow-sm">
                <CardHeader className="gap-y-2 lg:flex lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <CardTitle className="text-xl line-clamp-1 font-bold">Assign Departments</CardTitle>
                        <CardDescription>
                            AAssign a department to an employee.
                        </CardDescription>
                    </div>
                    <Button 
                        className="w-full lg:w-auto" 
                        onClick={() => setInvitationDialogOpen(true)}
                    >
                        <Mail size={16}/>
                        Send Invitation
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Current Department</TableHead>
                                <TableHead>Assign Department</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{getUserName(user)}</TableCell>
                                    <TableCell>{user.email ?? "-"}</TableCell>
                                    <TableCell>{user.departmentName ?? "No department"}</TableCell>
                                    <TableCell>
                                        <Select
                                            value={selectedDepartments[user.id] ?? NO_DEPARTMENT_VALUE}
                                            onValueChange={(value) => {
                                                setSelectedDepartments((currentState) => ({
                                                    ...currentState,
                                                    [user.id]: value,
                                                }));
                                            }}
                                        >
                                            <SelectTrigger className="w-[220px]">
                                                <SelectValue placeholder="Select department" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={NO_DEPARTMENT_VALUE}>No department</SelectItem>
                                                {departments.map((department) => (
                                                    <SelectItem key={department.id} value={department.id}>
                                                        {department.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            disabled={isPending}
                                            onClick={() => openConfirmation(user)}
                                        >
                                            Assign
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog
                open={pendingAssignment !== null}
                onOpenChange={(isOpen) => {
                    if (!isOpen) {
                        setPendingAssignment(null);
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm assignment</DialogTitle>
                        <DialogDescription>
                            {pendingAssignment?.departmentId
                                ? `Do you want to assign ${pendingAssignment.departmentName} to ${pendingAssignment.userName}?`
                                : `Do you want to remove department assignment for ${pendingAssignment?.userName}?`}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            disabled={isPending}
                            onClick={() => setPendingAssignment(null)}
                        >
                            Cancel
                        </Button>
                        <Button disabled={isPending} onClick={onConfirmAssignment}>
                            {isPending ? <Loader2 className="size-4 animate-spin" /> : "Confirm"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <SendInvitationDialog 
                open={invitationDialogOpen} 
                onOpenChange={setInvitationDialogOpen} 
            />
        </div>
    );
};
