type Application = {
  _id: number;
  appName: String;
  owner: User;
  createdAt: Date;
  dependants: User[];   
  collections: Collection[];
  envVariables: EnvVariable[];
};

type EnvVariable = {
  name: string;
  value: string;
};

type Collection = {
  _id: number;
  collectionName: string;
  description: string;
  createdAt: Date;
  endPoint: string;
  columns: TableColumns[]; // Can Edit the index (Re-arrange)
  functions: {
    canAddNew: boolean;
    canEditOne: boolean;
    canDeleteOne: boolean;
    canHideOne: boolean;
  };
  permissions: CollectionPermission[];
};

type TableColumns = {
  virtualName: string;
  endpointPath: string;
  isVisible: boolean;
};

type CollectionPermission = {
  _id: number;
  user: User;
  canRead: boolean;
  canCreateNew: boolean;
  canEdit: boolean;
  canDelete: boolean;
};

type User = {
  _id: number;
  username: string;
  password: string;
  varificationCode: string;
  createdAt: Date;
  plan: PlanNames;
};

enum PlanNames {
  Free,
  DeveloperPremium,
  ConsumerPremium,
  Enterprise,
}

type Plan = {
  planName: PlanNames;
  monthlyPrice: number;
  yearlyPrice: number;
  features: {
    devApps: number;
    devAppCollections: number;
    prodApps: number;
    prodAppCollections: number;
    hasDarkMode: boolean; // DeveloperPremium and up
    hasDependants: boolean; // ConsumerPremium
    isThemeConfigurable: boolean; // DeveloperPremium and up
    dataRepresentation: {
      hasTables: boolean; // all
      hasCards: boolean; // DeveloperPremium and up
    };
  };
};

type invoice = {
  _id: number;
  user: User;
  createdAt: Date;
  plan: PlanNames;
  price: number;
};
