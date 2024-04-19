export type ExtractRouteParams<Path extends string> = Path extends `${infer Left}/${infer Right}`
    ? Left extends `:${infer Param}`
        ? Record<Param, string> & ExtractRouteParams<Right>
        : ExtractRouteParams<Right>
    : Path extends `:${infer Param}`
        ? Record<Param, string>
        : Record<string, never>;
