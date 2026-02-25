import { cn } from "@/lib/utils";
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
 } from "@/components/ui/select"

type Props = {
    columnIndex: number;
    selectedColumn: Record<string, string | null>;
    onChange: (columnIndex: number, value: string | null) => void;
}

const options = [
    "amount",
    "payee",
    "date",
]

export const TableHeadSelect = ({ columnIndex, selectedColumn, onChange }: Props) => {
    const currentSelection = selectedColumn[`column_${columnIndex}`];
    return (
        <Select
            value={currentSelection || ""}
            onValueChange={(value) => onChange(columnIndex, value)}
        >
            <SelectTrigger className={cn(
                "focus:ring-offset-0 focus:ring-transparent outline-none border-none bg-transparent capitalize",
                currentSelection && "text-blue-500"
            )}>
                <SelectValue placeholder="Skip"/>
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="Skip">Skip</SelectItem>
                {options.map((option, index) => {
                    const disabled = Object.values(selectedColumn).includes(option) && selectedColumn[`column_${columnIndex}`] !== option;
                    return (
                        <SelectItem 
                        key={index} 
                        value={option}
                        disabled={disabled}
                        className="capitalize"
                        >
                            {option}
                        </SelectItem>
                    )
                })}
            </SelectContent>
        </Select>
    )
}