// Scripts para o CRM Nessler iStore - Versão otimizada para Render

// Configuração da URL base da API
const API_BASE_URL = window.location.hostname.includes('render.com') 
    ? 'https://nessler-crm-api.onrender.com/api' 
    : '/api';

// Funções de autenticação
function login(email, password) {
    return fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Falha na autenticação');
        }
        return response.json();
    })
    .then(data => {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data;
    })
    .catch(error => {
        // Fallback para modo de demonstração se a API não estiver disponível
        console.warn('Usando modo de demonstração:', error);
        
        if (email === 'admin@nessler.com.br' && password === 'senha123') {
            const userData = {
                id: 1,
                name: 'Administrador',
                email: 'admin@nessler.com.br',
                role: 'admin'
            };
            
            localStorage.setItem('access_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6IkFkbWluaXN0cmFkb3IiLCJpYXQiOjE2MTYxNjI4OTUsImV4cCI6MTYxNjE2NjQ5NX0');
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('demo_mode', 'true');
            
            return {
                access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6IkFkbWluaXN0cmFkb3IiLCJpYXQiOjE2MTYxNjI4OTUsImV4cCI6MTYxNjE2NjQ5NX0',
                user: userData
            };
        } else {
            throw new Error('Email ou senha incorretos');
        }
    });
}

function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('demo_mode');
    window.location.href = 'index.html';
}

function getAccessToken() {
    return localStorage.getItem('access_token');
}

function getCurrentUser() {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
}

function isAuthenticated() {
    return !!getAccessToken();
}

function isDemoMode() {
    return localStorage.getItem('demo_mode') === 'true';
}

// Função para fazer requisições autenticadas
function authenticatedFetch(url, options = {}) {
    const token = getAccessToken();
    
    if (!token) {
        return Promise.reject(new Error('Usuário não autenticado'));
    }
    
    // Se estiver em modo de demonstração, simular respostas
    if (isDemoMode()) {
        return simulateApiResponse(url, options);
    }
    
    const defaultOptions = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
    
    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };
    
    // Garantir que a URL tenha o prefixo correto
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
    
    return fetch(fullUrl, mergedOptions)
        .then(response => {
            // Se o token expirou (401), fazer logout
            if (response.status === 401) {
                logout();
                throw new Error('Sessão expirada. Por favor, faça login novamente.');
            }
            
            return response;
        })
        .catch(error => {
            console.error('Erro na requisição:', error);
            // Se houver erro de conexão, tentar usar modo de demonstração
            if (error.message.includes('Failed to fetch')) {
                console.warn('API indisponível, usando modo de demonstração');
                localStorage.setItem('demo_mode', 'true');
                return simulateApiResponse(url, options);
            }
            throw error;
        });
}

// Simulação de respostas da API para modo de demonstração
function simulateApiResponse(url, options) {
    console.log('Simulando resposta para:', url, options);
    
    return new Promise((resolve) => {
        setTimeout(() => {
            let responseData;
            
            // Simular diferentes endpoints
            if (url.includes('/clients')) {
                responseData = getMockClients();
            } else if (url.includes('/products')) {
                responseData = getMockProducts();
            } else if (url.includes('/dashboard')) {
                responseData = getMockDashboard();
            } else {
                responseData = { message: 'Operação simulada com sucesso' };
            }
            
            resolve({
                ok: true,
                status: 200,
                json: () => Promise.resolve(responseData)
            });
        }, 500); // Simular delay de rede
    });
}

// Dados simulados para modo de demonstração
function getMockClients() {
    return [
        {
            "id": 1,
            "name": "João Silva",
            "email": "joao.silva@email.com",
            "phone": "(47) 99999-1111",
            "last_purchase": "2025-05-15",
            "total_purchases": 3,
            "total_value": 15000.00
        },
        {
            "id": 2,
            "name": "Maria Oliveira",
            "email": "maria.oliveira@email.com",
            "phone": "(47) 99999-2222",
            "last_purchase": "2025-06-01",
            "total_purchases": 1,
            "total_value": 8500.00
        },
        {
            "id": 3,
            "name": "Carlos Santos",
            "email": "carlos.santos@email.com",
            "phone": "(47) 99999-3333",
            "last_purchase": "2025-05-20",
            "total_purchases": 2,
            "total_value": 12000.00
        }
    ];
}

