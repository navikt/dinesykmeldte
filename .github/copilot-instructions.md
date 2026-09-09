# dinesykmeldte

```sh
pnpm start
pnpm test
pnpm lint
pnpm gen
pnpm build
```

- `pnpm start` starts development and GraphQL codegen watchers; it is not a
  production-server command. `pnpm dev` starts only Next.js.
- Change `.graphql`/`.graphqls` sources and run `pnpm gen` before checking or
  building affected code. Do not edit `*.generated.ts`; `pnpm build` does not
  run codegen for you.
- Local URLs include `NEXT_PUBLIC_BASE_PATH` (`/arbeidsgiver/sykmeldte`).
- Fake resolver identities and authentication bypasses are restricted to the
  existing `isLocalOrDemo` gate. Other environments must keep the validated
  request token in the resolver context for downstream TokenX calls.
