import { z } from "zod"
import { json } from "@remix-run/node";
import dayjs from "dayjs";

export const CleanPositiveIntSchema = z.number().positive();

export const StringNumber = z.string().regex(/\d+/).transform(Number);

export const PositiveDecimalSchema = z
  .number()
  .positive()
  .or(StringNumber)
  .refine((n) => n > 0);

export const PerhapsZeroIntSchema = z
  .number()
  .int()
  .min(0)
  .or(StringNumber)
  .refine((n) => n > 0)

export const PositiveIntSchema = z
  .number()
  .int()
  .min(1)
  .or(StringNumber)
  .refine((n) => n > 0)

export const DateSchema = z.preprocess((arg) => {
  if (typeof arg == "string" || arg instanceof Date) {
    return new Date(arg);
  }
}, z.date())
.or(z.string())
.refine(str => dayjs(str).isValid());

export type inferSafeParseErrors<T extends z.ZodType<any, any, any>> = {
  [P in keyof z.infer<T>]?: string[];
};

interface ActionData {
  formError?: string;
  fields?: {
    [index: string]: any;
  }
  fieldErrors?: {
    [index: string]: string[];
  }
}

export function badRequest (data: ActionData) {
  return json(data, { status: 400 });
};