#!/usr/bin/env bash

TAG="O1";
CIRE="$HOME/git/cire/CIRE/build/CIRE_LLVM";

mkdir -p results;
for prgm in $(cat programs.txt); do
  ./hl.sh -c yellow -s double $prgm;
  $CIRE "ll/$prgm.$TAG.ll" -d domain/$prgm.domain.json --stdout > results/$prgm.cire.json;
done
