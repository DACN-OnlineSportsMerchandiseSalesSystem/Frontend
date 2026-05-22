export interface SimpleCategory {
  id: number;
  name: string;
  parentId?: number | null;
}

/**
 * Sorts category names in parent-to-child order.
 * E.g., if we have a parent category "Bóng đá" and child "Giày bóng đá",
 * it returns ["Bóng đá", "Giày bóng đá"] regardless of their initial order.
 */
export function sortCategoryNamesParentFirst(
  categoryNames: string[] | undefined,
  allCategories: SimpleCategory[]
): string[] {
  if (!categoryNames || categoryNames.length <= 1 || !allCategories || !allCategories.length) {
    return categoryNames || [];
  }

  // Find the category objects that match the names
  const matchingCats = allCategories.filter(c => categoryNames.includes(c.name));

  // If we can't find them, return original names
  if (matchingCats.length === 0) return categoryNames;

  // Calculate the depth of each matching category
  const getDepth = (cat: SimpleCategory): number => {
    let depth = 0;
    let current = cat;
    // Prevent infinite loop if there's a cycle
    const visited = new Set<number>();
    while (current && current.parentId !== undefined && current.parentId !== null && !visited.has(current.id)) {
      visited.add(current.id);
      depth++;
      const pId = current.parentId;
      const parent = allCategories.find(c => c.id === pId);
      if (!parent) break;
      current = parent;
    }
    return depth;
  };

  // Associate each name with its depth.
  // Categories not found in allCategories will default to depth 0.
  const nameToDepth = new Map<string, number>();
  matchingCats.forEach(cat => {
    nameToDepth.set(cat.name, getDepth(cat));
  });

  // Sort original categoryNames based on their depth
  const sortedNames = [...categoryNames].sort((a, b) => {
    const depthA = nameToDepth.get(a) ?? 0;
    const depthB = nameToDepth.get(b) ?? 0;
    return depthA - depthB;
  });

  return sortedNames;
}
