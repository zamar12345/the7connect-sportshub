
import { Badge } from "@/components/ui/badge";

interface PostContentProps {
  content: string;
  hashtags?: string[];
  image_url?: string;
  video_url?: string;
}

const PostContent = ({ content, hashtags, image_url, video_url }: PostContentProps) => {
  return (
    <>
      <p className="mt-1 mb-2 text-foreground whitespace-pre-wrap">{content}</p>
      
      {hashtags && hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {hashtags.map(tag => (
            <Badge 
              key={tag} 
              variant="secondary" 
              className="text-xs bg-primary/10 hover:bg-primary/20 text-primary cursor-pointer transition-colors"
            >
              #{tag}
            </Badge>
          ))}
        </div>
      )}
      
      {image_url && (
        <div className="mt-2 mb-3 rounded-xl overflow-hidden group-hover:shadow-md transition-all">
          <img 
            src={image_url} 
            alt="Post content" 
            className="w-full object-cover rounded-xl group-hover:scale-[1.01] transition-transform"
            style={{ maxHeight: "280px" }}
          />
        </div>
      )}
      
      {video_url && (
        <div className="mt-2 mb-3 rounded-xl overflow-hidden group-hover:shadow-md transition-all">
          <video 
            src={video_url} 
            controls
            className="w-full rounded-xl"
            style={{ maxHeight: "280px" }}
          />
        </div>
      )}
    </>
  );
};

export default PostContent;
