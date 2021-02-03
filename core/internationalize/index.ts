import { I18n } from 'i18n';
import { fromRootPath } from 'utils';

const i18n = new I18n();
const i = i18n.__;

i18n.configure({
  defaultLocale: 'vi',
  locales: ['en', 'vi'],
  directory: fromRootPath('translations')
});

export { i };
export default i18n;
