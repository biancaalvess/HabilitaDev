// Fetcher SWR: normaliza vários formatos de resposta JSON.

export const fetcher = async (url: string) => {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('habilitadev_user_cache');
          const currentPath = window.location.pathname;
          if (!currentPath.includes('/login') && !currentPath.includes('/auth')) {
            window.location.href = '/?error=session_expired';
          }
        }
        const error = new Error('Sessão expirada. Por favor, faça login novamente.');
        (error as any).status = 401;
        throw error;
      }

      if (response.status === 403) {
        if (typeof window !== 'undefined') {
          import('@/hooks/use-toast').then(({ toast }) => {
            toast({
              title: 'Acesso Negado',
              description: 'Você não tem permissão para realizar esta ação.',
              variant: 'destructive',
            });
          }).catch(() => {
            console.warn('Permissão insuficiente para esta ação');
          });
        }
        const error = new Error('Permissão insuficiente para realizar esta ação.');
        (error as any).status = 403;
        throw error;
      }

      let errorMessage = response.statusText;
      let errorData: any = {};

      try {
        errorData = await response.json();
        errorMessage = errorData.message || errorData.error?.message || errorData.error || response.statusText;
      } catch {
        errorData = { message: response.statusText };
      }

      const error = new Error(errorMessage);
      (error as any).status = response.status;
      (error as any).info = errorData;

      throw error;
    }

    const data = await response.json();

    if (Array.isArray(data)) {
      return data;
    }
    if (data.success && data.data) {
      return data.data;
    }
    if (data.data) {
      return data.data;
    }
    if (Array.isArray(data.content)) {
      return data.content;
    }
    if (Array.isArray(data.items)) {
      return data.items;
    }
    if (Array.isArray(data.results)) {
      return data.results;
    }

    return data;
  } catch (error) {
    throw error;
  }
};
