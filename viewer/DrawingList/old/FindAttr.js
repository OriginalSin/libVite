export default {
oper: [
	{ name: '=', title: '=' },
	{ name: '>', title: '>' },
	{ name: '<', title: '<' },
	{ name: '>=', title: '>=' },
	{ name: '<=', title: '<=' },
	{ name: '<>', title: '<>' },
	{ name: 'AND', title: 'AND' },
	{ name: 'OR', title: 'OR' },
	{ name: 'NOT', title: 'NOT' },
	{ name: 'IN', title: 'IN' },
	{ name: 'CONTAINS', title: 'CONTAINS' },
	{ name: 'CONTAINSIGNORECASE', title: 'CONTAINSIGNORECASE' },
	{ name: 'BETWEEN', title: 'BETWEEN' },
	{ name: 'STARTSWITH', title: 'STARTSWITH' },
	{ name: 'ENDSWITH', title: 'ENDSWITH' }
],
func: [{
	'string': [
		{ name: 'length', func: 'length(text)', title: ' - Возвращает длину строки' },
		{ name: 'lower', func: 'lower(text)', title: ' - Возвращает строку в нижнем регистре' },
		{ name: 'upper', func: 'upper(text)', title: ' - Возвращает строку в верхнем регистре' },
		{ name: 'trim', func: 'trim(text)', title: ' - Удаляет символ пробела в начале и в конце строки' },
		{ name: 'lTrim', func: 'lTrim(text)', title: ' - Удаляет символы пробела в начале строки' },
		{ name: 'rTrim', func: 'rTrim(text)', title: ' - Удаляет символы пробела в конце строки' },
		{ name: 'left', func: 'left(text, number_of_characters)', title: ' - Возвращает подстроку указанной длины от начала строки' },
		{ name: 'position', func: 'position(search_for, text_to_search)', title: ' - Возвращает позицию первого вхождения строки в тексте' },
		{ name: 'replace', func: 'replace(string, string, string)', title: ' - Заменяет все вхождения указанного строкового значения другим строковым значением.' },
		{ name: 'substring', func: 'substring(text, fist_character_index, characters_count)', title: ' - Возвращает подстроку заданной длины от указанной позиции в строке' },
		{ name: 'right', func: 'right(text, number_of_characters)', title: ' - Возвращает подстроку заданной длины от конца строки' }
	]},
	{
	'date': [
		{ name: 'addDays', func: 'addDays(datetime|date,num_of_days)', title: ' - Прибавляет к указанной дате заданное количество дней' },
		{ name: 'addHours', func: 'addHours(datetime|time, num_of_hours)', title: ' - Прибавляет к указанной дате или метке времени заданное количество часов' },
		{ name: 'addMinutes', func: 'addMinutes(datetime|time, num_of_minutes)', title: ' - Прибавляет к указанной дате или метке времени заданное количество минут' },
		{ name: 'addSeconds', func: 'addSeconds(datetime|time, num_of_seconds)', title: ' - Прибавляет к указанной дате или метке времени заданное количество секунд' },
		{ name: 'day', func: 'day(date)', title: ' - Возвращает номер дня в месяце для указанной даты' },
		{ name: 'month', func: 'month(date)', title: ' - Возвращает номер месяца в году для указанной даты' },
		{ name: 'year', func: 'year(date)', title: ' - Возвращает год как число для указанной даты' },
		{ name: 'now', func: 'now()', title: ' - Возвращает текущие дату и время' },
		{ name: 'strToDateTime', func: 'strToDateTime(string)', title: ' - Строка преобразуется к типу datetime' },
		{ name: 'strToTime', func: 'strToTime(string)', title: ' - Строка преобразуется к типу time' },
		{ name: 'toString', func: 'toString(expression)', title: ' - Преобразует выражение к строковому типу' }
	]},
	{
	'math': [
		{ name: 'round', func: 'round(value, places)', title: ' - Округляет число до заданного количества десятичных знаков' },
	]},
	{
	'agregate': [
		{ name: 'avg', func: 'avg()', title: ' - Среднее значение' },
		{ name: 'count', func: 'count()', title: ' - Количество записей' },
		{ name: 'max', func: 'max()', title: ' - Максимальное значение' },
		{ name: 'min', func: 'min()', title: ' - Минимальное значение' },
		{ name: 'sum', func: 'sum()', title: ' - Сумма' },
		{ name: 'unionAggregate', func: 'unionAggregate()', title: ' - Возвращает объединённую геометрию состоящую из всех геометрий таблицы.' },
	]},
	{
	'transform': [
		{ name: 'cast', func: 'cast(expression)', title: ' - Преобразует выражение к указанному типу.' },
	]},
	{
	'geometry': [
		{ name: 'STArea', func: 'STArea(gmx_geometry)', title: ' - Вычисляет площадь в кв.м (на эллипсоиде)' },
		{ name: 'geometryFromVectorLayer', func: 'geometryFromVectorLayer(layerID, countID)', title: ' - Возвращает геометрию из объекта другого векторного слоя.' },
		{ name: 'geometryToWkbHex', func: 'geometryToWkbHex(gmx_geometry)', title: ' - Преобразование геометрии в строку в виде WKB, закодированной в шестнадцатиричной форме (Hex).' },
		{ name: 'geometryFromWkbHex', func: 'geometryFromWkbHex(gmx_geometry, ESPG code)', title: ' - Создание объекта геометрии из шестнадцатиричной строки WKB и кода проекции.' },
		{ name: 'geometryFromWKT', func: 'geometryFromWKT(string, ESPG code)', title: ' - Возвращает геометрию по WKT.' },
		{ name: 'geometryFromGeoJson', func: 'geometryFromGeoJson(string, ESPG code)', title: ' - Возвращает геометрию по GeoJson' },
		{ name: 'buffer', func: 'buffer(gmx_geometry, buffer_size_meters)', title: ' - Создает полигон по буферной зоне заданного размера в метрах' },
		{ name: 'makeValid', func: 'makeValid(gmx_geometry)', title: ' - Возвращает валидную геометрию' },
		{ name: 'STEnvelopeMinX', func: 'STEnvelopeMinX(gmx_geometry)', title: ' - Возвращает соответствующую часть BBOX’a геометрии' },
		{ name: 'STEnvelopeMaxX', func: 'STEnvelopeMaxX(gmx_geometry)', title: ' - Возвращает соответствующую часть BBOX’a геометрии' },
		{ name: 'STEnvelopeMaxY', func: 'STEnvelopeMaxY(gmx_geometry)', title: ' - Возвращает соответствующую часть BBOX’a геометрии' },
		{ name: 'STEnvelopeMinY', func: 'STEnvelopeMinY(gmx_geometry)', title: ' - Возвращает соответствующую часть BBOX’a геометрии' },
		{ name: 'STContains', func: 'STContains(gmx_geometry, geometry)', title: ' - Возвращает значение true, если первый экземпляр геометрии полностью содержит второй экземпляр. В противном случае возвращается значение false.' },
		{ name: 'STIntersects', func: 'STIntersects(gmx_geometry, geometry)', title: ' - Возвращает значение true, если экземпляр geometry пересекается с другим экземпляром geometry. В противном случае возвращается значение false.' },
		{ name: 'STIntersection', func: 'STIntersection(gmx_geometry, geometry)', title: ' - Возвращает геометрию, представляющую пересечение указанных в аргументах двух геометрий.' },
		{ name: 'STDifference', func: 'STDifference(gmx_geometry, geometry)', title: ' - Возвращает геометрию, представляющую разницу первой геометрии относительно второй.' },
		{ name: 'STUnion', func: 'STUnion(gmx_geometry, geometry)', title: ' - Возвращает новую геометрию из объединения двух геометрий из аргументов' },
		{ name: 'geomIsEmpty', func: 'geomIsEmpty(gmx_geometry)', title: ' - Геометрия не определена' },
		{ name: 'STCentroid', func: 'STCentroid(gmx_geometry)', title: ' - Вычисляет геометрический центр экземпляра geometry. Возвращает геометрию типа Point.' },
		{ name: 'STAsText', func: 'STAsText(gmx_geometry)', title: ' - Геометрия в формате WKT' },
	]},
	{
	'special': [

		{ name: 'geometryFromVectorLayer', func: 'geometryFromVectorLayer(layerID, countID)', title: ' - Возвращает геометрию из объекта другого векторного слоя.' },
		{ name: 'geometryFromVectorLayerUnion', func: 'geometryFromVectorLayerUnion(layerID, countID)', title: ' - Возвращает объединённую геометрию из всех геометрий векторного слоя.' },
		{ name: 'geometryFromRasterLayer', func: 'geometryFromRasterLayer(layerID)', title: ' - Возвращает геометрию границу растрового слоя.' },
	]}
]
};