
import React from 'react';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

const EMOJI_CATEGORIES = {
  "Smileys & People": [
    "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃", 
    "😉", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😙"
  ],
  "Sports": [
    "⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱",
    "🏓", "🏸", "🏒", "🏑", "🥍", "🏏", "🥅", "⛳", "🪁", "🏹"
  ],
  "Activities": [
    "🚶", "🧗", "🏃", "🤸", "⛹️", "🤾", "🏌️", "🏇", "🧘", "🏄",
    "🏊", "🤽", "🚣", "🧞", "🧚", "🧙", "👨‍🚀", "👩‍🚀", "👨‍🔬", "👩‍🔬"
  ],
  "Nature": [
    "🌲", "🌳", "🌴", "🌵", "🌾", "🌱", "🌿", "☘️", "🍀", "🍁",
    "🍂", "🍃", "🌊", "🪨", "🌋", "🏔️", "⛰️", "🏕️", "🏜️", "🏝️"
  ]
};

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect }) => {
  const [activeCategory, setActiveCategory] = React.useState<keyof typeof EMOJI_CATEGORIES>("Sports");

  return (
    <div className="emoji-picker">
      <div className="flex border-b mb-2">
        {Object.keys(EMOJI_CATEGORIES).map((category) => (
          <button
            key={category}
            className={`px-2 py-1 text-sm ${activeCategory === category ? 'border-b-2 border-sport-blue' : ''}`}
            onClick={() => setActiveCategory(category as keyof typeof EMOJI_CATEGORIES)}
          >
            {category}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-8 gap-1">
        {EMOJI_CATEGORIES[activeCategory].map((emoji, index) => (
          <button
            key={index}
            className="text-xl p-1 hover:bg-muted rounded"
            onClick={() => onEmojiSelect(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmojiPicker;
