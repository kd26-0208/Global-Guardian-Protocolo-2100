// Initial Game State
const GAME_START_YEAR = 2026;
const GAME_END_YEAR = 2100;

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
    quizzesAsked: 0    // Total number of pop quizzes asked
};

// Interventions Database
const intervenciones = {
    eco: [
        {
            id: 'fomentar_quimica',
            title: 'Fomentar Producción Química',
            desc: 'Subsidios masivos para la industria pesada.',
            impact: '+$2000M, +4% Polución, -2% Ozono',
            cost: -2000, // Negative cost means profit
            effects: { ozono: -2, quimica: +4, social: +2, azufre: 1 },
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
            impact: '-$1500M, +5% Salud Ozono',
            cost: 1500,
            effects: { ozono: +5, quimica: 0, social: 0, azufre: 0 },
            msg: 'Proyecto Ozono iniciado. El escudo se fortalece.'
        },
        {
            id: 'limpiar_entidades',
            title: 'Limpiar Nuevas Entidades',
            desc: 'Filtrado molecular de micro-toxinas.',
            impact: '-$3000M, -8% Polución Química',
            cost: 3000,
            effects: { ozono: 0, quimica: -8, social: 0, azufre: 0 },
            msg: 'Limpieza profunda en curso. Integridad química mejorada.'
        },
        {
            id: 'filtros_desulf',
            title: 'Filtros de Desulfurización',
            desc: 'Modernización de chimeneas industriales.',
            impact: '-$1000M, -5% Azufre',
            cost: 1000,
            effects: { ozono: 0, quimica: 0, social: 2, azufre: -5 },
            msg: 'Filtros instalados. La lluvia ácida retrocede.'
        }
    ],
    soc: [
        {
            id: 'campana_conciencia',
            title: 'Campañas de Conciencia',
            desc: 'Marketing educativo sobre límites mundiales.',
            impact: '-$500M, +10% Aceptación Social',
            cost: 500,
            effects: { ozono: 0, quimica: 0, social: +10, azufre: 0 },
            msg: 'Población informada. Tu apoyo aumenta.'
        },
        {
            id: 'cumbre_clima',
            title: 'Cumbre del Clima',
            desc: 'Alianza global por la biosfera.',
            impact: '-$2000M, +3% Todas las barras',
            cost: 2000,
            effects: { ozono: +3, quimica: -3, social: +5, azufre: -2 },
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
        correct: 1
    },
    {
        cat: 'azufre',
        q: '¿Qué compuesto derivado del azufre oceánico ayuda a formar nubes y actúa como termostato planetario?',
        options: ['A) Dióxido de Azufre (SO2)', 'B) Sulfuro de Hidrógeno (H2S)', 'C) Dimetilsulfuro (DMS)'],
        correct: 2
    },
    {
        cat: 'azufre',
        q: '¿Cómo participa la combustión fósil en la ruptura del ciclo del azufre?',
        options: ['A) Incrementa su asimilación por plantas.', 'B) Libera SO2 que forma ácido sulfúrico (lluvia ácida).', 'C) Reduce el H2S en los humedales.'],
        correct: 1
    },
    {
        cat: 'azufre',
        q: '¿Qué efecto devastador e invisible tiene la lluvia ácida al tocar el suelo de los bosques?',
        options: ['A) Convierte las raíces en piedra.', 'B) Disuelve nutrientes vitales y activa metales tóxicos (aluminio).', 'C) Aumenta la temperatura del subsuelo drásticamente.'],
        correct: 1
    },
    {
        cat: 'azufre',
        q: 'En ambientes anóxicos (sin oxígeno), ¿qué gas con olor a "huevo podrido" producen las bacterias reductoras?',
        options: ['A) Sulfuro de Hidrógeno (H2S)', 'B) Ozono (O3)', 'C) Ácido Sulfúrico (H2SO4)'],
        correct: 0
    },
    {
        cat: 'azufre',
        q: 'Biológicamente, ¿para qué es vital asimilar el azufre del ambiente?',
        options: ['A) Producción de clorofila.', 'B) Fortalecer el esqueleto.', 'C) Formación de proteínas y aminoácidos.'],
        correct: 2
    },
    // Ozono (4)
    {
        cat: 'ozono',
        q: '¿En qué capa de la atmósfera se encuentra el "escudo" o capa de ozono?',
        options: ['A) Troposfera', 'B) Mesosfera', 'C) Estratosfera'],
        correct: 2
    },
    {
        cat: 'ozono',
        q: '¿Qué energía natural divide el oxígeno (O2) para formar ozono (O3)?',
        options: ['A) Radiación Infrarroja', 'B) Radiación Ultravioleta (UV)', 'C) Vientos polares'],
        correct: 1
    },
    {
        cat: 'ozono',
        q: '¿Qué liberan los CFCs en la alta atmósfera que actúa destruyendo miles de moléculas de ozono?',
        options: ['A) Un átomo de Cloro', 'B) Un átomo de Carbono', 'C) Un átomo de Hidrógeno'],
        correct: 0
    },
    {
        cat: 'ozono',
        q: 'A nivel biológico, ¿cuál es el daño más grave que previene la existencia del ozono?',
        options: ['A) Evaporación oceánica.', 'B) Mutaciones de ADN, cáncer y la muerte del fitoplancton.', 'C) Rayos gamma.'],
        correct: 1
    },
    // Química (4)
    {
        cat: 'quimica',
        q: '¿Qué define a las "Nuevas Entidades" en los límites planetarios?',
        options: ['A) Especies exóticas mutadas.', 'B) Químicos sintéticos masivos que la naturaleza no puede degradar.', 'C) Enfermedades de transmisión hídrica.'],
        correct: 1
    },
    {
        cat: 'quimica',
        q: '¿Cómo se llama el proceso donde un tóxico se absorbe MÁS RÁPIDO de lo que el ser vivo lo elimina?',
        options: ['A) Biomagnificación', 'B) Bioacumulación', 'C) Biodegradación'],
        correct: 1
    },
    {
        cat: 'quimica',
        q: '¿Qué significa la "Biomagnificación" en una cadena alimentaria (trófica)?',
        options: ['A) Que los depredadores tope concentran dosis multiplicadas letales del tóxico.', 'B) Que las toxinas desaparecen al llegar a humanos.', 'C) Que los virus se vuelven más grandes.'],
        correct: 0
    },
    {
        cat: 'quimica',
        q: 'Uno de los impactos letales de los residuos farmacéuticos y plásticos en animales es que actúan como...',
        options: ['A) Estimulantes musculares.', 'B) Depresores respiratorios.', 'C) Disruptores endocrinos (alteran desarrollo hormonal y reproductivo).'],
        correct: 2
    }
];

// Event Database
const events = [
    {
        title: "FRÍO TÓXICO",
        description: "El nuevo refrigerante HFOX-9 es un éxito comercial rotundo que ha detenido la erosión inmediata de la capa de ozono. Sin embargo, informes clasificados de GAIA-9 revelan un efecto secundario catastrófico: sus subproductos químicos son 'eternos' y están precipitando con la lluvia en las reservas de agua dulce. Las olas de calor abrasadoras, intensificadas por la falta de humedad, tienen a la población al borde del motín.",
        decisions: [
            {
                text: "[VÍA ECONÓMICA] Subsidiar HFOX-9.",
                cost: 2000,
                effects: { ozono: +10, quimica: +20, social: +10, azufre: 0 },
                result: "El mercado se estabiliza y el público respira aliviado bajo el aire acondicionado. Sin embargo, las biopsias globales muestran que el 98% de la población ahora tiene trazas de HFOX-9 en su torrente sanguíneo. La integridad química del planeta se tambalea."
            },
            {
                text: "[VÍA RADICAL] Prohibir HFOX-9. Usar propano.",
                cost: 1500,
                effects: { ozono: -10, quimica: -5, social: -20, azufre: 0 },
                result: "La prohibición genera una crisis de suministros. Una serie de explosiones domésticas accidentales por el uso de propano mal gestionado incendia el ánimo social. Mientras tanto, el mercado negro de CFCs viejos resurge, perforando de nuevo el cielo."
            },
            {
                text: "[VÍA TECNOLÓGICA] HFOX-9 + Filtrado Molecular.",
                cost: 7500,
                effects: { ozono: +10, quimica: -10, social: +5, azufre: 0 },
                result: "Una hazaña de ingeniería sin precedentes. Instalamos nanocrifiltros en las principales cuencas hidrográficas. Logramos el beneficio del refrigerante sin la condena química, aunque las arcas de la Autoridad Global han quedado exhaustas."
            }
        ]
    },
    {
        title: "ERUPCIÓN EN LA BOLSA",
        description: "Las cosechas de trigo en el hemisferio norte han fallado por tercer año consecutivo. El hambre desestabiliza a las naciones. Un consorcio de lobistas industriales propone una 'solución rápida': inyectar megatoneladas de aerosoles de azufre en la estratosfera para crear un escudo solar artificial. El riesgo es una alteración irreversible del ciclo del agua y lluvias ácidas letales.",
        decisions: [
            {
                text: "[VÍA ECONÓMICA] Inyección Estratosférica Privada.",
                cost: 0,
                effects: { azufre: +15, quimica: 0, social: +15, ozono: -10 },
                result: "El cielo se vuelve de un tono lechoso permanente. La temperatura baja y los mercados se calman, pero los sensores detectan una caída drástica en el pH de las lluvias globales. Las infraestructuras de concreto comienzan a descascararse por la acidez."
            },
            {
                text: "[VÍA RADICAL] Arrestar a los Bio-Hackers.",
                cost: 2000,
                effects: { azufre: -5, quimica: 0, social: -15, ozono: 0 },
                result: "La ley se impone, pero no alimenta a la gente. Al detener los proyectos de geoingeniería, las temperaturas siguen subiendo, incinerando lo que queda de la agricultura tradicional. El descontento social se vuelve violento en las calles."
            },
            {
                text: "[VÍA TECNOLÓGICA] Dispersión Orbital de Carbonato.",
                cost: 6500,
                effects: { azufre: -10, quimica: +5, social: +10, ozono: +5 },
                result: "Utilizamos polvo de diamante sintético y calcita. Es un enfriamiento 'limpio' que no genera acidez e incluso ayuda a neutralizar gases ácidos residuales. El mundo nos aplaude por salvar el cielo sin envenenar la tierra, a pesar del coste astronómico."
            }
        ]
    },
    {
        title: "PLÁSTICO INTELIGENTE",
        description: "La industria de consumo ha lanzado el 'Bio-Polymer-X', un plástico que se auto-repara y es prácticamente indestructible. Sin embargo, GAIA-9 ha identificado que estas 'nuevas entidades' están mutando al contacto con enzimas marinas, creando una red de priones sintéticos que atacan el sistema nervioso de la fauna oceánica. Es una plaga química invisible.",
        decisions: [
            {
                text: "[VÍA ECONÓMICA] Ignorar el informe de GAIA-9.",
                cost: -500,
                effects: { quimica: +25, social: +10, ozono: 0, azufre: 0 },
                result: "El auge económico es innegable. Los productos son baratos y duraderos. Pero en los puertos, miles de aves y peces mueren con espasmos neurológicos. Los océanos se están convirtiendo en una sopa de polímeros tóxicos."
            },
            {
                text: "[VÍA RADICAL] Cuarentena Naval y Prohibición.",
                cost: 4000,
                effects: { quimica: -15, social: -25, ozono: 0, azufre: 0 },
                result: "La economía se detiene en seco. Los estantes de los supermercados se vacían y estallan motines por la escasez. Pero el flujo de polímeros al mar se corta radicalmente. La biosfera marina tiene una oportunidad, si la sociedad sobrevive a la hambruna."
            },
            {
                text: "[VÍA TECNOLÓGICA] Desarrollar Enzima Depredadora.",
                cost: 5500,
                effects: { quimica: -20, social: 0, ozono: -5, azufre: 0 },
                result: "Desplegamos una bacteria genéticamente modificada para 'comer' el plástico. La limpieza es efectiva, pero un subproducto gaseoso de la digestión bacteriana asciende a la estratosfera, atacando ligeramente las moléculas de ozono. Un mal menor por un mar limpio."
            }
        ]
    },
    {
        title: "GUERRA DEL CARBÓN SUCIO",
        description: "En medio de una crisis energética, varias naciones han reactivado termoeléctricas de carbón de mediados del siglo XX. No tienen filtros, no tienen escrúpulos. El aire de las megaciudades se ha vuelto una sopa amarilla de dióxido de azufre. La visibilidad es de apenas unos metros y los hospitales están saturados de casos de insuficiencia respiratoria.",
        decisions: [
            {
                text: "[VÍA ECONÓMICA] Multar a las Energéticas.",
                cost: -1500,
                effects: { azufre: +20, social: -10, quimica: +10, ozono: -5 },
                result: "Ingresamos fondos masivos por las multas, dinero que necesitamos desesperadamente. Pero la gente respira veneno. El azufre troposférico se dispara, y la lluvia ácida resultante está disolviendo monumentos y selvas por igual."
            },
            {
                text: "[VÍA RADICAL] Apagón Forzado de Plantas.",
                cost: 2500,
                effects: { azufre: -20, social: -30, quimica: 0, ozono: 0 },
                result: "Corte total de energía. El aire se limpia en 48 horas, revelando un cielo azul que muchos jóvenes no habían visto. Sin embargo, la falta de electricidad en hospitales y hogares causa una tragedia social. Tu apoyo cae al abismo."
            },
            {
                text: "[VÍA TECNOLÓGICA] Modernización Flash de Filtros.",
                cost: 6000,
                effects: { azufre: -15, social: +15, quimica: -5, ozono: 0 },
                result: "Asumimos el coste total de instalar filtros de grafeno en cada chimenea. La polución cae, la energía sigue fluyendo y la gente celebra tu liderazgo visionario. Has convertido una crisis industrial en un triunfo ambiental."
            }
        ]
    },
    {
        title: "EL DESPERTAR DE SIBERIA",
        description: "El permafrost se ha fracturado. No es solo metano lo que escapa; depósitos geológicos de CFCs naturales y gases prehistóricos están siendo liberados masivamente. GAIA-9 detecta un 'punto ciego' en el Ártico donde la capa de ozono simplemente está dejando de existir. La tundra se está convirtiendo en un volcán químico frío.",
        decisions: [
            {
                text: "[VÍA ECONÓMICA] Reasentamiento de Comunidades.",
                cost: 2000,
                effects: { ozono: -20, social: -5, quimica: 0, azufre: +10 },
                result: "Salvamos las vidas de los habitantes locales de los gases tóxicos. Pero no hacemos nada para detener la fuga. El agujero de ozono ártico se expande hasta cubrir Europa, quemando los campos con radiación UV extrema."
            },
            {
                text: "[VÍA RADICAL] Bombardeo de 'Sellado Térmico'.",
                cost: 4500,
                effects: { ozono: -5, social: -20, quimica: +15, azufre: +15 },
                result: "Explosiones termobáricas colapsan el suelo para sellar las grietas. La fuga se detiene, pero las nubes de polvo y químicos levantadas por las detonaciones oscurecen el hemisferio norte, sumiendo a las naciones en un invierno artificial tóxico."
            },
            {
                text: "[VÍA TECNOLÓGICA] Torres de Criocaptura.",
                cost: 7000,
                effects: { ozono: 0, social: +10, quimica: -5, azufre: -5 },
                result: "Un despliegue de torres que congelan el aire y atrapan los gases fugitivos en estado sólido. Es una solución elegante y costosa que resella el permafrost sintéticamente. El mundo mira con asombro cómo dominamos la geología misma."
            }
        ]
    },
    {
        title: "GRANJAS DE ALGAS MUTANTES",
        description: "Investigadores proponen liberar una cepa de algas 'Hyper-Absorber' capaces de digerir microplásticos y metales pesados. Sin embargo, su crecimiento es tan agresivo que podrían alterar irrevocablemente el fitoplancton natural. Los océanos podrían volverse una masa verde sintética.",
        decisions: [
            {
                text: "[VÍA ECONÓMICA] Licenciar a Corporaciones Marinas.",
                cost: -2500,
                effects: { quimica: -5, social: +5, ozono: 0, azufre: 0 },
                result: "Las empresas limpian los mares para vender el alga como biocombustible. La química mejora levemente, pero el control sobre el ecosistema marino ahora pertenece a los consejos de administración, no a la ciencia."
            },
            {
                text: "[VÍA TECNOLÓGICA] Protocolo de Absorción Controlada.",
                cost: 5000,
                effects: { quimica: -20, social: +10, ozono: 0, azufre: 0 },
                result: "Desplegamos algas con un 'interruptor genético' que las mata tras absorber un límite de toxinas. Logramos una purga masiva de nuevas entidades sin arriesgar el colapso biológico del océano. Un triunfo de la biotecnología ética."
            }
        ]
    },
    {
        title: "CUMBRE DE LAS NACIONES ROTAS",
        description: "El apoyo social se desmorona a medida que los recursos escasean. Líderes de todo el mundo exigen una celebración que devuelva la esperanza, un 'Festival del Planeta Tierra'. Pero los fondos son limitados y el aire sigue siendo tóxico. ¿Priorizamos la moral o la supervivencia biológica?",
        decisions: [
            {
                text: "[VÍA SOCIAL] Gran Gala de la Unity Global.",
                cost: 1500,
                effects: { social: +30, ozono: 0, quimica: 0, azufre: 0 },
                result: "Durante una semana, el mundo olvida sus penurias. Las plazas se llenan y tu popularidad alcanza niveles históricos. Esta esperanza podría ser el motor que necesitamos para los años difíciles que vienen."
            },
            {
                text: "[VÍA ECONÓMICA] Cancelar y Desviar Fondos.",
                cost: -1500,
                effects: { social: -20, ozono: 0, quimica: 0, azufre: 0 },
                result: "Ahorramos dinero crucial, pero el ánimo global se hunde en la apatía. La gente deja de creer en el proyecto de la Autoridad Global, viéndolo como una fría máquina burocrática preocupada solo por los números."
            }
        ]
    },
    // === CICLO DEL AZUFRE ===
    {
        title: "EL PANTANO DE HUEVOS PODRIDOS",
        description: "Sensores de GAIA-9 alertan: en los humedales industriales del delta del Ganges, la actividad anaeróbica ha disparado los niveles de Sulfuro de Hidrógeno (H₂S) a concentraciones letales. El olor a 'huevos podridos' reportado por la población local augura una crisis de toxicidad masiva. Si el H₂S no es oxidado, se convertirá en ácido sulfhídrico en contacto con la humedad pulmonar.",
        decisions: [
            {
                text: "[VÍA INDUSTRIAL] Instalar bombas de oxígeno masivas.",
                cost: 3500,
                effects: { azufre: -10, social: +10, quimica: -5, ozono: 0 },
                result: "La inyección masiva de oxígeno oxida el H₂S en azufre elemental sólido, inofensivo y almacenable. El ecosistema del humedal comienza a respirar. El coste energético fue enorme, pero la crisis está contenida."
            },
            {
                text: "[VÍA BIOLÓGICA] Desplegar bacterias quimiolitótrofas oxidantes.",
                cost: 1500,
                effects: { azufre: -6, social: +5, quimica: +5, ozono: 0 },
                result: "Las bacterias Thiobacillus consumen el H₂S y lo convierten en sulfatos. El proceso es lento y libera trazas de otros compuestos, pero es un éxito parcial. La solución verde tiene un coste biológico menor pero resultados menos predecibles."
            },
            {
                text: "[VÍA SOCIAL] Evacuar la zona y aislar el humedal.",
                cost: 1000,
                effects: { azufre: +5, social: -15, quimica: 0, ozono: 0 },
                result: "Se salvan vidas en el corto plazo, pero el humedal se convierte en una zona muerta. La nube de H₂S se expande lentamente hacia áreas agrícolas. El público, indignado por el abandono, retira su apoyo."
            }
        ]
    },
    {
        title: "EL DILEMA DEL CULTIVO ACIDIFICADO",
        description: "La lluvia ácida ha bajado el pH del agua de suministro a 4.2. En los invernaderos hidropónicos de Europa Central, el aluminio del sustrato se ha vuelto soluble y tóxico para las raíces. Las plantas han dejado de absorber calcio y magnesio — los aminoácidos esenciales para la síntesis proteica humana están desapareciendo de la cadena alimentaria. El hambre estructural acecha.",
        decisions: [
            {
                text: "[VÍA QUÍMICA] Titulación masiva con cal hidratada.",
                cost: 2000,
                effects: { quimica: -10, social: +10, azufre: -5, ozono: 0 },
                result: "La adición de hidróxido de calcio neutraliza el pH de vuelta a 6.5. Las raíces se recuperan y la absorción de nutrientes se restablece. Los invernaderos vuelven a producir a plena capacidad. Un triunfo de la química aplicada."
            },
            {
                text: "[VÍA TECNOLÓGICA] Instalar sistemas de Osmosis Inversa en agua.",
                cost: 4500,
                effects: { quimica: -15, social: +15, azufre: 0, ozono: 0 },
                result: "La membrana de osmosis filtra todos los iones ácidos. El agua queda perfectamente regulada para el cultivo. Además, el sistema sirve para monitorear futuras acidificaciones en tiempo real. La solución más cara resultó ser la más duradera."
            },
            {
                text: "[VÍA ECONÓMICA] Importar alimentos mientras dure la crisis.",
                cost: 3000,
                effects: { quimica: +5, social: -10, azufre: 0, ozono: 0 },
                result: "Los mercados se abastecen temporalmente, pero la dependencia alimentaria externa dispara los precios. El suelo sigue acidificándose sin tratamiento. El problema se postergó, no se resolvió, y la deuda química sigue creciendo."
            }
        ]
    },
    {
        title: "MINERÍA EN LA LITOSFERA",
        description: "Las reservas de azufre para medicamentos y fertilizantes están al límite crítico. GAIA-9 ha localizado una veta de pirita y yeso en cuevas profundas del Ural. El problema: el azufre sedimentario está 'atrapado' en el ciclo lento de la roca. Para liberarlo a tiempo, necesitamos intervención biotecnológica que acelere procesos geológicos de millones de años.",
        decisions: [
            {
                text: "[VÍA BIOLÓGICA] Introducir bacterias oxidantes en la roca.",
                cost: 2500,
                effects: { azufre: -8, quimica: -5, social: +5, ozono: 0 },
                result: "Las bacterias Acidithiobacillus ferrooxidans liberan sulfatos solubles que son transportados en tanques. El suministro de azufre se estabiliza con un impacto ecológico mínimo — el río cercano muestra leve acidificación, pero dentro de los límites controlables."
            },
            {
                text: "[VÍA INDUSTRIAL] Extracción química acelerada con ácido.",
                cost: 1000,
                effects: { azufre: -12, quimica: +20, social: -5, ozono: 0 },
                result: "La lixiviación ácida extrae el azufre rápidamente, pero la sobre-acidificación del río cercano mata el 60% de la fauna piscícola. Hemos ganado azufre pero perdido otra fuente de proteínas. La comunidad científica nos condena."
            },
            {
                text: "[VÍA SINTÉTICA] Sintetizar azufre mediante desulfuración del petróleo.",
                cost: 4000,
                effects: { azufre: -10, quimica: -8, social: 0, ozono: -3 },
                result: "Los procesos Claus y Scot en refinerías capturan el SO₂ de los combustibles fósiles y lo convierten en azufre elemental puro. El suministro se cubre sin tocar el ecosistema. El proceso consume energía y emite ligeramente a la estratosfera."
            }
        ]
    },
    {
        title: "EL REGULADOR CLIMÁTICO OCEÁNICO",
        description: "El fitoplancton está muriendo. Las temperaturas oceánicas superficiales superan los 32°C y las algas microscópicas — que producen el Dimetilsulfuro (DMS) que forma las nubes — están desapareciendo. Sin estas nubes, la radiación solar aumenta, el plancton muere aún más rápido. Un bucle de retroalimentación positiva que podría crear un 'océano espejo' que acelere el calentamiento global.",
        decisions: [
            {
                text: "[VÍA ECOLÓGICA] Fertilización oceánica con hierro y nutrientes.",
                cost: 3000,
                effects: { azufre: -8, ozono: +5, social: +10, quimica: +5 },
                result: "El 'bloom' de fitoplancton inducido libera DMS a la atmósfera. Los compuestos de azufre actúan como núcleos de condensación, formando nubes que reflejan el 5% adicional de luz solar. Las temperaturas bajan en el área tratada. Un éxito frágil pero esperanzador."
            },
            {
                text: "[VÍA TECNOLÓGICA] Desplegar pantallas solares flotantes.",
                cost: 5500,
                effects: { ozono: +3, azufre: 0, social: +5, quimica: -5 },
                result: "Enormes láminas reflectantes de polímero cubren zonas críticas del océano. El plancton tiene tiempo para recuperarse bajo la sombra artificial. Caro y polémico, pero funciona y evita interferir directamente con la bioquímica oceánica."
            },
            {
                text: "[VÍA RADICAL] Enfriar océanos con bombas de agua profunda.",
                cost: 2000,
                effects: { ozono: 0, azufre: -5, social: -10, quimica: +10 },
                result: "Las bombas mezclan aguas frías profundas con la superficie. El choque térmico mata más plancton del que salva. Los sedimentos del fondo contienen metales pesados que contaminan la columna de agua. La medicina fue peor que la enfermedad."
            }
        ]
    },
    // === AGOTAMIENTO DEL OZONO ===
    {
        title: "EL CENTINELA DE LA ESTRATÓSFERA",
        description: "La estación de monitoreo SONDA-7 a 25km de altitud registra 264 Unidades Dobson — por debajo del umbral crítico de 277,4 UD establecido por los Límites Planetarios. La fotólisis natural no basta: necesitamos intervenir para catalizar la producción de O₃. Un volcán en el Pacífico Sur acaba de entrar en erupción, y sus aerosoles de sulfato facilitarán que el cloro residual de viejos CFCs destruya cada molécula de ozono que creemos.",
        decisions: [
            {
                text: "[VÍA CIENTÍFICA] Espejos satelitales para catalizar fotólisis de O₂.",
                cost: 6000,
                effects: { ozono: +20, quimica: +5, social: +10, azufre: 0 },
                result: "Los espejos concentran radiación UV para romper O₂ en átomos libres que forman O₃. El proceso es increíblemente eficiente. La nube volcánica destruye parte del ozono creado, pero el saldo neto es positivo. Las 277 UD se alcanzan de nuevo en 18 meses."
            },
            {
                text: "[VÍA QUÍMICA] Neutralizar aerosoles volcánicos con carbonato.",
                cost: 3500,
                effects: { ozono: +12, quimica: -5, social: +5, azufre: -5 },
                result: "Se dispersan nanopartículas de carbonato de calcio para neutralizar los aerosoles de azufre volcánico antes de que activen el cloro residual. El ozono natural tiene espacio para recuperarse. No es la solución más rápida, pero es la más sostenible."
            },
            {
                text: "[VÍA RADICAL] Bombardear la nube volcánica con agentes oxidantes.",
                cost: 2000,
                effects: { ozono: +5, quimica: +15, social: -15, azufre: +10 },
                result: "El bombardeo químico dispersa parcialmente los aerosoles, pero la reacción genera subproductos inesperados que empeoran temporalmente la química estratosférica. El mundo condena la acción unilateral sobre el clima global. El ozono sube levemente, pero a un coste diplomático enorme."
            }
        ]
    },
    {
        title: "LA HERENCIA DE LOS CFC",
        description: "Han pasado 4 años desde la prohibición total de refrigerantes antiguos y aerosoles. Sin embargo, GAIA-9 confirma que el ozono sigue cayendo. Los ciudadanos exigen explicaciones: ¿para qué sirvió el sacrificio económico? Lo que no entienden es que las sustancias que agotan el ozono tardan entre 2 y 5 años en ser transportadas desde la troposfera hasta la estratosfera. La fe en la ciencia —y en tu gobierno— está en juego.",
        decisions: [
            {
                text: "[VÍA DIPLOMÁTICA] Campaña de transparencia científica global.",
                cost: 1000,
                effects: { social: +20, ozono: +5, quimica: 0, azufre: 0 },
                result: "Lanzamos sondas de monitoreo en vivo y acceso público a los datos de transporte atmosférico. La ciudadanía comprende el rezago natural del proceso. La confianza se restaura y la coalición ambiental se fortalece con apoyo popular masivo."
            },
            {
                text: "[VÍA TECNOLÓGICA] Desarrollar captores de N₂O en granjas.",
                cost: 4500,
                effects: { ozono: +15, social: +5, quimica: -8, azufre: 0 },
                result: "El Óxido Nitroso es el principal agente actual de agotamiento del ozono. Los captores biológicos en granjas y arrozales eliminan el N₂O en origen. Los resultados tardan pero son permanentes. La cadena causal finalmente se corta."
            },
            {
                text: "[VÍA ADAPTATIVA] Crear refugios UV para ecosistemas marinos.",
                cost: 2500,
                effects: { ozono: 0, social: +10, quimica: -5, azufre: 0 },
                result: "Instalamos coberturas de filtro UV sobre arrecifes de coral y viveros de plancton mientras el ozono se recupera solo. La naturaleza tiene tiempo para sobrevivir el periodo de transición. No solucionamos el problema, pero evitamos el colapso biológico mientras esperamos."
            }
        ]
    },
    {
        title: "EL VÓRTICE DEL HEMISFERIO SUR",
        description: "El agujero de ozono antártico ha alcanzado un récord histórico. El vórtice polar fortalecido ha desplazado los cinturones de viento del hemisferio sur, causando una cascada de catástrofes simultáneas: el nivel del mar sube en costas del Pacífico, olas de calor propagan incendios en la Patagonia, y lluvias torrenciales devastan Buenos Aires. Tres frentes, un solo comando.",
        decisions: [
            {
                text: "[VÍA SOCIAL] Gestión de emergencias por zonas con la población.",
                cost: 2000,
                effects: { ozono: 0, social: +20, azufre: -5, quimica: 0 },
                result: "Movilizamos redes ciudadanas de respuesta rápida en las tres zonas. Las comunidades locales construyen diques, cortan zonas de fuego y despejan drenajes. La cohesión social alcanza su cénit. El daño material es alto, pero la pérdida humana es mínima."
            },
            {
                text: "[VÍA TECNOLÓGICA] Intervención climática para reducir forzamiento radiativo.",
                cost: 6500,
                effects: { ozono: +10, social: +10, azufre: -8, quimica: -5 },
                result: "Controlamos emisiones de CO₂ y metano en tiempo real, reduciendo el forzamiento radiativo neto. Los cinturones de viento recuperan gradualmente su posición. Es una solución a largo plazo que compra tiempo al Protocolo de Montreal para sanar el ozono."
            },
            {
                text: "[VÍA ECONÓMICA] Reconstrucción post-catástrofe con fondos de emergencia.",
                cost: -2000,
                effects: { ozono: -5, social: -10, azufre: +5, quimica: +5 },
                result: "Optamos por recibir deuda climática internacional. Se reconstruye lo destruido, pero no se atacan las causas. El vórtice polar sigue fortaleciéndose. Hemos comprado tiempo con dinero prestado y promesas que el planeta no puede cumplir sin acción real."
            }
        ]
    },
    // === POLUCIÓN QUÍMICA / NUEVAS ENTIDADES ===
    {
        title: "EL DILEMA DEL REGULADOR",
        description: "Tu Agencia de Sustancias Químicas tiene 12,000 compuestos sin evaluar en lista de espera. El lobby energético presiona con urgencia: el 'Plastitox-7' es imprescindible para fabricar paneles solares 10 veces más baratos — la transición verde lo necesita. Pero estudios preliminares de GAIA-9 señalan que podría ser un disruptor endocrino persistente que se bioacumula en tejido graso. El dilema del siglo: ¿el clima o la salud?",
        decisions: [
            {
                text: "[VÍA ECONÓMICA] Aprobar por vía rápida con monitoreo posterior.",
                cost: -1500,
                effects: { quimica: +20, social: +10, ozono: +5, azufre: 0 },
                result: "La energía solar se abarata. Las emisiones de carbono caen. Pero en 8 años, los estudios epidemiológicos muestran alteraciones hormonales en el 30% de la población infantil. La relación causal se establece demasiado tarde. 'Plastitox-7' se convierte en sinónimo de DDT."
            },
            {
                text: "[VÍA PRECAUTORIA] Prohibir hasta evaluación completa (10 años).",
                cost: 2000,
                effects: { quimica: -15, social: -15, ozono: -3, azufre: 0 },
                result: "El Principio de Precaución se impone. La transición energética se ralentiza. El precio de la energía sube y el descontento popular crece. Pero en los glaciares de datos biológicos futuros, no hay 'Plastitox-7'. Habrás elegido la salud de los no nacidos sobre la comodidad del presente."
            },
            {
                text: "[VÍA MIXTA] Uso solo en entornos industriales cerrados.",
                cost: 1000,
                effects: { quimica: +8, social: -5, ozono: +2, azufre: 0 },
                result: "La energía solar avanza a ritmo moderado. El riesgo de filtración (20%) se materializa en algunos incidentes aislados. Los tribunales internacionales establecerán precedente sobre responsabilidad corporativa por 'riesgos conocidos aceptados'. Un equilibrio imperfecto que define jurisprudencia ambiental."
            }
        ]
    },
    {
        title: "LA PARADOJA DE LA COSECHA",
        description: "Las plagas han destruido el 40% de los cultivos de cereales en Asia Central. El hambre golpea a 400 millones de personas. La industria agroquímica ofrece el 'ClorMax-P', un plaguicida clorado de alta eficacia. Tu equipo científico advierte: este compuesto se bioacumula en aves rapaces y polinizadores, con efectos similares al DDT. Sin polinizadores, los cultivos futuros colapsan. Pero sin ClorMax, la gente muere de hambre hoy.",
        decisions: [
            {
                text: "[VÍA ECONÓMICA] Uso masivo inmediato en todas las zonas afectadas.",
                cost: -1000,
                effects: { quimica: +25, social: +15, ozono: 0, azufre: 0 },
                result: "Las plagas son erradicadas. El hambre se contiene este año. Pero en la siguiente primavera, la densidad poblacional de abejas cae un 70%. Los cultivos siguientes necesitarán polinización manual. Has resuelto el hambre de 2030 creando el hambre de 2035."
            },
            {
                text: "[VÍA ECOLÓGICA] Subvencionar bio-pesticidas y control biológico.",
                cost: 3500,
                effects: { quimica: -10, social: -15, ozono: 0, azufre: 0 },
                result: "Los depredadores naturales de las plagas muestran resultados en 18 meses. La comida sube de precio y estallan protestas. Pero el ecosistema polinizador sobrevive intacto. La narrativa cambia: has apostado por el largo plazo cuando todo urgía corto plazo."
            },
            {
                text: "[VÍA MIXTA] Rotación estricta: ClorMax en el 15% del territorio.",
                cost: 1500,
                effects: { quimica: +8, social: -5, ozono: 0, azufre: 0 },
                result: "La plaga se contiene parcialmente. El hambre baja pero no desaparece. Los polinizadores sobreviven en las zonas no tratadas y actúan como reserva biológica. Una solución imperfecta pero sostenible que la comunidad científica elogia como 'gestión de daños responsable'."
            }
        ]
    },
    {
        title: "EL EFECTO CÓCTEL",
        description: "En la costa industrial de Corea del Sur, los sensores detectan niveles de plomo, microplásticos y acrilamida en el agua marina — cada uno individualmente por debajo del límite legal. Pero la fauna marina está muriendo. GAIA-9 confirma la hipótesis: el 'efecto cóctel' o sinergia química multiplica la toxicidad combinada por un factor de 8. Las leyes actuales son ciegas ante esto.",
        decisions: [
            {
                text: "[VÍA ECONÓMICA] Ignorar: cada sustancia cumple la ley individualmente.",
                cost: -2000,
                effects: { quimica: +20, social: +5, ozono: 0, azufre: 0 },
                result: "Las industrias siguen operando libres de culpa legal. En 6 años, el ecosistema marino colapsa. Los bancos de anchoa desaparecen. La pesca industrial colapsa y el desempleo en la costa destruye a las mismas comunidades que se intentaba proteger."
            },
            {
                text: "[VÍA TECNOLÓGICA] Invertir en filtros de nanopartículas.",
                cost: 5000,
                effects: { quimica: -20, social: -10, ozono: 0, azufre: 0 },
                result: "La filtración multimembrana elimina todos los contaminantes sinérgicos. El agua recupera su pureza biológica. Los impuestos suben un 30% y las empresas amenazan con deslocalizar. El océano está limpio pero la política industrial está en llamas."
            },
            {
                text: "[VÍA RADICAL] Clausurar las industrias emisoras de los tres contaminantes.",
                cost: 3000,
                effects: { quimica: -25, social: -20, ozono: 0, azufre: 0 },
                result: "Las fábricas cierran. El agua se recupera en 3 años. Pero el desempleo regional escala al 40% y los movimientos sociales de 'justicia económica vs. justicia ambiental' sacuden el sistema político. Has ganado el océano pero perdido el consenso social."
            }
        ]
    },
    {
        title: "LA FRONTERA ABISAL",
        description: "Una empresa minera ha descubierto nódulos polimetálicos en la Fosa de las Marianas — ricos en cobalto, litio y manganeso, esenciales para baterías de nueva generación. La extracción liberará sedimentos con materiales radiactivos naturales al océano. GAIA-9 advierte: la contaminación química ya llegó al punto más profundo del planeta. Este proyecto sería la 'gota que colma el vaso' para la acidificación oceánica.",
        decisions: [
            {
                text: "[VÍA ECONÓMICA] Autorizar: los metales son críticos para el progreso verde.",
                cost: -3000,
                effects: { quimica: +25, social: +10, ozono: +5, azufre: 0 },
                result: "Las baterías se abaratan. La transición energética se acelera. Pero las columnas de sedimento radiactivo ascienden por las corrientes abisales. En 10 años, trazas de radio-226 aparecen en el plancton del Pacífico Norte. El fondo marino se ha convertido oficialmente en 'sacrificio necesario'."
            },
            {
                text: "[VÍA DIPLOMÁTICA] Liderar moratoria internacional de minería submarina.",
                cost: 2000,
                effects: { quimica: -10, social: -10, ozono: 0, azufre: 0 },
                result: "142 naciones firman el Protocolo Abisal. La minería submarina se detiene globalmente. Las grandes potencias tecnológicas te hostigan en foros internacionales. Los precios del litio se disparan. Pero el ecosistema del fondo oceánico — el más desconocido del planeta — sobrevive intacto."
            },
            {
                text: "[VÍA MIXTA] Permitir extracción con impuesto de restauración del 50%.",
                cost: 0,
                effects: { quimica: +10, social: 0, ozono: +3, azufre: 0 },
                result: "La empresa extrae y la mitad de sus ganancias se destinan a limpiar microplásticos oceánicos superficiales. La matemática resulta positiva a corto plazo: el daño en el fondo es parcialmente compensado por la limpieza en superficie. Un contrato de imperfección controlada que define la geopolítica oceánica del siglo."
            }
        ]
    },
    // === EVENTOS ADICIONALES ===
    {
        title: "LA TORMENTA DE METANO",
        description: "GAIA-9 detecta bolsas de metano antiguo liberándose desde el lecho del Mar de Kara a velocidad exponencial. El metano es 80 veces más potente que el CO₂ en los primeros 20 años. Si este proceso entra en bucle de retroalimentación, todo el trabajo de estabilización del ozono y la química podría revertirse en una generación. Tienes una ventana de 18 meses.",
        decisions: [
            {
                text: "[VÍA TECNOLÓGICA] Instalar captores de metano submarinos.",
                cost: 5500,
                effects: { ozono: +5, quimica: -8, social: +5, azufre: -5 },
                result: "Una flota de barcazas con captores de oxidación catalítica convierte el metano en CO₂ —un mal menor. El bucle se rompe. La operación deja un legado tecnológico que será estudiado durante décadas como referencia en geoingeniería oceánica."
            },
            {
                text: "[VÍA RADICAL] Sellado criogénico del lecho marino.",
                cost: 7000,
                effects: { ozono: +8, quimica: +10, social: -10, azufre: 0 },
                result: "Congelamos el lecho marino con nitrógeno líquido desde satélites. El metano queda atrapado, pero el proceso libera compuestos químicos residuales. El océano queda dañado en la zona tratada, aunque el peligro climático se neutraliza."
            },
            {
                text: "[VÍA ECONÓMICA] Vender derechos de captura a empresas energéticas.",
                cost: -2000,
                effects: { ozono: -5, quimica: +15, social: +10, azufre: 0 },
                result: "Las empresas capturan el metano para usarlo como gas natural. El incentivo económico acelera la captura, pero la quema posterior añade CO₂ y compuestos secundarios. El problema se gestiona parcialmente con ganancias a corto plazo y costos a largo plazo."
            }
        ]
    },
    {
        title: "COLAPSO DE LOS ARRECIFES",
        description: "La acidificación oceánica ha alcanzado pH 7.8 — el punto de no retorno para el carbonato de calcio que forman los arrecifes de coral. El 60% de los arrecifes del Indo-Pacífico ha blanqueado. Sin corales, las cadenas tróficas marinas se desintegran. Los arrecifes son el 'bosque tropical' del océano: albergan el 25% de todas las especies marinas.",
        decisions: [
            {
                text: "[VÍA BIOLÓGICA] Sembrar corales resistentes al calor.",
                cost: 3000,
                effects: { quimica: -10, social: +15, ozono: 0, azufre: 0 },
                result: "Cepas de coral termotolerante, cultivadas en laboratorio durante 10 años, son trasplantadas masivamente. La recuperación es lenta pero real. En 15 años, los arrecifes muestran señales de vida. La imagen de buzos sembrando corales se convierte en símbolo de esperanza global."
            },
            {
                text: "[VÍA QUÍMICA] Alcalinización oceánica localizada.",
                cost: 4500,
                effects: { quimica: -20, social: +5, ozono: 0, azufre: -3 },
                result: "Dispersamos hidróxido de magnesio en las zonas de arrecife críticas para elevar el pH localmente. Los corales existentes sobreviven y los trasplantes prosperan. El proceso requiere mantenimiento perpetuo, pero los ecosistemas marinos quedan estabilizados en las zonas tratadas."
            },
            {
                text: "[VÍA ECONÓMICA] Priorizar solo arrecifes con alto valor turístico.",
                cost: 1000,
                effects: { quimica: +5, social: -10, ozono: 0, azufre: 0 },
                result: "Se salvan 12 arrecifes 'premium' como activos económicos. El resto perece. La biodiversidad colapsa en el 85% de la zona arrecifal global. Los pescadores artesanales de 40 países pierden su sustento y el apoyo social en las costas se desintegra."
            }
        ]
    },
    {
        title: "LA GRAN SEQUÍA",
        description: "El cinturón subtropical se ha expandido 400km hacia los polos. Las regiones mediterráneas, el centro de Australia, el suroeste americano y el norte de África llevan 7 años en sequía severa. Los acuíferos fósiles — agua que tardó 10,000 años en acumularse — se agotan en años. La migración climática de 200 millones de personas está en marcha.",
        decisions: [
            {
                text: "[VÍA TECNOLÓGICA] Desalinización masiva con energía solar.",
                cost: 6000,
                effects: { social: +20, quimica: -5, ozono: 0, azufre: 0 },
                result: "Plantas de desalinización de última generación en 20 costas áridas abastecen a las megaciudades. La tecnología de membranas reduce el consumo energético en un 60% respecto a modelos anteriores. Las migraciones se detienen y la crisis de legitimidad del gobierno se disuelve."
            },
            {
                text: "[VÍA SOCIAL] Protocolo global de gestión del agua.",
                cost: 2000,
                effects: { social: -10, quimica: -8, ozono: 0, azufre: 0 },
                result: "Imponemos racionamiento estricto y redistribución de acuíferos entre naciones. Países ricos ceden reservas de agua a naciones en colapso. El resentimiento político es inevitable, pero la distribución se estabiliza. La crisis se administra; el conflicto por el agua se pospone."
            },
            {
                text: "[VÍA RADICAL] Siembra de nubes a escala continental.",
                cost: 3500,
                effects: { social: +10, quimica: +10, azufre: +5, ozono: -3 },
                result: "La siembra de nubes con yoduro de plata produce lluvias en zonas seleccionadas, pero el proceso altera los patrones de precipitación globales. Lo que llueve aquí, deja de llover allá. Varias naciones acusan a la Autoridad Global de 'robar' su lluvia en foros internacionales."
            }
        ]
    },
    {
        title: "RADIACIÓN SIN ESCUDO",
        description: "Los satélites UV de GAIA-9 registran niveles de radiación UV-B sobre las zonas polares que duplican el umbral seguro para organismos vivos. Los primeros casos de cataratas en fauna marina —delfines y focas— señalan el inicio de una cadena trófica bajo presión. En zonas de alta altitud, las cosechas de soja y trigo muestran daño en el ADN de las semillas. El escudo falla en tiempo real.",
        decisions: [
            {
                text: "[VÍA CIENTÍFICA] Programa de restauración de ozono acelerado.",
                cost: 5000,
                effects: { ozono: +25, quimica: +5, social: +10, azufre: 0 },
                result: "Combinamos captura de N₂O, dispersión de nano-catalizadores y restricciones de emergencia a los CFC residuales. El ozono polar comienza a recuperarse en 24 meses. Los niveles UV vuelven al umbral seguro con 3 años de antelación respecto a las proyecciones previas."
            },
            {
                text: "[VÍA ADAPTATIVA] Refugios UV para ecosistemas críticos.",
                cost: 2000,
                effects: { ozono: 0, social: +10, quimica: -5, azufre: 0 },
                result: "Desplegamos membranas de filtro UV sobre los arrecifes y campos agrícolas más vulnerables. La solución es cara de mantener y no soluciona el ozono, pero preserva la biodiversidad y las cosechas mientras el ciclo natural sana. Una solución de puente que salva el presente."
            },
            {
                text: "[VÍA ECONÓMICA] Invertir en cultivos resistentes a UV.",
                cost: 3000,
                effects: { ozono: -5, social: -5, quimica: +8, azufre: 0 },
                result: "Desarrollamos variedades de cereales con mayor tolerancia a la radiación. El proceso requiere ingeniería genética que genera controversia. Los cultivos se adaptan, pero los ecosistemas salvajes no tienen quien los modifique. La biodiversidad sigue cayendo mientras la agricultura se salva."
            }
        ]
    },
    {
        title: "EL COLAPSO DE LA BIODIVERSIDAD",
        description: "La tasa de extinción ha alcanzado 1,000 veces la tasa natural de fondo. El 'Gran Silencio Biológico' avanza: los polinizadores salvajes caen un 40% por la combinación de pesticidas, destrucción de hábitats y cambio climático. Sin polinizadores, un tercio de los alimentos globales desaparece. La humanidad ha construido su civilización sobre una red biológica que ahora se deshilacha.",
        decisions: [
            {
                text: "[VÍA ECOLÓGICA] Red Global de Corredores Biológicos.",
                cost: 4000,
                effects: { quimica: -10, social: +15, ozono: +3, azufre: -3 },
                result: "Conectamos reservas naturales fragmentadas con corredores de vegetación. Los polinizadores recuperan rutas migratorias. Las poblaciones de abejas silvestres aumentan un 30% en las zonas tratadas. La recuperación es lenta pero autosostenida: la naturaleza hace el trabajo si le damos espacio."
            },
            {
                text: "[VÍA TECNOLÓGICA] Polinización robótica a gran escala.",
                cost: 5000,
                effects: { quimica: 0, social: +5, ozono: 0, azufre: 0 },
                result: "Millones de micro-drones del tamaño de un abejorro polinizan campos y ecosistemas clave. Funcionan, pero la dependencia tecnológica para mantener algo tan básico como la reproducción vegetal genera una fragilidad nueva. Si el sistema falla, no hay plan B biológico."
            },
            {
                text: "[VÍA RADICAL] Banco Global de Semillas y ADN ampliado.",
                cost: 2500,
                effects: { quimica: -5, social: +5, ozono: 0, azufre: 0 },
                result: "Almacenamos en permafrost y en servidores distribuidos el ADN de 2 millones de especies. No salvamos las especies, pero preservamos el plano para reconstruirlas. Es una apuesta de que la civilización sobrevivirá el colapso y podrá dar marcha atrás. Un archivo de últimos recursos."
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
let currentEventIndex = 0;

// Text sequences for the introduction
const introTextSequence = [
    "ESTABLECIENDO CONEXIÓN CON SATÉLITE GAIA-9...\n",
    "CARGANDO DATOS DE LA BIOSFERA...\n",
    "ALERTA: CRUCE DE LÍMITES PLANETARIOS DETECTADO.\n\n",
    "🛰️ INFORME DE MISIÓN: ESTADO DE EMERGENCIA GLOBAL\nFECHA: 12 de marzo de 2026\n\n",
    "DE: Inteligencia Artificial de Monitoreo Planetario (GAIA-9)\n\n",
    "PARA: Comisionado(a) de la Biosfera [DIRECTOR]\n\n",
    "EL CONTEXTO:\nEl 'Gran Colapso Silencioso' ha comenzado. Tras décadas de ignorar las señales, los límites que sostienen la vida en la Tierra se han fracturado simultáneamente. No es solo el clima; es la química misma de nuestra existencia la que se está desmoronando.\n\n",
    "LA CRISIS ACTUAL:\nEl Escudo se desvanece: Los nuevos gases industriales han reabierto el agujero de la capa de Ozono. La radiación UV está quemando las cosechas y cegando a las especies migratorias. El cielo ya no nos protege.\n\n",
    "El Ciclo Roto: La quema masiva de combustibles sucios ha saturado la atmósfera de Azufre. Las nubes ahora escupen lluvia ácida que está disolviendo los nutrientes del suelo y convirtiendo los bosques en cementerios de madera muerta.\n\n",
    "La Invasión Invisible: Miles de Nuevas Entidades (químicos sintéticos y microplásticos) han saturado cada rincón del planeta. Están en el agua, en la sangre de los recién nacidos y en el código genético de la vida. La incertidumbre química es total.\n\n",
    "TU MISIÓN:\nLos gobiernos del mundo han colapsado bajo la presión de las crisis sociales. En un acto de desesperación, se ha creado la Autoridad Global de la Biosfera.\n\n",
    "Te hemos elegido a ti. No porque seas un político, sino porque tienes la capacidad de ver la Tierra como un solo organismo. Tu objetivo es simple pero casi imposible: Estabilizar estos tres pilares y guiar a la humanidad hasta el año 2100.\n\n",
    "Si fallas, no solo caerá la economía; caerá la biología.\n\n",
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
let btnShowCodex;
let btnCloseCodex;
let codexModal;

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
    // Collect DOM Elements
    startScreen = document.getElementById('start-screen');
    btnThemeDark = document.getElementById('btn-theme-dark');
    btnThemeGirly = document.getElementById('btn-theme-girly');
    btnThemeEco = document.getElementById('btn-theme-eco');
    btnBeginIntro = document.getElementById('btn-begin-intro');

    terminalIntroScreen = document.getElementById('terminal-intro-screen');
    introTextEl = document.getElementById('intro-text');
    btnSkipIntro = document.getElementById('btn-skip-intro');
    btnAcceptMission = document.getElementById('btn-accept-mission');
    inductionScreen = document.getElementById('induction-screen');
    gameScreen = document.getElementById('game-screen');
    endScreen = document.getElementById('end-screen');

    btnStart = document.getElementById('btn-start');
    currentYearEl = document.getElementById('current-year');
    currentBudgetEl = document.getElementById('current-budget');
    btnShowCodex = document.getElementById('btn-show-codex');
    btnCloseCodex = document.getElementById('btn-close-codex');
    codexModal = document.getElementById('codex-modal');

    btnShowMandato = document.getElementById('btn-show-mandato');
    btnCloseMandato = document.getElementById('btn-close-mandato');
    mandatoModal = document.getElementById('mandato-modal');
    mandatoContent = document.getElementById('mandato-content');
    interventionsLeftEl = document.getElementById('interventions-left');
    tabBtns = document.querySelectorAll('.tab-btn');
    notificationToast = document.getElementById('notification-toast');
    gameLogEl = document.getElementById('game-log');

    barOzono = document.getElementById('bar-ozono');
    barQuimica = document.getElementById('bar-quimica');
    barAzufre = document.getElementById('bar-azufre');
    barSocial = document.getElementById('bar-social');

    valOzono = document.getElementById('val-ozono');
    valQuimica = document.getElementById('val-quimica');
    valAzufre = document.getElementById('val-azufre');
    valSocial = document.getElementById('val-social');

    eventTitle = document.getElementById('event-title');
    eventDesc = document.getElementById('event-description');
    decisionsContainer = document.getElementById('decisions-container');
    resultLog = document.getElementById('result-log');
    resultText = document.getElementById('result-text');
    btnNextYear = document.getElementById('btn-next-year');

    // Attach Event Listeners
    
    // Theme selection
    btnThemeDark.addEventListener('click', () => setTheme('dark'));
    btnThemeGirly.addEventListener('click', () => setTheme('girly'));
    btnThemeEco.addEventListener('click', () => setTheme('eco'));

    // Start Flow
    btnBeginIntro.addEventListener('click', transitionToIntro);

    // Skip Intro
    btnSkipIntro.addEventListener('click', skipTypewriterAnimation);

    btnAcceptMission.addEventListener('click', showInductionManual);
    btnStart.addEventListener('click', startGame);
    btnNextYear.addEventListener('click', advanceYear);

    // Learning Module Logic
    const lessonBtns = document.querySelectorAll('.lesson-tab-btn');
    const lessonContents = document.querySelectorAll('.lesson-content');
    let lessonsRead = { azufre: false, quimica: false, ozono: false };
    
    // Mark first tab as read initially
    lessonsRead['ozono'] = true;
    document.querySelector('.lesson-tab-btn[data-lesson="ozono"]').classList.add('read');

    lessonBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update UI
            lessonBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            btn.classList.add('read');
            
            // Show content
            lessonContents.forEach(c => c.classList.add('hidden'));
            document.getElementById(`lesson-${btn.dataset.lesson}`).classList.remove('hidden');

            // Track read status
            lessonsRead[btn.dataset.lesson] = true;
            
            // Unlock start button if all read
            if(lessonsRead.ozono && lessonsRead.quimica && lessonsRead.azufre) {
                btnStart.disabled = false;
                btnStart.classList.add('blink');
                btnStart.innerText = "ENTRENAMIENTO COMPLETADO. INICIAR SIMULACIÓN [2026]";
            }
        });
    });

    // Codex Modal Logic
    btnShowCodex.addEventListener('click', () => {
        codexModal.classList.remove('hidden');
    });

    btnCloseCodex.addEventListener('click', () => {
        codexModal.classList.add('hidden');
    });

    codexModal.addEventListener('click', (e) => {
        if (e.target === codexModal) {
            codexModal.classList.add('hidden');
        }
    });

    // Command Center logic
    btnShowMandato.addEventListener('click', openMandato);
    btnCloseMandato.addEventListener('click', () => mandatoModal.classList.add('hidden'));
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderMandatoTab(btn.dataset.tab);
        });
    });

    mandatoModal.addEventListener('click', (e) => {
        if (e.target === mandatoModal) mandatoModal.classList.add('hidden');
    });
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
                setTimeout(typeWriter, 40); // 40ms per character
            } else {
                sequenceIndex++;
                charIndex = 0;
                setTimeout(typeWriter, 500); // Wait between paragraphs
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
            optionsContainer.style.display = 'none';

            if (index === question.correct) {
                state.quizScore++;
                state.budget += 1000;
                resultText.innerText = "✅ ¡Respuesta Correcta! Bono de $1,000M añadido al presupuesto.";
                resultText.style.color = "var(--color-success)";
                updateUI();
            } else {
                // Apply penalty based on category
                let penaltyText = "";
                if (question.cat === 'azufre') { state.azufre += 2; penaltyText = "Azufre +2% (Alejándose de meta)"; }
                else if (question.cat === 'ozono') { state.ozono -= 2; penaltyText = "Ozono -2%"; }
                else if (question.cat === 'quimica') { state.quimica += 2; penaltyText = "Química +2%"; }
                
                state.social -= 2;
                resultText.innerHTML = `❌ Respuesta Incorrecta.<br>La ignorancia cuesta caro a la civilización.<br><em>Penalidad: ${penaltyText}, Aceptación Social -2%</em>`;
                resultText.style.color = "var(--color-danger)";
                updateUI();
            }
            resultContainer.classList.remove('hidden');
        };
        optionsContainer.appendChild(btn);
    });

    // Continue button binds to checkEndGame
    btnContinue.onclick = () => {
        quizModal.classList.add('hidden');
        checkEndGame();
    };
}

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
    
    // Advance time in smaller increments for a longer game
    state.year += Math.floor(Math.random() * 4) + 4;

    updateUI();

    // Check if we should trigger a quiz
    // 14 questions over ~74 years = approx 1 question every 5.2 years
    // With dynamic year jumps (4-7 years), almost every jump or every other jump should trigger it.
    // 50% chance is historically decent if checked every click.
    if (popQuizQuestions.length > 0 && Math.random() < 0.5) {
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
    // Win Condition (Reached 2100)
    else if (state.year >= GAME_END_YEAR) {
        isGameOver = true;
        survived = true;
        endTitleText = "MANDATO COMPLETADO: AÑO 2100";
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
    let report = `<p>Ha guiado a la humanidad hasta los albores del siglo XXII. Aquí están las consecuencias de sus protocolos sistemáticos:</p>`;

    // Azufre
    if (Math.abs(state.azufre - 50) <= 15) {
        report += `<p><strong>☁️ Los Cielos (Azufre):</strong> Los niveles de aerosoles están estabilizados. Las nubes mantienen su ciclo hídrico normal sin desatar lluvias ácidas corrosivas. Un logro atmosférico notable.</p>`;
    } else if (state.azufre > 65) {
        report += `<p><strong>💀 Lluvia Cáustica (Azufre Alto):</strong> Para enfriar el mundo o abaratar costos, llenó los cielos de azufre. Hoy en 2100, la lluvia ácida derrite regularmente aceros no tratados y ha decolorado millones de hectáreas de bosque boreal.</p>`;
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

    // Grand total: 50% environmental metrics, 50% pop quiz score
    const grandTotal = (envTotal * 0.5) + (quizPercentage * 0.5);

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
           *Feedback Técnico:* Aunque tus decisiones prácticas hayan sido buenas, demostraste lagunas teóricas en los pop quizzes. El 50% de tu nota final dependía de tu dominio técnico. Es vital que consultes la sección del "Códice" (📂) durante la partida para asegurar la comprensión de los fenómenos geoquímicos.`
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
