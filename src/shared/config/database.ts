import { Patient, User, MedicalRecord, Antecedent, ID } from '@/shared/types';

export const APP_CONFIG = {
  apiUrl: (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api',
  storagePrefix: 'gestion_patients_'
} as const;

interface FetchOptions extends RequestInit {
  requiresAuth?: boolean;
}

const getAuthToken = (): string | null => {
  const token = localStorage.getItem('gestion_patients_auth_token');
  
  if (!token || token === 'undefined' || token === 'null') {
    return null;
  }
  
  let cleanedToken = token;
  if (token.startsWith('"') && token.endsWith('"')) {
    cleanedToken = token.slice(1, -1);
  }
  
  return cleanedToken;
};

const apiFetch = async <T>(
  endpoint: string, 
  options: FetchOptions = {}
): Promise<T> => {
  const { requiresAuth = true, ...fetchOptions } = options;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers || {}),
  };

  if (requiresAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(`${APP_CONFIG.apiUrl}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    // Si la réponse est 204 No Content, retourner void
    if (response.status === 204) {
      return undefined as T;
    }

    const data = await response.json();
    return data.data !== undefined ? data.data : data;
  } catch (error) {
    console.error('❌ Erreur fetch:', error);
    throw error;
  }
};

export const dataService = {
  // Patients
  async getPatients(): Promise<Patient[]> {
    const patients = await apiFetch<Patient[]>('/patients');
    
    return patients.map(p => ({
      ...p,
      date_naissance: new Date(p.date_naissance),
      date_debut: new Date(p.date_debut),
      date_fin: p.date_fin ? new Date(p.date_fin) : null,
    }));
  },

  async savePatient(patient: Patient): Promise<Patient> {
    const method = patient.id ? 'PUT' : 'POST';
    const endpoint = patient.id ? `/patients/${patient.id}` : '/patients';
    
    const patientForApi = {
      ...patient,
      date_naissance: patient.date_naissance instanceof Date 
        ? patient.date_naissance.toISOString().split('T')[0] 
        : patient.date_naissance,
      date_debut: patient.date_debut instanceof Date 
        ? patient.date_debut.toISOString().split('T')[0] 
        : patient.date_debut,
      date_fin: patient.date_fin 
        ? (patient.date_fin instanceof Date 
          ? patient.date_fin.toISOString().split('T')[0] 
          : patient.date_fin)
        : null,
    };
    
    const result = await apiFetch<Patient>(endpoint, {
      method,
      body: JSON.stringify(patientForApi),
    });
    
    return {
      ...result,
      date_naissance: new Date(result.date_naissance),
      date_debut: new Date(result.date_debut),
      date_fin: result.date_fin ? new Date(result.date_fin) : null,
    };
  },

  async deletePatient(patientId: ID): Promise<void> {
    await apiFetch<void>(`/patients/${patientId}`, {
      method: 'DELETE',
    });
  },

  // Users
  async getUsers(): Promise<User[]> {
    return apiFetch<User[]>('/users');
  },

  async createUser(userData: {
    username: string;
    password: string;
    role: User['role'];
    assignedPatients?: ID[];
  }): Promise<User> {
    const userForApi = {
      username: userData.username,
      password: userData.password,
      role: userData.role,
      assignedPatients: userData.assignedPatients || [],
    };
    
    return apiFetch<User>('/users', {
      method: 'POST',
      body: JSON.stringify(userForApi),
    });
  },

  async updateUser(userId: ID, userData: Partial<User>): Promise<User> {
    const userForApi = {
      ...userData,
      assignedPatients: userData.assignedPatients || [],
    };
    
    return apiFetch<User>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userForApi),
    });
  },

  async deleteUser(userId: ID): Promise<void> {
    await apiFetch<void>(`/users/${userId}`, {
      method: 'DELETE',
    });
  },

  // Medical Records
  async getMedicalRecords(patientId?: ID): Promise<MedicalRecord[]> {
    const endpoint = patientId ? `/medical-records?patientId=${patientId}` : '/medical-records';
    return apiFetch<MedicalRecord[]>(endpoint);
  },

  async saveMedicalRecord(record: MedicalRecord): Promise<MedicalRecord> {
    const method = record.id ? 'PUT' : 'POST';
    const endpoint = record.id ? `/medical-records/${record.id}` : '/medical-records';
    
    const recordForApi = {
      ...record,
      date: record.date instanceof Date ? record.date.toISOString() : record.date,
    };
    
    return apiFetch<MedicalRecord>(endpoint, {
      method,
      body: JSON.stringify(recordForApi),
    });
  },

  async deleteMedicalRecord(recordId: ID): Promise<void> {
    await apiFetch<void>(`/medical-records/${recordId}`, {
      method: 'DELETE',
    });
  },

  // Antecedents
  async getAntecedents(patientId: ID): Promise<Antecedent[]> {
    return apiFetch<Antecedent[]>(`/antecedents?patientId=${patientId}`);
  },

  async saveAntecedent(antecedent: Antecedent): Promise<Antecedent> {
    const method = antecedent.id ? 'PUT' : 'POST';
    const endpoint = antecedent.id ? `/antecedents/${antecedent.id}` : '/antecedents';
    
    return apiFetch<Antecedent>(endpoint, {
      method,
      body: JSON.stringify(antecedent),
    });
  },

  async deleteAntecedent(antecedentId: ID): Promise<void> {
    await apiFetch<void>(`/antecedents/${antecedentId}`, {
      method: 'DELETE',
    });
  },

  // Auth
  async login(username: string, password: string): Promise<{ user: User; token: string }> {
    return apiFetch<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      requiresAuth: false,
    });
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await apiFetch<void>('/users/change-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword }),
    });
  },

  async getCurrentUser(): Promise<User> {
    return apiFetch<User>('/users/me');
  },

  async getStatistics(): Promise<{
    total: number;
    permanent: number;
    vacancier: number;
    finTraitement: number;
  }> {
    return apiFetch<{
      total: number;
      permanent: number;
      vacancier: number;
      finTraitement: number;
    }>('/patients/statistics');
  },
};