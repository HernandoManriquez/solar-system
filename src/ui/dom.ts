import type { Locale } from '../i18n';
import { i18n } from '../i18n';

/** Small DOM helper utilities for the vanilla UI layer. */

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function clear(node: HTMLElement): void {
  node.textContent = '';
}

export function fmtKm(km: number, locale: Locale): string {
  if (km >= 1_000_000_000) {
    return `${(km / 1_000_000_000).toFixed(1)} ${i18n.t('unitBillionKm', locale)}`;
  }
  if (km >= 1_000_000) {
    return `${(km / 1_000_000).toFixed(1)} ${i18n.t('unitMillionKm', locale)}`;
  }
  if (km >= 1_000) {
    return `${(km / 1_000).toFixed(1)} ${i18n.t('unitThousandKm', locale)}`;
  }
  return `${km.toFixed(0)} ${i18n.t('unitKm', locale)}`;
}
