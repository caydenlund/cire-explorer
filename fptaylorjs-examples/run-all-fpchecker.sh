#!/usr/bin/env bash

TAG="O1";

mkdir -p results;
for prgm in $(cat programs.txt); do
  rm -rf .fpc_logs;
  ./hl.sh -c yellow -s double $prgm;
  ./hl.sh -c blue -s underlined " fperr: ";
  "./bin/$prgm.$TAG.fperr" && mv .fpc_logs/*.json results/$prgm.fperr.json;
  ./hl.sh -c blue -s underlined " round: ";
  "./bin/$prgm.$TAG.round" && mv .fpc_logs/*.json results/$prgm.round.json;
done
