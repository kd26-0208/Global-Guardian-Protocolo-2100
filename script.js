// Diagnostic Error Catching
window.onerror = function(message, source, lineno, colno, error) {
    console.error(`GLOBAL ERROR: ${message} at ${source}:${lineno}:${colno}`);
};
console.log("Script loading started...");

// Initial Game State
const GAME_START_YEAR = 2026;
const GAME_END_YEAR = 2060;

let state = {
    year: GAME_START_YEAR,
    budget: 8000,
    ozono: 40,   // Meta: >80, Collapse: 0
    quimica: 70, // Meta: <30, Collapse: 100
    azufre: 80,  // Meta: 50
    social: 50,  // Collapse: 0
    intervencionesRealizadas: 0, // Max 2 per year
    logs: [], // Mission history
    quizScore: 0,      // Number of correct pop quiz questions
    quizzesAsked: 0,   // Total number of pop quizzes asked
    isPracticeRound: false // Tracks if the current round is for practice
};

// Interventions Database
const intervenciones = {
    eco: [
        {
            id: 'fomentar_quimica',
            title: 'Fomentar Producción Química',
            desc: 'Subsidios masivos para la industria pesada.',
            impact: '+$2000M, +4% Polución, -2% Ozono, +3% Social',
            cost: -2000, // Negative cost means profit
            effects: { ozono: -2, quimica: +4, social: +3, azufre: 1 },
            msg: 'Decreto firmado. La economía sube, pero el aire se resiente.'
        },
        {
            id: 'impuesto_azufre',
            title: 'Impuesto al Azufre',
            desc: 'Penalización por emisiones de SO2.',
            impact: '+$500M, -3% Lluvia Ácida, -5% Social',
            cost: -500,
            effects: { ozono: 0, quimica: 0, social: -5, azufre: -3 },
            msg: 'Impuesto aplicado. Descontento industrial, pero cielos más limpios.'
        },
        {
            id: 'bonos_verdes',
            title: 'Bonos Verdes',
            desc: 'Crédito climático de emergencia.',
            impact: '+$3000M ahora, -10% Social (Deuda)',
            cost: -3000,
            effects: { ozono: 0, quimica: 0, social: -10, azufre: 0 },
            msg: 'Fondos recibidos. El futuro pagará la factura de hoy.'
        }
    ],
    sci: [
        {
            id: 'reparar_o3',
            title: 'Reparar Escudo O3',
            desc: 'Dispersión de agentes neutralizadores de CFCs.',
            impact: '-$1500M, +8% Salud Ozono',
            cost: 1500,
            effects: { ozono: +8, quimica: 0, social: 0, azufre: 0 },
            msg: 'Proyecto Ozono iniciado. El escudo se fortalece.'
        },
        {
            id: 'limpiar_entidades',
            title: 'Limpiar Nuevas Entidades',
            desc: 'Filtrado molecular de micro-toxinas.',
            impact: '-$3000M, -12% Polución Química',
            cost: 3000,
            effects: { ozono: 0, quimica: -12, social: 0, azufre: 0 },
            msg: 'Limpieza profunda en curso. Integridad química mejorada.'
        },
        {
            id: 'filtros_desulf',
            title: 'Filtros de Desulfurización',
            desc: 'Modernización de chimeneas industriales.',
            impact: '-$1000M, -5% Azufre, +3% Social',
            cost: 1000,
            effects: { ozono: 0, quimica: 0, social: 3, azufre: -5 },
            msg: 'Filtros instalados. La lluvia ácida retrocede.'
        }
    ],
    soc: [
        {
            id: 'campana_conciencia',
            title: 'Campañas de Conciencia',
            desc: 'Marketing educativo sobre límites mundiales.',
            impact: '-$500M, +15% Aceptación Social',
            cost: 500,
            effects: { ozono: 0, quimica: 0, social: +15, azufre: 0 },
            msg: 'Población informada. Tu apoyo aumenta.'
        },
        {
            id: 'cumbre_clima',
            title: 'Cumbre del Clima',
            desc: 'Alianza global por la biosfera.',
            impact: '-$2000M, +5% Ozono, -5% Química, +8% Social',
            cost: 2000,
            effects: { ozono: +5, quimica: -5, social: +8, azufre: -2 },
            msg: 'Cooperación internacional lograda. Gestión unificada.'
        }
    ]
};

// Pop Quiz Database
const popQuizQuestions = [
    // Azufre (6)
    {
        cat: 'azufre',
        q: '¿Cuál es el mayor reservorio de azufre en el planeta Tierra?',
        options: ['A) La Hidrosfera (Océanos)', 'B) La Litosfera (Rocas sedimentarias)', 'C) La Atmósfera (Gases)'],
        correct: 1,
        explanation: 'La gran mayoría del azufre terrestre está atrapado en rocas como la pirita y el yeso, liberándose muy lentamente por erosión natural.'
    },
    {
        cat: 'azufre',
        q: '¿Qué compuesto derivado del azufre oceánico ayuda a formar nubes y actúa como termostato planetario?',
        options: ['A) Dióxido de Azufre (SO2)', 'B) Sulfuro de Hidrógeno (H2S)', 'C) Dimetilsulfuro (DMS)'],
        correct: 2,
        explanation: 'El DMS producido por el fitoplancton asciende a la atmósfera, se oxida y forma núcleos de condensación que crean nubes reflejando la luz solar.'
    },
    {
        cat: 'azufre',
        q: '¿Cómo participa la combustión fósil en la ruptura del ciclo del azufre?',
        options: ['A) Incrementa su asimilación por plantas.', 'B) Libera SO2 que forma ácido sulfúrico (lluvia ácida).', 'C) Reduce el H2S en los humedales.'],
        correct: 1,
        explanation: 'Al quemar carbón o petróleo, liberamos azufre que estuvo atrapado por millones de años, sobrecargando la atmósfera con SO2 corrosivo.'
    },
    {
        cat: 'azufre',
        q: '¿Qué efecto devastador e invisible tiene la lluvia ácida al tocar el suelo de los bosques?',
        options: ['A) Convierte las raíces en piedra.', 'B) Disuelve nutrientes vitales y activa metales tóxicos (aluminio).', 'C) Aumenta la temperatura del subsuelo drásticamente.'],
        correct: 1,
        explanation: 'La acidez moviliza el aluminio del suelo, el cual es altamente tóxico para las raíces, impidiéndoles absorber nutrientes y agua.'
    },
    {
        cat: 'azufre',
        q: 'En ambientes anóxicos (sin oxígeno), ¿qué gas con olor a "huevo podrido" producen las bacterias reductoras?',
        options: ['A) Sulfuro de Hidrógeno (H2S)', 'B) Ozono (O3)', 'C) Ácido Sulfúrico (H2SO4)'],
        correct: 0,
        explanation: 'El H2S es un subproducto del metabolismo bacteriano en pantanos y sedimentos marinos donde no hay oxígeno disponible.'
    },
    {
        cat: 'azufre',
        q: 'Biológicamente, ¿para qué es vital asimilar el azufre del ambiente?',
        options: ['A) Producción de clorofila.', 'B) Fortalecer el esqueleto.', 'C) Formación de proteínas y aminoácidos.'],
        correct: 2,
        explanation: 'El azufre es un componente esencial de aminoácidos como la cisteína y metionina, fundamentales para construir todas las proteínas de la vida.'
    },
    // Ozono (4)
    {
        cat: 'ozono',
        q: '¿En qué capa de la atmósfera se encuentra el "escudo" o capa de ozono?',
        options: ['A) Troposfera', 'B) Mesosfera', 'C) Estratosfera'],
        correct: 2,
        explanation: 'La estratosfera concentra el 90% del ozono planetario, filtrando la radiación UV letal entre los 15 y 35 km de altura.'
    },
    {
        cat: 'ozono',
        q: '¿Qué energía natural divide el oxígeno (O2) para formar ozono (O3)?',
        options: ['A) Radiación Infrarroja', 'B) Radiación Ultravioleta (UV)', 'C) Vientos polares'],
        correct: 1,
        explanation: 'La radiación UV-C de alta energía rompe los enlaces del O2, permitiendo que los átomos libres se unan a otras moléculas de O2 para crear O3.'
    },
    {
        cat: 'ozono',
        q: '¿Qué liberan los CFCs en la alta atmósfera que actúa destruyendo miles de moléculas de ozono?',
        options: ['A) Un átomo de Cloro', 'B) Un átomo de Carbono', 'C) Un átomo de Hidrógeno'],
        correct: 0,
        explanation: 'Un solo átomo de cloro liberado de un CFC puede destruir cíclicamente hasta 100,000 moléculas de ozono antes de ser neutralizado.'
    },
    {
        cat: 'ozono',
        q: 'A nivel biológico, ¿cuál es el daño más grave que previene la existencia del ozono?',
        options: ['A) Evaporación oceánica.', 'B) Mutaciones de ADN, cáncer y la muerte del fitoplancton.', 'C) Rayos gamma.'],
        correct: 1,
        explanation: 'Sin el escudo de ozono, la radiación UV-B rompería los enlaces químicos del ADN en todos los seres vivos, causando un colapso biológico global.'
    },
    // Química (4)
    {
        cat: 'quimica',
        q: '¿Qué define a las "Nuevas Entidades" en los límites planetarios?',
        options: ['A) Especies exóticas mutadas.', 'B) Químicos sintéticos masivos que la naturaleza no puede degradar.', 'C) Enfermedades de transmisión hídrica.'],
        correct: 1,
        explanation: 'Son sustancias de origen humano (plásticos, PFAS, pesticidas) que no existen naturalmente y cuyos efectos a largo plazo son impredecibles.'
    },
    {
        cat: 'quimica',
        q: '¿Cómo se llama el proceso donde un tóxico se absorbe MÁS RÁPIDO de lo que el ser vivo lo elimina?',
        options: ['A) Biomagnificación', 'B) Bioacumulación', 'C) Biodegradación'],
        correct: 1,
        explanation: 'La bioacumulación ocurre cuando el organismo no puede metabolizar o excretar una sustancia, acumulándola en sus tejidos (generalmente grasas).'
    },
    {
        cat: 'quimica',
        q: '¿Qué significa la "Biomagnificación" en una cadena alimentaria (trófica)?',
        options: ['A) Que los depredadores tope concentran dosis multiplicadas letales del tóxico.', 'B) Que las toxinas desaparecen al llegar a humanos.', 'C) Que los virus se vuelven más grandes.'],
        correct: 0,
        explanation: 'A medida que un depredador come muchas presas contaminadas, la concentración del tóxico en su cuerpo aumenta exponencialmente.'
    },
    {
        cat: 'quimica',
        q: 'Uno de los impactos letales de los residuos farmacéuticos y plásticos en animales es que actúan como...',
        options: ['A) Estimulantes musculares.', 'B) Depresores respiratorios.', 'C) Disruptores endocrinos (alteran desarrollo hormonal y reproductivo).'],
        correct: 2,
        explanation: 'Muchos químicos sintéticos imitan hormonas naturales, confundiendo al sistema endocrino y provocando esterilidad o malformaciones.'
    }
];

