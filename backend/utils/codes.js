export function generateSKU(productCode, color, sizeName) {
  const cleanCode = String(productCode || "").toUpperCase().replace(/\s+/g, "-");
  const cleanColor = String(color || "").toUpperCase().replace(/\s+/g, "-");
  const cleanSize = String(sizeName || "").toUpperCase().replace(/\s+/g, "-");

  return `${cleanCode}-${cleanColor}-${cleanSize}`;
}

export function generateBarcode() {
  let code = "";
  for (let i = 0; i < 13; i++) {
    code += Math.floor(Math.random() * 10);
  }
  return code;
}
