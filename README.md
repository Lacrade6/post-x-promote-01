# post-x-promote-01

[![make.fun bounty](https://make.fun/badge/post-x-promote-make-your-own-bounty-01.svg)](https://make.fun/bounty/post-x-promote-make-your-own-bounty-01)

Entry for the make.fun bounty ["Promote make.fun's make-your-own-bounty post on X"](https://make.fun/bounty/post-x-promote-make-your-own-bounty-01) ($250, top 50 paid).

The entry is the post itself: a post by [@perbedaxan](https://x.com/perbedaxan) on X quoting [make.fun's make-your-own-bounty post](https://x.com/makefunai/status/2124915864336236646), with a photo of its own attached and the play code in its text. `POST.json` names that post, and `main.ts` validates the address and hands it to the gate.

## Run it

```sh
mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
```

This copies `POST.json` to `out/POST.json` and writes a deterministic
`out/validation.json` describing the checks the URL passed. It needs
Node 22 and nothing else: standard library only, no network access.