// Event Database
const events = [
    {
        title: "FRÍO TÓXICO",
        description: "El refrigerante HFOX-9 protege el ozono pero filtra químicos 'eternos' en el agua dulce. La sequía y el calor extremo tienen a la población al borde del motín.",
        decisions: [
            {
                text: "[VÍA ECONÓMICA] Subsidiar HFOX-9.",
                cost: 2000,
                effects: { ozono: +10, quimica: +20, social: +10, azufre: 0 },
                result: "El mercado se calma y el aire acondicionado alivia la tensión, pero químicos tóxicos saturan ahora el torrente sanguíneo de la población global."
            },
            {
                text: "[VÍA RADICAL] Prohibir HFOX-9. Usar propano.",
                cost: 1500,
                effects: { ozono: -10, quimica: -5, social: -20, azufre: 0 },
                result: "La prohibición causa escasez y explosiones accidentales por propano. El mercado negro de CFCs resurge, perforando de nuevo el cielo."
            },
            {
                text: "[VÍA TECNOLÓGICA] HFOX-9 + Filtrado Molecular.",
                cost: 7500,
                effects: { ozono: +10, quimica: -10, social: +5, azufre: 0 },
                result: "Nanocrifiltros purifican las cuencas hidrográficas. Logramos el beneficio del gas sin la condena química, aunque las arcas globales han quedado exhaustas."
            }
        ]
    },
    {
        title: "ERUPCIÓN EN LA BOLSA",
        description: "Tres años de malas cosechas desestabilizan a las naciones. La industria propone inyectar aerosoles de azufre para enfriar el planeta, arriesgando lluvias ácidas letales.",
        decisions: [
            {
                text: "[VÍA ECONÓMICA] Inyección Estratosférica Privada.",
                cost: 0,
                effects: { azufre: +15, quimica: 0, social: +15, ozono: -10 },
                result: "El cielo se vuelve lechoso y las temperaturas bajan, pero la lluvia ácida comienza a corroer infraestructuras y bosques."
            },
            {
                text: "[VÍA RADICAL] Detener a los Bio-Hackers.",
                cost: 2000,
                effects: { azufre: -5, quimica: 0, social: -15, ozono: 0 },
                result: "La ley se impone pero el hambre persiste. Sin geoingeniería, el calor extremo incinera la agricultura restante provocando violencia en las calles."
            },
            {
                text: "[VÍA TECNOLÓGICA] Dispersión Orbital de Carbonato.",
                cost: 6500,
                effects: { azufre: -10, quimica: +5, social: +10, ozono: +5 },
                result: "Polvo de diamante y calcita logran un enfriamiento limpio sin acidez. El éxito es total frente a la crisis climática, pese al coste astronómico."
            }
        ]
    },
    {
        title: "PLÁSTICO INTELIGENTE",
        description: "El nuevo 'Bio-Polymer-X' se auto-repara pero muta con enzimas marinas, creando priones sintéticos que atacan el sistema nervioso de la fauna oceánica.",
        decisions: [
            {
                text: "[VÍA ECONÓMICA] Ignorar el informe científico.",
                cost: -500,
                effects: { quimica: +25, social: +10, ozono: 0, azufre: 0 },
                result: "Auge económico y productos baratos, pero el mar se convierte en una sopa tóxica donde la fauna muere con espasmos neurológicos."
            },
            {
                text: "[VÍA RADICAL] Cuarentena Naval y Prohibición.",
                cost: 4000,
                effects: { quimica: -15, social: -25, ozono: 0, azufre: 0 },
                result: "La economía se detiene y estallan motines por escasez, pero se corta el flujo de polímeros. La biosfera marina tiene una oportunidad de sanar."
            },
            {
                text: "[VÍA TECNOLÓGICA] Desarrollar Enzima Depredadora.",
                cost: 5500,
                effects: { quimica: -20, social: 0, ozono: -5, azufre: 0 },
                result: "Bacterias modificadas 'comen' el plástico eficazmente. Sin embargo, los gases del proceso dañan levemente la capa de ozono."
            }
        ]
    },
    {
        title: "GUERRA DEL CARBÓN SUCIO",
        description: "Naciones reinician termoeléctricas de carbón sin filtros ante la crisis energética. El aire urbano es una sopa tóxica de azufre que satura los hospitales.",
        decisions: [
            {
                text: "[VÍA ECONÓMICA] Multar a las Energéticas.",
                cost: -1500,
                effects: { azufre: +20, social: -10, quimica: +10, ozono: -5 },
                result: "Obtenemos fondos masivos, pero la lluvia ácida disuelve selvas y monumentos mientras la salud pública colapsa por el aire venenoso."
            },
            {
                text: "[VÍA RADICAL] Apagón Forzado de Plantas.",
                cost: 2500,
                effects: { azufre: -20, social: -30, quimica: 0, ozono: 0 },
                result: "El aire se limpia y el cielo recupera su azul, pero la falta de electricidad en hospitales causa una tragedia social sin precedentes."
            },
            {
                text: "[VÍA TECNOLÓGICA] Modernización Flash de Filtros.",
                cost: 6000,
                effects: { azufre: -15, social: +15, quimica: -5, ozono: 0 },
                result: "Filtros de grafeno limpian cada chimenea. La energía sigue fluyendo y el mundo celebra este triunfo ambiental y tecnológico."
            }
        ]
    },
    {
        title: "EL DESPERTAR DE SIBERIA",
        description: "El permafrost se fractura liberando CFCs prehistóricos. Un punto ciego de ozono surge en el Ártico, convirtiendo la tundra en un volcán químico frío.",
        decisions: [
            {
                text: "[VÍA ECONÓMICA] Reasentamiento de Comunidades.",
                cost: 2000,
                effects: { ozono: -20, social: -5, quimica: 0, azufre: +10 },
                result: "Salvamos a la población local, pero el agujero de ozono ártico se expande sobre Europa quemando los campos con radiación UV extrema."
            },
            {
                text: "[VÍA RADICAL] Bombardeo de 'Sellado Térmico'.",
                cost: 4500,
                effects: { ozono: -5, social: -20, quimica: +15, azufre: +15 },
                result: "Explosiones colapsan el suelo sellando las grietas, pero las nubes químicas oscurecen el hemisferio norte en un invierno artificial tóxico."
            },
            {
                text: "[VÍA TECNOLÓGICA] Torres de Criocaptura.",
                cost: 7000,
                effects: { ozono: 0, social: +10, quimica: -5, azufre: -5 },
                result: "Torres gigantes congelan el aire y atrapan los gases fugitivos. Dominamos la geología y salvamos el cielo mediante ingeniería costosa."
            }
        ]
    },
    {
        title: "GRANJAS DE ALGAS MUTANTES",
        description: "Se propone liberar algas 'Hyper-Absorber' para digerir microplásticos, pero su agresividad podría asfixiar al fitoplancton natural del océano.",
        decisions: [
            {
                text: "[VÍA ECONÓMICA] Licenciar a Corporaciones.",
                cost: -2500,
                effects: { quimica: -5, social: +5, ozono: 0, azufre: 0 },
                result: "Las empresas limpian los mares para vender biocompuesto. La química mejora, pero el control del ecosistema marino pasa a manos privadas."
            },
            {
                text: "[VÍA TECNOLÓGICA] Protocolo de Absorción Controlada.",
                cost: 5000,
                effects: { quimica: -20, social: +10, ozono: 0, azufre: 0 },
                result: "Algas con 'interruptor genético' purgan el mar sin riesgo de colapso biológico. Un triunfo absoluto de la biotecnología ética."
            }
        ]
    },
    {
        title: "CUMBRE DE LAS NACIONES ROTAS",
        description: "La escasez desmorona el apoyo social. Los líderes exigen un festival para devolver la esperanza al mundo. ¿Priorizamos la moral o la supervivencia biológica?",
        decisions: [
            {
                text: "[VÍA SOCIAL] Gran Gala de la Unity Global.",
                cost: 1500,
                effects: { social: +30, ozono: 0, quimica: 0, azufre: 0 },
                result: "El mundo olvida sus penurias durante una semana. Tu popularidad alcanza niveles históricos, inyectando esperanza para los años venideros."
            },
            {
                text: "[VÍA ECONÓMICA] Cancelar y Desviar Fondos.",
                cost: -1500,
                effects: { social: -20, ozono: 0, quimica: 0, azufre: 0 },
                result: "Ahorramos fondos vitales pero el ánimo global se hunde. La gente ve a la Autoridad Global como una fría y distante máquina burocrática."
            }
        ]
    },
    {
        title: "EL PANTANO DE HUEVOS PODRIDOS",
        description: "Humedales industriales emiten Sulfuro de Hidrógeno (H₂S) en niveles letales. El olor a 'huevos podridos' alerta de una crisis tóxica inminente para la población local.",
        decisions: [
            {
                text: "[VÍA INDUSTRIAL] Bombas de oxígeno masivas.",
                cost: 3500,
                effects: { azufre: -10, social: +10, quimica: -5, ozono: 0 },
                result: "El oxígeno oxida el H₂S en azufre sólido inofensivo. La crisis se contiene y el ecosistema respira, pese al enorme coste energético."
            },
            {
                text: "[VÍA BIOLÓGICA] Bacterias oxidantes Thiobacillus.",
                cost: 1500,
                effects: { azufre: -6, social: +5, quimica: +5, ozono: 0 },
                result: "Las bacterias convierten el H₂S en sulfatos. Proceso lento y con resultados variables, pero menos costoso que la opción industrial."
            },
            {
                text: "[VÍA SOCIAL] Evacuar y aislar la zona.",
                cost: 1000,
                effects: { azufre: +5, social: -15, quimica: 0, ozono: 0 },
                result: "Salvamos vidas hoy, pero el humedal se vuelve una zona muerta. El gas se expande hacia granjas y la población indignada retira su apoyo."
            }
        ]
    },
    {
        title: "EL DILEMA DEL CULTIVO ACIDIFICADO",
        description: "La lluvia ácida disuelve el aluminio del suelo, impidiendo que las plantas absorban nutrientes. Las cosechas fallan y el hambre estructural acecha a Europa.",
        decisions: [
            {
                text: "[VÍA QUÍMICA] Titulación con cal hidratada.",
                cost: 2000,
                effects: { quimica: -10, social: +10, azufre: -5, ozono: 0 },
                result: "El hidróxido de calcio neutraliza el pH del suelo. Las raíces se recuperan y los invernaderos vuelven a producir a plena capacidad rápidamente."
            },
            {
                text: "[VÍA TECNOLÓGICA] Sistemas de Osmosis Inversa.",
                cost: 4500,
                effects: { quimica: -15, social: +15, azufre: 0, ozono: 0 },
                result: "La filtración elimina iones ácidos del riego de forma permanente. Es la solución más cara, pero también la más duradera y precisa."
            },
            {
                text: "[VÍA ECONÓMICA] Importar alimentos de emergencia.",
                cost: 3000,
                effects: { quimica: +5, social: -10, azufre: 0, ozono: 0 },
                result: "El mercado se abastece pero los precios se disparan. El suelo sigue acidificándose; solo postergamos el problema aumentando la deuda química."
            }
        ]
    },
    {
        title: "MINERÍA EN LA LITOSFERA",
        description: "Necesitamos azufre para fertilizantes, pero las reservas están en el ciclo lento de la roca. GAIA-9 propone acelerar procesos geológicos de millones de años.",
        decisions: [
            {
                text: "[VÍA BIOLÓGICA] Bacterias oxidantes de roca.",
                cost: 2500,
                effects: { azufre: -8, quimica: -5, social: +5, ozono: 0 },
                result: "Bacterias liberan sulfatos solubles con impacto ecológico mínimo. El suministro se estabiliza sin grandes daños ambientales colaterales."
            },
            {
                text: "[VÍA INDUSTRIAL] Extracción química con ácido.",
                cost: 1000,
                effects: { azufre: -12, quimica: +20, social: -5, ozono: 0 },
                result: "Obtenemos azufre rápido pero la sobredevastación ácida mata la fauna de los ríos cercanos. La comunidad científica condena este desastre ecológico."
            },
            {
                text: "[VÍA SINTÉTICA] Desulfuración del petróleo.",
                cost: 4000,
                effects: { azufre: -10, quimica: -8, social: 0, ozono: -3 },
                result: "Capturamos SO₂ de combustibles fósiles para crear azufre puro. Suministro limpio pero con alto gasto energético y leves emisiones estratosféricas."
            }
        ]
    },
    {
        title: "EL REGULADOR CLIMÁTICO OCEÁNICO",
        description: "El fitoplancton muere por el calor, dejando de producir el gas DMS que forma las nubes enfriadoras. Sin nubes, el calentamiento se acelera en un bucle letal.",
        decisions: [
            {
                text: "[VÍA ECOLÓGICA] Fertilización oceánica.",
                cost: 3000,
                effects: { azufre: -8, ozono: +5, social: +10, quimica: +5 },
                result: "El fitoplancton recuperado libera DMS y forma nubes que reflejan la luz solar. Logramos bajar la temperatura local con un éxito frágil."
            },
            {
                text: "[VÍA TECNOLÓGICA] Pantallas solares flotantes.",
                cost: 5500,
                effects: { ozono: +3, azufre: 0, social: +5, quimica: -5 },
                result: "Láminas reflectantes dan sombra artificial al océano. Solución cara y polémica que evita interferir directamente con la bioquímica marina."
            },
            {
                text: "[VÍA RADICAL] Bombas de agua profunda.",
                cost: 2000,
                effects: { ozono: 0, azufre: -5, social: -10, quimica: +10 },
                result: "Mezclar aguas frías profundas mata más plancton del que salva y libera metales pesados. La medicina resultó peor que la enfermedad."
            }
        ]
    },
    {
        title: "EL CENTINELA DE LA ESTRATÓSFERA",
        description: "El ozono cae por debajo del umbral crítico. Un volcán activo facilita que el cloro residual destruya el escudo protector. Debemos actuar en las alturas.",
        decisions: [
            {
                text: "[VÍA CIENTÍFICA] Espejos satelitales (Fotólisis).",
                cost: 6000,
                effects: { ozono: +20, quimica: +5, social: +10, azufre: 0 },
                result: "Concentramos radiación para crear O₃ artificialmente. Proceso muy eficiente que estabiliza el escudo en 18 meses pese a la nube volcánica."
            },
            {
                text: "[VÍA QUÍMICA] Neutralizar aerosoles con carbonato.",
                cost: 3500,
                effects: { ozono: +12, quimica: -5, social: +5, azufre: -5 },
                result: "Dispersamos nanopartículas para frenar la destrucción química del volcán. Es la vía más lenta pero más sostenible para sanar el cielo."
            },
            {
                text: "[VÍA RADICAL] Bombardeo de agentes oxidantes.",
                cost: 2000,
                effects: { ozono: +5, quimica: +15, social: -15, azufre: +10 },
                result: "El bombardeo dispersa la nube pero ensucia la química estratosférica provocando condena global. El beneficio en ozono es mínimo y costoso."
            }
        ]
    },
    {
        title: "LA HERENCIA DE LOS CFC",
        description: "Pese a las prohibiciones, el ozono no mejora. El público ignora que los químicos tardan años en subir a la estratosfera. La fe en tu gobierno se tambalea.",
        decisions: [
            {
                text: "[VÍA DIPLOMÁTICA] Campaña de transparencia.",
                cost: 1000,
                effects: { social: +20, ozono: +5, quimica: 0, azufre: 0 },
                result: "Datos en vivo explican el rezago natural del clima. La ciudadanía comprende la situación, restaurando la confianza en la coalición ambiental."
            },
            {
                text: "[VÍA TECNOLÓGICA] Captores de N₂O en granjas.",
                cost: 4500,
                effects: { ozono: +15, social: +5, quimica: -8, azufre: 0 },
                result: "Atacamos al principal agente actual de agotamiento del ozono en su origen. Solución lenta pero permanente que corta la cadena causal del daño."
            },
            {
                text: "[VÍA ADAPTATIVA] Refugios UV para el plancton.",
                cost: 2500,
                effects: { ozono: 0, social: +10, quimica: -5, azufre: 0 },
                result: "Instalamos filtros sobre arrecifes y viveros marinos. No sanamos el ozono directamente, pero evitamos el colapso biológico durante la transición."
            }
        ]
    },
    {
        title: "EL VÓRTICE DEL HEMISFERIO SUR",
        description: "El agujero de ozono antártico desplaza los vientos, causando calor en la Patagonia e inundaciones en Buenos Aires. Tres desastres, un solo comando.",
        decisions: [
            {
                text: "[VÍA SOCIAL] Gestión de emergencias locales.",
                cost: 2000,
                effects: { ozono: 0, social: +20, azufre: -5, quimica: 0 },
                result: "Redes ciudadanas construyen diques y apagan incendios. La cohesión social salva vidas, aunque el daño material en las costas sea inevitable."
            },
            {
                text: "[VÍA TECNOLÓGICA] Reducir forzamiento radiativo.",
                cost: 6500,
                effects: { ozono: +10, social: +10, azufre: -8, quimica: -5 },
                result: "Controlamos emisiones de metano en tiempo real para estabilizar los vientos. Solución a largo plazo que da respiro al protocolo ambiental global."
            },
            {
                text: "[VÍA ECONÓMICA] Créditos de reconstrucción.",
                cost: -2000,
                effects: { ozono: -5, social: -10, azufre: +5, quimica: +5 },
                result: "Recibimos deuda para reconstruir lo destruido sin atacar las causas. El vórtice polar sigue fortaleciéndose; compramos tiempo con dinero prestado."
            }
        ]
    },
    {
        title: "EL DILEMA DEL REGULADOR",
        description: "El lobby presiona para aprobar el 'Plastitox-7', vital para paneles solares baratos. Pero GAIA-9 advierte que es un disruptor endocrino persistente.",
        decisions: [
            {
                text: "[VÍA ECONÓMICA] Aprobar vía rápida.",
                cost: -1500,
                effects: { quimica: +20, social: +10, ozono: +5, azufre: 0 },
                result: "La energía solar se abarata y el CO₂ cae, pero años después la población infantil muestra graves alteraciones hormonales por Plastitox-7."
            },
            {
                text: "[VÍA PRECAUTORIA] Prohibir evaluación (10 años).",
                cost: 2000,
                effects: { quimica: -15, social: -15, ozono: -3, azufre: 0 },
                result: "El principio de precaución ralentiza la transición verde. El descontento popular crece, pero salvas la salud biológica de las futuras generaciones."
            },
            {
                text: "[VÍA MIXTA] Uso industrial cerrado.",
                cost: 1000,
                effects: { quimica: +8, social: -5, ozono: +2, azufre: 0 },
                result: "Equilibrio imperfecto que permite avanzar a ritmo moderado. Incidentes aislados de filtración definen nuevas y duras jurisprudencias ambientales."
            }
        ]
    },
    {
        title: "LA PARADOJA DE LA COSECHA",
        description: "Plagas amenazan el alimento de 400 millones de personas. El pesticida ClorMax-P salva el trigo hoy, pero mata a los polinizadores del mañana.",
        decisions: [
            {
                text: "[VÍA ECONÓMICA] Uso masivo inmediato.",
                cost: -1000,
                effects: { quimica: +25, social: +15, ozono: 0, azufre: 0 },
                result: "El hambre se contiene este año, pero las abejas desaparecen. Has resuelto la crisis de hoy creando una hambruna biológica para la próxima década."
            },
            {
                text: "[VÍA ECOLÓGICA] Bio-pesticidas lentos.",
                cost: 3500,
                effects: { quimica: -10, social: -15, ozono: 0, azufre: 0 },
                result: "El control biológico tarda y estallan protestas por el precio de la comida. Sin embargo, el ecosistema polinizador sobrevive intacto para el futuro."
            },
            {
                text: "[VÍA MIXTA] Rotación estricta de zonas.",
                cost: 1500,
                effects: { quimica: +8, social: -5, ozono: 0, azufre: 0 },
                result: "Plaga contenida parcialmente. El hambre persiste pero las zonas no tratadas actúan como reserva biológica, salvando el ciclo reproductivo vegetal."
            }
        ]
    },
    {
        title: "EL EFECTO CÓCTEL",
        description: "En Corea, varios químicos están bajo el límite legal individual, pero su combinación multiplica la toxicidad por ocho. La fauna marina está colapsando.",
        decisions: [
            {
                text: "[VÍA ECONÓMICA] Ignorar (cumple la ley).",
                cost: -2000,
                effects: { quimica: +20, social: +5, ozono: 0, azufre: 0 },
                result: "La industria prospera pero el mar muere en poco tiempo. La pesca desaparece, destruyendo las mismas comunidades que intentabas proteger económicamente."
            },
            {
                text: "[VÍA TECNOLÓGICA] Filtros de nanopartículas.",
                cost: 5000,
                effects: { quimica: -20, social: -10, ozono: 0, azufre: 0 },
                result: "La filtración multimembrana restaura la pureza del agua. Los impuestos suben y las empresas amenazan con irse, pero el océano está limpio."
            },
            {
                text: "[VÍA RADICAL] Clausura industrial total.",
                cost: 3000,
                effects: { quimica: -25, social: -20, ozono: 0, azufre: 0 },
                result: "El mar sana rápidamente sin emisiones, pero el desempleo local causa motines. Has ganado la batalla ambiental pero perdido el consenso social."
            }
        ]
    },
    {
        title: "LA FRONTERA ABISAL",
        description: "Minería en la Fosa de las Marianas promete metales críticos para baterías, pero liberará sedimentos radiactivos. Es el último golpe para la acidificación.",
        decisions: [
            {
                text: "[VÍA ECONÓMICA] Autorizar extracción.",
                cost: -3000,
                effects: { quimica: +25, social: +10, ozono: +5, azufre: 0 },
                result: "Baterías baratas aceleran la transición verde, pero el veneno radiactivo asciende por las corrientes. El fondo marino es sacrificado por el sol."
            },
            {
                text: "[VÍA DIPLOMÁTICA] Moratoria Protocolo Abisal.",
                cost: 2000,
                effects: { quimica: -10, social: -10, ozono: 0, azufre: 0 },
                result: "Detenemos la minería globalmente. El litio sube de precio y las potencias te hostigan, pero el ecosistema más desconocido del mundo sobrevive."
            },
            {
                text: "[VÍA MIXTA] Impuesto de restauración (50%).",
                cost: 0,
                effects: { quimica: +10, social: 0, ozono: +3, azufre: 0 },
                result: "La empresa paga por limpiar plásticos superficiales mientras daña el fondo. Un contrato de imperfección controlada que define la geopolítica del siglo."
            }
        ]
    },
    {
        title: "LA TORMENTA DE METANO",
        description: "Metano antiguo escapa del Mar de Kara a velocidad exponencial. Si entra en bucle, el calentamiento revertirá todo tu trabajo en una sola generación.",
        decisions: [
            {
                text: "[VÍA TECNOLÓGICA] Captores de metano submarinos.",
                cost: 5500,
                effects: { ozono: +5, quimica: -8, social: +5, azufre: -5 },
                result: "Barcazas catalíticas convierten el metano en CO₂, rompiendo el bucle letal. Tu legado tecnológico será estudiado durante décadas de geoingeniería."
            },
            {
                text: "[VÍA RADICAL] Sellado criogénico del lecho.",
                cost: 7000,
                effects: { ozono: +8, quimica: +10, social: -10, azufre: 0 },
                result: "Congelamos el mar con nitrógeno líquido. El metano queda atrapado pero el proceso daña la zona tratada. El peligro climático global es neutralizado."
            },
            {
                text: "[VÍA ECONÓMICA] Derechos de captura comercial.",
                cost: -2000,
                effects: { ozono: -5, quimica: +15, social: +10, azufre: 0 },
                result: "Empresas usan el metano como combustible. El incentivo acelera la captura pero la quema añade más CO₂. Un alivio parcial con costos futuros."
            }
        ]
    },
    {
        title: "COLAPSO DE LOS ARRECIFES",
        description: "La acidificación llega al punto de no retorno para los corales. El 60% de los arrecifes ha blanqueado, amenazando la base de la vida oceánica.",
        decisions: [
            {
                text: "[VÍA BIOLÓGICA] Sembrar corales resistentes.",
                cost: 3000,
                effects: { quimica: -10, social: +15, ozono: 0, azufre: 0 },
                result: "Trasplantes de corales termotolerantes dan resultados tras años de esfuerzo. La vida vuelve lentamente a los arrecifes, símbolo de esperanza global."
            },
            {
                text: "[VÍA QUÍMICA] Alcalinización localizada.",
                cost: 4500,
                effects: { quimica: -20, social: +5, ozono: 0, azufre: -3 },
                result: "Dispersamos hidróxido de magnesio para elevar el pH local. Los corales sobreviven con mantenimiento perpetuo, estabilizando ecosistemas críticos."
            },
            {
                text: "[VÍA ECONÓMICA] Priorizar arrecifes turísticos.",
                cost: 1000,
                effects: { quimica: +5, social: -10, ozono: 0, azufre: 0 },
                result: "Salvamos arrecifes 'premium' como activos económicos. El resto perece, colapsando la biodiversidad y el sustento de millones de pescadores."
            }
        ]
    },
    {
        title: "LA GRAN SEQUÍA",
        description: "Acuíferos de 10,000 años se agotan en meses. La sequía extrema provoca migraciones masivas de 200 millones de personas en todo el cinturón subtropical.",
        decisions: [
            {
                text: "[VÍA TECNOLÓGICA] Desalinización solar masiva.",
                cost: 6000,
                effects: { social: +20, quimica: -5, ozono: 0, azufre: 0 },
                result: "Plantas de última generación abastecen a las megaciudades costeras. Detenemos las migraciones y restauramos la legitimidad de tu gobierno líder."
            },
            {
                text: "[VÍA SOCIAL] Protocolo global del agua.",
                cost: 2000,
                effects: { social: -10, quimica: -8, ozono: 0, azufre: 0 },
                result: "Naciones ricas ceden agua a países en colapso por ley. Resentimiento político masivo, pero la distribución vital se estabiliza minimizando el conflicto."
            },
            {
                text: "[VÍA RADICAL] Siembra continental de nubes.",
                cost: 3500,
                effects: { social: +10, quimica: +10, azufre: +5, ozono: -3 },
                result: "Lluvia artificial para zonas seleccionadas que altera patrones globales. Lo que llueve aquí falta allá, provocando acusaciones de 'robo de lluvia'."
            }
        ]
    },
    {
        title: "RADIACIÓN SIN ESCUDO",
        description: "Niveles de UV-B duplican el umbral seguro. La fauna polar sufre cataratas y las cosechas muestran daño genético. El escudo ozono falla en tiempo real.",
        decisions: [
            {
                text: "[VÍA CIENTÍFICA] Restauración acelerada ozono.",
                cost: 5000,
                effects: { ozono: +25, quimica: +5, social: +10, azufre: 0 },
                result: "Nano-catalizadores y capturadores de N₂O sanan el cielo tres años antes de lo previsto. Los niveles UV regresan al umbral de seguridad vital."
            },
            {
                text: "[VÍA ADAPTATIVA] Refugios UV para biodiversidad.",
                cost: 2000,
                effects: { ozono: 0, social: +10, quimica: -5, azufre: 0 },
                result: "Filtros sobre arrecifes y campos salvan el presente sin sanar el ozono. Una solución puente para preservar la vida mientras el ciclo natural sana."
            },
            {
                text: "[VÍA ECONÓMICA] Semillas resistentes a UV.",
                cost: 3000,
                effects: { ozono: -5, social: -5, quimica: +8, azufre: 0 },
                result: "La agricultura se salva con ingeniería genética, pero la vida silvestre no tiene quien la modifique. La biodiversidad salvaje sigue su caída libre."
            }
        ]
    },
    {
        title: "EL COLAPSO DE LA BIODIVERSIDAD",
        description: "El 'Silencio Biológico' avanza: polinizadores caen un 40%. La red biológica sobre la que se apoya la humanidad comienza a deshilacharse sin remedio.",
        decisions: [
            {
                text: "[VÍA ECOLÓGICA] Corredores biológicos globales.",
                cost: 4000,
                effects: { quimica: -10, social: +15, ozono: +3, azufre: -3 },
                result: "Conectamos reservas fragmentadas y las abejas silvestres aumentan un 30%. La naturaleza hace el trabajo si simplemente le damos el espacio necesario."
            },
            {
                text: "[VÍA TECNOLÓGICA] Polinización robótica masiva.",
                cost: 5000,
                effects: { quimica: 0, social: +5, ozono: 0, azufre: 0 },
                result: "Micro-drones polinizan los campos. Funciona, pero crea una nueva y frágil dependencia tecnológica de la que no hay retorno ni plan B biológico."
            },
            {
                text: "[VÍA RADICAL] Banco de ADN y Semillas.",
                cost: 2500,
                effects: { quimica: -5, social: +5, ozono: 0, azufre: 0 },
                result: "Congelamos el plano de la vida terrestre en servidores abisales. No salvamos especies, pero preservamos el código para reconstruirlas si sobrevivimos."
            }
        ]
    }
];

