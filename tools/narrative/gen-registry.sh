#!/bin/bash
# Regenerate registry-full.ts from every module under src/data (default export = def or def[]). Atomic (tmp + mv).
here=$(cd "$(dirname "$0")" && pwd)
SRC="$here/../../src"
OUT="$here/registry-full.ts"
TMP="$OUT.$$"
files=$(cd "$SRC" && find data -name '*.ts' ! -name '_*' | sort)
{
  i=0; for f in $files; do i=$((i+1)); echo "import * as m$i from '@/${f%.ts}';"; done
  echo "const store = new Map<string, Map<string, any>>();"
  echo "const origin = new Map<string, string>();"
  echo "/** ids defined in more than one data module (the later one silently wins in the Registry) */"
  echo "export const DUPLICATES: string[] = [];"
  printf "const MODS: [string, any][] = [ "; j=0; for f in $files; do j=$((j+1)); printf "['%s', m$j], " "$f"; done; echo "];"
  echo "for (const [file, mod] of MODS) for (const d of ([] as any[]).concat((mod as any).default ?? [])) {"
  echo "  if (d && typeof d.id === 'string') { if (origin.has(d.id)) DUPLICATES.push(\`\${d.id} in \${origin.get(d.id)} and \${file}\`); else origin.set(d.id, file); }"
  echo "}"
  printf "for (const d of [ "; j=0; for f in $files; do j=$((j+1)); printf "...([] as any[]).concat((m$j as any).default ?? []), "; done; echo "] as any[]) {"
  cat <<'T'
  if (!d || typeof d.id !== 'string') continue;
  const k = d.id.split(':')[0]; if (!store.has(k)) store.set(k, new Map());
  store.get(k)!.set(d.id, d);
}
export const Registry = {
  load() {}, get: (k: string, id: string) => store.get(k)!.get(id), tryGet: (k: string, id: string) => store.get(k)?.get(id),
  all: (k: string) => [...(store.get(k)?.values() ?? [])],
  extra: (p: string, id: string) => store.get(p)?.get(id), extraAll: (p: string) => [...(store.get(p)?.values() ?? [])],
};
T
} > "$TMP" && mv "$TMP" "$OUT"
