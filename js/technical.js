// Lazy loading para imagens e documentos
document.addEventListener('DOMContentLoaded', function() {
    // Lazy loading para imagens
    const lazyImages = document.querySelectorAll('img.lazy');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });
    } else {
        // Fallback para navegadores que não suportam IntersectionObserver
        let lazyLoadThrottleTimeout;
        
        function lazyLoad() {
            if (lazyLoadThrottleTimeout) {
                clearTimeout(lazyLoadThrottleTimeout);
            }
            
            lazyLoadThrottleTimeout = setTimeout(function() {
                const scrollTop = window.pageYOffset;
                
                lazyImages.forEach(img => {
                    if (img.offsetTop < window.innerHeight + scrollTop) {
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                    }
                });
                
                if (lazyImages.length === 0) {
                    document.removeEventListener('scroll', lazyLoad);
                    window.removeEventListener('resize', lazyLoad);
                    window.removeEventListener('orientationChange', lazyLoad);
                }
            }, 20);
        }
        
        document.addEventListener('scroll', lazyLoad);
        window.addEventListener('resize', lazyLoad);
        window.addEventListener('orientationChange', lazyLoad);
    }
    
    // Lazy loading para documentos PDF
    const documentCards = document.querySelectorAll('.document-card');
    
    if ('IntersectionObserver' in window) {
        const documentObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const card = entry.target;
                    card.classList.add('loaded');
                    observer.unobserve(card);
                    
                    // Pré-carregar miniatura do PDF se disponível
                    const previewButton = card.querySelector('.preview-button');
                    if (previewButton) {
                        const pdfPath = previewButton.getAttribute('data-document');
                        if (pdfPath) {
                            prefetchPdfThumbnail(pdfPath);
                        }
                    }
                }
            });
        });
        
        documentCards.forEach(card => {
            documentObserver.observe(card);
        });
    }
    
    // Função para pré-carregar miniaturas de PDF
    function prefetchPdfThumbnail(pdfPath) {
        // Esta função seria implementada com uma biblioteca como pdf.js
        // para gerar miniaturas de PDFs, mas aqui apenas simulamos o comportamento
        console.log(`Pré-carregando miniatura para: ${pdfPath}`);
    }
});

// Indexação de conteúdo de PDFs
class PdfIndexer {
    constructor() {
        this.index = {};
        this.initialized = false;
    }
    
    async initialize() {
        if (this.initialized) return;
        
        try {
            // Tentar carregar índice do localStorage
            const savedIndex = localStorage.getItem('pdf_index');
            if (savedIndex) {
                this.index = JSON.parse(savedIndex);
                this.initialized = true;
                console.log('Índice de PDF carregado do armazenamento local');
                return;
            }
            
            // Se não houver índice salvo, criar um novo
            await this.buildIndex();
            
        } catch (error) {
            console.error('Erro ao inicializar indexador de PDF:', error);
        }
    }
    
    async buildIndex() {
        // Em uma implementação real, usaríamos pdf.js para extrair texto
        // Aqui simulamos o processo com dados estáticos
        
        this.index = {
            'regimento-escolar.pdf': {
                title: 'Regimento Escolar',
                content: 'Documento oficial com as normas e diretrizes da instituição escolar. Inclui regras de conduta, procedimentos disciplinares, direitos e deveres dos alunos.',
                keywords: ['regimento', 'normas', 'diretrizes', 'regras', 'conduta', 'disciplina']
            },
            'calendario-2025.pdf': {
                title: 'Calendário 2025',
                content: 'Calendário oficial com datas de aulas, eventos e feriados para o ano letivo de 2025. Inclui períodos de férias, datas de provas e eventos escolares.',
                keywords: ['calendário', '2025', 'datas', 'eventos', 'feriados', 'férias', 'provas']
            },
            'lista-material-6ano.pdf': {
                title: 'Lista de Material - 6º Ano',
                content: 'Lista completa de materiais necessários para os alunos do 6º ano do Ensino Fundamental. Inclui cadernos, livros, materiais de arte e itens de uso pessoal.',
                keywords: ['lista', 'material', '6º ano', 'cadernos', 'livros', 'materiais']
            }
        };
        
        // Salvar índice no localStorage
        localStorage.setItem('pdf_index', JSON.stringify(this.index));
        this.initialized = true;
        console.log('Índice de PDF construído e salvo');
    }
    
