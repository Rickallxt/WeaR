import { wardrobeItems as seedItems, type WardrobeItem } from '../../data/wearData';

export function getWardrobeItemsForOutfit(wardrobe: WardrobeItem[], pieces: string[]) {
  return pieces
    .map((piece, index) => {
      const match = wardrobe.find((item) => item.name === piece);
      const seedMatch = seedItems.find((item) => item.name === piece);

      return (
        match ??
        seedMatch ?? {
          id: `${piece}-${index}`,
          name: piece,
          palette: 'from-[#ece7df] via-[#fffaf4] to-[#dde4ff]',
          imageDataUrl: null,
          category: 'Other',
          fit: '',
          material: '',
          color: 'Neutral',
          tags: [],
          status: 'Core',
        }
      );
    })
    .slice(0, 4);
}
