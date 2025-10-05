// Utilidades de formateo para el sistema Prestsy

/**
 * Formatea un número como moneda
 * @param amount - El monto a formatear
 * @param currency - La moneda (por defecto USD)
 * @param locale - La configuración regional (por defecto es-US)
 * @returns El monto formateado como moneda
 */
export const formatCurrency = (
  amount: number | string,
  currency: string = 'USD',
  locale: string = 'es-US'
): string => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) {
    return '$0.00';
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);
};

/**
 * Formatea un número con separadores de miles
 * @param number - El número a formatear
 * @param locale - La configuración regional (por defecto es-US)
 * @returns El número formateado con separadores
 */
export const formatNumber = (
  number: number | string,
  locale: string = 'es-US'
): string => {
  const numericValue = typeof number === 'string' ? parseFloat(number) : number;
  
  if (isNaN(numericValue)) {
    return '0';
  }

  return new Intl.NumberFormat(locale).format(numericValue);
};

/**
 * Formatea una fecha en formato legible
 * @param date - La fecha a formatear (Date, string o timestamp)
 * @param options - Opciones de formateo
 * @returns La fecha formateada
 */
export const formatDate = (
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
): string => {
  let dateObj: Date;

  if (typeof date === 'string') {
    dateObj = new Date(date);
  } else if (typeof date === 'number') {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }

  if (isNaN(dateObj.getTime())) {
    return 'Fecha inválida';
  }

  return dateObj.toLocaleDateString('es-ES', options);
};

/**
 * Formatea una fecha y hora
 * @param date - La fecha a formatear
 * @returns La fecha y hora formateada
 */
export const formatDateTime = (date: Date | string | number): string => {
  return formatDate(date, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Formatea un porcentaje
 * @param value - El valor decimal a formatear como porcentaje
 * @param decimals - Número de decimales (por defecto 2)
 * @returns El porcentaje formateado
 */
export const formatPercentage = (
  value: number,
  decimals: number = 2
): string => {
  if (isNaN(value)) {
    return '0%';
  }

  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Formatea un número de teléfono
 * @param phone - El número de teléfono
 * @returns El teléfono formateado
 */
export const formatPhone = (phone: string): string => {
  if (!phone) return '';
  
  // Eliminar todos los caracteres que no sean números
  const cleaned = phone.replace(/\D/g, '');
  
  // Formatear según la longitud
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  return phone; // Devolver original si no coincide con formatos conocidos
};

/**
 * Formatea el estado de un préstamo
 * @param status - El estado del préstamo
 * @returns El estado formateado y legible
 */
export const formatLoanStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'active': 'Activo',
    'paid': 'Pagado',
    'overdue': 'Vencido',
    'pending': 'Pendiente',
    'cancelled': 'Cancelado',
    'approved': 'Aprobado',
    'rejected': 'Rechazado'
  };

  return statusMap[status.toLowerCase()] || status;
};

/**
 * Formatea el tiempo transcurrido desde una fecha
 * @param date - La fecha de referencia
 * @returns El tiempo transcurrido en formato legible
 */
export const formatTimeAgo = (date: Date | string | number): string => {
  const now = new Date();
  const dateObj = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Hace unos segundos';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `Hace ${days} día${days > 1 ? 's' : ''}`;
  } else {
    return formatDate(dateObj);
  }
};

/**
 * Trunca un texto a una longitud específica
 * @param text - El texto a truncar
 * @param maxLength - La longitud máxima
 * @returns El texto truncado con puntos suspensivos si es necesario
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) {
    return text || '';
  }
  
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Capitaliza la primera letra de cada palabra
 * @param text - El texto a capitalizar
 * @returns El texto capitalizado
 */
export const capitalizeWords = (text: string): string => {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Formatea un ID de préstamo con padding
 * @param id - El ID del préstamo
 * @param length - La longitud deseada (por defecto 6)
 * @returns El ID formateado con ceros a la izquierda
 */
export const formatLoanId = (id: string | number, length: number = 6): string => {
  const idStr = String(id);
  return idStr.padStart(length, '0');
};

/**
 * Valida y formatea un email
 * @param email - El email a formatear
 * @returns El email en minúsculas y limpio
 */
export const formatEmail = (email: string): string => {
  if (!email) return '';
  return email.toLowerCase().trim();
};

/**
 * Formatea un monto para mostrar en inputs
 * @param amount - El monto a formatear
 * @returns El monto sin símbolo de moneda para inputs
 */
export const formatAmountForInput = (amount: number | string): string => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) {
    return '';
  }

  return numericAmount.toFixed(2);
};