    search(query) {
        if (!this.initialized) {
            console.warn('Indexador não inicializado. Inicialize antes de pesquisar.');
            return [];
        }
        
        query = query.toLowerCase();
        const results = [];
        
        for (const [filename, data] of Object.entries(this.index)) {
            // Verificar título
            if (data.title.toLowerCase().includes(query)) {
                results.push({
                    filename,
                    title: data.title,
                    relevance: 3, // Alta relevância para correspondências no título
                    match: 'title'
                });
                continue; // Pular para o próximo documento
            }
            
            // Verificar palavras-chave
            const keywordMatch = data.keywords.some(keyword => keyword.includes(query));
            if (keywordMatch) {
                results.push({
                    filename,
                    title: data.title,
                    relevance: 2, // Relevância média para correspondências em palavras-chave
                    match: 'keyword'
                });
                continue;
            }
            
            // Verificar conteúdo
            if (data.content.toLowerCase().includes(query)) {
                results.push({
                    filename,
                    title: data.title,
                    relevance: 1, // Relevância baixa para correspondências no conteúdo
                    match: 'content'
                });
            }
        }
        
        // Ordenar resultados por relevância
        results.sort((a, b) => b.relevance - a.relevance);
        return results;
    }
}

// Estatísticas de uso
class UsageStatistics {
    constructor() {
        this.stats = {
            views: {},
            downloads: {},
            searches: [],
            popularCategories: {},
            sessionDuration: [],
            lastReset: new Date().toISOString()
        };
        
        this.loadStats();
    }
    
    loadStats() {
        const savedStats = localStorage.getItem('usage_statistics');
        if (savedStats) {
            this.stats = JSON.parse(savedStats);
        }
    }
    
    saveStats() {
        localStorage.setItem('usage_statistics', JSON.stringify(this.stats));
    }
    
    recordView(documentId, documentTitle, category) {
        if (!this.stats.views[documentId]) {
            this.stats.views[documentId] = {
                title: documentTitle,
                category: category,
                count: 0,
                lastViewed: null
            };
        }
        
        this.stats.views[documentId].count++;
        this.stats.views[documentId].lastViewed = new Date().toISOString();
        
        // Registrar categoria
        if (!this.stats.popularCategories[category]) {
            this.stats.popularCategories[category] = 0;
        }
        this.stats.popularCategories[category]++;
        
        this.saveStats();
    }
    
    recordDownload(documentId, documentTitle, category) {
        if (!this.stats.downloads[documentId]) {
            this.stats.downloads[documentId] = {
                title: documentTitle,
                category: category,
                count: 0,
                lastDownloaded: null
            };
        }
        
        this.stats.downloads[documentId].count++;
        this.stats.downloads[documentId].lastDownloaded = new Date().toISOString();
        this.saveStats();
    }
    
    recordSearch(query, resultsCount) {
        this.stats.searches.push({
            query: query,
            timestamp: new Date().toISOString(),
            resultsCount: resultsCount
        });
        
        // Limitar a 100 pesquisas salvas
        if (this.stats.searches.length > 100) {
            this.stats.searches = this.stats.searches.slice(-100);
        }
        
        this.saveStats();
    }
    
    recordSessionDuration(durationSeconds) {
        this.stats.sessionDuration.push({
            duration: durationSeconds,
            timestamp: new Date().toISOString()
        });
        
        // Limitar a 100 sessões salvas
        if (this.stats.sessionDuration.length > 100) {
            this.stats.sessionDuration = this.stats.sessionDuration.slice(-100);
        }
        
        this.saveStats();
    }
    
    getPopularDocuments(limit = 5) {
        const documents = Object.entries(this.stats.views)
            .map(([id, data]) => ({
                id: id,
                title: data.title,
                category: data.category,
                views: data.count
            }))
            .sort((a, b) => b.views - a.views)
            .slice(0, limit);
        
        return documents;
    }
    
    getPopularCategories() {
        return Object.entries(this.stats.popularCategories)
            .map(([category, count]) => ({ category, count }))
            .sort((a, b) => b.count - a.count);
    }
    
