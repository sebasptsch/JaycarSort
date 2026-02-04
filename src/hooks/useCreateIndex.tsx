import { useMutation, useQueryClient } from "@tanstack/react-query";
import { regenerateIndex } from "../lib/lunr";

export default function useCreateIndex() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: regenerateIndex,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["components"],
				exact: false,
			});
		},
	});
}
