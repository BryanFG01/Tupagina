import type { BlockStyle } from '@/domain/landing/block.types'

const PADDING: Record<string, string> = {
  sm: 'py-8',
  md: 'py-16',
  lg: 'py-24',
  xl: 'py-32',
}

const FONT: Record<string, string> = {
  inter:    'font-inter',
  playfair: 'font-playfair',
  grotesk:  'font-grotesk',
  nunito:   'font-nunito',
}

/**
 * Returns className string for the block's <section> element.
 * Merges custom style with the block's default bg and padding.
 */
export function bsCls(
  style: BlockStyle | undefined,
  defaultBg: string,
  defaultPadding: string = 'py-16',
  extra: string = ''
): string {
  const padding = style?.paddingY ? (PADDING[style.paddingY] ?? defaultPadding) : defaultPadding
  const font    = style?.fontFamily ? (FONT[style.fontFamily] ?? '') : ''
  // If a custom bg is set, skip the default bg class
  const bg = (style?.backgroundColor && style.backgroundColor !== 'default') ? '' : defaultBg
  return `${padding} px-6 ${bg} ${font} ${extra}`.trim().replace(/\s+/g, ' ')
}

/**
 * Returns inline style object for background + text color overrides.
 */
export function bsStyle(style: BlockStyle | undefined): React.CSSProperties {
  const css: React.CSSProperties = {}
  if (style?.backgroundColor && style.backgroundColor !== 'default') {
    css.backgroundColor = style.backgroundColor
  }
  if (style?.textColor && style.textColor !== 'default') {
    css.color = style.textColor
  }
  return css
}

/**
 * Returns button background and text colors from BlockStyle.
 * Use on <a> / <button> elements inside blocks.
 */
export function bsBtn(style: BlockStyle | undefined): React.CSSProperties {
  const css: React.CSSProperties = {}
  if (style?.buttonColor && style.buttonColor !== 'default') {
    css.backgroundColor = style.buttonColor
    css.borderColor = style.buttonColor
  }
  if (style?.buttonTextColor && style.buttonTextColor !== 'default') {
    css.color = style.buttonTextColor
  }
  return css
}
