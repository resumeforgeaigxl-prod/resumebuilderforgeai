/**
 * ATS Adapters Registry (Level 13)
 */

import type { AtsProvider, ApplicationFormAdapter } from '../types';
import { GreenhouseAdapter } from './greenhouse';
import { LeverAdapter } from './lever';
import { AshbyAdapter } from './ashby';
import { GenericFormAdapter } from './generic';

export * from './adapter-interface';
export * from './detector';
export * from './field-mapper';
export * from './greenhouse';
export * from './lever';
export * from './ashby';
export * from './generic';

const ADAPTER_INSTANCES: Partial<Record<AtsProvider, ApplicationFormAdapter>> = {
  GREENHOUSE: new GreenhouseAdapter(),
  LEVER: new LeverAdapter(),
  ASHBY: new AshbyAdapter(),
  GENERIC_FORM: new GenericFormAdapter(),
};

export function getAtsAdapter(provider: AtsProvider): ApplicationFormAdapter | null {
  return ADAPTER_INSTANCES[provider] || null;
}
