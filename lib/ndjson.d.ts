// next.config.ts loads *.ndjson with webpack's asset/source: the import is the file text.
declare module "*.ndjson" {
  const text: string;
  export default text;
}
