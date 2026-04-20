const CATEGORY_CLASS_MAP = {
  supermercado: "supermercado",
  transporte: "transporte",
  entretenimiento: "entretenimiento",
  salud: "salud",
  restaurantes: "restaurantes",
  servicios: "servicios",
  otros: "otros",
};

export function normalizeCategoryClass(category) {
  return CATEGORY_CLASS_MAP[String(category || "").toLowerCase()] || "otros";
}
