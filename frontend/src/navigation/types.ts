import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { Implement } from '../types/implement';
import type { Tractor } from '../types/tractor';

/**
 * Optional seed for the simulation wizard. Both ids are pre-selections made from a
 * tractor or implement detail screen; the wizard still requires the full flow.
 */
export type SimulationSetupParams =
  | {
      tractorId?: string;
      implementId?: string;
      /** Seed the wizard from an existing simulation ("Re-run"). */
      prefillFromSimulationId?: string;
    }
  | undefined;

export type IoTStackParamList = {
  IoTDashboard: undefined;
  IoTMap: undefined;
};

/** Stack inside the auth flow (login ↔ register). */
export type AuthStackParamList = {
  Login:
    | {
        phone?: string;
        successMessage?: string;
      }
    | undefined;
  Register: undefined;
};

/** Root native stack: auth flow vs main app (tabs). */
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  SessionSetup: undefined;
  ActiveSession: { sessionId: string };
  SessionSummary: { sessionId: string };
  FieldMap: { sessionId?: string };
  Reports: undefined;
  OperationCharges: undefined;
  Configuration: undefined;
  IoTStackScreen: undefined;
  SimulationStackScreen: undefined;
};

export type RootTabParamList = {
  Home: undefined;
  IoTTab: undefined;
  Sessions: undefined;
  TractorsTab: undefined;
  ImplementsTab: undefined;
  SimulationsTab: undefined;
};

export type TractorStackParamList = {
  TractorList: undefined;
  TractorDetail: { id: string };
  TractorForm:
    | { id?: string; initial?: Partial<Tractor>; source?: 'library' | 'custom' }
    | undefined;
  SimulationSetup: SimulationSetupParams;
  SimulationResult: { id: string };
};

export type ImplementStackParamList = {
  ImplementList: undefined;
  ImplementDetail: { id: string };
  ImplementForm:
    | { id?: string; initial?: Partial<Implement>; source?: 'library' | 'custom' }
    | undefined;
  SimulationSetup: SimulationSetupParams;
  SimulationResult: { id: string };
};

export type SimulationStackParamList = {
  SimulationHistory: undefined;
  SimulationResult: { id: string };
  SimulationCompare: { ids: string[] };
  SimulationSetup: SimulationSetupParams;
};

/**
 * Navigation available to the simulation screens.
 *
 * They move within their own stack and also jump to the equipment tabs when the
 * user has nothing to simulate with, so the type is the composition of both rather
 * than either alone.
 */
export type SimulationScreenNavigation = CompositeNavigationProp<
  NativeStackNavigationProp<SimulationStackParamList>,
  BottomTabNavigationProp<RootTabParamList>
>;