// Shuffle events to make playthroughs slightly different
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
shuffleArray(events);

// Buff positive effects across all events
events.forEach(ev => {
    ev.decisions.forEach(dec => {
        if (dec.effects.ozono > 0) dec.effects.ozono = Math.round(dec.effects.ozono * 1.5);
        if (dec.effects.social > 0) dec.effects.social = Math.round(dec.effects.social * 1.5);
        if (dec.effects.quimica < 0) dec.effects.quimica = Math.round(dec.effects.quimica * 1.5);
    });
});

let currentEventIndex = 0;

// Text sequences for the introduction
const introTextSequence = [
    "ESTABLECIENDO CONEXIÓN CON SATÉLITE GAIA-9...\n",
    "CARGANDO DATOS DE LA BIOSFERA...\n",
    "ALERTA: CRUCE DE LÍMITES PLANETARIOS DETECTADO.\n\n",
    "🛰️ INFORME DE EMERGENCIA GLOBAL\nFECHA: 12 de marzo de 2026\n\n",
    "EL CONTEXTO:\nEl 'Gran Colapso' ha comenzado. Los límites biológicos y químicos de la Tierra se han fracturado.\n\n",
    "LA CRISIS ACTUAL:\n- El Escudo se desvanece: Gases industriales reabren la capa de Ozono.\n- El Ciclo Roto: Lluvia ácida por exceso de Azufre arrasa los suelos.\n- Invasión Invisible: Químicos sintéticos contaminan cada ecosistema.\n\n",
    "TU MISIÓN:\nAnte la crisis, se te ha designado líder de la Autoridad Global de la Biosfera.\n\n",
    "Tu objetivo: Estabilizar estos 3 pilares y guiar a la humanidad hasta el año 2060.\n\n",
    "¿Aceptas el control del Planeta?"
];

