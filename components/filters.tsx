import { AccountFilter } from "./account-filters"
import { DateFilter } from "./date-filter"
import { AppRole } from "@/lib/roles"

type Props = {
    role: AppRole;
    userDepartment: string | null;
}

export const Filters = ({ role, userDepartment }: Props) => {
    return (
        <div className="flex flex-col lg:flex-row items-center gap-y-2 lg:gap-y-0 lg:gap-x-2">
            <AccountFilter role={role} userDepartment={userDepartment} />
            <DateFilter />
        </div>
    )
}