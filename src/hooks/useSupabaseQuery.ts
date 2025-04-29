
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { toast } from "sonner";

type QueryFunction<T> = () => Promise<T>;

export function useSupabaseQuery<T>(
  queryKey: string[], 
  queryFn: QueryFunction<T>, 
  options: Omit<UseQueryOptions<T, Error, T, string[]>, 'queryKey' | 'queryFn'> = {}
) {
  return useQuery({
    queryKey,
    queryFn,
    meta: {
      onError: (error: Error) => {
        console.error(`Query error (${queryKey.join('/')}):`, error);
        toast.error(`Error: ${error.message}`);
      }
    },
    retry: (failureCount, error) => {
      // Don't retry on unauthorized errors or after 3 attempts
      if (error.message.includes('JWT') || error.message.includes('authentication')) {
        return false;
      }
      return failureCount < 3;
    },
    ...options
  });
}
