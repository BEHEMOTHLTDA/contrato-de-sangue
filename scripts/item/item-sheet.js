/**
 * Ficha de Item para o sistema Contrato de Sangue
 * Estende a classe ItemSheet do Foundry VTT
 */
export class ContratoDeSangueItemSheet extends ItemSheet {

    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["contrato-de-sangue", "sheet", "item"],
            width: 520,
            height: 480,
            tabs: [{ navSelector: ".tabs", contentSelector: ".tab-content", initial: "description" }]
        });
    }

    /** @override */
    get template() {
        const path = "systems/contrato-de-sangue/templates/item";
        return `${path}/item-${this.item.type}-sheet.html`;
    }

    /** @override */
    getData() {
        const context = super.getData();
        const itemData = this.item.toObject(false);
        
        // Adiciona dados do sistema
        context.system = itemData.system;
        context.flags = itemData.flags;
        
        // Adiciona opções específicas por tipo
        context.config = CONFIG.CDS || {};
        
        // Adiciona dados específicos por tipo de item
        switch (this.item.type) {
            case 'vantagem':
                context.linhagens = {
                    'upior': 'CDS.Upior',
                    'wilkolaki': 'CDS.Wilkolaki',
                    'ambas': 'CDS.Ambas'
                };
                context.tiposBonus = {
                    'pericia': 'CDS.Pericia',
                    'atributo': 'CDS.Atributo',
                    'especial': 'CDS.Especial'
                };
                break;
                
            case 'arma':
                context.tiposArma = {
                    'branca': 'CDS.ArmaBranca',
                    'fogo': 'CDS.ArmaFogo'
                };
                context.alcances = {
                    'curto': 'CDS.AlcanceCurto',
                    'medio': 'CDS.AlcanceMedio',
                    'longo': 'CDS.AlcanceLongo'
                };
                break;
                
            case 'poder':
                context.linhagens = {
                    'upior': 'CDS.Upior',
                    'wilkolaki': 'CDS.Wilkolaki'
                };
                break;
        }
        
        // Enriquece a descrição
        context.enrichedDescription = TextEditor.enrichHTML(context.system.description, {async: false});
        
        return context;
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        // Tudo abaixo só funciona se a ficha for editável
        if (!this.isEditable) return;

        // Listeners específicos por tipo de item
        switch (this.item.type) {
            case 'vantagem':
                this._activateVantagemListeners(html);
                break;
            case 'arma':
                this._activateArmaListeners(html);
                break;
            case 'armadura':
                this._activateArmaduraListeners(html);
                break;
            case 'equipamento':
                this._activateEquipamentoListeners(html);
                break;
            case 'poder':
                this._activatePoderListeners(html);
                break;
        }

        // Listener para testar o item
        html.find('.test-item').click(this._onTestItem.bind(this));
    }

    /**
     * Ativa listeners específicos para vantagens
     * @param {jQuery} html - HTML da ficha
     */
    _activateVantagemListeners(html) {
        // Listener para mudança de tipo de bônus
        html.find('select[name="system.bonus.tipo"]').change(this._onBonusTypeChange.bind(this));
    }

    /**
     * Ativa listeners específicos para armas
     * @param {jQuery} html - HTML da ficha
     */
    _activateArmaListeners(html) {
        // Listener para mudança de tipo de arma
        html.find('select[name="system.tipo"]').change(this._onWeaponTypeChange.bind(this));
    }

    /**
     * Ativa listeners específicos para armaduras
     * @param {jQuery} html - HTML da ficha
     */
    _activateArmaduraListeners(html) {
        // Listeners específicos para armaduras podem ser adicionados aqui
    }

    /**
     * Ativa listeners específicos para equipamentos
     * @param {jQuery} html - HTML da ficha
     */
    _activateEquipamentoListeners(html) {
        // Listeners específicos para equipamentos podem ser adicionados aqui
    }

    /**
     * Ativa listeners específicos para poderes
     * @param {jQuery} html - HTML da ficha
     */
    _activatePoderListeners(html) {
        // Listener para mudança de linhagem
        html.find('select[name="system.linhagem"]').change(this._onLineageChange.bind(this));
    }

    /**
     * Manipula mudança de tipo de bônus em vantagens
     * @param {Event} event - Evento de mudança
     */
    async _onBonusTypeChange(event) {
        event.preventDefault();
        const bonusType = event.target.value;
        
        // Limpa a aplicação quando o tipo muda
        await this.item.update({
            'system.bonus.aplicacao': ''
        });
        
        this.render(false);
    }

    /**
     * Manipula mudança de tipo de arma
     * @param {Event} event - Evento de mudança
     */
    async _onWeaponTypeChange(event) {
        event.preventDefault();
        const weaponType = event.target.value;
        
        // Ajusta valores padrão baseados no tipo
        const updates = {};
        
        if (weaponType === 'fogo') {
            updates['system.alcance'] = 'medio';
        } else {
            updates['system.alcance'] = 'curto';
        }
        
        await this.item.update(updates);
        this.render(false);
    }

    /**
     * Manipula mudança de linhagem em poderes
     * @param {Event} event - Evento de mudança
     */
    async _onLineageChange(event) {
        event.preventDefault();
        const lineage = event.target.value;
        
        // Pode ajustar custos padrão baseados na linhagem
        // Por exemplo, poderes Upiór podem ter custos diferentes de Wilkołaki
        
        this.render(false);
    }

    /**
     * Manipula teste do item
     * @param {Event} event - Evento de clique
     */
    async _onTestItem(event) {
        event.preventDefault();
        
        if (this.item.parent) {
            // Se o item pertence a um ator, usa o ator
            await this.item.roll();
        } else {
            // Se não pertence a um ator, apenas mostra informações
            await this.item._showItemInfo();
        }
    }

    /** @override */
    async _updateObject(event, formData) {
        // Processamento especial para diferentes tipos de item
        switch (this.item.type) {
            case 'vantagem':
                formData = this._processVantagemData(formData);
                break;
            case 'arma':
                formData = this._processArmaData(formData);
                break;
            case 'armadura':
                formData = this._processArmaduraData(formData);
                break;
            case 'equipamento':
                formData = this._processEquipamentoData(formData);
                break;
            case 'poder':
                formData = this._processPoderData(formData);
                break;
        }
        
        return super._updateObject(event, formData);
    }

    /**
     * Processa dados específicos de vantagem
     * @param {Object} formData - Dados do formulário
     * @returns {Object} Dados processados
     */
    _processVantagemData(formData) {
        // Garante que valores numéricos sejam números
        if (formData['system.bonus.valor']) {
            formData['system.bonus.valor'] = parseInt(formData['system.bonus.valor']) || 0;
        }
        
        return formData;
    }

    /**
     * Processa dados específicos de arma
     * @param {Object} formData - Dados do formulário
     * @returns {Object} Dados processados
     */
    _processArmaData(formData) {
        // Garante que valores numéricos sejam números
        if (formData['system.dano']) {
            formData['system.dano'] = parseInt(formData['system.dano']) || 0;
        }
        
        if (formData['system.peso']) {
            formData['system.peso'] = parseFloat(formData['system.peso']) || 0;
        }
        
        if (formData['system.preco']) {
            formData['system.preco'] = parseFloat(formData['system.preco']) || 0;
        }
        
        return formData;
    }

    /**
     * Processa dados específicos de armadura
     * @param {Object} formData - Dados do formulário
     * @returns {Object} Dados processados
     */
    _processArmaduraData(formData) {
        // Garante que valores numéricos sejam números
        if (formData['system.absorcao']) {
            formData['system.absorcao'] = parseInt(formData['system.absorcao']) || 0;
        }
        
        if (formData['system.penalidade']) {
            formData['system.penalidade'] = parseInt(formData['system.penalidade']) || 0;
        }
        
        if (formData['system.peso']) {
            formData['system.peso'] = parseFloat(formData['system.peso']) || 0;
        }
        
        if (formData['system.preco']) {
            formData['system.preco'] = parseFloat(formData['system.preco']) || 0;
        }
        
        return formData;
    }

    /**
     * Processa dados específicos de equipamento
     * @param {Object} formData - Dados do formulário
     * @returns {Object} Dados processados
     */
    _processEquipamentoData(formData) {
        // Garante que valores numéricos sejam números
        if (formData['system.peso']) {
            formData['system.peso'] = parseFloat(formData['system.peso']) || 0;
        }
        
        if (formData['system.preco']) {
            formData['system.preco'] = parseFloat(formData['system.preco']) || 0;
        }
        
        if (formData['system.quantidade']) {
            formData['system.quantidade'] = parseInt(formData['system.quantidade']) || 1;
        }
        
        return formData;
    }

    /**
     * Processa dados específicos de poder
     * @param {Object} formData - Dados do formulário
     * @returns {Object} Dados processados
     */
    _processPoderData(formData) {
        // Garante que valores numéricos sejam números
        if (formData['system.custo.reservaDados']) {
            formData['system.custo.reservaDados'] = parseInt(formData['system.custo.reservaDados']) || 0;
        }
        
        if (formData['system.custo.mortalidade']) {
            formData['system.custo.mortalidade'] = parseInt(formData['system.custo.mortalidade']) || 0;
        }
        
        if (formData['system.custo.pontosEntendimento']) {
            formData['system.custo.pontosEntendimento'] = parseInt(formData['system.custo.pontosEntendimento']) || 0;
        }
        
        return formData;
    }
}