function getMockProducts() {
    return [
        {
            "id": 1,
            "name": "MacBook Pro 16\"",
            "category": "Notebooks",
            "price": 25000.00,
            "stock": 5,
            "status": "available"
        },
        {
            "id": 2,
            "name": "iPhone 15 Pro Max",
            "category": "Smartphones",
            "price": 12000.00,
            "stock": 8,
            "status": "available"
        },
        {
            "id": 3,
            "name": "iPad Pro 12.9\"",
            "category": "Tablets",
            "price": 15000.00,
            "stock": 3,
            "status": "available"
        }
    ];
}

function getMockDashboard() {
    return {
        "total_clients": 156,
        "new_clients_month": 12,
        "total_sales_month": 185000.00,
        "average_ticket": 15416.67,
        "top_products": [
            {
                "name": "MacBook Pro 16\"",
                "sales": 5,
                "revenue": 125000.00
            },
            {
                "name": "iPhone 15 Pro Max",
                "sales": 8,
                "revenue": 96000.00
            }
        ]
    };
}

// Funções de utilidade
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short'
    }).format(date);
}

// Funções para manipulação de elementos DOM
function showElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'block';
    }
}

function hideElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'none';
    }
}

function showAlert(message, type = 'error') {
    // Implementação simples de alerta
    alert(message);
}

// Inicialização da página de login
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se estamos na página de login
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        // Se já estiver autenticado, redirecionar para o dashboard
        if (isAuthenticated()) {
            window.location.href = 'dashboard.html';
            return;
        }
        
        // Configurar formulário de login
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const loginButton = document.getElementById('loginButton');
            const loginError = document.getElementById('loginError');
            
            // Validação básica
            if (!email || !password) {
                if (loginError) {
                    loginError.textContent = 'Por favor, preencha todos os campos';
                    loginError.style.display = 'block';
                }
                return;
            }
            
            // Desabilitar botão e mostrar loading
            if (loginButton) {
                loginButton.disabled = true;
                loginButton.textContent = 'Entrando...';
            }
            
            // Esconder mensagem de erro anterior
            if (loginError) {
                loginError.style.display = 'none';
            }
            
            // Tentar login
            login(email, password)
                .then(() => {
                    window.location.href = 'dashboard.html';
                })
                .catch(error => {
                    if (loginError) {
                        loginError.textContent = error.message || 'Erro ao fazer login';
                        loginError.style.display = 'block';
                    }
                    
                    // Reabilitar botão
                    if (loginButton) {
                        loginButton.disabled = false;
                        loginButton.textContent = 'Entrar';
                    }
                });
        });
    }
    
    // Verificar se estamos em uma página protegida
    if (!loginForm && !isAuthenticated()) {
        // Redirecionar para login se não estiver autenticado
        window.location.href = 'index.html';
        return;
    }
    
    // Configurar botão de logout em páginas protegidas
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
    
    // Exibir nome do usuário logado
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        const user = getCurrentUser();
        if (user) {
            userNameElement.textContent = user.name;
        }
    }
    
    // Exibir indicador de modo de demonstração
    if (isDemoMode()) {
        const demoIndicator = document.createElement('div');
        demoIndicator.style.position = 'fixed';
        demoIndicator.style.bottom = '10px';
        demoIndicator.style.right = '10px';
        demoIndicator.style.backgroundColor = 'rgba(255, 165, 0, 0.8)';
        demoIndicator.style.color = 'white';
        demoIndicator.style.padding = '5px 10px';
        demoIndicator.style.borderRadius = '5px';
        demoIndicator.style.fontSize = '12px';
        demoIndicator.style.zIndex = '9999';
        demoIndicator.textContent = 'MODO DEMONSTRAÇÃO';
        document.body.appendChild(demoIndicator);
    }
});