// DOM Elements
let startScreen;
let btnThemeDark;
let btnThemeGirly;
let btnThemeEco;
let btnBeginIntro;

let terminalIntroScreen;
let introTextEl;
let btnSkipIntro;
let btnAcceptMission;
let inductionScreen;
let gameScreen;
let endScreen;

let btnStart;
let currentYearEl;
let currentBudgetEl;
let btnShowManual;
let btnCloseManual;
let manualModal;

let btnShowMandato;
let btnCloseMandato;
let mandatoModal;
let mandatoContent;
let interventionsLeftEl;
let tabBtns;
let notificationToast;
let gameLogEl;

// Bars
let barOzono;
let barQuimica;
let barAzufre;
let barSocial;

let valOzono;
let valQuimica;
let valAzufre;
let valSocial;

// Event UI
let eventTitle;
let eventDesc;
let decisionsContainer;
let resultLog;
let resultText;
let btnNextYear;

// Initialization
window.addEventListener('DOMContentLoaded', init);

function init() {
    console.log("Initializing DOM Elements...");

    // Helper functions for robust collection and listeners
    const getEl = (id) => {
        const el = document.getElementById(id);
        if (!el) console.warn(`Missing DOM element: #${id}`);
        return el;
    };

    const attach = (el, event, handler) => {
        if (el) {
            el.addEventListener(event, handler);
        } else {
            console.warn("Attempted to attach listener to a null element.");
        }
    };

    // Collect DOM Elements
    startScreen = getEl('start-screen');
    btnThemeDark = getEl('btn-theme-dark');
    btnThemeGirly = getEl('btn-theme-girly');
    btnThemeEco = getEl('btn-theme-eco');
    btnBeginIntro = getEl('btn-begin-intro');

    terminalIntroScreen = getEl('terminal-intro-screen');
    introTextEl = getEl('intro-text');
    btnSkipIntro = getEl('btn-skip-intro');
    btnAcceptMission = getEl('btn-accept-mission');
    inductionScreen = getEl('induction-screen');
    gameScreen = getEl('game-screen');
    endScreen = getEl('end-screen');

    btnStart = getEl('btn-start');
    currentYearEl = getEl('current-year');
    currentBudgetEl = getEl('current-budget');
    btnShowManual = getEl('btn-show-manual');
    btnCloseManual = getEl('btn-close-manual');
    manualModal = getEl('manual-modal');

    btnShowMandato = getEl('btn-show-mandato');
    btnCloseMandato = getEl('btn-close-mandato');
    mandatoModal = getEl('mandato-modal');
    mandatoContent = getEl('mandato-content');
    interventionsLeftEl = getEl('interventions-left');
    tabBtns = document.querySelectorAll('.tab-btn');
    notificationToast = getEl('notification-toast');
    gameLogEl = getEl('game-log');

    barOzono = getEl('bar-ozono');
    barQuimica = getEl('bar-quimica');
    barAzufre = getEl('bar-azufre');
    barSocial = getEl('bar-social');

    valOzono = getEl('val-ozono');
    valQuimica = getEl('val-quimica');
    valAzufre = getEl('val-azufre');
    valSocial = getEl('val-social');

    eventTitle = getEl('event-title');
    eventDesc = getEl('event-description');
    decisionsContainer = getEl('decisions-container');
    resultLog = getEl('result-log');
    resultText = getEl('result-text');
    btnNextYear = getEl('btn-next-year');

    // Attach Event Listeners
    attach(btnThemeDark, 'click', () => setTheme('dark'));
    attach(btnThemeGirly, 'click', () => setTheme('girly'));
    attach(btnThemeEco, 'click', () => setTheme('eco'));

    attach(btnBeginIntro, 'click', transitionToIntro);
    attach(btnSkipIntro, 'click', skipTypewriterAnimation);
    attach(btnAcceptMission, 'click', showInductionManual);
    attach(btnStart, 'click', startGame);

    attach(btnNextYear, 'click', () => {
        if (state.isPracticeRound) {
            endPracticeRound();
        } else {
            advanceYear();
        }
    });

    // Practice buttons
    const practiceModal = getEl('practice-modal');
    const btnPracticeYes = getEl('btn-practice-yes');
    const btnPracticeNo = getEl('btn-practice-no');

    attach(btnPracticeYes, 'click', startPracticeRound);
    attach(btnPracticeNo, 'click', () => {
        if(practiceModal) practiceModal.classList.add('hidden');
    });

    // Learning Module
    const lessonBtns = document.querySelectorAll('.lesson-tab-btn');
    const lessonContents = document.querySelectorAll('.lesson-content');
    let lessonsRead = { azufre: false, quimica: false, ozono: false };
    
    lessonsRead['ozono'] = true;
    const firstLessonTab = document.querySelector('.lesson-tab-btn[data-lesson="ozono"]');
    if(firstLessonTab) firstLessonTab.classList.add('read');

    attach(btnShowManual, 'click', () => {
        if(manualModal) manualModal.classList.remove('hidden');
    });
    attach(btnCloseManual, 'click', () => {
        if(manualModal) manualModal.classList.add('hidden');
    });

    lessonBtns.forEach(btn => {
        attach(btn, 'click', () => {
            lessonBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            btn.classList.add('read');
            
            lessonContents.forEach(c => c.classList.add('hidden'));
            const targetContent = getEl(`lesson-${btn.dataset.lesson}`);
            if(targetContent) targetContent.classList.remove('hidden');

            lessonsRead[btn.dataset.lesson] = true;
            
            if(lessonsRead.ozono && lessonsRead.quimica && lessonsRead.azufre) {
                if(btnStart) {
                    btnStart.disabled = false;
                    btnStart.classList.add('blink');
                    btnStart.innerText = "ENTRENAMIENTO COMPLETADO. INICIAR SIMULACIÓN [2026]";
                }
            }
        });
    });

    if(manualModal) {
        manualModal.addEventListener('click', (e) => {
            if (e.target === manualModal) manualModal.classList.add('hidden');
        });
    }

    attach(btnShowMandato, 'click', openMandato);
    attach(btnCloseMandato, 'click', () => {
        if(mandatoModal) mandatoModal.classList.add('hidden');
    });

    const btnTutorialNext = getEl('btn-tutorial-next');
    const btnTutorialSkip = getEl('btn-tutorial-skip');
    attach(btnTutorialNext, 'click', nextTutorialStep);
    attach(btnTutorialSkip, 'click', endTutorial);
    
    tabBtns.forEach(btn => {
        attach(btn, 'click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderMandatoTab(btn.dataset.tab);
        });
    });

    if(mandatoModal) {
        mandatoModal.addEventListener('click', (e) => {
            if (e.target === mandatoModal) mandatoModal.classList.add('hidden');
        });
    }

    console.log("Global Guardian Initialized Successfully.");
}

