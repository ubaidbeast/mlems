import { format } from "date-fns"
import {
    Tooltip,
    XAxis,
    ResponsiveContainer,
    CartesianGrid,
    LineChart,
    Line
} from "recharts"

import { CustomTooltip } from "./custom-tooltip"

type Props = {
    data: {
        date: string
        income: number
        expense: number
    }[]
}

export const LineVariant = ({ data }: Props) => {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => format(value, "dd MMM")}
                    style={{fontSize: "12px"}}
                    tickMargin={16}
                />
                <Tooltip content={<CustomTooltip/>} />
                <Line
                    dot={false} 
                    dataKey="Budget"
                    stroke="#3d82f6"
                    strokeWidth={2}
                    className="drop-shadow-sm"
                />
                <Line
                    dot={false} 
                    dataKey="expense"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    className="drop-shadow-sm"
                />
            </LineChart>
        </ResponsiveContainer>
    )
}