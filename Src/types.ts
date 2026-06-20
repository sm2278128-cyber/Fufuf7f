export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export interface ProjectMedia {
  type: 'image' | 'video';
  url: string;
}

export interface Project {
  id?: string;
  title: string;
  description: string;
  category: string;
  mediaList: ProjectMedia[];
  createdAt: any; // firestore timestamp or raw JS date representation
}

export interface Skill {
  id?: string;
  name: string;
  displayIcon: string; // name matching Lucide icon set
  rating: number; // 0 - 100 rating scale representing strength
  category: string; // 'Core', 'Secondary'
}
