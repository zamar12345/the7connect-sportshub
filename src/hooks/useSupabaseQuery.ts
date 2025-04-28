
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

type QueryFunction<T> = () => Promise<T>;

export function useSupabaseQuery<T>(
  queryKey: string[], 
  queryFn: QueryFunction<T>, 
  options = {}
) {
  return useQuery({
    queryKey,
    queryFn,
    onError: (error: Error) => {
      console.error(`Query error (${queryKey.join('/')}):`, error);
      toast.error(`Error: ${error.message}`);
    },
    ...options
  });
}
