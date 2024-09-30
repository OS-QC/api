import path from 'path'
import { I18n } from 'i18n'

export const fxI18n = new I18n({
  locales: ['en', 'es'],
  directory: path.join(__dirname, 'locales'),
  defaultLocale: 'en',
})