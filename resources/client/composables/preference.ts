import { useDark, useSessionStorage } from '@vueuse/core'
import type { RemovableRef } from '@vueuse/core'
import { darkTheme, dateEnUS, dateIdID, enUS, idID } from 'naive-ui'
import type { GlobalTheme, GlobalThemeOverrides, NDateLocale, NLocale } from 'naive-ui'

export interface AppPreference {
  locale: string
}

export interface MenuPreference {
  collapsed: boolean
  activeKey?: string
  expandedKeys: string[]
}

interface NaiveConfig {
  theme: GlobalTheme | null
  themeOverrides: GlobalThemeOverrides
  locale: NLocale
  dateLocale: NDateLocale
}

export const appPreference: RemovableRef<AppPreference> = useSessionStorage<AppPreference>('app-preference', {
  locale: document.documentElement.lang,
})

export const menuPreference: RemovableRef<MenuPreference> = useSessionStorage<MenuPreference>('menu-preference', {
  collapsed: false,
  expandedKeys: [],
})

const themeOverrides: GlobalThemeOverrides = {}

/**
 * Override default naive-ui theme.
 *
 * @see https://www.naiveui.com/en-US/os-theme/docs/customize-theme
 * @param overrides
 */
export function createThemeOverrides(overrides: GlobalThemeOverrides): void {
  Object.assign(themeOverrides, overrides)
}

/**
 * Use naive-ui configuration
 */
export function useNaiveConfig(): NaiveConfig {
  const i18n = useI18n()
  const isDark = useDark()

  const lang = i18n.locale.value as AppLocale

  const locales: { [k in AppLocale]: NLocale } = {
    id: idID,
    en: enUS,
  }

  const dateLocales: { [k in AppLocale]: NDateLocale } = {
    id: dateIdID,
    en: dateEnUS,
  }

  return {
    theme: isDark ? darkTheme : null,
    themeOverrides,
    locale: locales[lang],
    dateLocale: dateLocales[lang],
  }
}
