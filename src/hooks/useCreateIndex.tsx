import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createIndex } from "../lib/lunr";

export default function useCreateIndex() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createIndex,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["components"],
				exact: false,
			});
		},
	});
}
