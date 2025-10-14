export interface User {
  id: string; // backend returns 'id' in auth responses
  email: string;
  role: 'admin' | 'teacher' | 'student';
  profileData?: any;
  profile?: {
    _id?: string;
    fullName?: string;
    bio?: string;
    avatarUrl?: string;
    [key: string]: any;
  } | any;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    token: string;
    user: User;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  role: string;
  fullName: string;
}
