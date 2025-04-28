
import { useState, useEffect } from "react";
import { fetchComments, addComment } from "@/services/postService";
import { useAuth } from "@/context/AuthProvider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

interface CommentUser {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: CommentUser;
}

interface CommentSectionProps {
  postId: string;
}

const CommentSection = ({ postId }: CommentSectionProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const getComments = async () => {
      try {
        setLoading(true);
        const commentsData = await fetchComments(postId);
        setComments(commentsData);
      } catch (error: any) {
        console.error("Error fetching comments:", error);
        toast.error(`Error loading comments: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    getComments();
  }, [postId]);
  
  const handleSubmitComment = async () => {
    if (!user) {
      toast.error("You must be logged in to comment");
      return;
    }
    
    if (newComment.trim() === "") return;
    
    try {
      setIsSubmitting(true);
      await addComment(postId, newComment);
      
      // Refresh comments after posting
      const commentsData = await fetchComments(postId);
      setComments(commentsData);
      
      setNewComment("");
      toast.success("Comment added");
    } catch (error: any) {
      console.error("Error posting comment:", error);
      toast.error(`Error posting comment: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + " at " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className="flex flex-col space-y-4">
      {/* Comment input */}
      <div className="flex gap-3">
        <Avatar className="w-8 h-8">
          <AvatarImage src={user?.user_metadata?.avatar_url} />
          <AvatarFallback>{user?.user_metadata?.full_name?.[0] || user?.email?.[0]}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full resize-none"
            disabled={!user || isSubmitting}
          />
          
          <div className="flex justify-end mt-2">
            <Button
              onClick={handleSubmitComment}
              disabled={newComment.trim() === "" || !user || isSubmitting}
              className="bg-sport-blue hover:bg-sport-blue/90"
              size="sm"
            >
              {isSubmitting ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Comments list */}
      <div className="space-y-4 pt-2">
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Loading comments...</p>
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 border-t border-border pt-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={comment.user.avatar_url} alt={comment.user.full_name} />
                <AvatarFallback>{comment.user.full_name?.[0] || comment.user.username?.[0]}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="font-semibold text-sm">
                    {comment.user.full_name || comment.user.username}
                  </span>
                  <span className="text-muted-foreground text-xs ml-2">
                    @{comment.user.username}
                  </span>
                </div>
                
                <p className="text-sm mt-1">{comment.content}</p>
                
                <span className="text-xs text-muted-foreground mt-1 block">
                  {formatTimestamp(comment.created_at)}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
