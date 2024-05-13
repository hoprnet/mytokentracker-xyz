{ pkgs ? import <nixpkgs> {}, ... }:
let
  linuxPkgs = with pkgs; lib.optional stdenv.isLinux (
    inotifyTools
  );
  macosPkgs = with pkgs; lib.optional stdenv.isDarwin (
    with darwin.apple_sdk.frameworks; [
      # macOS file watcher support
      CoreFoundation
      CoreServices
    ]
  );
in
with pkgs;
mkShell {
  buildInputs = [
    envsubst
    # nodejs-20_x
    # (yarn.override { nodejs = nodejs-20_x; })
    deno
    macosPkgs
    linuxPkgs
  ];
  shellHook = ''
    deno install --unstable-worker-options --allow-read --allow-net --allow-env \
      --allow-run --name denoflare --force --root .deno \
      https://raw.githubusercontent.com/skymethod/denoflare/v0.6.0/cli/cli.ts
    export PATH="$PWD/.deno/bin:$PATH";
  '';
}
