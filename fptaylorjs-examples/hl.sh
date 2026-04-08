#!/usr/bin/env bash

set -euo pipefail

usage() {
    cat <<EOF
Usage: hl [OPTIONS] [TEXT...]

Create stylized headlines from text

Options:
  -s, --style STYLE      boxed|double|round|bold|underlined|overlined|framed|dashed|stars|banner (default: boxed)
  -c, --color COLOR      red|green|yellow|blue|magenta|cyan|white|
                         bright-red|bright-green|bright-yellow|bright-blue|bright-magenta|bright-cyan
  -p, --padding N        padding inside box (default: 1)
  -h, --help             show this help
EOF
}

# Defaults
STYLE="boxed"
COLOR=""
PADDING=1

# Parse args
POSITIONAL=()
while [[ $# -gt 0 ]]; do
    case "$1" in
        -s|--style)   STYLE="$2";   shift 2 ;;
        -c|--color)   COLOR="$2";   shift 2 ;;
        -p|--padding) PADDING="$2"; shift 2 ;;
        -h|--help)    usage; exit 0 ;;
        --) shift; POSITIONAL+=("$@"); break ;;
        -*) echo "Unknown option: $1" >&2; usage >&2; exit 1 ;;
        *)  POSITIONAL+=("$1"); shift ;;
    esac
done

# Get input text
if [[ ${#POSITIONAL[@]} -gt 0 ]]; then
    TEXT="${POSITIONAL[*]}"
else
    TEXT="$(cat)"
fi
TEXT="${TEXT%$'\n'}"  # trim trailing newline

if [[ -z "$TEXT" ]]; then
    echo "Error: No text provided" >&2
    exit 1
fi

# Detect TTY
if [[ -t 1 ]] || [[ -n "$COLOR" ]]; then
    USE_META=1
else
    USE_META=0
fi

# ANSI color codes
apply_color() {
    local text="$1"
    local bold="\e[1m"
    local reset="\e[0m"
    local code=""
    case "$COLOR" in
        red)            code="\e[31m" ;;
        green)          code="\e[32m" ;;
        yellow)         code="\e[33m" ;;
        blue)           code="\e[34m" ;;
        magenta)        code="\e[35m" ;;
        cyan)           code="\e[36m" ;;
        white)          code="\e[37m" ;;
        bright-red)     code="\e[91m" ;;
        bright-green)   code="\e[92m" ;;
        bright-yellow)  code="\e[93m" ;;
        bright-blue)    code="\e[94m" ;;
        bright-magenta) code="\e[95m" ;;
        bright-cyan)    code="\e[96m" ;;
        "")             code="" ;;
        *)  echo "Unknown color: $COLOR" >&2; exit 1 ;;
    esac
    printf "${bold}${code}%s${reset}" "$text"
}

# Compute max line width
max_width() {
    local max=0
    while IFS= read -r line; do
        [[ ${#line} -gt $max ]] && max=${#line}
    done <<< "$1"
    echo "$max"
}

repeat_char() {
    local char="$1" n="$2"
    printf "%0.s${char}" $(seq 1 "$n")
}

pad_line() {
    local line="$1" width="$2" padding="$3"
    local pad; pad="$(repeat_char ' ' "$padding")"
    printf "%s%-*s%s" "$pad" "$width" "$line" "$pad"
}

build_headline() {
    local text="$1"
    local max_w; max_w="$(max_width "$text")"
    local content_w=$(( max_w + PADDING * 2 ))
    local result=""

    # helper: append a line to result
    append() { result+="${1}"$'\n'; }

    if [[ $USE_META -eq 0 ]]; then
        # Plain ASCII fallback
        case "$STYLE" in
            boxed|double|round|bold)
                local hrule; hrule="+$(repeat_char '-' "$content_w")+"
                append "$hrule"
                while IFS= read -r line; do
                    append "|$(pad_line "$line" "$max_w" "$PADDING")|"
                done <<< "$text"
                append "$hrule"
                ;;
            underlined)
                while IFS= read -r line; do append "$line"; done <<< "$text"
                append "$(repeat_char '-' "$max_w")"
                ;;
            overlined)
                append "$(repeat_char '-' "$max_w")"
                while IFS= read -r line; do append "$line"; done <<< "$text"
                ;;
            framed)
                local rule; rule="$(repeat_char '-' "$max_w")"
                append "$rule"
                while IFS= read -r line; do append "$line"; done <<< "$text"
                append "$rule"
                ;;
            dashed)
                while IFS= read -r line; do append "$line"; done <<< "$text"
                append "$(repeat_char '- ' $(( max_w / 2 )))"
                ;;
            stars)
                append "*** $text ***"
                ;;
            banner)
                local rule; rule="$(repeat_char '=' "$content_w")"
                append "$rule"
                while IFS= read -r line; do
                    append "$(pad_line "$line" "$max_w" "$PADDING")"
                done <<< "$text"
                append "$rule"
                ;;
        esac
    else
        # Unicode / metacharacter version
        case "$STYLE" in
            boxed)
                append "┌$(repeat_char '─' "$content_w")┐"
                while IFS= read -r line; do
                    append "│$(pad_line "$line" "$max_w" "$PADDING")│"
                done <<< "$text"
                append "└$(repeat_char '─' "$content_w")┘"
                ;;
            double)
                append "╔$(repeat_char '═' "$content_w")╗"
                while IFS= read -r line; do
                    append "║$(pad_line "$line" "$max_w" "$PADDING")║"
                done <<< "$text"
                append "╚$(repeat_char '═' "$content_w")╝"
                ;;
            round)
                append "╭$(repeat_char '─' "$content_w")╮"
                while IFS= read -r line; do
                    append "│$(pad_line "$line" "$max_w" "$PADDING")│"
                done <<< "$text"
                append "╰$(repeat_char '─' "$content_w")╯"
                ;;
            bold)
                append "┏$(repeat_char '━' "$content_w")┓"
                while IFS= read -r line; do
                    append "┃$(pad_line "$line" "$max_w" "$PADDING")┃"
                done <<< "$text"
                append "┗$(repeat_char '━' "$content_w")┛"
                ;;
            underlined)
                while IFS= read -r line; do append "$line"; done <<< "$text"
                append "$(repeat_char '─' "$max_w")"
                ;;
            overlined)
                append "$(repeat_char '─' "$max_w")"
                while IFS= read -r line; do append "$line"; done <<< "$text"
                ;;
            framed)
                local rule; rule="$(repeat_char '─' "$max_w")"
                append "$rule"
                while IFS= read -r line; do append "$line"; done <<< "$text"
                append "$rule"
                ;;
            dashed)
                while IFS= read -r line; do append "$line"; done <<< "$text"
                append "$(repeat_char '- ' $(( max_w / 2 )))"
                ;;
            stars)
                append "*** $text ***"
                ;;
            banner)
                local rule; rule="$(repeat_char '=' "$content_w")"
                append "$rule"
                while IFS= read -r line; do
                    append "$(pad_line "$line" "$max_w" "$PADDING")"
                done <<< "$text"
                append "$rule"
                ;;
            *)
                echo "Unknown style: $STYLE" >&2; exit 1 ;;
        esac
    fi

    # Strip trailing newline from result for clean apply_color pass
    result="${result%$'\n'}"
    apply_color "$result"
    printf "\n"
}

build_headline "$TEXT"
