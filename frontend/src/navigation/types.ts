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
    | { id?: string; initial?: any; source?: 'library' | 'custom' }
    | undefined;
  SimulationSetup: { tractorId?: string; implementId?: string } | undefined;
  SimulationResult: { id: string };
};

export type ImplementStackParamList = {
  ImplementList: undefined;
  ImplementDetail: { id: string };
  ImplementForm:
    | { id?: string; initial?: any; source?: 'library' | 'custom' }
    | undefined;
  SimulationSetup: { tractorId?: string; implementId?: string } | undefined;
  SimulationResult: { id: string };
};

export type SimulationStackParamList = {
  SimulationHistory: undefined;
  SimulationResult: { id: string };
  SimulationCompare: { ids: string[] };
  SimulationSetup: { tractorId?: string; implementId?: string } | undefined;
};
