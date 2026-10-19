const store = new Map<string, Map<string, any>>();
export const Registry = {
  load() {}, get: (k: string, id: string) => store.get(k)!.get(id), tryGet: (k: string, id: string) => store.get(k)?.get(id),
  all: (k: string) => [...(store.get(k)?.values() ?? [])],
  extra: (p: string, id: string) => store.get(p)?.get(id), extraAll: (p: string) => [...(store.get(p)?.values() ?? [])],
  add(d: any) { const k = d.id.split(':')[0]; if (!store.has(k)) store.set(k, new Map()); store.get(k)!.set(d.id, d); },
};
