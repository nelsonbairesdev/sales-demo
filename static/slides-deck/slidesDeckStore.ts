import { reactive } from "vue";
import { problemDataSets } from "./data/problemDataSets";

const STORAGE_KEY = "slides-deck-store";

export type Slide = {
  id: number;
  title: string;
}

export type SlidesSizeMap = {
  id: Slide["id"];
  size: number;
}

export type Problem = {
  id: number;
  title: string;
  orderHint?: number;
}

interface slidesDeckState {
  sizeMap: SlidesSizeMap[];
  currentSlide: Slide | undefined;
} 

const initialSizeMap = (): SlidesSizeMap[] => {
  return problemDataSets.map(problem => ({
    id: problem.id,
    size: 50 // Default size for each problem bubble
  }));
};

const load = (): slidesDeckState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { sizeMap: initialSizeMap(), currentSlide: undefined };  
  } catch(error) {
    console.error("Failed to load slides deck store from localStorage", error);
    return { sizeMap: [], currentSlide: undefined };
  }
}

const state = reactive<slidesDeckState>(load());

const save = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save slides deck store to localStorage", error);
  }
};

const slidesDeckStore = {
  getState() {
    return state;
  },

  setCurrentSlide(slide : Slide | undefined) {
    state.currentSlide = slide;
    save();
  },

  getCurrentSlide() {
    return state.currentSlide;
  },

  addSizeMap(slidesSizeMap: SlidesSizeMap) {
    const existing = state.sizeMap.find(s => s.id === slidesSizeMap.id);
    if (existing) {
      existing.size = slidesSizeMap.size;
    } else {
      state.sizeMap.push(slidesSizeMap);
    }
    save();
  },

  getSizeMap() {
    return state.sizeMap;
  },

  getProblemsSortedByPriority(): Problem[] {
    // Sort problems by size in descending order (highest priority first)
    return state.sizeMap
      .sort((a, b) => b.size - a.size)
      .map(item => ({
        id: item.id,
        title: `Problem ${item.id}`,
        orderHint: item.size
      }));
  },

  clear() {
    localStorage.removeItem(STORAGE_KEY);
    Object.assign(state, { sizeMap: [], currentSlideId: undefined });
  },

  increaseBubbleSize(id: Slide["id"], increment = 10) {
    const currentSize = state.sizeMap.find(s => s.id === id)?.size || 50;
    this.addSizeMap({ id, size: currentSize + increment });
  },

  decreaseBubbleSize(id: Slide["id"], decrement = 10) {
    const currentSize = state.sizeMap.find(s => s.id === id)?.size || 50;
    this.addSizeMap({ id, size: currentSize - decrement });
  },
}

export default slidesDeckStore;
