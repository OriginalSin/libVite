let gmxPlugins = [
	{ pluginName: 'gmxForest_2.1', file: 'plugins/external/gmxForest_2.1/public/addGmxPlugin.js', module: 'gmxForest_2.1', mapPlugin: true, isPublic: true },
	{ pluginName: 'gmxForest_2.0', file: 'plugins/external/gmxForest_2.0/public/addGmxPlugin.js', module: 'gmxForest_2.0', mapPlugin: true, isPublic: true },
	{ pluginName: 'gmxForest_1.7', file: 'plugins/external/gmxForest_1.7/public/addGmxPlugin.js', module: 'gmxForest_1.7', mapPlugin: true, isPublic: true },
	{ pluginName: 'gmxForest_1.6', file: 'plugins/external/gmxForest_1.6/public/addGmxPlugin.js', module: 'gmxForest_1.6', mapPlugin: true, isPublic: true },
    { pluginName: 'AISPluginBeta', file: 'plugins/AIS/AISSearch/AISPluginBeta.js', module: 'AISPluginBeta', mapPlugin: true },
	{ pluginName: 'domrf_1.0', file: 'plugins/external/gmxDomRF/public/addGmxPlugin.js', module: 'domrf_1.0', mapPlugin: true, isPublic: true },
	{ pluginName: 'gmxForest_1.4v', file: 'plugins/external/gmxForest_1.4v/public/addGmxPlugin.js', module: 'gmxForest_1.4v', mapPlugin: true, isPublic: true },
	{ pluginName: 'gmxForest_1.4', file: 'plugins/external/gmxForest_1.4/public/addGmxPlugin.js', module: 'gmxForest_1.4', mapPlugin: true, isPublic: true },
	{ pluginName: 'gmxForest_1.3', file: 'plugins/external/gmxForest_1.3/public/addGmxPlugin.js', module: 'gmxForest_1.3', mapPlugin: true, isPublic: true },
	{ pluginName: 'gmxForest_1.2', file: 'plugins/external/gmxForest_1.2/public/addGmxPlugin.js', module: 'gmxForest_1.2', mapPlugin: true, isPublic: true },
	{ pluginName: 'gmxForest_1.1', file: 'plugins/external/gmxForest_1.1/public/addGmxPlugin.js', module: 'gmxForest_1.1', mapPlugin: true, isPublic: true },
	{ pluginName: 'gmxForest_dev2', file: 'plugins/external/gmxForest_dev2/public/addGmxPlugin.js', module: 'gmxForest_dev2', mapPlugin: true, isPublic: true },
	{ pluginName: 'gmxForest_dev1', file: 'plugins/external/gmxForest_dev1/public/addGmxPlugin.js', module: 'gmxForest_dev1', mapPlugin: true, isPublic: true },
	{ pluginName: 'gmxForest_1.0', file: 'plugins/external/gmxForest_1.0/public/addGmxPlugin.js', module: 'gmxForest_1.0', mapPlugin: true, isPublic: true },
	{ pluginName: 'Leaflet.PolylineMeasure', file: 'plugins/external/GMXPluginPolylineMeasure/addGmxPlugin.js', module: 'Leaflet.PolylineMeasure', mapPlugin: true, isPublic: true },
    { pluginName: 'WWF Plugin new', file: 'plugins/external/GMXPluginWWF/gmxPluginWWF.js', module: 'GWWFPlugin', mapPlugin: true, isPublic: true },
    { pluginName: 'Timeline Rasters', file: 'plugins/TimelineRCPlugin.js', module: 'TimelineRCPlugin', mapPlugin: true, isPublic: true },
	// { pluginName: 'gmxForest_dev3', file: 'plugins/external/gmxForest_dev3/public/addGmxPlugin.js', module: 'gmxForest_dev3', mapPlugin: true, isPublic: true },
    // { pluginName: 'GeoMixer Timeline', file: 'plugins/external/GMXPluginTimeLine/L.Control.gmxTimeLine.js', module: 'gmxTimeLine', mapPlugin: false, isPublic: true, lazyLoad: false }
	{ pluginName: 'Weather View test', file: 'plugins/WeatherViewTest/scanex-weather-view.js', module: 'WeatherViewTest', mapPlugin: true, isPublic: true},
	{ pluginName: 'MachineLearningPlugin', file: 'plugins/MachineLearningPlugin/addGmxPlugin.js', module: 'MachineLearningPlugin', mapPlugin: true, isPublic: true},
	{ pluginName: 'IceConditionsPlugin', file: 'plugins/AIS/IceConditions/IceConditionsPlugin.js', module: 'IceConditionsPlugin', mapPlugin: true, isPublic: true },	
];
gmxPlugins.push(    
	{ pluginName: 'ReliefLayerPlugin', file: 'plugins/reliefLayer/main.js', module: 'ReliefLayerPlugin', mapPlugin: true, isPublic: true }
);


