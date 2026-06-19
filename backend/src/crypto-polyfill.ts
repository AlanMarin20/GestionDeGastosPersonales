import * as crypto from 'crypto';

// Hacer crypto disponible globalmente antes de que cualquier módulo lo use
if (typeof (globalThis as any).crypto === 'undefined') {
  (globalThis as any).crypto = crypto;
}

export {};
