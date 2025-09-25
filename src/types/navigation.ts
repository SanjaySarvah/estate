

export type RootTabParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Redy: undefined;
  Tabs: undefined;
  OnlineAttendanceReport: undefined;
  OnlineWeightReport: undefined;
  FaceRegister: {
    workerId: string;
    name: string;
  };
}


declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}