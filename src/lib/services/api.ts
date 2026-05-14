/**
 * Service Clients for Microservices
 * 
 * These clients communicate with the microservices through Next.js API routes.
 * The API route forwards requests to the appropriate microservice based on XTransformPort.
 */

// Service ports
const PDF_SERVICE_PORT = 3001;
const TEMPLATE_SERVICE_PORT = 3002;

// Generic fetch helper
async function serviceFetch(
  port: number,
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `/api${path}?XTransformPort=${port}`;
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}

// PDF Generator Service Client
export const PDFService = {
  async generatePDF(data: any): Promise<{ success: boolean; buffer?: ArrayBuffer; error?: string }> {
    const response = await serviceFetch(PDF_SERVICE_PORT, '/api/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error };
    }
    
    const buffer = await response.arrayBuffer();
    return { success: true, buffer };
  },

  async generatePreview(data: any): Promise<{ success: boolean; base64?: string; error?: string }> {
    const response = await serviceFetch(PDF_SERVICE_PORT, '/api/preview', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    return result;
  },

  async getDocumentTypes(): Promise<any> {
    const response = await serviceFetch(PDF_SERVICE_PORT, '/api/document-types', {
      method: 'GET',
    });
    return response.json();
  },

  async validateDocument(data: any): Promise<any> {
    const response = await serviceFetch(PDF_SERVICE_PORT, '/api/validate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async checkHealth(): Promise<any> {
    const response = await serviceFetch(PDF_SERVICE_PORT, '/health', {
      method: 'GET',
    });
    return response.json();
  },
};

// Template Manager Service Client
export const TemplateService = {
  async getTemplates(filters?: { category?: string; type?: string; search?: string }): Promise<any> {
    const params = new URLSearchParams();
    params.set('XTransformPort', TEMPLATE_SERVICE_PORT.toString());
    if (filters?.category) params.set('category', filters.category);
    if (filters?.type) params.set('type', filters.type);
    if (filters?.search) params.set('search', filters.search);
    
    const response = await fetch(`/api/templates?${params.toString()}`);
    return response.json();
  },

  async getTemplate(id: string): Promise<any> {
    const response = await serviceFetch(TEMPLATE_SERVICE_PORT, `/api/templates/${id}`);
    return response.json();
  },

  async createTemplate(template: any): Promise<any> {
    const response = await serviceFetch(TEMPLATE_SERVICE_PORT, '/api/templates', {
      method: 'POST',
      body: JSON.stringify(template),
    });
    return response.json();
  },

  async updateTemplate(id: string, template: any): Promise<any> {
    const response = await serviceFetch(TEMPLATE_SERVICE_PORT, `/api/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(template),
    });
    return response.json();
  },

  async deleteTemplate(id: string): Promise<any> {
    const response = await serviceFetch(TEMPLATE_SERVICE_PORT, `/api/templates/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  async duplicateTemplate(id: string): Promise<any> {
    const response = await serviceFetch(TEMPLATE_SERVICE_PORT, `/api/templates/${id}/duplicate`, {
      method: 'POST',
    });
    return response.json();
  },

  async getCategories(): Promise<any> {
    const response = await serviceFetch(TEMPLATE_SERVICE_PORT, '/api/categories');
    return response.json();
  },

  async getFieldTypes(): Promise<any> {
    const response = await serviceFetch(TEMPLATE_SERVICE_PORT, '/api/field-types');
    return response.json();
  },

  async getSources(): Promise<any> {
    const response = await serviceFetch(TEMPLATE_SERVICE_PORT, '/api/sources');
    return response.json();
  },

  async scrapeTemplates(params: { source?: string; category?: string; limit?: number }): Promise<any> {
    const response = await serviceFetch(TEMPLATE_SERVICE_PORT, '/api/scrape', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return response.json();
  },

  async checkHealth(): Promise<any> {
    const response = await serviceFetch(TEMPLATE_SERVICE_PORT, '/health');
    return response.json();
  },
};
