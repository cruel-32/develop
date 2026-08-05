export interface Person {
  id: number;
  name: string;
  age: number;
  job: string;
  address: string | null;
}

export interface PersonInput {
  id: number;
  name: string;
  age: number;
  job: string;
  address: string | null;
}

export interface PeoplePage {
  data: Person[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