    getPopularSearches(limit = 10) {
        const searchCounts = {};
        
        this.stats.searches.forEach(search => {
            if (!searchCounts[search.query]) {
                searchCounts[search.query] = 0;
            }
            searchCounts[search.query]++;
        });
        
        return Object.entries(searchCounts)
            .map(([query, count]) => ({ query, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    }
    
    getAverageSessionDuration() {
        if (this.stats.sessionDuration.length === 0) return 0;
        
        const totalDuration = this.stats.sessionDuration.reduce(
            (sum, session) => sum + session.duration, 0
        );
        return totalDuration / this.stats.sessionDuration.length;
    }
    
    resetStats() {
        this.stats = {
            views: {},
            downloads: {},
            searches: [],
            popularCategories: {},
            sessionDuration: [],
            lastReset: new Date().toISOString()
        };
        this.saveStats();
    }
    
    generateReport() {
        const popularDocs = this.getPopularDocuments();
        const popularCats = this.getPopularCategories();
        const popularSearches = this.getPopularSearches();
        const avgSession = this.getAverageSessionDuration();
        
        return {
            generatedAt: new Date().toISOString(),
            lastReset: this.stats.lastReset,
            popularDocuments: popularDocs,
            popularCategories: popularCats,
            popularSearches: popularSearches,
            averageSessionDuration: avgSession,
            totalViews: Object.values(this.stats.views).reduce((sum, doc) => sum + doc.count, 0),
            totalDownloads: Object.values(this.stats.downloads).reduce((sum, doc) => sum + doc.count, 0),
            totalSearches: this.stats.searches.length
        };
    }
}

// Inicializar componentes quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar indexador de PDF
    const pdfIndexer = new PdfIndexer();
    pdfIndexer.initialize();
    
    // Inicializar estatísticas de uso
    const usageStats = new UsageStatistics();
    
    // Registrar início da sessão
    const sessionStart = Date.now();
    
    // Registrar duração da sessão ao sair da página
    window.addEventListener('beforeunload', function() {
        const sessionDuration = (Date.now() - sessionStart) / 1000; // em segundos
        usageStats.recordSessionDuration(sessionDuration);
    });
    
    // Adicionar eventos para rastrear visualizações
    document.querySelectorAll('.preview-button').forEach(button => {
        button.addEventListener('click', function() {
            const documentId = this.closest('.document-card').querySelector('.favorite-button').getAttribute('data-id');
            const documentTitle = this.closest('.document-card').querySelector('h3').textContent;
            const category = this.closest('.document-card').getAttribute('data-category');
            
            usageStats.recordView(documentId, documentTitle, category);
        });
    });
    
    // Adicionar eventos para rastrear downloads
    document.querySelectorAll('.download-button').forEach(button => {
        button.addEventListener('click', function() {
            const documentId = this.closest('.document-card').querySelector('.favorite-button').getAttribute('data-id');
            const documentTitle = this.closest('.document-card').querySelector('h3').textContent;
            const category = this.closest('.document-card').getAttribute('data-category');
            
            usageStats.recordDownload(documentId, documentTitle, category);
        });
    });
    
    // Adicionar evento para rastrear pesquisas
    const searchForm = document.getElementById('advancedSearchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const searchTitle = document.getElementById('searchTitle').value;
            const searchCategory = document.getElementById('searchCategory').value;
            
            // Construir query de pesquisa
            let query = searchTitle;
            if (searchCategory) {
                query += ` categoria:${searchCategory}`;
            }
            
            // Simular contagem de resultados
            const resultsCount = Math.floor(Math.random() * 5) + 1;
            
            usageStats.recordSearch(query, resultsCount);
            
            // Aqui implementaríamos a pesquisa real
            console.log(`Pesquisa registrada: "${query}" com ${resultsCount} resultados`);
        });
    }
    
    // Adicionar pesquisa no conteúdo de PDFs
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    
    if (searchButton && searchInput) {
        searchButton.addEventListener('click', function() {
            const query = searchInput.value.trim();
            if (query.length < 2) return;
            
            // Pesquisar no índice de PDFs
            const results = pdfIndexer.search(query);
            
            // Registrar pesquisa nas estatísticas
            usageStats.recordSearch(query, results.length);
            
            // Exibir resultados (em uma implementação real, atualizaríamos a UI)
            console.log(`Resultados da pesquisa para "${query}":`, results);
            
            // Aqui implementaríamos a atualização da UI com os resultados
        });
    }
});