// Begin: MedvedIcons
    //var medvedValues = ["барсук", "бобр", "глухарь", "тетерев", "лисица", "енотовидная собака", "ондатра", "волк", "бурый медведь"];
    let medvedParams = {
        iconText: 'Режим добавления объектов',
        select: 'Выбор зверя',
        setAll: "Выбрать все",
        unSetAll: "Отменить все",
        iconPrefix: 'https://maps.kosmosnimki.ru/GetImage.ashx?usr=khaibrik%40scanex.ru&img=',
        proxyUrl: '',
        
        layers: {
            'B141AAD4698A496B96C0BF6EB1AFA68B': {
                id: 'birds',
                iconPrefix: '//icons.iconarchive.com/icons/femfoyou/angry-birds/48/',
                icon: 'angry-bird-icon.png',
                //style: { width: '30px' },
                select: 'Вид птицы',
                attribute: 'Вид птицы',
                values: ["глухарь", "тетерев", "синица"]
            },
            'C44F463579DD466C8AF384CF9A853C23': {
                //icon: 'polygon_beer.png',
                iconText: 'Встречи с животными',
                // attribute: 'Type',
                // values: ['рысь', 'лось', 'олень', 'утки', 'гуси', 'лисица', 'волк', 'бурый медведь', 'куропатка', 'рябчик', 'болотно-луговая дичь', 'хищные птицы', 'кабан', 'красная книга']
            },
            'A538C16A1C684206900EF5302399909F': {
                iconText: 'Учет по следам',
                attributes: [
                    {
                        title: 'Выбор зверя',
                        name: 'Type',
                        values: ['рысь', 'волк', 'бурый медведь'],
                        result: {
                            name: 'Type'
                        }
                    },
                    {
                        title: 'Выбор маршрута',
                        select: {
                            layer: '98E7F1B3538A4C6A80C4F7678959BC21',
                            orderby: 'Date',
                            columns: '[{"Value":"Date"},{"Value":"Name"},{"Value":"geomixergeojson"}]',
                            id: 'Date',
                            name: 'Name'
                        }
                    }
                ],
                results: {
                    layer: 'A538C16A1C684206900EF5302399909F',
                    conf: {
                        'рысь': 0.2,
                        'волк': 0.12
                    },
                    orderby: 'Type',
                    groupby: '[{"Value":"Type"}, {"Value":"Date"}]',
                    columns: '[{"Value":"Type"},{"Value":"Date"},{"Value":"count(*)"}]'
                }
            },
            'E5C3F46612E346EBABE048BB3A2FBE73': {
                //icon: '%D0%BC%D0%B5%D1%81%D1%82%D0%B0_%D0%BE%D0%B1%D0%B8%D1%82%D0%B0%D0%BD%D0%B8%D1%8F.png',
                iconText: 'Локальные местообитания',
                select: 'Выбор зверя',
                attribute: 'Type',
                values: ["барсук", "бобр", "глухарь", "тетерев", "лисица", "енотовидная собака", "ондатра", "волк", "бурый медведь"]
            },
            'A573428D7A544F9CA2D5E2BD40C654CD': {
                //icon: 'polygon_walf.png',
                iconText: 'Площадные местообитания',
                select: 'Выбор зверя',
                attribute: 'Type',
                values: ['группа_1', 'группа_2', 'группа_3', 'группа_4', 'группа_5']
            },
            '65858ACD8A9F4C4EA47EC9646A5B364F': {
                //icon: '%D0%B1%D0%B8%D0%BE%D1%82%D0%B5%D1%85%D0%BD%D0%B8%D1%8F.png',
                iconText: 'Биотехния',
                select: 'Выбор биотехнии',
                attribute: 'Name',
                values: ['кормохранилище', 'кормовая площадка', 'кормовое поле', 'база', 'аншлаг', 'вышка', 'живоловушка', 'галечник', 'солонец', 'порхалище', 'вольер', 'кормушка', 'искусственное']
            },
            '98E7F1B3538A4C6A80C4F7678959BC21': {
                iconText: 'Учет на маршрутах',
                select: 'Выбор маршрута',
                attribute: 'Type',
                values: ['группа_1', 'группа_2', 'группа_3', 'группа_4', 'группа_5']
            },
            'DEA3512AC437488DBAA443E03CD354F0': {
                iconText: 'Учет многодневным окладом',
                select: 'Выбор маршрута',
                attribute: 'Type',
                values: ['группа_1', 'группа_2', 'группа_3', 'группа_4', 'группа_5']
            },
            '4C071FC4C2A74B52AE9C01A8DAFAC2CA': {
                iconText: 'Учет на пробных площадках',
                select: 'Выбор маршрута',
                attribute: 'Type',
                values: ['группа_1', 'группа_2', 'группа_3', 'группа_4', 'группа_5']
            },
            '492B0337A5A946299047566DF9135813': {
                iconText: 'Охотохозяйственная организация',
                select: 'Выбор маршрута',
                attribute: 'Type',
                values: ['группа_1', 'группа_2', 'группа_3', 'группа_4', 'группа_5']
            },
            '89A99A0D91B64EBA9E268D71BA56B967': {
                iconText: 'Маркеры',
                select: 'Выбор маршрута',
                attribute: 'Type',
                values: ['группа_1', 'группа_2', 'группа_3', 'группа_4', 'группа_5']
            // },
            // '861C3341054A4501B5850B3ED4ADED22': {
                // iconText: 'Фото',
                // select: 'Выбор зверя',
                // attribute: 'Type',
                // values: ["барсук", "бобр", "глухарь", "тетерев", "лисица", "енотовидная собака", "ондатра", "волк", "бурый медведь", 'другое']
            }
        }
    };

    gmxPlugins.push({
        pluginName: 'MedvedIcons',
        file: './plugins/external/GMXPluginMedved/MedvedIcons.js',
        module: 'MedvedIcons',
        mapPlugin: true,
        params: medvedParams
    });
    
    gmxPlugins.push({
        pluginName: 'Medved Timeline',
        file: './plugins/external/GMXPluginMedved/MedvedTimeline.js',
        module: 'MedvedTimeline',
        mapPlugin: true
    });
    
    gmxPlugins.push({
        pluginName: 'Medved Distance',
        file: './plugins/external/GMXPluginMedved/MedvedDistance.js',
        module: 'MedvedDistance',
        mapPlugin: true
    });
// End: MedvedIcons

// export gmxPlugins;
export default gmxPlugins;