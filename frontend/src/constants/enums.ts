export type DriveMode = '2WD' | '4WD';
export type TireType = 'Bias Ply' | 'Radial Ply';
export type SoilTexture = 'Fine' | 'Coarse' | 'Medium';
export type SoilHardness = 'Hard' | 'Firm' | 'Tilled' | 'Soft';

/**
 * Implement taxonomy — mirrors `backend/app/core/implement_taxonomy.py`.
 *
 * Conventional tillage
 *   Primary   -> MB Plough
 *   Secondary -> Disc Plough, Disc Harrow (Tandem/Offset), Cultivator
 * Combi tillage
 *   Passive + Passive -> two passive tools
 *   Active + Passive  -> a passive tool + a PTO-powered tool
 *
 * Passive tools are the only ones the DSS draft equation is defined for; active
 * (powered) tools may only occupy the rotor slot of an active-passive run. The
 * backend enforces this, and the pickers here filter to match.
 */
export type PassiveImplementType = 'MB Plough' | 'Disc Plough' | 'Cultivator' | 'Disc Harrow';
export type ActiveImplementType =
  | 'Rotavator'
  | 'Disc Harrow (Powered)'
  | 'Cultivator (Powered)';
export type ImplementType = PassiveImplementType | ActiveImplementType;

export type ImplementPowerClass = 'passive' | 'active';
export type TillageStage = 'primary' | 'secondary';
export type TillageClass = 'conventional' | 'combi';

/** Descriptive disc-harrow arrangement. Has NO effect on any calculation. */
export type DiscHarrowConfiguration = 'Tandem' | 'Offset';
export const DISC_HARROW_CONFIGURATIONS: readonly DiscHarrowConfiguration[] = ['Tandem', 'Offset'];

export const PASSIVE_IMPLEMENT_TYPES: readonly PassiveImplementType[] = [
  'MB Plough',
  'Disc Plough',
  'Cultivator',
  'Disc Harrow',
];

export const ACTIVE_IMPLEMENT_TYPES: readonly ActiveImplementType[] = [
  'Rotavator',
  'Disc Harrow (Powered)',
  'Cultivator (Powered)',
];

export const IMPLEMENT_TYPES: readonly ImplementType[] = [
  ...PASSIVE_IMPLEMENT_TYPES,
  ...ACTIVE_IMPLEMENT_TYPES,
];

export const IMPLEMENT_POWER_CLASS: Record<ImplementType, ImplementPowerClass> = {
  'MB Plough': 'passive',
  'Disc Plough': 'passive',
  Cultivator: 'passive',
  'Disc Harrow': 'passive',
  Rotavator: 'active',
  'Disc Harrow (Powered)': 'active',
  'Cultivator (Powered)': 'active',
};

/**
 * Primary/Secondary is a Conventional-tillage concept only; the reference
 * diagram does not classify powered tools, so they map to null.
 */
export const IMPLEMENT_TILLAGE_STAGE: Record<ImplementType, TillageStage | null> = {
  'MB Plough': 'primary',
  'Disc Plough': 'secondary',
  Cultivator: 'secondary',
  'Disc Harrow': 'secondary',
  Rotavator: null,
  'Disc Harrow (Powered)': null,
  'Cultivator (Powered)': null,
};

export function powerClassOf(type: ImplementType): ImplementPowerClass {
  return IMPLEMENT_POWER_CLASS[type] ?? 'passive';
}

export function isActiveImplement(type: ImplementType): boolean {
  return powerClassOf(type) === 'active';
}

export function isPassiveImplement(type: ImplementType): boolean {
  return powerClassOf(type) === 'passive';
}

export function tillageStageOf(type: ImplementType): TillageStage | null {
  return IMPLEMENT_TILLAGE_STAGE[type] ?? null;
}

export const TILLAGE_STAGE_LABEL: Record<TillageStage, string> = {
  primary: 'Primary',
  secondary: 'Secondary',
};

export const POWER_CLASS_LABEL: Record<ImplementPowerClass, string> = {
  passive: 'Passive',
  active: 'Powered',
};