function openMandato() {
    mandatoModal.classList.remove('hidden');
    const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
    renderMandatoTab(activeTab);
}

function renderMandatoTab(category) {
    interventionsLeftEl.innerText = 2 - state.intervencionesRealizadas;
    mandatoContent.innerHTML = '';
    
    intervenciones[category].forEach(action => {
        const card = document.createElement('div');
        const isLimitReached = state.intervencionesRealizadas >= 2;
        const cannotAfford = action.cost > 0 && state.budget < action.cost;
        const isDisabled = isLimitReached || cannotAfford;
        
        card.className = `intervention-card ${isDisabled ? 'disabled' : ''}`;
        
        card.innerHTML = `
            <div class="intervention-info">
                <h4>${action.title}</h4>
                <p>${action.desc}</p>
                <div class="intervention-impact">${action.impact}</div>
            </div>
            <button class="btn-primary" ${isDisabled ? 'disabled' : ''}>
                ${action.cost < 0 ? 'COBRAR' : 'EJECUTAR'}
            </button>
        `;
        
        if (!isDisabled) {
            card.querySelector('button').onclick = () => executeIntervention(action);
        }
        
        mandatoContent.appendChild(card);
    });

    if (state.intervencionesRealizadas >= 2) {
        const msg = document.createElement('div');
        msg.style.padding = '1rem';
        msg.style.marginTop = '1rem';
        msg.style.border = '1px solid var(--color-warning)';
        msg.style.textAlign = 'center';
        msg.style.color = 'var(--color-warning)';
        msg.style.fontFamily = 'var(--font-heading)';
        msg.innerHTML = "⚠️ YA NO QUEDAN MÁS ACCIONES POR ESTE AÑO.<br>Para salir, pulsa la X en la esquina superior derecha.";
        mandatoContent.appendChild(msg);
    }
}

function executeIntervention(action) {
    if (state.intervencionesRealizadas >= 2) return;
    
    state.budget -= action.cost;
    state.ozono = Math.max(0, Math.min(100, state.ozono + action.effects.ozono));
    state.quimica = Math.max(0, Math.min(100, state.quimica + action.effects.quimica));
    state.azufre = Math.max(0, Math.min(100, state.azufre + action.effects.azufre));
    state.social = Math.max(0, Math.min(100, state.social + action.effects.social));
    
    state.intervencionesRealizadas++;
    
    addLog(`He ejecutado la acción: ${action.title}.`, 'mandato');
    updateUI();
    showToast(action.msg);
    renderMandatoTab(document.querySelector('.tab-btn.active').dataset.tab);
}

function showToast(message) {
    notificationToast.innerText = `>> ${message}`;
    notificationToast.classList.remove('hidden');
    setTimeout(() => {
        notificationToast.classList.add('hidden');
    }, 4000);
}

// Theme Logic
function setTheme(theme) {
    // Remove active classes
    btnThemeDark.classList.remove('active');
    btnThemeGirly.classList.remove('active');
    btnThemeEco.classList.remove('active');

    if (theme === 'dark') {
        document.body.className = 'theme-dark';
        btnThemeDark.classList.add('active');
    } else if (theme === 'girly') {
        document.body.className = 'theme-girly';
        btnThemeGirly.classList.add('active');
    } else if (theme === 'eco') {
        document.body.className = 'theme-eco';
        btnThemeEco.classList.add('active');
    }
}

// Flow Logic
function transitionToIntro() {
    startScreen.classList.remove('active');
    startScreen.classList.add('hidden');
    
    setTimeout(() => {
        terminalIntroScreen.classList.remove('hidden');
        terminalIntroScreen.classList.add('active');
        startTypewriterIntro();
    }, 300);
}

// Typewriter logic
let isTypingSkipped = false;

function skipTypewriterAnimation() {
    isTypingSkipped = true;
}

function startTypewriterIntro() {
    let sequenceIndex = 0;
    let charIndex = 0;
    isTypingSkipped = false;
    
    function typeWriter() {
        if (isTypingSkipped) {
            // Instantly show the rest of the text
            let remainingText = introTextSequence.slice(sequenceIndex).join("");
            // If we were in the middle of a line, only append the rest of that line
            if (charIndex > 0) {
                remainingText = introTextSequence[sequenceIndex].substring(charIndex) + introTextSequence.slice(sequenceIndex + 1).join("");
            }
            introTextEl.innerHTML += remainingText;
            btnAcceptMission.classList.remove('hidden');
            btnSkipIntro.classList.add('hidden');
            return;
        }

        if (sequenceIndex < introTextSequence.length) {
            const currentLine = introTextSequence[sequenceIndex];
            if (charIndex < currentLine.length) {
                introTextEl.innerHTML += currentLine.charAt(charIndex);
                charIndex++;
                setTimeout(typeWriter, 15); // 15ms per character
            } else {
                sequenceIndex++;
                charIndex = 0;
                setTimeout(typeWriter, 200); // Wait between paragraphs
            }
        } else {
            // Finished typing all sequences
            btnAcceptMission.classList.remove('hidden');
            btnSkipIntro.classList.add('hidden');
        }
    }
    
    // Start after a slight delay
    setTimeout(typeWriter, 1000);
}

function playSoundEffect() {
    // We use a simple AudioContext oscillator just to have a synthesized "System Activated" beep
    // Since we don't have an external file, this guarantees a sound plays
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
    } catch(e) {
        console.log("Audio API not supported or interaction needed first.");
    }
}

function showInductionManual() {
    playSoundEffect();
    terminalIntroScreen.classList.remove('active');
    terminalIntroScreen.classList.add('hidden');
    
    setTimeout(() => {
        inductionScreen.classList.remove('hidden');
        inductionScreen.classList.add('active');
    }, 300);
}

function startGame() {
    inductionScreen.classList.remove('active');
    inductionScreen.classList.add('hidden');
    setTimeout(() => {
        gameScreen.classList.remove('hidden');
        gameScreen.classList.add('active');
        updateUI();
        addLog("He asumido el control de la biosfera. Que Dios nos ayude.", "system");
        loadNextEvent();
        startTutorial();
    }, 300);
}

