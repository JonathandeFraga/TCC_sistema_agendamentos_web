export function formatBRLFromCent(cents: number) {
    return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function isoToBRDate(isoDate: string) {
    const [y, m, d] = isoDate.split("-");
    return `${d}/${m}/${y}`;
}