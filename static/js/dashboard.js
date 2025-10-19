(function () {
    "use strict";

    // Utility functions
    const select = (el, all = false) => {
        el = el.trim();
        if (all) {
            return [...document.querySelectorAll(el)];
        } else {
            return document.querySelector(el);
        }
    };

    const on = (type, el, listener, all = false) => {
        if (all) {
            select(el, all).forEach((e) => e.addEventListener(type, listener));
        } else {
            const element = select(el, all);
            if (element) {
                element.addEventListener(type, listener);
            }
        }
    };

    const onscroll = (el, listener) => {
        el.addEventListener("scroll", listener, { passive: true });
    };

    // Sidebar toggle functionality
    if (select(".sidebar-toggle")) {
        const isToggled = Boolean(JSON.parse(localStorage.getItem("sidebar-toggled"))) || false;
        if (isToggled) {
            select("body").classList.add("toggle-sidebar");
        } else {
            select("body").classList.remove("toggle-sidebar");
        }

        on("click", ".sidebar-toggle", function (e) {
            select("body").classList.toggle("toggle-sidebar");
            this.classList.toggle("collapsed");
            const isToggled = select("body").classList.contains("toggle-sidebar");
            localStorage.setItem("sidebar-toggled", isToggled);
        });
    }

    // Search bar toggle
    if (select(".search-bar-toggle")) {
        on("click", ".search-bar-toggle", function (e) {
            const searchBar = select(".search-bar");
            if (searchBar) {
                searchBar.classList.toggle("search-bar-show");
            }
        });
    }

    // Navbar active links
    let navbarlinks = select("#navbar .scrollto", true);
    const navbarlinksActive = () => {
        let position = window.scrollY + 200;
        navbarlinks.forEach((navbarlink) => {
            if (!navbarlink.hash) return;
            let section = select(navbarlink.hash);
            if (!section) return;
            if (position >= section.offsetTop && position <= section.offsetTop + section.offsetHeight) {
                navbarlink.classList.add("active");
            } else {
                navbarlink.classList.remove("active");
            }
        });
    };
    window.addEventListener("load", navbarlinksActive);
    onscroll(document, navbarlinksActive);

    // Header scroll effect
    let selectHeader = select("#header");
    if (selectHeader) {
        const headerScrolled = () => {
            if (window.scrollY > 100) {
                selectHeader.classList.add("header-scrolled");
            } else {
                selectHeader.classList.remove("header-scrolled");
            }
        };
        window.addEventListener("load", headerScrolled);
        onscroll(document, headerScrolled);
    }

    // Back to top button
    let backtotop = select(".back-to-top");
    if (backtotop) {
        const toggleBacktotop = () => {
            if (window.scrollY > 100) {
                backtotop.classList.add("active");
            } else {
                backtotop.classList.remove("active");
            }
        };
        window.addEventListener("load", toggleBacktotop);
        onscroll(document, toggleBacktotop);
    }

    // Form validation
    var needsValidation = document.querySelectorAll(".needs-validation");
    Array.prototype.slice.call(needsValidation).forEach(function (form) {
        form.addEventListener(
            "submit",
            function (event) {
                if (!form.checkValidity()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                form.classList.add("was-validated");
            },
            false,
        );
    });

    // Simple DataTables initialization
    const datatables = select(".datatable", true);
    datatables.forEach((datatable) => {
        new simpleDatatables.DataTable(datatable, {
            perPageSelect: [5, 10, 15, ["All", -1]],
            columns: [
                { select: 2, sortSequence: ["desc", "asc"] },
                { select: 3, sortSequence: ["desc"] },
                { select: 4, cellClass: "green", headerClass: "red" },
            ],
        });
    });



    // Table Manager
    const tableManager = {
    init() {
        this.setupEventListeners();
        this.initDataTable();
        const editModal = document.getElementById('editModal');
        if (editModal) {
            editModal.addEventListener('show.bs.modal', function (event) {
                const button = event.relatedTarget;
                const cityName = button.getAttribute('data-name');
                const cityId = button.getAttribute('data-id');

                const keywordName = button.getAttribute('data-keyword-name');
                const keywordId = button.getAttribute('data-keyword-id');

                const cityNameOldInput = editModal.querySelector('#city_name_old');
                const cityNameNewInput = editModal.querySelector('#city_name_new');
                const cityIdInput = editModal.querySelector('#city_id');

                const keywordNameOldInput = editModal.querySelector('#keyword_name_old');
                const keywordNameNewInput = editModal.querySelector('#keyword_name_new');
                const keywordIdInput = editModal.querySelector('#keyword_id');

                if (cityNameOldInput) cityNameOldInput.value = cityName || '';
                if (cityNameNewInput) cityNameNewInput.value = '';
                if (cityIdInput) cityIdInput.value = cityId || '';

                if (keywordNameOldInput) keywordNameOldInput.value = keywordName || '';
                if (keywordNameNewInput) keywordNameNewInput.value = '';
                if (keywordIdInput) keywordIdInput.value = keywordId || '';

            });
        }
    },

    setupEventListeners() {
        document.addEventListener('change', (e) => {
            const el = e.target;
            if (!el.matches('#ip-table .checkbox, #ip-table .select-all')) return;

            if (el.matches('.select-all')) {
                document.querySelectorAll('#ip-table .checkbox').forEach(cb => cb.checked = el.checked);
            }
            this.updateUI();
        });

        const deleteBtn = document.getElementById('deleteButton');
        if (deleteBtn) {
            deleteBtn.onclick = (e) => this.handleDelete(e);
        }
        const editCityBtn = document.getElementById('edit-city-btn');
        if (editCityBtn) {
            editCityBtn.onclick = (e) => this.handleEdit(e);
        }

        const editKeywordBtn = document.getElementById('edit-keyword-btn');
        if (editKeywordBtn) {
            editKeywordBtn.onclick = (e) => this.handleEdit(e);
        }
    },

    initDataTable() {
        const table = $('#ip-table');
        if ($.fn.DataTable.isDataTable(table)) {
            table.DataTable().destroy();
        }

        const hasData = table.find('tbody tr:not(.no-data)').length > 0;

        if (hasData) {
            table.DataTable({
                responsive: true,
                paging: true,
                searching: true,
                dom: '<"d-flex justify-content-between"lf>rt<"d-flex justify-content-between"ip>',
                language: {
                    search: "",
                    searchPlaceholder: "Search...",
                    emptyTable: ""
                },
                columnDefs: [
                    { targets: '_all', defaultContent: '' }
                ],
                initComplete: function () {
                    $('.dataTables_filter input').css('width', '500px');
                    table.find('thead').show();
                }
            });
        } else {
            table.find('thead').show();
        }
    },

    getSelectedItems() {
        const isCity = window.location.pathname.includes('city');
        const isKeyword = window.location.pathname.includes('keyword');

        return Array.from(document.querySelectorAll('#ip-table .checkbox:checked')).map(el => {
            if (isKeyword) {
                return {
                    id: el.dataset.keywordId,
                    name: el.dataset.keywordName
                };
            } else {
                return {
                    id: el.dataset.id,
                    name: el.dataset.name
                };
            }
        });
    },

    updateUI() {
        const checkboxes = document.querySelectorAll('#ip-table .checkbox');
        const checked = document.querySelectorAll('#ip-table .checkbox:checked');
        const selectAll = document.querySelector('#ip-table .select-all');

        if (selectAll) {
            selectAll.checked = checkboxes.length > 0 && checked.length === checkboxes.length;
        }

        const actionBtns = document.getElementById('selection-buttons');
        if (actionBtns) {
            actionBtns.style.display = checked.length > 0 ? 'block' : 'none';
        }
    },

    async handleEdit(e) {
        e?.preventDefault();
        const isCity = window.location.pathname.includes('city');
        const isKeyword = window.location.pathname.includes('keyword');
        const modal = document.getElementById('editModal');

        let nameInput = modal.querySelector('#city_name_new');
        let idInput = modal.querySelector('#city_id');

        if (isKeyword) {
            nameInput = modal.querySelector('#keyword_name_new');
            idInput = modal.querySelector('#keyword_id');
        }
        const updatedName = nameInput?.value?.trim();
        const id = idInput?.value;

        console.log('Attempting to edit:', { updatedName, id, nameInput, idInput });

        try {
            const response = await fetch(`/${isCity ? 'city' : isKeyword ? 'keyword' : 'keyword'}_edit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    [isCity ? 'city' : 'keyword']: {
                        id,
                        name: updatedName
                    }
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Edit failed');

            bootstrap.Modal.getInstance(modal)?.hide();
            alert(`${isCity ? 'City' : 'Keyword'} updated successfully!`);
            setTimeout(() => window.location.reload(), 500);
        } catch (err) {
            console.error('Edit error:', err);
            alert('Error: ' + (err.message || 'Failed to edit'));
        }
    },

    async handleDelete(e) {
        e?.preventDefault();
        
        const items = this.getSelectedItems();

        if (items.length === 0) {
            return alert('Please select items to delete.');
        }

        const btn = e?.target;
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Deleting...';
        }

        try {
            const isCity = window.location.pathname.includes('city');
            const endpoint = `/${isCity ? 'city' : 'keyword'}_delete`;
            
            const body = {
                [isCity ? 'cities' : 'keywords']: items
            };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `Delete failed with status ${response.status}`);
            }

            
            const modal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
            if (modal) modal.hide();

            alert(`${isCity ? 'Cities' : 'Keywords'} deleted successfully! (${data.deleted_count || items.length} items)`);
            
            window.location.href = window.location.href.split('?')[0]

        } catch (error) {
            alert('Error: ' + (error.message || 'Failed to delete items'));
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = 'Delete';
            }
        }
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    tableManager.init();
});
})();