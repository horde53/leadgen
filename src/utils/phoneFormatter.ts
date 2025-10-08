// ==========================================
// UTILITÁRIOS DE FORMATAÇÃO DE TELEFONE
// ==========================================

/**
 * Formata um número de telefone para o padrão brasileiro
 * @param value - Valor a ser formatado
 * @returns Número formatado no padrão (11) 99999-9999
 */
export function formatPhoneNumber(value: string): string {
  // Remove todos os caracteres não numéricos
  const numbers = value.replace(/\D/g, '');
  
  // Limita a 11 dígitos (DDD + 9 dígitos)
  const limitedNumbers = numbers.slice(0, 11);
  
  // Aplica a máscara baseada no tamanho
  if (limitedNumbers.length <= 2) {
    return limitedNumbers;
  } else if (limitedNumbers.length <= 7) {
    return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2)}`;
  } else {
    return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 7)}-${limitedNumbers.slice(7)}`;
  }
}

/**
 * Remove a formatação do telefone, deixando apenas números
 * @param formattedPhone - Telefone formatado
 * @returns Apenas os números
 */
export function unformatPhoneNumber(formattedPhone: string): string {
  return formattedPhone.replace(/\D/g, '');
}

/**
 * Valida se o telefone está no formato correto
 * @param phone - Telefone a ser validado
 * @returns true se válido, false caso contrário
 */
export function isValidPhoneNumber(phone: string): boolean {
  const numbers = unformatPhoneNumber(phone);
  // Deve ter 10 ou 11 dígitos (com ou sem o 9 adicional)
  return numbers.length >= 10 && numbers.length <= 11;
}

/**
 * Formata o telefone para exibição no padrão brasileiro
 * @param phone - Telefone a ser formatado
 * @returns Telefone formatado ou string vazia se inválido
 */
export function displayPhoneNumber(phone: string): string {
  if (!phone) return '';
  
  const numbers = unformatPhoneNumber(phone);
  if (numbers.length < 10) return phone; // Retorna como está se muito curto
  
  return formatPhoneNumber(numbers);
}


