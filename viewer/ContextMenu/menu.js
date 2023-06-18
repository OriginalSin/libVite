const key = {
	mapName: {
		items: [
			{text: 'Свойства', cmd: 'props'},
			{text: 'Добавить группу', cmd: 'addGroup'},
			{text: 'Права доступа', cmd: 'rights'},
			{text: 'Права доступа к слоям', cmd: 'rightLayers'},
		]
	},
	layerName: {
		items: [
			{text: 'Свойства', cmd: 'EditLayer'},
			{text: 'Стили', cmd: 'styles'},
			{text: 'Таблица атрибутов', cmd: 'TableAttrs'},
			{text: 'Права доступа', cmd: 'rightLayers'},
			{text: 'Скачать', cmd: 'DownloadLayer'},
			{text: 'Удалить', cmd: 'styles'},
			{text: 'Копировать стиль', cmd: 'copyStyle'},
			{text: 'Создать копию слоя', cmd: 'copyLayer'},
			{text: 'Вставить объекты', cmd: 'addObjects'},
			{text: 'Добавить объект', cmd: 'EditObject'},
			{text: 'Добавить в таймлайн', cmd: 'addTimeLine'},
		]
	}
}
let current;
export { key, current };