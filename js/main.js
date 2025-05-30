/* Arquivo JavaScript principal */
document.addEventListener('DOMContentLoaded', function() {
    // Elementos DOM
    const filterButtons = document.querySelectorAll('.filter-button');
    const documentCards = document.querySelectorAll('.document-card');
    const categorySections = document.querySelectorAll('.category-section');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const currentCategory = document.getElementById('currentCategory');
    // const themeToggle = document.getElementById("themeToggle"); // REMOVIDO: Elemento não existe, causava erro.
    // const themeIcon = themeToggle.querySelector("i"); // REMOVIDO: Dependia de themeToggle e não era usado.
    const previewButtons = document.querySelectorAll('.preview-button');
    const previewModal = document.getElementById('previewModal');
    const closeModal = document.getElementById('closeModal');
    const pdfFrame = document.getElementById('pdfFrame');
    const modalTitle = document.getElementById('modalTitle');
    const favoriteButtons = document.querySelectorAll('.favorite-button');
    const favoritesContainer = document.getElementById('favoritesContainer');
    const favoritesSection = document.getElementById('favorites');
    const historyContainer = document.getElementById('historyContainer');
    const historySection = document.getElementById('history');
    const themeSelector = document.getElementById('themeSelector');
    const themeSelectorToggle = document.getElementById('themeSelectorToggle');
    const readingModeToggle = document.getElementById('readingModeToggle');
    const readingMode = document.getElementById('readingMode');
    const readingModeClose = document.getElementById('readingModeClose');
    const readingModeContent = document.getElementById('readingModeContent');
    const readingModeTitle = document.getElementById('readingModeTitle');
    const fontSizeButtons = document.querySelectorAll('.font-size-button');
    const lineSpacingButtons = document.querySelectorAll('.line-spacing-button');
    const readingThemeButtons = document.querySelectorAll('.reading-theme-button');
    const shareButtons = document.querySelectorAll('.share-button');
    const commentButtons = document.querySelectorAll(".comment-button");
    const commentModal = document.getElementById("commentModal"); // Adicionado para referência
    const commentClose = document.getElementById("commentClose"); // Adicionado para fechar modal
    const notificationToggle = document.getElementById("notificationToggle"); // Adicionado para notificações
    const notificationCenter = document.getElementById("notificationCenter"); // Adicionado para notificações
    const notificationCenterClose = document.getElementById("notificationCenterClose"); // Adicionado para notificações
    const addCategoryButton = document.getElementById("addCategoryButton"); // Adicionado para Nova Categoria
    const addCategoryModal = document.getElementById("addCategoryModal"); // Adicionado para Nova Categoria
    const addCategoryClose = document.getElementById("addCategoryClose"); // Adicionado para Nova Categoria
    const advancedSearchToggle = document.getElementById("advancedSearchToggle"); // Adicionado para Pesquisa Avançada
    const advancedSearch = document.getElementById("advancedSearch"); // Adicionado para Pesquisa Avançada
    const advancedSearchClose = document.getElementById("advancedSearchClose"); // Adicionado para Pesquisa Avançada
    const exportButton = document.getElementById("exportButton");

    // Inicializar Service Worker para PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('Service Worker registrado com sucesso:', registration);
            })
            .catch(error => {
                console.log('Falha ao registrar Service Worker:', error);
            });
    }

    // Sistema de temas
    const themeOptions = document.querySelectorAll('.theme-option');
    
    // Verificar tema salvo
    const savedTheme = localStorage.getItem('theme') || 'default';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    themeOptions.forEach(option => {
        if (option.getAttribute('data-theme') === savedTheme) {
            option.classList.add('active');
        }
        
        option.addEventListener('click', function() {
            const theme = this.getAttribute('data-theme');
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            
            themeOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Mostrar/ocultar seletor de temas
    if (themeSelectorToggle) {
        themeSelectorToggle.addEventListener('click', function() {
            themeSelector.classList.toggle('show');
        });
    }
    
    // Fechar seletor de temas ao clicar fora
    document.addEventListener('click', function(event) {
        if (themeSelector && !themeSelector.contains(event.target) && 
            !themeSelectorToggle.contains(event.target)) {
            themeSelector.classList.remove('show');
        }
    });

    // Modo de leitura - CORRIGIDO: Usar querySelectorAll e event delegation
    const documentsContainer = document.querySelector('.documents-container');
    if (documentsContainer && readingMode && readingModeClose) {
        documentsContainer.addEventListener('click', function(event) {
            const readingModeButton = event.target.closest('.reading-mode-toggle');
            if (readingModeButton) {
                const documentId = readingModeButton.getAttribute('data-document');
                const documentTitle = readingModeButton.getAttribute('data-title');
                
                // Carregar conteúdo do documento (simulado)
                readingModeTitle.textContent = documentTitle;
                readingModeContent.innerHTML = `<p>Conteúdo do documento "${documentTitle}" carregado para leitura simplificada.</p>`;
                
                // Mostrar modo de leitura
                readingMode.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });

        readingModeClose.addEventListener('click', function() {
            readingMode.classList.remove('active');
            document.body.style.overflow = '';
        });
    } else {
        console.warn('Elementos necessários para o Modo de Leitura não encontrados.');
    }
    
    // Controles do modo de leitura
    fontSizeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const size = this.getAttribute('data-size');
            readingMode.setAttribute('data-font-size', size);
            
            fontSizeButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    lineSpacingButtons.forEach(button => {
        button.addEventListener('click', function() {
            const spacing = this.getAttribute('data-spacing');
            readingMode.setAttribute('data-line-spacing', spacing);
            
            lineSpacingButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    readingThemeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const theme = this.getAttribute('data-theme');
            readingMode.setAttribute('data-theme', theme);
            
            readingThemeButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Compartilhamento de documentos
    shareButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const documentTitle = this.getAttribute('data-title');
            const documentUrl = this.getAttribute('data-url');
            
            if (navigator.share) {
                navigator.share({
                    title: documentTitle,
                    text: `Confira este documento: ${documentTitle}`,
                    url: documentUrl
                })
                .then(() => console.log('Compartilhado com sucesso'))
                .catch((error) => console.log('Erro ao compartilhar', error));
            } else {
                // Fallback para navegadores que não suportam Web Share API
                const shareMenu = document.getElementById('shareMenu');
                shareMenu.style.display = 'block';
                
                // Configurar links de compartilhamento
                const whatsappShare = document.getElementById('whatsappShare');
                const emailShare = document.getElementById('emailShare');
                const copyLink = document.getElementById('copyLink');
                
                whatsappShare.href = `https://wa.me/?text=${encodeURIComponent(`${documentTitle} - ${documentUrl}`)}`;
                emailShare.href = `mailto:?subject=${encodeURIComponent(documentTitle)}&body=${encodeURIComponent(`Confira este documento: ${documentUrl}`)}`;
                
                copyLink.addEventListener('click', function() {
                    navigator.clipboard.writeText(documentUrl)
                        .then(() => {
                            showNotification('Link copiado para a área de transferência!');
                        })
                        .catch(err => {
                            console.error('Erro ao copiar link: ', err);
                        });
                });
            }
        });
    });

    // Sistema de comentários
    commentButtons.forEach(button => {
        button.addEventListener('click', function() {
            const documentId = this.getAttribute('data-id');
            const commentModal = document.getElementById('commentModal');
            const commentForm = document.getElementById('commentForm');
            const commentsList = document.getElementById('commentsList');
            
            // Carregar comentários existentes (simulado)
            const savedComments = JSON.parse(localStorage.getItem(`comments_${documentId}`)) || [];
            
            commentsList.innerHTML = '';
            if (savedComments.length > 0) {
                savedComments.forEach(comment => {
                    const commentElement = document.createElement('div');
                    commentElement.classList.add('comment-item');
                    commentElement.innerHTML = `
                        <div class="comment-header">
                            <span class="comment-author">Usuário</span>
                            <span class="comment-date">${comment.date}</span>
                        </div>
                        <div class="comment-text">${comment.text}</div>
                    `;
                    commentsList.appendChild(commentElement);
                });
            } else {
                commentsList.innerHTML = '<p class="empty-comments">Nenhum comentário ainda. Seja o primeiro a comentar!</p>';
            }
            
            // Configurar formulário
            commentForm.dataset.documentId = documentId;
            
            // Mostrar modal
            commentModal.classList.add('show');
        });
    });

    // Enviar comentário
    const commentForm = document.getElementById('commentForm');
    if (commentForm) {
        commentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const documentId = this.dataset.documentId;
            const commentText = document.getElementById('commentText').value;
            
            if (commentText.trim() === '') return;
            
            // Salvar comentário (simulado)
            const savedComments = JSON.parse(localStorage.getItem(`comments_${documentId}`)) || [];
            const newComment = {
                text: commentText,
                date: new Date().toLocaleDateString()
            };
            
            savedComments.push(newComment);
            localStorage.setItem(`comments_${documentId}`, JSON.stringify(savedComments));
            
            // Atualizar lista de comentários
            const commentsList = document.getElementById('commentsList');
            const commentElement = document.createElement('div');
            commentElement.classList.add('comment-item');
            commentElement.innerHTML = `
                <div class="comment-header">
                    <span class="comment-author">Usuário</span>
                    <span class="comment-date">${newComment.date}</span>
                </div>
                <div class="comment-text">${newComment.text}</div>
            `;
            
            if (commentsList.querySelector('.empty-comments')) {
                commentsList.innerHTML = '';
            }
            
            commentsList.appendChild(commentElement);
            
            // Limpar formulário
            document.getElementById('commentText').value = '';
            
            showNotification('Comentário adicionado com sucesso!');
        });
    }

    // Exportação de listas
    if (exportButton) {
        exportButton.addEventListener('click', function() {
            const format = document.getElementById('exportFormat').value;
            const category = currentCategory.textContent;
            
            if (format === 'csv') {
                exportToCSV(category);
            } else if (format === 'pdf') {
                exportToPDF(category);
            }
        });
    }

    // Função para exportar para CSV
    function exportToCSV(category) {
        let csvContent = 'Título,Categoria,Data de Atualização,Tamanho\n';
        
        documentCards.forEach(card => {
            if (category === 'Todos os documentos' || card.getAttribute('data-category') === category.toLowerCase()) {
                const title = card.querySelector('h3').textContent;
                const cardCategory = card.getAttribute('data-category');
                const date = card.querySelector('.document-date').textContent.replace('Atualizado: ', '');
                const size = card.querySelector('.document-size').textContent;
                
                csvContent += `"${title}","${cardCategory}","${date}","${size}"\n`;
            }
        });
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `documentos_${category.toLowerCase().replace(/\s+/g, '_')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('Lista exportada em formato CSV!');
    }

    // Função para exportar para PDF (simulada)
    function exportToPDF(category) {
        // Em uma implementação real, usaríamos uma biblioteca como jsPDF
        // Aqui apenas simulamos a exportação
        showNotification('Lista exportada em formato PDF!');
    }

    // Função para mostrar notificações
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.classList.add('notification');
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-info-circle"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Lazy loading de imagens e documentos
    if ('IntersectionObserver' in window) {
        const lazyLoadObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    if (element.tagName === 'IMG') {
                        element.src = element.dataset.src;
                        element.classList.remove('lazy');
                    } else if (element.classList.contains('document-card')) {
                        element.classList.add('loaded');
                    }
                    observer.unobserve(element);
                }
            });
        });
        
        document.querySelectorAll('img.lazy').forEach(img => {
            lazyLoadObserver.observe(img);
        });
        
        document.querySelectorAll('.document-card').forEach(card => {
            lazyLoadObserver.observe(card);
        });
    }

    // Adicionar efeito de ondulação (ripple) aos botões
    const rippleButtons = document.querySelectorAll('.ripple');
    rippleButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const ripple = document.createElement('span');
            ripple.classList.add('ripple-effect');
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            button.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // Função para filtrar por categoria
    function filterByCategory(category) {
        // Atualizar breadcrumb
        if (category === 'todos') {
            currentCategory.textContent = 'Todos os documentos';
        } else {
            const categoryTitle = document.querySelector(`#${category} h2`).textContent;
            currentCategory.textContent = categoryTitle;
        }

        // Atualizar ARIA para tabs
        filterButtons.forEach(btn => {
            const btnCategory = btn.getAttribute('data-category');
            btn.setAttribute('aria-selected', btnCategory === category);
        });

        if (category === 'todos') {
            categorySections.forEach(section => {
                section.style.display = 'block';
            });
        } else {
            categorySections.forEach(section => {
                if (section.id === category) {
                    section.style.display = 'block';
                } else {
                    section.style.display = 'none';
                }
            });
        }
    }

    // Adicionar evento de clique aos botões de filtro
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remover classe ativa de todos os botões
            filterButtons.forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Adicionar classe ativa ao botão clicado
            this.classList.add('active');
            
            // Filtrar documentos pela categoria
            const category = this.getAttribute('data-category');
            filterByCategory(category);
        });
    });

    // Função de pesquisa
    function searchDocuments(query) {
        query = query.toLowerCase().trim();
        
        if (query === '') {
            // Restaurar visualização normal
            documentCards.forEach(card => {
                card.style.display = 'flex';
                
                // Remover marcações de destaque
                const title = card.querySelector('h3');
                const description = card.querySelector('.document-info p');
                
                title.innerHTML = title.textContent;
                description.innerHTML = description.textContent;
            });
            
            // Mostrar todas as seções
            categorySections.forEach(section => {
                section.style.display = 'block';
            });
            
            return;
        }
        
        // Filtrar e destacar resultados
        let hasResults = false;
        
        documentCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const description = card.querySelector('.document-info p').textContent.toLowerCase();
            
            if (title.includes(query) || description.includes(query)) {
                card.style.display = 'flex';
                hasResults = true;
                
                // Destacar termos da pesquisa
                const titleElement = card.querySelector('h3');
                const descriptionElement = card.querySelector('.document-info p');
                
                titleElement.innerHTML = highlightText(titleElement.textContent, query);
                descriptionElement.innerHTML = highlightText(descriptionElement.textContent, query);
            } else {
                card.style.display = 'none';
            }
        });
        
        // Verificar quais seções têm resultados
        categorySections.forEach(section => {
            const sectionId = section.id;
            const hasVisibleCards = Array.from(section.querySelectorAll('.document-card')).some(card => card.style.display !== 'none');
            
            section.style.display = hasVisibleCards ? 'block' : 'none';
        });
        
        // Atualizar breadcrumb
        currentCategory.textContent = `Resultados para "${query}"`;
        
        // Remover classe ativa de todos os botões de filtro
        filterButtons.forEach(btn => {
            btn.classList.remove('active');
        });
    }
    
    // Função para destacar texto
    function highlightText(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
    
    // Evento de pesquisa
    searchButton.addEventListener('click', function() {
        searchDocuments(searchInput.value);
    });
    
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            searchDocuments(this.value);
        }
    });

    // Visualização de documentos
    previewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const documentPath = this.getAttribute('data-document');
            const documentTitle = this.closest('.document-card').querySelector('h3').textContent;
            
            // Atualizar título do modal
            modalTitle.textContent = documentTitle;
            
            // Carregar PDF no iframe
            pdfFrame.src = documentPath;
            
            // Mostrar modal
            previewModal.classList.add('show');
            document.body.style.overflow = 'hidden';
            
            // Adicionar ao histórico
            addToHistory(documentTitle, documentPath, this.closest('.document-card').getAttribute('data-category'));
        });
    });
    
    // Fechar modal
    closeModal.addEventListener('click', function() {
        previewModal.classList.remove('show');
        document.body.style.overflow = '';
        
        // Limpar iframe para evitar problemas de memória
        setTimeout(() => {
            pdfFrame.src = '';
        }, 300);
    });
    
    // Fechar modal ao clicar fora
    previewModal.addEventListener('click', function(e) {
        if (e.target === previewModal) {
            closeModal.click();
        }
    });

    // Sistema de favoritos
    favoriteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const documentId = this.getAttribute('data-id');
            const documentCard = this.closest('.document-card');
            const documentTitle = documentCard.querySelector('h3').textContent;
            const documentPath = documentCard.querySelector('.preview-button').getAttribute('data-document');
            const documentCategory = documentCard.getAttribute('data-category');
            const starIcon = this.querySelector('i');
            
            // Verificar se já está nos favoritos
            const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
            const isFavorite = favorites.some(fav => fav.id === documentId);
            
            if (isFavorite) {
                // Remover dos favoritos
                const updatedFavorites = favorites.filter(fav => fav.id !== documentId);
                localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
                
                // Atualizar ícone
                starIcon.classList.remove('fas');
                starIcon.classList.add('far');
                
                showNotification('Documento removido dos favoritos!');
            } else {
                // Adicionar aos favoritos
                favorites.push({
                    id: documentId,
                    title: documentTitle,
                    path: documentPath,
                    category: documentCategory
                });
                localStorage.setItem('favorites', JSON.stringify(favorites));
                
                // Atualizar ícone
                starIcon.classList.remove('far');
                starIcon.classList.add('fas');
                
                showNotification('Documento adicionado aos favoritos!');
            }
            
            // Atualizar seção de favoritos
            updateFavorites();
        });
    });
    
    // Função para atualizar seção de favoritos
    function updateFavorites() {
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        
        if (favorites.length > 0) {
            favoritesContainer.innerHTML = '';
            
            favorites.forEach(fav => {
                const favoriteCard = document.createElement('article');
                favoriteCard.classList.add('document-card');
                favoriteCard.setAttribute('data-category', fav.category);
                
                favoriteCard.innerHTML = `
                    <div class="document-icon">
                        <i class="fas fa-file-pdf" aria-hidden="true"></i>
                    </div>
                    <div class="document-info">
                        <h3>${fav.title}</h3>
                        <div class="document-meta">
                            <span class="document-category"><i class="fas fa-folder" aria-hidden="true"></i> ${fav.category}</span>
                        </div>
                    </div>
                    <div class="document-actions">
                        <button class="preview-button" data-document="${fav.path}" aria-label="Visualizar ${fav.title}">
                            <i class="fas fa-eye" aria-hidden="true"></i> Visualizar
                        </button>
                        <a href="${fav.path}" download class="download-button" aria-label="Baixar ${fav.title}">
                            <i class="fas fa-download" aria-hidden="true"></i> Download
                        </a>
                        <button class="favorite-button" data-id="${fav.id}" aria-label="Remover dos favoritos">
                            <i class="fas fa-star" aria-hidden="true"></i>
                        </button>
                    </div>
                `;
                
                favoritesContainer.appendChild(favoriteCard);
                
                // Adicionar evento de clique ao botão de visualização
                const previewButton = favoriteCard.querySelector('.preview-button');
                previewButton.addEventListener('click', function() {
                    const documentPath = this.getAttribute('data-document');
                    
                    // Atualizar título do modal
                    modalTitle.textContent = fav.title;
                    
                    // Carregar PDF no iframe
                    pdfFrame.src = documentPath;
                    
                    // Mostrar modal
                    previewModal.classList.add('show');
                    document.body.style.overflow = 'hidden';
                    
                    // Adicionar ao histórico
                    addToHistory(fav.title, documentPath, fav.category);
                });
                
                // Adicionar evento de clique ao botão de favorito
                const favoriteButton = favoriteCard.querySelector('.favorite-button');
                favoriteButton.addEventListener('click', function() {
                    const documentId = this.getAttribute('data-id');
                    
                    // Remover dos favoritos
                    const updatedFavorites = favorites.filter(f => f.id !== documentId);
                    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
                    
                    // Atualizar ícone no documento original
                    const originalButton = document.querySelector(`.favorite-button[data-id="${documentId}"]`);
                    if (originalButton) {
                        const originalIcon = originalButton.querySelector('i');
                        originalIcon.classList.remove('fas');
                        originalIcon.classList.add('far');
                    }
                    
                    showNotification('Documento removido dos favoritos!');
                    
                    // Atualizar seção de favoritos
                    updateFavorites();
                });
            });
        } else {
            favoritesContainer.innerHTML = '<p class="empty-favorites">Você ainda não adicionou documentos aos favoritos.</p>';
        }
    }
    
    // Função para adicionar ao histórico
    function addToHistory(title, path, category) {
        const history = JSON.parse(localStorage.getItem('history')) || [];
        
        // Verificar se já está no histórico
        const existingIndex = history.findIndex(item => item.path === path);
        if (existingIndex !== -1) {
            // Remover item existente
            history.splice(existingIndex, 1);
        }
        
        // Adicionar ao início do histórico
        history.unshift({
            title: title,
            path: path,
            category: category,
            date: new Date().toISOString()
        });
        
        // Limitar a 10 itens
        if (history.length > 10) {
            history.pop();
        }
        
        localStorage.setItem('history', JSON.stringify(history));
        
        // Atualizar seção de histórico
        updateHistory();
    }
    
    // Função para atualizar seção de histórico
    function updateHistory() {
        const history = JSON.parse(localStorage.getItem('history')) || [];
        
        if (history.length > 0) {
            historyContainer.innerHTML = '';
            
            history.forEach(item => {
                const historyCard = document.createElement('article');
                historyCard.classList.add('document-card');
                historyCard.setAttribute('data-category', item.category);
                
                const date = new Date(item.date);
                const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
                
                historyCard.innerHTML = `
                    <div class="document-icon">
                        <i class="fas fa-file-pdf" aria-hidden="true"></i>
                    </div>
                    <div class="document-info">
                        <h3>${item.title}</h3>
                        <div class="document-meta">
                            <span class="document-category"><i class="fas fa-folder" aria-hidden="true"></i> ${item.category}</span>
                            <span class="document-date"><i class="fas fa-clock" aria-hidden="true"></i> ${formattedDate}</span>
                        </div>
                    </div>
                    <div class="document-actions">
                        <button class="preview-button" data-document="${item.path}" aria-label="Visualizar ${item.title}">
                            <i class="fas fa-eye" aria-hidden="true"></i> Visualizar
                        </button>
                        <a href="${item.path}" download class="download-button" aria-label="Baixar ${item.title}">
                            <i class="fas fa-download" aria-hidden="true"></i> Download
                        </a>
                    </div>
                `;
                
                historyContainer.appendChild(historyCard);
                
                // Adicionar evento de clique ao botão de visualização
                const previewButton = historyCard.querySelector('.preview-button');
                previewButton.addEventListener('click', function() {
                    const documentPath = this.getAttribute('data-document');
                    
                    // Atualizar título do modal
                    modalTitle.textContent = item.title;
                    
                    // Carregar PDF no iframe
                    pdfFrame.src = documentPath;
                    
                    // Mostrar modal
                    previewModal.classList.add('show');
                    document.body.style.overflow = 'hidden';
                });
            });
        } else {
            historyContainer.innerHTML = '<p class="empty-history">Nenhum documento visualizado recentemente.</p>';
        }
    }
    
    // Inicializar favoritos e histórico
    updateFavorites();
    updateHistory();
    
    // Verificar favoritos existentes e atualizar ícones
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favoriteButtons.forEach(button => {
        const documentId = button.getAttribute('data-id');
        const isFavorite = favorites.some(fav => fav.id === documentId);
        
        if (isFavorite) {
            const starIcon = button.querySelector('i');
            starIcon.classList.remove('far');
            starIcon.classList.add('fas');
        }
    });

    // Adicionar data para impressão
    document.querySelector('.container').setAttribute('data-print-date', new Date().toLocaleDateString());
});


    // Fechar Modal de Comentários - CORRIGIDO: Adicionado listener
    if (commentClose && commentModal) {
        commentClose.addEventListener("click", function() {
            commentModal.classList.remove("show");
        });
    }

    // Abrir/Fechar Centro de Notificações - CORRIGIDO: Adicionado listeners
    if (notificationToggle && notificationCenter) {
        notificationToggle.addEventListener("click", function() {
            notificationCenter.classList.toggle("show");
        });
    }
    if (notificationCenterClose && notificationCenter) {
        notificationCenterClose.addEventListener("click", function() {
            notificationCenter.classList.remove("show");
        });
    }

    // Fechar Centro de Notificações ao clicar fora (opcional, mas boa prática)
    document.addEventListener("click", function(event) {
        if (notificationCenter && notificationToggle && 
            !notificationCenter.contains(event.target) && 
            !notificationToggle.contains(event.target)) {
            notificationCenter.classList.remove("show");
        }
    });



    // Visualizar Documento (Preview) - CORRIGIDO: Abrir em nova aba e garantir fechamento do modal (se ainda usado)
    previewButtons.forEach(button => {
        button.addEventListener("click", function() {
            const documentPath = this.getAttribute("data-document");
            const documentTitle = this.getAttribute("data-title");

            // Opção A (Recomendada): Abrir PDF em nova aba
            window.open(documentPath, "_blank");

            /* Opção B (Alternativa - Manter Modal, mas sem iframe direto):
            if (previewModal && modalTitle && closeModal) {
                modalTitle.textContent = documentTitle;
                // Aqui você integraria PDF.js ou outra lógica para exibir no #pdfFrame
                // pdfFrame.innerHTML = '<p>Carregando pré-visualização...</p>'; 
                previewModal.classList.add("show");
                document.body.style.overflow = "hidden";
            } else {
                console.warn("Elementos do modal de visualização não encontrados.");
            }
            */
        });
    });

    // Fechar Modal de Visualização (se a Opção B for usada)
    if (closeModal && previewModal) {
        closeModal.addEventListener("click", function() {
            previewModal.classList.remove("show");
            document.body.style.overflow = ""; // Restaurar rolagem
            // pdfFrame.src = "about:blank"; // Limpar iframe se usado
        });
    }

    // Nova Categoria - CORRIGIDO: Adicionado listeners para abrir/fechar modal
    if (addCategoryButton && addCategoryModal) {
        addCategoryButton.addEventListener("click", function() {
            addCategoryModal.classList.add("show");
        });
    }
    if (addCategoryClose && addCategoryModal) {
        addCategoryClose.addEventListener("click", function() {
            addCategoryModal.classList.remove("show");
        });
    }
    // Listener para o form addCategoryForm precisaria ser implementado para salvar a categoria

    // Pesquisa Avançada - CORRIGIDO: Adicionado listeners para abrir/fechar painel
    if (advancedSearchToggle && advancedSearch) {
        advancedSearchToggle.addEventListener("click", function() {
            advancedSearch.classList.toggle("show");
        });
    }
    if (advancedSearchClose && advancedSearch) {
        advancedSearchClose.addEventListener("click", function() {
            advancedSearch.classList.remove("show");
        });
    }

