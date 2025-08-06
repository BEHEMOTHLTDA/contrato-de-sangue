/**
 * Ficha de Personagem para o sistema Contrato de Sangue
 * Estende a classe ActorSheet do Foundry VTT
 */
export class ContratoDeSangueActorSheet extends ActorSheet {

    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["contrato-de-sangue", "sheet", "actor"],
            template: "systems/contrato-de-sangue/templates/actor/actor-sheet.html",
            width: 1000,
            height: 700,
            tabs: [{ navSelector: ".tabs", contentSelector: ".tab-content", initial: "info" }],
            dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }]
        });
    }

    /** @override */
    get template() {
        return `systems/contrato-de-sangue/templates/actor/actor-sheet-improved.html`;
    }

    /** @override */
    getData() {
        const context = super.getData();
        const actorData = this.actor.toObject(false);
        
        // Adiciona dados do sistema
        context.system = actorData.system;
        context.flags = actorData.flags;
        
        // Organiza itens por tipo
        context.items = actorData.items;
        context.vantagens = actorData.items.filter(i => i.type === "vantagem");
        context.armas = actorData.items.filter(i => i.type === "arma");
        context.armaduras = actorData.items.filter(i => i.type === "armadura");
        context.equipamentos = actorData.items.filter(i => i.type === "equipamento");
        context.poderes = actorData.items.filter(i => i.type === "poder");
        
        // Adiciona informações calculadas
        context.penalidades = {
            mortalidade: this._getMortalityPenalty(context.system.mortalidade.value),
            ferimentos: this._getWoundPenalty(context.system.health.conditions),
            total: 0
        };
        context.penalidades.total = context.penalidades.mortalidade + context.penalidades.ferimentos;
        
        // Informações sobre caça
        context.cacaInfo = this._getCacaInfo(context.system.mortalidade.value);
        
        // Enriquece dados para exibição
        context.enrichedBiography = TextEditor.enrichHTML(context.system.biografia, {async: false});
        
        return context;
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        // Tudo abaixo só funciona se a ficha for editável
        if (!this.isEditable) return;

        // Listeners para rolagens de perícia
        html.find('.rollable').click(this._onSkillRoll.bind(this));
        
        // Listeners para dados de reserva
        html.find('[data-action="usar-dado-sagrado"]').click(this._onUseSacredDie.bind(this));
        html.find('[data-action="usar-dado-umbral"]').click(this._onUseUmbralDie.bind(this));
        
        // Listeners para ações de combate
        html.find('[data-action="rolar-iniciativa"]').click(this._onRollInitiative.bind(this));
        html.find('[data-action="rolar-ataque"]').click(this._onRollAttack.bind(this));
        html.find('[data-action="rolar-defesa"]').click(this._onRollDefense.bind(this));
        
        // Listeners para gerenciamento de itens
        html.find('.item-create-button').click(this._onItemCreate.bind(this));
        html.find('.item-edit').click(this._onItemEdit.bind(this));
        html.find('.item-delete').click(this._onItemDelete.bind(this));
        html.find('.item-roll').click(this._onItemRoll.bind(this));
        
        // Listeners para sistema de abas
        html.find('.tabs .item').click(this._onTabClick.bind(this));
        
        // Listeners para campos especiais
        html.find('input[name="system.humanidade.value"]').change(this._onHumanidadeChange.bind(this));
        html.find('input[name="system.bestialidade.value"]').change(this._onBestialidadeChange.bind(this));
        
        // Listeners para recuperação de reserva
        html.find('.recover-reserve').click(this._onRecoverReserve.bind(this));
        
        // Listeners para caça
        html.find('.perform-hunt').click(this._onPerformHunt.bind(this));
        
        // Listeners para pontos de entendimento
        html.find('.spend-understanding').click(this._onSpendUnderstanding.bind(this));
        html.find('.add-understanding').click(this._onAddUnderstanding.bind(this));
    }

    /**
     * Manipula rolagens de perícia
     * @param {Event} event - Evento de clique
     */
    async _onSkillRoll(event) {
        event.preventDefault();
        const element = event.currentTarget;
        const dataset = element.dataset;
        
        if (dataset.roll) {
            const skillName = dataset.roll.split(' + @pericias.')[1];
            const label = dataset.label || skillName;
            
            // Abre diálogo para modificadores
            const dialogContent = `
                <form>
                    <div class="form-group">
                        <label>Modificador:</label>
                        <input type="number" name="modifier" value="0" />
                    </div>
                    <div class="form-group">
                        <label>Dificuldade:</label>
                        <select name="difficulty">
                            <option value="">Sem dificuldade específica</option>
                            <option value="5">Trivial (5)</option>
                            <option value="8">Fácil (8)</option>
                            <option value="10">Médio (10)</option>
                            <option value="12">Difícil (12)</option>
                            <option value="15">Extremo (15)</option>
                            <option value="18">Lendário (18)</option>
                        </select>
                    </div>
                </form>
            `;
            
            new Dialog({
                title: `Rolar ${label}`,
                content: dialogContent,
                buttons: {
                    roll: {
                        label: "Rolar",
                        callback: (html) => {
                            const modifier = parseInt(html.find('[name="modifier"]').val()) || 0;
                            const difficulty = parseInt(html.find('[name="difficulty"]').val()) || null;
                            this.actor.rollSkill(skillName, modifier, difficulty);
                        }
                    },
                    cancel: {
                        label: "Cancelar"
                    }
                },
                default: "roll"
            }).render(true);
        }
    }

    /**
     * Manipula uso de Dado Sagrado
     * @param {Event} event - Evento de clique
     */
    async _onUseSacredDie(event) {
        event.preventDefault();
        await this.actor.useSacredDie();
    }

    /**
     * Manipula uso de Dado Umbral
     * @param {Event} event - Evento de clique
     */
    async _onUseUmbralDie(event) {
        event.preventDefault();
        
        // Confirma o uso do Dado Umbral devido às consequências
        const confirmed = await Dialog.confirm({
            title: "Usar Dado Umbral",
            content: `
                <p><strong>Atenção!</strong> Usar um Dado Umbral terá as seguintes consequências:</p>
                <ul>
                    <li>Você rolará 1d6 e adicionará o resultado completo</li>
                    <li>Sua Bestialidade aumentará permanentemente em 1</li>
                    <li>Sua Humanidade diminuirá permanentemente em 1</li>
                </ul>
                <p>Deseja continuar?</p>
            `
        });
        
        if (confirmed) {
            await this.actor.useUmbralDie();
        }
    }

    /**
     * Manipula rolagem de iniciativa
     * @param {Event} event - Evento de clique
     */
    async _onRollInitiative(event) {
        event.preventDefault();
        await this.actor.rollInitiative();
    }

    /**
     * Manipula rolagem de ataque
     * @param {Event} event - Evento de clique
     */
    async _onRollAttack(event) {
        event.preventDefault();
        
        // Abre diálogo para escolher tipo de ataque
        const dialogContent = `
            <form>
                <div class="form-group">
                    <label>Tipo de Arma:</label>
                    <select name="weaponType">
                        <option value="armasBrancas">Armas Brancas</option>
                        <option value="armasDeFogo">Armas de Fogo</option>
                        <option value="briga">Briga (Desarmado)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Dano da Arma:</label>
                    <input type="number" name="weaponDamage" value="0" />
                </div>
                <div class="form-group">
                    <label>Dificuldade:</label>
                    <input type="number" name="difficulty" value="10" />
                </div>
            </form>
        `;
        
        new Dialog({
            title: "Rolar Ataque",
            content: dialogContent,
            buttons: {
                roll: {
                    label: "Rolar",
                    callback: (html) => {
                        const weaponType = html.find('[name="weaponType"]').val();
                        const weaponDamage = parseInt(html.find('[name="weaponDamage"]').val()) || 0;
                        const difficulty = parseInt(html.find('[name="difficulty"]').val()) || 10;
                        this.actor.rollAttack(weaponType, weaponDamage, difficulty);
                    }
                },
                cancel: {
                    label: "Cancelar"
                }
            },
            default: "roll"
        }).render(true);
    }

    /**
     * Manipula rolagem de defesa
     * @param {Event} event - Evento de clique
     */
    async _onRollDefense(event) {
        event.preventDefault();
        await this.actor.rollDefense();
    }

    /**
     * Manipula criação de itens
     * @param {Event} event - Evento de clique
     */
    async _onItemCreate(event) {
        event.preventDefault();
        const element = event.currentTarget;
        const type = element.dataset.type;
        
        const itemData = {
            name: `Novo ${game.i18n.localize(`CDS.${type.charAt(0).toUpperCase() + type.slice(1)}`)}`,
            type: type,
            system: {}
        };
        
        // Adiciona dados específicos por tipo
        switch (type) {
            case 'vantagem':
                itemData.system = {
                    description: "",
                    linhagem: this.actor.system.linhagem,
                    bonus: { tipo: "pericia", valor: 0, aplicacao: "" },
                    ativa: true
                };
                break;
            case 'arma':
                itemData.system = {
                    description: "",
                    dano: 1,
                    alcance: "curto",
                    especial: "",
                    tipo: "branca",
                    equipada: false
                };
                break;
            case 'armadura':
                itemData.system = {
                    description: "",
                    absorcao: 1,
                    penalidade: 0,
                    equipada: false
                };
                break;
            case 'equipamento':
                itemData.system = {
                    description: "",
                    peso: 0,
                    preco: 0,
                    quantidade: 1,
                    equipado: false
                };
                break;
            case 'poder':
                itemData.system = {
                    description: "",
                    linhagem: this.actor.system.linhagem,
                    custo: { reservaDados: 0, mortalidade: 0, pontosEntendimento: 0 },
                    efeito: "",
                    duracao: "",
                    alcance: ""
                };
                break;
        }
        
        const item = await Item.create(itemData, { parent: this.actor });
        item.sheet.render(true);
    }

    /**
     * Manipula edição de itens
     * @param {Event} event - Evento de clique
     */
    async _onItemEdit(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        const item = this.actor.items.get(li.data("item-id"));
        item.sheet.render(true);
    }

    /**
     * Manipula exclusão de itens
     * @param {Event} event - Evento de clique
     */
    async _onItemDelete(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        const item = this.actor.items.get(li.data("item-id"));
        
        const confirmed = await Dialog.confirm({
            title: "Excluir Item",
            content: `Tem certeza que deseja excluir ${item.name}?`
        });
        
        if (confirmed) {
            await item.delete();
            li.slideUp(200, () => this.render(false));
        }
    }

    /**
     * Manipula rolagem de itens
     * @param {Event} event - Evento de clique
     */
    async _onItemRoll(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        const item = this.actor.items.get(li.data("item-id"));
        
        if (item.type === 'arma') {
            const weaponType = item.system.tipo === 'branca' ? 'armasBrancas' : 'armasDeFogo';
            await this.actor.rollAttack(weaponType, item.system.dano, 10);
        } else if (item.type === 'poder') {
            await this._usePower(item);
        }
    }

    /**
     * Usa um poder
     * @param {Item} power - O poder a ser usado
     */
    async _usePower(power) {
        const costs = power.system.custo;
        let canUse = true;
        let messages = [];
        
        // Verifica se tem recursos suficientes
        if (costs.reservaDados > 0 && this.actor.system.reservaDados.value < costs.reservaDados) {
            canUse = false;
            messages.push(`Reserva de Dados insuficiente (necessário: ${costs.reservaDados}, atual: ${this.actor.system.reservaDados.value})`);
        }
        
        if (costs.pontosEntendimento > 0 && this.actor.system.pontosEntendimento.value < costs.pontosEntendimento) {
            canUse = false;
            messages.push(`Pontos de Entendimento insuficientes (necessário: ${costs.pontosEntendimento}, atual: ${this.actor.system.pontosEntendimento.value})`);
        }
        
        if (!canUse) {
            ui.notifications.warn(messages.join('. '));
            return;
        }
        
        // Confirma o uso do poder
        const confirmed = await Dialog.confirm({
            title: `Usar ${power.name}`,
            content: `
                <p><strong>Efeito:</strong> ${power.system.efeito}</p>
                <p><strong>Duração:</strong> ${power.system.duracao}</p>
                <p><strong>Alcance:</strong> ${power.system.alcance}</p>
                ${costs.reservaDados > 0 ? `<p><strong>Custo:</strong> ${costs.reservaDados} dados da reserva</p>` : ''}
                ${costs.mortalidade > 0 ? `<p><strong>Consequência:</strong> +${costs.mortalidade} Mortalidade</p>` : ''}
                ${costs.pontosEntendimento > 0 ? `<p><strong>Custo:</strong> ${costs.pontosEntendimento} Pontos de Entendimento</p>` : ''}
                <p>Deseja usar este poder?</p>
            `
        });
        
        if (!confirmed) return;
        
        // Aplica os custos
        const updates = {};
        
        if (costs.reservaDados > 0) {
            updates['system.reservaDados.value'] = this.actor.system.reservaDados.value - costs.reservaDados;
        }
        
        if (costs.pontosEntendimento > 0) {
            updates['system.pontosEntendimento.value'] = this.actor.system.pontosEntendimento.value - costs.pontosEntendimento;
        }
        
        if (costs.mortalidade > 0) {
            updates['system.mortalidade.value'] = this.actor.system.mortalidade.value + costs.mortalidade;
        }
        
        await this.actor.update(updates);
        
        // Cria mensagem de chat
        const messageData = {
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            flavor: `<strong>${power.name}</strong>`,
            content: `
                <div class="cds-power">
                    <div class="power-effect">
                        <strong>Efeito:</strong> ${power.system.efeito}
                    </div>
                    <div class="power-details">
                        <p><strong>Duração:</strong> ${power.system.duracao}</p>
                        <p><strong>Alcance:</strong> ${power.system.alcance}</p>
                    </div>
                    ${power.system.description ? `<div class="power-description">${power.system.description}</div>` : ''}
                </div>
            `
        };
        
        ChatMessage.create(messageData);
    }

    /**
     * Manipula cliques nas abas
     * @param {Event} event - Evento de clique
     */
    _onTabClick(event) {
        event.preventDefault();
        const tab = event.currentTarget.dataset.tab;
        
        // Remove classe active de todas as abas e conteúdos
        $(event.currentTarget).siblings().removeClass('active');
        $(event.currentTarget).addClass('active');
        
        // Mostra o conteúdo da aba selecionada
        const tabContent = $(event.currentTarget).closest('.center-pane').find('.tab');
        tabContent.removeClass('active');
        tabContent.filter(`[data-tab="${tab}"]`).addClass('active');
    }

    /**
     * Manipula mudanças na Humanidade (Balança Eterna)
     * @param {Event} event - Evento de mudança
     */
    async _onHumanidadeChange(event) {
        event.preventDefault();
        const newHumanidade = parseInt(event.target.value);
        const newBestialidade = 12 - newHumanidade;
        
        await this.actor.update({
            'system.humanidade.value': newHumanidade,
            'system.bestialidade.value': newBestialidade,
            'system.reservaDados.max': newBestialidade + 1
        });
        
        // Ajusta a reserva atual se necessário
        if (this.actor.system.reservaDados.value > newBestialidade + 1) {
            await this.actor.update({
                'system.reservaDados.value': newBestialidade + 1
            });
        }
    }

    /**
     * Manipula mudanças na Bestialidade (Balança Eterna)
     * @param {Event} event - Evento de mudança
     */
    async _onBestialidadeChange(event) {
        event.preventDefault();
        const newBestialidade = parseInt(event.target.value);
        const newHumanidade = 12 - newBestialidade;
        
        await this.actor.update({
            'system.bestialidade.value': newBestialidade,
            'system.humanidade.value': newHumanidade,
            'system.reservaDados.max': newBestialidade + 1
        });
        
        // Ajusta a reserva atual se necessário
        if (this.actor.system.reservaDados.value > newBestialidade + 1) {
            await this.actor.update({
                'system.reservaDados.value': newBestialidade + 1
            });
        }
    }

    /**
     * Manipula recuperação de reserva
     * @param {Event} event - Evento de clique
     */
    async _onRecoverReserve(event) {
        event.preventDefault();
        
        const dialogContent = `
            <form>
                <div class="form-group">
                    <label>Quantidade de dados a recuperar:</label>
                    <input type="number" name="amount" value="1" min="1" />
                </div>
                <div class="form-group">
                    <label>Método de recuperação:</label>
                    <select name="method">
                        <option value="sangue">Consumo de Sangue (Upiór)</option>
                        <option value="sono">Sono/Descanso (Wilkołaki)</option>
                        <option value="caca">Caça (Wilkołaki)</option>
                        <option value="outro">Outro</option>
                    </select>
                </div>
            </form>
        `;
        
        new Dialog({
            title: "Recuperar Reserva de Dados",
            content: dialogContent,
            buttons: {
                recover: {
                    label: "Recuperar",
                    callback: (html) => {
                        const amount = parseInt(html.find('[name="amount"]').val()) || 1;
                        this.actor.recoverReserveDice(amount);
                    }
                },
                cancel: {
                    label: "Cancelar"
                }
            },
            default: "recover"
        }).render(true);
    }

    /**
     * Manipula realização de caça
     * @param {Event} event - Evento de clique
     */
    async _onPerformHunt(event) {
        event.preventDefault();
        
        const dialogContent = `
            <form>
                <div class="form-group">
                    <label>Redução de Mortalidade:</label>
                    <input type="number" name="reduction" value="1" min="1" />
                </div>
                <div class="form-group">
                    <label>Descrição da caça:</label>
                    <textarea name="description" placeholder="Descreva como a caça foi realizada..."></textarea>
                </div>
            </form>
        `;
        
        new Dialog({
            title: "Realizar Caça",
            content: dialogContent,
            buttons: {
                hunt: {
                    label: "Caçar",
                    callback: (html) => {
                        const reduction = parseInt(html.find('[name="reduction"]').val()) || 1;
                        this.actor.performHunt(reduction);
                    }
                },
                cancel: {
                    label: "Cancelar"
                }
            },
            default: "hunt"
        }).render(true);
    }

    /**
     * Manipula gasto de pontos de entendimento
     * @param {Event} event - Evento de clique
     */
    async _onSpendUnderstanding(event) {
        event.preventDefault();
        
        const dialogContent = `
            <form>
                <div class="form-group">
                    <label>Pontos a gastar:</label>
                    <select name="amount">
                        <option value="1">1 ponto - Conexão simples</option>
                        <option value="3">3 pontos - Informação não óbvia</option>
                        <option value="5">5 pontos - Insight crucial</option>
                        <option value="10">10 pontos - Compreensão completa</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Propósito:</label>
                    <input type="text" name="purpose" placeholder="Para que está gastando os pontos?" />
                </div>
            </form>
        `;
        
        new Dialog({
            title: "Gastar Pontos de Entendimento",
            content: dialogContent,
            buttons: {
                spend: {
                    label: "Gastar",
                    callback: (html) => {
                        const amount = parseInt(html.find('[name="amount"]').val());
                        const purpose = html.find('[name="purpose"]').val();
                        this.actor.spendUnderstandingPoints(amount, purpose);
                    }
                },
                cancel: {
                    label: "Cancelar"
                }
            },
            default: "spend"
        }).render(true);
    }

    /**
     * Manipula adição de pontos de entendimento
     * @param {Event} event - Evento de clique
     */
    async _onAddUnderstanding(event) {
        event.preventDefault();
        
        const dialogContent = `
            <form>
                <div class="form-group">
                    <label>Pontos a adicionar:</label>
                    <input type="number" name="amount" value="1" min="1" />
                </div>
                <div class="form-group">
                    <label>Fonte:</label>
                    <input type="text" name="source" placeholder="De onde vieram os pontos?" />
                </div>
            </form>
        `;
        
        new Dialog({
            title: "Adicionar Pontos de Entendimento",
            content: dialogContent,
            buttons: {
                add: {
                    label: "Adicionar",
                    callback: (html) => {
                        const amount = parseInt(html.find('[name="amount"]').val()) || 1;
                        const source = html.find('[name="source"]').val();
                        this.actor.addUnderstandingPoints(amount, source);
                    }
                },
                cancel: {
                    label: "Cancelar"
                }
            },
            default: "add"
        }).render(true);
    }

    /**
     * Calcula penalidade de mortalidade
     * @param {number} mortality - Valor de mortalidade
     * @returns {number} Penalidade
     */
    _getMortalityPenalty(mortality) {
        if (mortality >= 13) return -3;
        if (mortality >= 10) return -3;
        if (mortality >= 7) return -2;
        if (mortality >= 4) return -1;
        return 0;
    }

    /**
     * Calcula penalidade de ferimentos
     * @param {Object} conditions - Condições de ferimento
     * @returns {number} Penalidade total
     */
    _getWoundPenalty(conditions) {
        if (conditions.incapacitado) return -10;
        if (conditions.aleijado) return -5;
        if (conditions.feridoGravemente) return -4;
        if (conditions.ferido) return -3;
        if (conditions.machucado) return -2;
        if (conditions.escoriado) return -1;
        return 0;
    }

    /**
     * Obtém informações sobre caça
     * @param {number} mortality - Valor de mortalidade
     * @returns {Object} Informações sobre caça
     */
    _getCacaInfo(mortality) {
        if (mortality >= 13) {
            return { necessaria: true, frequencia: "constantemente", penalidade: -3 };
        } else if (mortality >= 10) {
            return { necessaria: true, frequencia: "diariamente", penalidade: -3 };
        } else if (mortality >= 7) {
            return { necessaria: true, frequencia: "duas vezes por semana", penalidade: -2 };
        } else if (mortality >= 4) {
            return { necessaria: true, frequencia: "uma vez por semana", penalidade: -1 };
        } else {
            return { necessaria: false, frequencia: "nenhuma", penalidade: 0 };
        }
    }
}

