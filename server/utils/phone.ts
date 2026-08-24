import { parsePhoneNumberFromString } from 'libphonenumber-js/min'
export const normalizePhone = (value: string, countryCode: string) => {
  const parsed = parsePhoneNumberFromString(value.trim(), countryCode as never)
  if (!parsed || !parsed.isValid()) return undefined
  return parsed.number
}
