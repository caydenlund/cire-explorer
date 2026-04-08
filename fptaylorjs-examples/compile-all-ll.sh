#!/usr/bin/env bash

CFLAGS="-O1";
TAG="O1";
CC="clang";

mkdir -p ll;
for prgm in $(cat programs.txt); do
  ./hl.sh -c yellow -s double $prgm;
  $CC $CFLAGS -fno-discard-value-names -S -emit-llvm "src/$prgm.c" -o "ll/$prgm.$TAG.ll";
done