function updateUI() {
    // Update numerical values
    currentYearEl.innerText = state.year;
    currentBudgetEl.innerText = `$${state.budget}M`;
    
    valOzono.innerText = `${Math.round(state.ozono)}%`;
    valQuimica.innerText = `${Math.round(state.quimica)}%`;
    valAzufre.innerText = `${Math.round(state.azufre)}%`;
    valSocial.innerText = `${Math.round(state.social)}%`;

    // Update Bar Widths
    barOzono.style.width = `${state.ozono}%`;
    barQuimica.style.width = `${state.quimica}%`;
    barAzufre.style.width = `${state.azufre}%`;
    barSocial.style.width = `${state.social}%`;

    updateLogUI();
    renderCurrentEventDecisions();

    // Critical Bar Hints
    const isOzonoLow = state.ozono < 40;
    const isQuimicaHigh = state.quimica > 70;
    const isAzufreFar = Math.abs(50 - state.azufre) > 25;
    const isSocialLow = state.social < 30;

    if (isOzonoLow || isQuimicaHigh || isAzufreFar || isSocialLow) {
        btnShowMandato.classList.add('critical-blink');
        showCriticalHint(isOzonoLow, isQuimicaHigh, isAzufreFar, isSocialLow);
    } else {
        btnShowMandato.classList.remove('critical-blink');
        hideCriticalHint();
    }

    // Update Bar Colors conditionally
    // Ozono: High is good, Low is bad (>80 good, <30 bad)
    updateBarColor(barOzono, state.ozono, 80, 40, true);
    
    // Quimica: Low is good, High is bad (<30 good, >70 bad)
    updateBarColor(barQuimica, state.quimica, 30, 70, false);
    
    // Azufre: Middle is best (50). Farther is worse.
    updateAzufreColor(barAzufre, state.azufre);

    // Social: Higher is better
    updateBarColor(barSocial, state.social, 70, 30, true);
}

function updateBarColor(barElement, value, thresholdGood, thresholdBad, higherIsBetter) {
    barElement.className = 'progress'; // Reset classes
    
    if (higherIsBetter) {
        if (value >= thresholdGood) barElement.classList.add('fill-success');
        else if (value <= thresholdBad) barElement.classList.add('fill-danger');
        else barElement.classList.add('fill-warning');
    } else {
        if (value <= thresholdGood) barElement.classList.add('fill-success');
        else if (value >= thresholdBad) barElement.classList.add('fill-danger');
        else barElement.classList.add('fill-warning');
    }
}

function updateAzufreColor(barElement, value) {
    barElement.className = 'progress'; // Reset classes
    // 50 is perfect. Deviations are bad.
    const dist = Math.abs(50 - value);
    if (dist <= 15) barElement.classList.add('fill-success');
    else if (dist <= 30) barElement.classList.add('fill-warning');
    else barElement.classList.add('fill-danger');
}

function showCriticalHint(o3, chem, s, soc) {
    let hintEl = document.getElementById('critical-alert-msg');
    if (!hintEl) {
        hintEl = document.createElement('div');
        hintEl.id = 'critical-alert-msg';
        hintEl.style.color = 'var(--color-danger)';
        hintEl.style.fontSize = '0.85rem';
        hintEl.style.marginTop = '0.5rem';
        hintEl.style.textAlign = 'center';
        hintEl.style.fontWeight = 'bold';
        document.querySelector('.metrics-panel').appendChild(hintEl);
    }
    
    let parts = [];
    if (o3) parts.push("¡OZONO CRÍTICO!");
    if (chem) parts.push("¡QUÍMICA CRÍTICA!");
    if (s) parts.push("¡AZUFRE DESBALANCEADO!");
    if (soc) parts.push("¡BAJA ACEPTACIÓN!");
    
    hintEl.innerHTML = `⚠️ ${parts.join(' ')}<br>Vaya al botón de MANDATO para mejorar las barras.`;
    hintEl.classList.remove('hidden');
}

function hideCriticalHint() {
    const hintEl = document.getElementById('critical-alert-msg');
    if (hintEl) hintEl.classList.add('hidden');
}

function addLog(text, category) {
    state.logs.unshift({
        year: state.year,
        text: text,
        category: category
    });
}

function updateLogUI() {
    gameLogEl.innerHTML = '';
    state.logs.forEach(log => {
        const entry = document.createElement('div');
        entry.className = `log-entry log-category-${log.category}`;
        entry.innerHTML = `<span class="log-year">${log.year}:</span> ${log.text}`;
        gameLogEl.appendChild(entry);
    });
}

function loadNextEvent() {
    resultLog.classList.add('hidden');
    
    if (currentEventIndex >= events.length) {
        // Recycle events if we run out before year 2100
        shuffleArray(events);
        currentEventIndex = 0;
    }

    const ev = events[currentEventIndex];
    eventTitle.innerText = `🚨 ${ev.title}`;
    eventDesc.innerText = ev.description;

    renderCurrentEventDecisions();
}

function renderCurrentEventDecisions() {
    // Only render if we are in the decision phase (resultLog is hidden and we are on gameScreen)
    if (!resultLog.classList.contains('hidden') || gameScreen.classList.contains('hidden')) return;

    const ev = events[currentEventIndex];
    decisionsContainer.innerHTML = '';

    ev.decisions.forEach((dec) => {
        const btn = document.createElement('button');
        btn.className = 'btn-decision';
        
        let costText = dec.cost > 0 ? `Coste: -$${dec.cost}M` : `Ingreso: +$${Math.abs(dec.cost)}M`;
        
        // Format impacts
        let impactsText = Object.entries(dec.effects)
            .filter(([_, val]) => val !== 0)
            .map(([key, val]) => {
                const sign = val > 0 ? '+' : '';
                const label = key === 'ozono' ? 'Ozono' : key === 'quimica' ? 'Química' : key === 'azufre' ? 'Azufre' : 'Social';
                return `${sign}${val}% ${label}`;
            })
            .join(', ');

        btn.innerHTML = `
            <span class="decision-title">${dec.text}</span>
            <div class="decision-meta">
                <span class="decision-cost">${costText}</span>
                <span class="decision-impacts">${impactsText}</span>
            </div>
        `;
        
        // Disable button if not enough money (for paths that have positive cost)
        if (dec.cost > 0 && state.budget - dec.cost < 0) {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
            btn.innerHTML += `<span style="color:red; font-size:0.8rem; margin-top:5px;">[FONDOS INSUFICIENTES]</span>`;
        }

        btn.onclick = () => processDecision(ev, dec);
        decisionsContainer.appendChild(btn);
    });
}

function processDecision(ev, dec) {
    // Hide buttons
    decisionsContainer.innerHTML = '';
    
    // Apply changes
    state.budget -= dec.cost;
    
    // Update metric state (bounding between 0 and 100)
    state.ozono = Math.max(0, Math.min(100, state.ozono + dec.effects.ozono));
    state.quimica = Math.max(0, Math.min(100, state.quimica + dec.effects.quimica));
    state.azufre = Math.max(0, Math.min(100, state.azufre + dec.effects.azufre));
    state.social = Math.max(0, Math.min(100, state.social + dec.effects.social));

    // Show result
    resultText.innerText = dec.result;
    resultLog.classList.remove('hidden');

    updateUI();
    addLog(`He decidido: ${dec.text.split('] ')[1] || dec.text}`, 'event');

    btnNextYear.className = 'btn-info';
    currentEventIndex++;
}

function playQuizSound() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
        oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1); 
        
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
        console.log("Audio not supported or disabled");
    }
}

function triggerPopQuiz() {
    if (popQuizQuestions.length === 0) {
        checkEndGame();
        return;
    }

    // Modal elements
    const quizModal = document.getElementById('quiz-modal');
    const questionEl = document.getElementById('quiz-question');
    const optionsContainer = document.getElementById('quiz-options');
    const resultContainer = document.getElementById('quiz-result');
    const resultText = document.getElementById('quiz-result-text');
    const btnContinue = document.getElementById('btn-quiz-continue');

    // Pick a random question and remove it from array
    const qIndex = Math.floor(Math.random() * popQuizQuestions.length);
    const question = popQuizQuestions.splice(qIndex, 1)[0];
    
    state.quizzesAsked++;

    // Reset UI
    optionsContainer.innerHTML = '';
    resultContainer.classList.add('hidden');
    optionsContainer.style.display = 'flex';
    questionEl.innerText = question.q;
    
    playQuizSound();
    quizModal.classList.remove('hidden');

    question.options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.className = 'btn-secondary action-btn';
        btn.innerText = opt;
        btn.onclick = () => {
            // Disable all buttons
            Array.from(optionsContainer.children).forEach(b => b.disabled = true);
            
            // Highlight options
            Array.from(optionsContainer.children).forEach((child, i) => {
                if (i === question.correct) {
                    child.style.backgroundColor = 'var(--color-success)';
                    child.style.color = '#fff';
                    child.style.borderColor = 'var(--color-success)';
                } else if (i === index) {
                    child.style.backgroundColor = 'var(--color-danger)';
                    child.style.color = '#fff';
                    child.style.borderColor = 'var(--color-danger)';
                }
            });

            if (index === question.correct) {
                state.quizScore++;
                state.budget += 1000;
                resultText.innerHTML = `✅ ¡Respuesta Correcta! <br><br><strong>Ciencia:</strong> ${question.explanation}<br><br><span style="color: var(--color-success)">Bono de $1,000M añadido al presupuesto.</span>`;
                resultText.style.color = "var(--text-main)";
                btnContinue.className = "btn-success";
                updateUI();
            } else {
                // Apply penalty based on category
                let penaltyText = "";
                if (question.cat === 'azufre') { state.azufre += 2; penaltyText = "Azufre +2% (Alejándose de meta)"; }
                else if (question.cat === 'ozono') { state.ozono -= 2; penaltyText = "Ozono -2%"; }
                else if (question.cat === 'quimica') { state.quimica += 2; penaltyText = "Química +2%"; }
                
                state.social -= 2;
                resultText.innerHTML = `❌ Respuesta Incorrecta. <br><br><strong>Respuesta correcta:</strong> ${question.options[question.correct]}<br><br><strong>Explicación:</strong> ${question.explanation}<br><br><span style="color: var(--color-danger)">Penalidad: ${penaltyText}, Aceptación Social -2%</span>`;
                resultText.style.color = "var(--text-main)";
                btnContinue.className = "btn-secondary"; // Changed from btn-primary to avoid red color confusion
                updateUI();
            }
            resultContainer.classList.remove('hidden');
        };
        optionsContainer.appendChild(btn);
    });

    // Continue button binds to checkEndGame
    btnContinue.onclick = () => {
        quizModal.classList.add('hidden');
        state.quizzesAskedThisTurn = (state.quizzesAskedThisTurn || 0) + 1;
        if (state.quizzesAskedThisTurn < (state.quizzesToAskThisTurn || 1) && popQuizQuestions.length > 0) {
            setTimeout(triggerPopQuiz, 300);
        } else {
            checkEndGame();
        }
    };
}

