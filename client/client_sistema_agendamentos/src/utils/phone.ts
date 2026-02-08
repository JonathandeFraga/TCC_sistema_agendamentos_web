export function normalizeBrMobileToE164(input: string): string | null {
    const digits = input.replace(/\D/g, '');

    let national = digits;
    if (digits.startsWith('55') && digits.length === 13) national = digits.slice(2);
    if (national.length !== 11) return null;

    const ddd = national.slice(0, 2);
    const subscriber = national.slice(2);

    if (ddd === '00') return null;
    if (!/^9\d{8}$/.test(subscriber)) return null;

    return `+55${national}`;
}