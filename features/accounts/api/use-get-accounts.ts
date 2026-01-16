import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetAccounts = () => {
    const query = useQuery({
        queryKey: ["accouonts"],
        queryFn: async () => {
            const response = await client.api.accounts.$get();

            if(!response) {
                throw new Error("Failed to fetch accounts");
            }

            const { data } = await response.json();
            return data;
        }
    })

    return query;
}