
import { useSupabaseQuery } from "./useSupabaseQuery";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchComments, addComment } from "@/services/posts";
import { toast } from "sonner";
import { Comment } from "@/types/supabase";

export function useCommentsQuery(postId: string) {
  return useSupabaseQuery<Comment[]>(
    ['comments', postId],
    () => fetchComments(postId),
    {
      enabled: !!postId
    }
  );
}

export function useAddCommentMutation(postId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (content: string) => addComment(postId, content),
    onSuccess: () => {
      // Invalidate and refetch comments for this post
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      // Update post counts
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success("Comment added");
    },
    onError: (error: Error) => {
      toast.error(`Error posting comment: ${error.message}`);
    }
  });
}
