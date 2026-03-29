import { en } from './en';

type Leaves<T, Prefix extends string = ''> = {
  [K in keyof T]: T[K] extends object
    ? Leaves<T[K], `${Prefix}${K & string}.`>
    : `${Prefix}${K & string}`;
}[keyof T];

export type TranslationKey = Leaves<typeof en.translation>;
