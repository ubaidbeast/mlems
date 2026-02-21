import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.categories.$post>;
type RequestType = InferRequestType<typeof client.api.categories.$post>["json"];

export const useCreateCategory = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async (json) => {
            const reponse = await client.api.categories.$post({json})
            return await reponse.json();
        },
        onSuccess: () => {
            toast.success("Category created successfully");
            queryClient.invalidateQueries({queryKey: ["categories"]});
        },
        onError: () => {
            toast.error("Failed to create category");
        }
    })

    return mutation;
}