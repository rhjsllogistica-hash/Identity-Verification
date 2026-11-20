export function cleanCpfDigits(value: string): string {
  return value.replace(/\D/g, '').slice(0, 11);
}

export function formatCpf(value: string): string {
  const digits = cleanCpfDigits(value);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

export function maskCpf(value: string): string {
  const digits = cleanCpfDigits(value);
  if (digits.length !== 11) return '***.***.***-**';
  return `${digits.slice(0, 3)}.***.***-${digits.slice(9, 11)}`;
}

export function isValidCpf(value: string): boolean {
  const digits = cleanCpfDigits(value);
  if (digits.length !== 11) return false;

  // Reject known invalid sequences with all identical digits
  if (/^(\d)\1{10}$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += Number(digits[i]) * (10 - i);
  }
  let check1 = (sum * 10) % 11;
  if (check1 === 10 || check1 === 11) check1 = 0;
  if (check1 !== Number(digits[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += Number(digits[i]) * (11 - i);
  }
  let check2 = (sum * 10) % 11;
  if (check2 === 10 || check2 === 11) check2 = 0;
  if (check2 !== Number(digits[10])) return false;

  return true;
}
