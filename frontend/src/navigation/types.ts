export type RootTabParamList = {
  Home: undefined;
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

