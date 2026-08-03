import type { Resolver } from "react-hook-form";

export type extractResolverFields<Type> = Type extends Resolver<infer X> ? X : never