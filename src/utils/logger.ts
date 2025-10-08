// src/utils/logger.ts
const isProduction = import.meta.env.PROD;

const maskString = (str: string, startLen: number, endLen: number, maskChar: string = '*') => {
  if (!str || str.length <= startLen + endLen) {
    return str;
  }
  return str.substring(0, startLen) + maskChar.repeat(str.length - startLen - endLen) + str.substring(str.length - endLen);
};

const maskEmail = (email: string) => {
  if (!email || !email.includes('@')) return email;
  const [localPart, domain] = email.split('@');
  const maskedLocal = maskString(localPart, 1, 1); // e.g., t***a
  return `${maskedLocal}@${domain}`;
};

const maskPhone = (phone: string) => {
  if (!phone) return phone;
  const digits = phone.replace(/\D/g, ''); // Remove non-digits
  if (digits.length < 8) return phone; // Not enough digits to mask meaningfully
  const maskedDigits = maskString(digits, 2, 2); // e.g., 619***498
  return phone.replace(digits, maskedDigits); // Replace original digits with masked ones
};

const maskUrl = (url: string) => {
  if (!url) return url;
  try {
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/');
    const filename = pathSegments[pathSegments.length - 1];
    return `[Arquivo: ${filename}]`;
  } catch (e) {
    return '[URL de arquivo mascarada]';
  }
};

const maskUuid = (uuid: string) => {
  if (!uuid || uuid.length !== 36) return uuid; // UUIDs are 36 chars long
  return `${uuid.substring(0, 4)}...${uuid.substring(uuid.length - 4)}`;
};

const maskObject = (obj: any): any => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => maskObject(item));
  }

  const maskedObj: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      switch (key) {
        case 'email':
          maskedObj[key] = maskEmail(value);
          break;
        case 'phone':
        case 'client_phone':
        case 'whatsapp':
          maskedObj[key] = maskPhone(value);
          break;
        case 'energy_bill_file':
          maskedObj[key] = maskUrl(value);
          break;
        case 'id':
        case 'affiliate_id':
          maskedObj[key] = maskUuid(value);
          break;
        case 'password_hash': // Senhas nunca devem ser logadas, mas se por algum motivo aparecerem, mascarar
          maskedObj[key] = '********';
          break;
        default:
          maskedObj[key] = maskObject(value); // Recursivamente mascarar objetos aninhados
          break;
      }
    }
  }
  return maskedObj;
};

export const appLogger = {
  log: (...args: any[]) => {
    if (!isProduction) {
      console.log(...args);
    } else {
      const maskedArgs = args.map(arg => maskObject(arg));
      console.log(...maskedArgs);
    }
  },
  error: (...args: any[]) => {
    console.error(...args); // Erros geralmente não são mascarados para facilitar o debug em produção
  },
  warn: (...args: any[]) => {
    console.warn(...args);
  },
  info: (...args: any[]) => {
    if (!isProduction) {
      console.info(...args);
    } else {
      const maskedArgs = args.map(arg => maskObject(arg));
      console.info(...maskedArgs);
    }
  },
};


