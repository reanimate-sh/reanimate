export const splitChangelogItem = (item: string) => {
  const normalizedItem = item.trim().replace(/^-\s*/, "");
  const firstColonIndex = normalizedItem.indexOf(":");

  if (firstColonIndex < 0) {
    return {
      label: "",
      description: normalizedItem,
    };
  }

  return {
    label: `${normalizedItem.slice(0, firstColonIndex)}:`,
    description: normalizedItem.slice(firstColonIndex + 1).trim(),
  };
};
