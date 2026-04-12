"use client"

import qs from "query-string"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { useGetAccounts } from "@/features/accounts/api/use-get-accounts"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { useGetSummary } from "@/features/summary/use-get-summary"
import { AppRole } from "@/lib/roles"
import { AlertCircle } from "lucide-react"

type Props = {
    role: AppRole;
    userDepartment: string | null;
}

export const AccountFilter = ({ role, userDepartment }: Props) => {
    const router = useRouter()
    const pathname = usePathname()

    const params = useSearchParams()
    const accountId = params.get("accountId") || "all"
    const from = params.get("from") || ""
    const to = params.get("to") || ""
    

    const { data: accounts, isLoading: isLoadingAccounts } = useGetAccounts()
    const { isLoading: isLoadingSummary } = useGetSummary()

    const isNonAdmin = role !== "admin";
    const hasNoDepartment = isNonAdmin && !userDepartment;

    const onChange = (newValue: string) => {
        const query = {
            accountId: newValue,
            from,
            to
        }

        if (newValue === "all") {
            query.accountId = ""
        }

        const url = qs.stringifyUrl({
            url: pathname,
            query
        }, { skipNull: true, skipEmptyString: true })

        router.push(url)
    }

    // For employees with no department, show a disabled state with message
    if (hasNoDepartment) {
        return (
            <div className="flex items-center gap-2 w-full lg:w-auto">
                <div className="flex-1 lg:flex-initial">
                    <Select disabled>
                        <SelectTrigger
                            className="lg:w-auto w-full h-9 rounded-md px-3 font-normal bg-white/10 hover:bg-white/20 hover:text-white border-none focus:ring-offset-0 focus:ring-transparent outline-none text-white focus:bg-white/30 transition disabled:opacity-50 cursor-not-allowed"
                        >
                            <SelectValue placeholder="No Department Assigned"/>
                        </SelectTrigger>
                    </Select>
                </div>
                <div className="flex items-center gap-1 text-sm text-yellow-200">
                    <AlertCircle className="size-4" />
                </div>
            </div>
        )
    }

    // For employees with a department, show their department as disabled/selected
    if (isNonAdmin && userDepartment) {
        const departmentName = accounts?.find(acc => acc.id === userDepartment)?.name || "Your Department";
        
        return (
            <Select 
                value={userDepartment}
                disabled={true}
            >
                <SelectTrigger
                    className="lg:w-auto w-full h-9 rounded-md px-3 font-normal bg-white/10 hover:bg-white/20 hover:text-white border-none focus:ring-offset-0 focus:ring-transparent outline-none text-white focus:bg-white/30 transition disabled:opacity-70 cursor-not-allowed"
                >
                    <SelectValue placeholder="Department"/>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={userDepartment}>
                        {departmentName}
                    </SelectItem>
                </SelectContent>
            </Select>
        )
    }

    // For admins, show the full filter with all departments
    return (
        <Select 
            value={accountId}
            onValueChange={onChange}
            disabled={isLoadingAccounts || isLoadingSummary}
        >
            <SelectTrigger
                className="lg:w-auto w-full h-9 rounded-md px-3 font-normal bg-white/10 hover:bg-white/20 hover:text-white border-none focus:ring-offset-0 focus:ring-transparent outline-none text-white focus:bg-white/30 transition"
            >
                <SelectValue placeholder="select Department"/>
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">
                    All departments
                </SelectItem>
                {accounts?.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                        {account.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
