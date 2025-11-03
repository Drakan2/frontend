// Type centralisé pour tous les IDs
export type ID = number;  // Si migration vers UUID, changer ici en `string`

export interface BaseEntity {
  id?: ID;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ApiResponse<T> = {
  data: T;
  message?: string;
  success: boolean;
};

export type PaginatedResponse<T> = ApiResponse<T> & {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};