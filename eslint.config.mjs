import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  ...compat.extends('next/core-web-vitals'),
  {
    ignores: ['.next/**', 'out/**', 'node_modules/**'],
  },
  {
    // The logo uses a plain <img> on purpose: it needs an onError fallback
    // for a missing public/logo.png, which next/image doesn't offer here.
    rules: { '@next/next/no-img-element': 'warn' },
  },
];

export default eslintConfig;
