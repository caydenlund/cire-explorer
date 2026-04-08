#!/usr/bin/env bash

CFLAGS="-O1";
TAG="O1";
CC="clang-fpchecker";

mkdir -p bin;
for prgm in $(cat programs.txt); do
  ./hl.sh -c yellow -s double $prgm;
  ./hl.sh -c blue -s underlined " fperr: ";
  FPC_INSTRUMENT=1 $CC $CFLAGS -lm -Wno-format "src/$prgm.c" && mv a.out "bin/$prgm.$TAG.fperr";
  ./hl.sh -c blue -s underlined " round: ";
  FPC_INSTRUMENT_ERR_TRACKING=1 $CC $CFLAGS -lm -Wno-format "src/$prgm.c" && mv a.out "bin/$prgm.$TAG.round";
done