// We have moved the advance year binding logic to the init block for practice round intercept
function advanceYear() {
    // Reset interventions
    state.intervencionesRealizadas = 0;

    // Add annual budget based on social acceptance (max +$1200M)
    const annualIncome = Math.floor((state.social / 100) * 1200);
    state.budget += annualIncome;
    
    // Slightly drift values annually
    state.ozono -= 2; // Natural decay if not protected
    state.quimica += 3; // Natural human expansion
    // Bound again
    state.ozono = Math.max(0, Math.min(100, state.ozono));
    state.quimica = Math.max(0, Math.min(100, state.quimica));
    
    // Advance time in smaller increments
    state.year += Math.floor(Math.random() * 3) + 5; // Advances 5 to 7 years per turn

    updateUI();

    // Set how many quizzes to ask this turn
    state.quizzesAskedThisTurn = 0;
    state.quizzesToAskThisTurn = 2;

    // Check if we should trigger a quiz
    // By triggering every turn, we ensure all questions are asked.
    if (popQuizQuestions.length > 0) {
        triggerPopQuiz();
    } else {
        checkEndGame();
    }
}

function checkEndGame() {
    let isGameOver = false;
    let endTitleText = "";
    let endNarrative = "";
    let survived = false;

    // Fail conditions
    if (state.social <= 0) {
        isGameOver = true;
        endTitleText = "DESTITUCIÓN INMINENTE";
        endNarrative = "<p class='system-msg' style='color:red;'>> ERROR DEL SISTEMA: Aceptación popular en 0%.</p><p>Las multitudes han asaltado los edificios de la coalición gubernamental. Usted ha sido relevado de su cargo y encerrado. El planeta queda a la deriva ante la crisis ecológica.</p>";
    } else if (state.ozono <= 0) {
        isGameOver = true;
        endTitleText = "COLAPSO ECOLÓGICO: OZONO CERO";
        endNarrative = "<p class='system-msg' style='color:red;'>> ERROR DEL SISTEMA: Agotamiento Letal de Ozono.</p><p>Sin escudo protector, la superficie de la Tierra ha sido esterilizada por radiación UV-C. Las cadenas tróficas marinas han colapsado y la agricultura de superficie es imposible. La humanidad debe retroceder a ciudades subterráneas.</p>";
    } else if (state.quimica >= 100) {
        isGameOver = true;
        endTitleText = "INFIERNO TÓXICO: BIOACUMULACIÓN 100%";
        endNarrative = "<p class='system-msg' style='color:red;'>> ERROR DEL SISTEMA: Límite Planetario de Nuevas Entidades Excedido.</p><p>Las tasas de mutación y enfermedades congénitas bloquean la reproducción humana sana globalmente. Ríos polimerizados y fauna mutante irreversible. El daño genético es el legado final del siglo XXI.</p>";
    } 
    // Win Condition
    else if (state.year >= GAME_END_YEAR || popQuizQuestions.length === 0) {
        if (popQuizQuestions.length > 0) {
            state.quizzesAskedThisTurn = 0;
            state.quizzesToAskThisTurn = popQuizQuestions.length;
            triggerPopQuiz();
            return;
        }
        isGameOver = true;
        survived = true;
        endTitleText = `MANDATO COMPLETADO: AÑO ${state.year}`;
        endNarrative += generateFinalReport();
    }

    if (isGameOver) {
        gameScreen.classList.remove('active');
        gameScreen.classList.add('hidden');
        endScreen.classList.remove('hidden');
        endScreen.classList.add('active');
        
        document.getElementById('end-title').innerText = endTitleText;
        document.getElementById('end-report').innerHTML = endNarrative + generateEvaluation(survived);

        document.getElementById('btn-restart').onclick = () => location.reload();
    } else {
        loadNextEvent();
    }
}

function generateFinalReport() {
    let report = `<p>Ha guiado a la humanidad hasta el año ${state.year}. Aquí están las consecuencias de sus protocolos sistemáticos:</p>`;

    // Azufre
    if (Math.abs(state.azufre - 50) <= 15) {
        report += `<p><strong>☁️ Los Cielos (Azufre):</strong> Los niveles de aerosoles están estabilizados. Las nubes mantienen su ciclo hídrico normal sin desatar lluvias ácidas corrosivas. Un logro atmosférico notable.</p>`;
    } else if (state.azufre > 65) {
        report += `<p><strong>💀 Lluvia Cáustica (Azufre Alto):</strong> Para enfriar el mundo o abaratar costos, llenó los cielos de azufre. Hoy en el año ${state.year}, la lluvia ácida derrite regularmente aceros no tratados y ha decolorado millones de hectáreas de bosque boreal.</p>`;
    } else {
        report += `<p><strong>🔥 El Horno (Azufre Bajo/Desbalance):</strong> Evitó los sulfatos a toda costa. Sin ese enfriamiento, las temperaturas aumentaron. Paradójicamente, salvó el ecologismo químico pero condenó grandes franjas del ecuador al calor letal.</p>`;
    }

    // Ozono
    if (state.ozono > 80) {
        report += `<p><strong>🛡️ El Escudo (O<sub>3</sub>):</strong> La capa de ozono se ha reconstruido mucho más fuerte que en el siglo XX. El cáncer de piel por exposición solar ha sido prácticamente erradicado en las nuevas generaciones.</p>`;
    } else {
        report += `<p><strong>☀️ Rayos Cegadores (O<sub>3</sub> Débil):</strong> El escudo sobrevivió, pero apenas. Nadie sale a la calle sin trajes protectores UV entre las 10:00 y las 16:00. Las cosechas sufren quemaduras constantes.</p>`;
    }

    // Química
    if (state.quimica < 30) {
        report += `<p><strong>💧 Agua Prístina (Int. Química):</strong> Su prohibición de quimicos sintéticos logró purgar las reservas acuíferas. Las aguas globales están libres del lastre de los 'químicos eternos' del siglo XXI.</p>`;
    } else {
        report += `<p><strong>🧪 Océanos Sintéticos (Int. Química Alta):</strong> Evitamos la aniquilación total, pero la omnipresencia de toxinas microscópicas ha alterado permanentemente los ecosistemas oceánicos. Los peces silvestres son técnicamente productos químicos exóticos imposibles de consumir.</p>`;
    }

    report += `<br><p class='system-msg'>> EVALUACIÓN FINAL: ${state.social > 70 ? 'HÉROE PLANETARIO' : 'GESTIÓN DE SUPERVIVENCIA CUESTIONABLE'}.</p>`;
    
    return report;
}

// =============================================
// EVALUACIÓN ACADÉMICA
// =============================================

function calculateScore() {
    // Ozono: 0-100, meta >80. Puntaje lineal, máximo en 100.
    const ozonoScore = Math.min(100, (state.ozono / 80) * 100);

    // Química: 0-100, meta <30. Invertido: 0 contaminación = 100 puntos.
    const quimicaScore = Math.min(100, ((100 - state.quimica) / 70) * 100);

    // Azufre: meta = 50. Penalizar por desviación.
    const azufreDist = Math.abs(state.azufre - 50);
    const azufreScore = Math.max(0, 100 - (azufreDist / 50) * 100);

    // The environmental score is the average of the 3 metrics
    const envTotal = (ozonoScore + quimicaScore + azufreScore) / 3;

    // Quiz Score evaluation
    let quizPercentage = 100; // default to 100 if no quizzes were asked
    if (state.quizzesAsked > 0) {
        quizPercentage = (state.quizScore / state.quizzesAsked) * 100;
    }

    // Grand total: 30% environmental metrics, 70% pop quiz score
    const grandTotal = (envTotal * 0.3) + (quizPercentage * 0.7);

    return {
        total: Math.round(grandTotal),
        envTotal: Math.round(envTotal),
        quizTotal: Math.round(quizPercentage),
        ozono: Math.round(ozonoScore),
        quimica: Math.round(quimicaScore),
        azufre: Math.round(azufreScore)
    };
}

