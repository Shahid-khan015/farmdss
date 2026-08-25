/**
 * Disambiguation for equipment pickers.
 *
 * Library reference data and a user's own equipment appear in the same list and
 * can share a name — a custom "Eicher 485" sits beside the library one, and a
 * user can hold several records all called "E2E Tractor". Name, manufacturer,
 * model and the spec line may all be identical, so without help those rows are
 * indistinguishable and the choice is a coin flip.
 *
 * Both must stay selectable: this labels them rather than filtering any out.
 */

export type EquipmentGroup = 'mine' | 'library';

/** The fields this module needs; deliberately narrower than the picker's option type. */
export type Disambiguable = {
  id: string;
  title: string;
  subtitle?: string;
  spec?: string;
};

export type SourceRecord = {
  is_library: boolean;
  created_at?: string | null;
};

export type Disambiguated<T> = T & {
  group: EquipmentGroup;
  /** Set only when the title alone does not identify the row within its group. */
  disambiguator?: string;
};

export function groupLabel(group: EquipmentGroup): string {
  return group === 'mine' ? 'My equipment' : 'Library';
}

/** Short badge text shown on each row and on the closed trigger. */
export function groupBadge(group: EquipmentGroup): string {
  return group === 'mine' ? 'Custom' : 'Library';
}

function addedOn(createdAt: string | null | undefined, withTime = false): string | undefined {
  if (!createdAt) return undefined;
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return undefined;
  const date = d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  if (!withTime) return `added ${date}`;
  const time = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  return `added ${date}, ${time}`;
}

/** Last resort: always unique, because it is derived from the primary key. */
function idFragment(id: string): string {
  return `ref ${id.replace(/-/g, '').slice(0, 4).toUpperCase()}`;
}

/**
 * Tag each option with its group, and give a distinguishing hint to any option
 * whose title is not unique *within that group*.
 *
 * The hint is the first candidate that gives EVERY colliding row a different
 * value — subtitle, spec, added date, added date with time, then a fragment of
 * the id. Testing "separates the whole set" rather than merely "differs from
 * me" is what makes this correct: four records saved on the same day all render
 * "added 9 Aug", which distinguishes nothing. The id fragment is derived from
 * the primary key, so the final candidate always succeeds and a group can never
 * end up containing two visually identical rows.
 *
 * Cross-group collisions (custom "Eicher 485" vs library "Eicher 485") need no
 * hint: the section header and badge already separate them.
 */
export function withDisambiguation<T extends Disambiguable>(
  options: T[],
  sourceById: Map<string, SourceRecord>,
): Disambiguated<T>[] {
  const tagged = options.map((option) => ({
    ...option,
    group: (sourceById.get(option.id)?.is_library ? 'library' : 'mine') as EquipmentGroup,
  }));

  const countByKey = new Map<string, number>();
  for (const o of tagged) {
    const key = `${o.group} ${o.title}`;
    countByKey.set(key, (countByKey.get(key) ?? 0) + 1);
  }

  return tagged.map((option) => {
    const key = `${option.group} ${option.title}`;
    if ((countByKey.get(key) ?? 0) < 2) return option;

    const peers = tagged.filter((o) => `${o.group} ${o.title}` === key);

    const candidates: Array<(o: Disambiguated<T>) => string | undefined> = [
      (o) => o.subtitle,
      (o) => o.spec,
      (o) => addedOn(sourceById.get(o.id)?.created_at),
      (o) => addedOn(sourceById.get(o.id)?.created_at, true),
      (o) => idFragment(o.id),
    ];

    for (const pick of candidates) {
      const values = peers.map(pick);
      if (values.some((v) => !v)) continue;
      if (new Set(values).size !== peers.length) continue;
      return { ...option, disambiguator: pick(option) };
    }
    return option;
  });
}
