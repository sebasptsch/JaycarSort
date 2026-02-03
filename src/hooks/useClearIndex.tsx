import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clearIndex } from "../lib/lunr";

export default function useClearIndex() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: clearIndex,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["components"],
				exact: false,
			});
		},
	});
}