function generateEvaluation(survived) {
    const scores = calculateScore();
    const total = survived ? scores.total : Math.min(scores.total, 40); // Penalizar si no sobrevivió

    let grade, gradeColor, gradeComment;
    if (total >= 90)      { grade = 'A+'; gradeColor = '#00ff88'; gradeComment = '¡Excelente gestión! La Tierra del futuro te lo agradece.'; }
    else if (total >= 80) { grade = 'A';  gradeColor = '#00e07a'; gradeComment = 'Muy buena gestión. Los sistemas planetarios están en buen estado.'; }
    else if (total >= 70) { grade = 'B';  gradeColor = '#a3e635'; gradeComment = 'Buena gestión. Algunos sistemas necesitaban más atención.'; }
    else if (total >= 60) { grade = 'C';  gradeColor = '#facc15'; gradeComment = 'Gestión aceptable. El planeta sobrevivió, pero con secuelas.'; }
    else if (total >= 50) { grade = 'D';  gradeColor = '#f97316'; gradeComment = 'Gestión deficiente. La biosfera quedó al límite de colapso.'; }
    else                  { grade = 'F';  gradeColor = '#ef4444'; gradeComment = 'Gestión crítica. Los sistemas planetarios fallaron bajo tu mando.'; }

    // Identificar áreas de mejora
    const improvements = [];

    if (scores.ozono < 70) {
        improvements.push({
            icon: '🛡️',
            area: 'Capa de Ozono (Falta de Dominio)',
            tip: `**Conceptos a reforzar:** Ubicación estratosférica, proceso de formación vía radiación UV, y el impacto de los CFCs como catalizadores destructivos.<br>
            *Resultado en tu simulación:* La capa de ozono terminó en ${state.ozono}% (meta >80%). No lograste evitar la destrucción de las moléculas de O<sub>3</sub>, lo que en la realidad causa daño severo al ADN planetario y extinción del fitoplancton.`
        });
    }
    if (scores.quimica < 70) {
        improvements.push({
            icon: '🧪',
            area: 'Polución Química (Límite Planetario Excedido)',
            tip: `**Conceptos a reforzar:** Bioacumulación, Biomagnificación, y los efectos de los disruptores endocrinos.<br>
            *Resultado en tu simulación:* La contaminación llegó al ${state.quimica}% (meta <30%). No aplicaste el principio de precaución frente a las "Nuevas Entidades". En la realidad, esto satura la biosfera con toxinas eternas que se multiplican en la cadena trófica.`
        });
    }
    if (scores.azufre < 70) {
        const dist = Math.abs(state.azufre - 50);
        improvements.push({
            icon: '☁️',
            area: 'Ciclo Biogeoquímico del Azufre (Desbalance)',
            tip: `**Conceptos a reforzar:** Reservorios naturales, rol de los microorganismos, y el problema del SO<sub>2</sub> industrial formador de lluvia ácida.<br>
            *Resultado en tu simulación:* El azufre terminó en ${state.azufre}% con una desviación de ${dist} puntos de su estado óptimo natural. La falta de control en las 5 etapas del ciclo rompe el termostato del planeta y acidifica el suelo, liberando metales tóxicos (aluminio) letales para las raíces.`
        });
    }
    if (scores.quizTotal < 70) {
       improvements.push({
           icon: '📝',
           area: 'Conocimiento Científico Aplicado (Pop Quiz Fines)',
           tip: `**Apertura Conceptual Fallida:** Lograste ${state.quizScore} de ${state.quizzesAsked} respuestas correctas (Nota: ${scores.quizTotal}%).<br>
           *Feedback Técnico:* Aunque tus decisiones prácticas hayan sido buenas, demostraste lagunas teóricas en los pop quizzes. El 70% de tu nota final dependía de tu dominio técnico. Es vital que consultes la sección del "Códice" durante la partida para asegurar la comprensión de los fenómenos geoquímicos.`
       });
    }

    const improvementsHTML = improvements.length === 0
        ? `<p class="eval-perfect">✅ ¡Rendimiento óptimo en todas las categorías! Dominio total técnico y científico.</p>`
        : improvements.map(imp => `
            <div class="eval-improvement-item">
                <div class="eval-imp-header">${imp.icon} <strong>${imp.area}</strong></div>
                <p>${imp.tip}</p>
            </div>`).join('');

    return `
    <div class="evaluation-card">
        <div class="eval-header">
            <h3>📋 EVALUACIÓN ACADÉMICA FINAL</h3>
            <p class="eval-subtitle">El destino de la Tierra y tu dominio científico</p>
        </div>

        <div class="eval-score-section">
            <div class="eval-grade-circle" style="border-color: ${gradeColor}; color: ${gradeColor};">
                ${grade}
            </div>
            <div class="eval-score-info">
                <div class="eval-total-score">${total} <span>/ 100</span></div>
                <p class="eval-comment">${gradeComment}</p>
            </div>
        </div>

        <div class="eval-criteria">
            <h4 style="margin-bottom: 0.5rem;">📝 Evaluaciones de Conocimiento (50% de la nota)</h4>
            <div class="eval-criterion" style="margin-bottom: 1.5rem;">
                <div class="eval-crit-label">🧠 Pop Quizzes</div>
                <div class="eval-crit-bar-bg"><div class="eval-crit-bar" style="width:${scores.quizTotal}%; background: ${scores.quizTotal >= 70 ? '#00ff88' : scores.quizTotal >= 50 ? '#facc15' : '#ef4444'};"></div></div>
                <div class="eval-crit-val">${state.quizScore}/${state.quizzesAsked} Correctas (${scores.quizTotal}%)</div>
            </div>

            <h4 style="margin-bottom: 0.5rem;">📊 Gestión Planetaria (50% de la nota)</h4>
            <div class="eval-criteria-grid">
                <div class="eval-criterion">
                    <div class="eval-crit-label">🛡️ Ozono (O₃)</div>
                    <div class="eval-crit-bar-bg"><div class="eval-crit-bar" style="width:${scores.ozono}%; background: ${scores.ozono >= 70 ? '#00ff88' : scores.ozono >= 50 ? '#facc15' : '#ef4444'};"></div></div>
                    <div class="eval-crit-val">${scores.ozono}%</div>
                </div>
                <div class="eval-criterion">
                    <div class="eval-crit-label">🧪 Int. Química</div>
                    <div class="eval-crit-bar-bg"><div class="eval-crit-bar" style="width:${scores.quimica}%; background: ${scores.quimica >= 70 ? '#00ff88' : scores.quimica >= 50 ? '#facc15' : '#ef4444'};"></div></div>
                    <div class="eval-crit-val">${scores.quimica}%</div>
                </div>
                <div class="eval-criterion">
                    <div class="eval-crit-label">☁️ Azufre (S)</div>
                    <div class="eval-crit-bar-bg"><div class="eval-crit-bar" style="width:${scores.azufre}%; background: ${scores.azufre >= 70 ? '#00ff88' : scores.azufre >= 50 ? '#facc15' : '#ef4444'};"></div></div>
                    <div class="eval-crit-val">${scores.azufre}%</div>
                </div>
            </div>
        </div>

        <div class="eval-improvements">
            <h4>🔍 Áreas de Mejora</h4>
            ${improvementsHTML}
        </div>
    </div>`;
}

// =============================================
// GAME TUTORIAL LOGIC
// =============================================

const tutorialSteps = [
    {
        sel: null,
        title: "BIENVENIDO AL GABINETE",
        text: "Como Director(a), esta es tu interfaz de control principal. Aquí tomarás decisiones a lo largo de décadas que afectarán la permanencia de la humanidad hasta el año 2100."
    },
    {
        sel: ".budget-display",
        title: "PRESUPUESTO GUBERNAMENTAL",
        text: "Este es el capital disponible (M = Millones) para financiar intervenciones climáticas. Las crisis cuestan dinero, pero no ejecutar medidas cuesta vidas y ecología."
    },
    {
        sel: ".metrics-panel",
        title: "MÉTRICAS PLANETARIAS (LÍMITES)",
        text: "Estas barras representan la salud de la biosfera y tu apoyo político.\n\nReglas Críticas:\n- Ozono (O3) debe estar cerca de 100%.\n- Int. Química debe mantenerse baja (cerca de 0%).\n- Azufre debe estar equilibrado (ideal en 50%).\n- Si la Aceptación Social cae al 0%, te destituyen."
    },
    {
        sel: ".event-panel",
        title: "EVENTOS GLOBALES (CRISIS)",
        text: "Cada año saltarán alertas de crisis. Deberás elegir sabiamente entre vías económicas, científicas o radicales. Cada respuesta tiene un lado negativo, el mundo no es blanco y negro."
    },
    {
        sel: "#btn-show-mandato",
        title: "CENTRO DE MANDATO",
        text: "Aquí puedes ejecutar proactivamente intervenciones extraordinarias abonando parte de tu presupuesto. Tienes permitidas un máximo de 2 acciones de política pública por año."
    },
    {
        sel: "#btn-show-manual",
        title: "EL MANUAL CIENTÍFICO",
        text: "La memoria humana es frágil. Si olvidas cómo funciona el Ciclo del Azufre o la Química de los CFCs, recurre aquí en cualquier momento para repasar la ciencia detrás de la crisis."
    },
    {
        sel: ".log-panel",
        title: "HISTORIAL DE MISIÓN",
        text: "Todo queda registrado. Utiliza este registro de bitácora para repasar todas las intervenciones previas ejecutadas en tu gobierno."
    }
];

let currentTutorialStep = 0;

function startTutorial() {
    const overlay = document.getElementById('tutorial-overlay');
    const box = document.getElementById('tutorial-box');
    if(overlay && box) {
        overlay.classList.remove('hidden');
        box.classList.remove('hidden');
        currentTutorialStep = 0;
        showTutorialStep();
    }
}

function showTutorialStep() {
    const step = tutorialSteps[currentTutorialStep];
    const box = document.querySelector('.tutorial-box');
    
    // Set explicit text first to calculate valid dimensions for placement
    document.getElementById('tutorial-title').innerText = step.title;
    document.getElementById('tutorial-text').innerText = step.text;
    
    const btnNext = document.getElementById('btn-tutorial-next');
    if (currentTutorialStep === tutorialSteps.length - 1) {
        btnNext.innerText = "Finalizar";
    } else {
        btnNext.innerText = "Siguiente ⏭️";
    }
    
    // Clear previous highlight
    document.querySelectorAll('.tutorial-highlight').forEach(el => el.classList.remove('tutorial-highlight'));
    
    if (step.sel) {
        const target = document.querySelector(step.sel);
        if (target) {
            target.classList.add('tutorial-highlight');
            
            // Smart positioning logic: dynamically place the box left/right or top/bottom
            // based on the highlighted element's bounding rect.
            const rect = target.getBoundingClientRect();
            box.style.transform = 'none';
            
            const screenCenterX = window.innerWidth / 2;
            const screenCenterY = window.innerHeight / 2;
            
            let topPos, leftPos;
            const boxWidth = box.offsetWidth || 500;
            const boxHeight = box.offsetHeight || 250;
            
            if (rect.width > window.innerWidth * 0.5) {
                // For very wide elements (like the top bar), place below or above
                leftPos = Math.max(20, rect.left + (rect.width / 2) - (boxWidth / 2));
                if (rect.top > screenCenterY) {
                    topPos = rect.top - boxHeight - 20; // Place above
                } else {
                    topPos = rect.bottom + 20; // Place below
                }
            } else {
                // For normal or tall elements (like panels), place to the side
                topPos = Math.max(20, Math.min(window.innerHeight - boxHeight - 20, rect.top + (rect.height / 2) - (boxHeight / 2)));
                
                if (rect.left > screenCenterX) {
                    leftPos = rect.left - boxWidth - 20; // Place to the left
                } else {
                    leftPos = rect.right + 20; // Place to the right
                }
            }
            
            // Final viewport constraints to guarantee it never goes off screen
            topPos = Math.max(20, Math.min(window.innerHeight - boxHeight - 20, topPos));
            leftPos = Math.max(20, Math.min(window.innerWidth - boxWidth - 20, leftPos));
            
            box.style.top = `${topPos}px`;
            box.style.left = `${leftPos}px`;
        }
    } else {
        box.style.top = '50%';
        box.style.left = '50%';
        box.style.transform = 'translate(-50%, -50%)';
    }
}

function nextTutorialStep() {
    if (currentTutorialStep < tutorialSteps.length - 1) {
        currentTutorialStep++;
        showTutorialStep();
    } else {
        endTutorial();
    }
}

function endTutorial() {
    document.querySelectorAll('.tutorial-highlight').forEach(el => el.classList.remove('tutorial-highlight'));
    const overlay = document.getElementById('tutorial-overlay');
    const box = document.getElementById('tutorial-box');
    if(overlay) overlay.classList.add('hidden');
    if(box) box.classList.add('hidden');

    const practiceModal = document.getElementById('practice-modal');
    if(practiceModal) practiceModal.classList.remove('hidden');
}

function startPracticeRound() {
    state.isPracticeRound = true;
    const practiceModal = document.getElementById('practice-modal');
    if(practiceModal) practiceModal.classList.add('hidden');
    
    // Check if we haven't loaded an event yet (if logic differs in future), load it
    const resultLog = document.getElementById('result-log');
    if (!resultLog.classList.contains('hidden')) {
        loadNextEvent();
    }
    
    addLog("Modo Práctica Activado. Este turno no afectará tus métricas.", "system");
    
    // Show banner
    const practiceBanner = document.getElementById('practice-banner');
    if(practiceBanner) practiceBanner.classList.remove('hidden');

    updateUI();
}

function endPracticeRound() {
    state.isPracticeRound = false;
    // Reset state back to initial constraints
    state.year = GAME_START_YEAR;
    state.budget = 8000;
    state.ozono = 40;   
    state.quimica = 70; 
    state.azufre = 80;  
    state.social = 50;  
    state.intervencionesRealizadas = 0; 
    state.logs = [{
        year: state.year,
        text: "He asumido el control de la biosfera. Que Dios nos ayude.",
        category: "system"
    }];
    state.quizScore = 0;
    state.quizzesAsked = 0;

    // Hide banner
    const practiceBanner = document.getElementById('practice-banner');
    if(practiceBanner) practiceBanner.classList.add('hidden');

    updateUI();
    showToast("Fin de la Práctica. Iniciando simulación real...");
    loadNextEvent();
}
