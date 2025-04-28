
import { Json } from "@/integrations/supabase/types";
import { Achievement, Stat } from "@/types/profile";

export function parseAchievements(data: Json | null): Achievement[] {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return [];
  }
  
  try {
    const achievements = Array.isArray(data) 
      ? data 
      : (data as { [key: string]: any })['achievements'] || [];
    
    if (!Array.isArray(achievements)) {
      return [];
    }
    
    return achievements.filter((item): item is Achievement => 
      typeof item === 'object' && 
      item !== null && 
      'title' in item && 
      'year' in item
    );
  } catch (error) {
    console.error("Error parsing achievements:", error);
    return [];
  }
}

export function parseStats(data: Json | null): Stat[] {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return [];
  }
  
  try {
    const stats = Array.isArray(data) 
      ? data 
      : (data as { [key: string]: any })['stats'] || [];
    
    if (!Array.isArray(stats)) {
      return [];
    }
    
    return stats.filter((item): item is Stat => 
      typeof item === 'object' && 
      item !== null && 
      'label' in item && 
      'value' in item
    );
  } catch (error) {
    console.error("Error parsing stats:", error);
    return [];
  }
}
