import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat()

const config = [
  { ignores: ['.next'] },
  ...compat.extends('next/core-web-vitals'),
]

export default config
