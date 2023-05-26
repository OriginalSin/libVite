<script>

	export let data;

</script>

<div class="find">
	<div class="close"><button>Скрыть</button></div>
	<div class="middle">
		<div class="query-container" filtertable="true">
			<span>WHERE</span>
			<button class="clean">Очистить</button>
			<textarea placeholder="&quot;field1&quot; = 1 AND &quot;field2&quot; = 'value'"></textarea>

			<div class="suggest">
				<table>
				<tbody>
				<tr>
				<td>
					<div class="attr">Колонки	
						<span class="ui-icon ui-icon-triangle-1-s"></span>
						<div class="suggest-helper">
							<div class="suggest-helper-elem" title="gmx_id">gmx_id</div>
							<div class="suggest-helper-elem" title="Name">Name</div>
							<div class="suggest-helper-elem" title="Type">Type</div>
							<div class="suggest-helper-elem" title="Date">Date</div>
							<div class="suggest-helper-elem" title="Time">Time</div>
							<div class="suggest-helper-elem" title="DateChange">DateChange</div>
							<div class="suggest-helper-elem" title="TimeChange">TimeChange</div>
							<div class="suggest-helper-elem" title="NextDateChange">NextDateChange</div>
							<div class="suggest-helper-elem" title="NextTimeChange">NextTimeChange</div>
							<div class="suggest-helper-elem" title="State">State</div>
							<div class="suggest-helper-elem" title="Origin">Origin</div>
							<div class="suggest-helper-elem" title="_mediadescript_">_mediadescript_</div>
							<div class="suggest-helper-elem" title="BorderStatus">BorderStatus</div>
							<div class="suggest-helper-elem" title="gmx_geometry">gmx_geometry</div>
						</div>
					</div>
				</td>
				<td>
					<div class="op">Операторы
						<span class="ui-icon ui-icon-triangle-1-s"></span>
						<div class="suggest-helper">
							<div class="suggest-helper-elem" title="=">=</div>
							<div class="suggest-helper-elem" title=">">&gt;</div>
							<div class="suggest-helper-elem" title="<">&lt;</div>
							<div class="suggest-helper-elem" title=">=">&gt;=</div>
							<div class="suggest-helper-elem" title="<=">&lt;=</div>
							<div class="suggest-helper-elem" title="<>">&lt;&gt;</div>
							<div class="suggest-helper-elem" title="AND">AND</div>
							<div class="suggest-helper-elem" title="OR">OR</div>
							<div class="suggest-helper-elem" title="NOT">NOT</div>
							<div class="suggest-helper-elem" title="IN">IN</div>
							<div class="suggest-helper-elem" title="CONTAINS">CONTAINS</div>
							<div class="suggest-helper-elem" title="CONTAINSIGNORECASE">CONTAINSIGNORECASE</div>
							<div class="suggest-helper-elem" title="BETWEEN">BETWEEN</div>
							<div class="suggest-helper-elem" title="STARTSWITH">STARTSWITH</div>
							<div class="suggest-helper-elem" title="ENDSWITH">ENDSWITH</div>
						</div>
					</div>
				</td>
				<td>
					<div class="suggest-link-container selectStyle suggest-func">Функции
						<span class="ui-icon ui-icon-triangle-1-s"></span>
						<div class="suggest-helper">
							<div class="suggest-helper-elem-group">string</div>
							<div class="suggest-helper-elem suggest-helper-elem-custom-tooltip" title="length(text) - Возвращает длину строки">length</div>
							<div class="suggest-helper-elem suggest-helper-elem-custom-tooltip" title="lower(text) - Возвращает строку в нижнем регистре">lower</div>
							<div class="suggest-helper-elem suggest-helper-elem-custom-tooltip" title="upper(text) - Возвращает строку в верхнем регистре">upper</div>
							<div class="suggest-helper-elem suggest-helper-elem-custom-tooltip" title="trim(text) - Удаляет символ пробела в начале и в конце строки">trim</div>
							<div class="suggest-helper-elem suggest-helper-elem-custom-tooltip" title="lTrim(text) - Удаляет символы пробела в начале строки">lTrim</div>
							<div class="suggest-helper-elem suggest-helper-elem-custom-tooltip" title="rTrim(text) - Удаляет символы пробела в конце строки">rTrim</div>
							<div class="suggest-helper-elem suggest-helper-elem-custom-tooltip" title="left(text, number_of_characters) - Возвращает подстроку указанной длины от начала строки">left</div>
							<div class="suggest-helper-elem suggest-helper-elem-custom-tooltip" title="position(search_for, text_to_search) - Возвращает позицию первого вхождения строки в тексте">position</div>
							<div class="suggest-helper-elem suggest-helper-elem-custom-tooltip" title="replace(string, string, string) - Заменяет все вхождения указанного строкового значения другим строковым значением.">replace</div>
							<div class="suggest-helper-elem suggest-helper-elem-custom-tooltip" title="substring(text, fist_character_index, characters_count) - Возвращает подстроку заданной длины от указанной позиции в строке">substring</div>
							<div class="suggest-helper-elem suggest-helper-elem-custom-tooltip" title="right(text, number_of_characters) - Возвращает подстроку заданной длины от конца строки">right</div>
							<div class="suggest-helper-elem-group">date</div>
							<div class="suggest-helper-elem suggest-helper-elem-custom-tooltip" title="addDays(datetime|date,num_of_days) - Прибавляет к указанной дате заданное количество дней">addDays</div>
							<div class="suggest-helper-elem suggest-helper-elem-custom-tooltip" title="addHours(datetime|time, num_of_hours) - 
							Прибавляет к указанной дате или метке времени заданное количество часов">addHours</div>
							<div class="suggest-helper-elem suggest-helper-elem-custom-tooltip" title="addMinutes(datetime|time, num_of_minutes) - 
							Прибавляет к указанной дате или метке времени заданное количество минут">addMinutes</div>
							<div class="suggest-helper-elem suggest-helper-elem-custom-tooltip" title="addSeconds(datetime|time, num_of_seconds) - 
							Прибавляет к указанной дате или метке времени заданное количество секунд">addSeconds</div>
							<div class="suggest-helper-elem suggest-helper-elem-custom-tooltip" title="day(date) - 
							Возвращает номер дня в месяце для указанной даты">day</div>
							<div class="suggest-helper-elem suggest-helper-elem-custom-tooltip" title="month(date) - 
							Возвращает номер месяца в году для указанной даты">month</div>
							<div class="suggest-helper-elem suggest-helper-elem-custom-tooltip" title="year(date) - 
							Возвращает год как число для указанной даты">year</div>
							<div class="suggest-helper-elem suggest-helper-elem-custom-tooltip" title="now() - 
							Возвращает текущие дату и время">now</div>
							<div class="suggest-helper-elem suggest-helper-elem-custom-tooltip" title="strToDateTime(string) - 
							Строка преобразуется к типу datetime">strToDateTime</div>
							<div class="suggest-helper-elem suggest-helper-elem-custom-tooltip" title="strToTime(string) - 
							Строка преобразуется к типу time">strToTime</div>
							<div class="suggest-helper-elem suggest-helper-elem-custom-tooltip" title="toString(expression) - 
							Преобразует выражение к строковому типу">toString</div>
							<div class="suggest-helper-elem-group">math</div>
							<div class="suggest-helper-elem suggest-helper-elem-custom-tooltip" title="round(value, places) - 
							Округляет число до заданного количества десятичных знаков">round</div>
							<div class="suggest-helper-elem-group">agregate</div>
							<div class="suggest-helper-elem suggest-helper-elem-custom-tooltip" title="avg() - 
							Среднее значение">avg</div>
							<div class="suggest-helper-elem suggest-helper-elem-custom-tooltip" title="count() - 
							Количество записей">count</div>
							<div class="suggest-helper-elem suggest-helper-elem-custom-tooltip" title="max() - 
							Максимальное значение">max</div>
							<div class="suggest-helper-elem suggest-helper-elem-custom-tooltip" title="min() - 
							Минимальное значение">min</div>
							<div class="suggest-helper-elem suggest-helper-elem-custom-tooltip" title="sum() - 
							Сумма">sum</div>
							<div class="suggest-helper-elem suggest-helper-elem-custom-tooltip" title="unionAggregate() - 
							Возвращает объединённую геометрию состоящую из всех геометрий таблицы.">unionAggregate</div>
							<div class="suggest-helper-elem-group">transform</div>
							<div class="suggest-helper-elem suggest-helper-elem-custom-tooltip" title="cast(expression) - 
							Преобразует выражение к указанному типу.">cast</div>
							<div class="suggest-helper-elem-group">geometry</div>
							<div class="suggest-helper-elem suggest-helper-elem-custom-tooltip" title="STArea(geometry) - 
							Вычисляет площадь в кв.м (на эллипсоиде)">STArea</div>
							<div class="suggest-helper-elem suggest-helper-elem-custom-tooltip" title="geometryFromVectorLayer(layerID, countID) - 
							Возвращает геометрию из объекта другого векторного слоя.">geometryFromVectorLayer</div>
							<div class="suggest-helper-elem suggest-helper-elem-custom-tooltip" title="geometryToWkbHex(geometry) - 
							Преобразование геометрии в строку в виде WKB, закодированной в шестнадцатиричной форме (Hex).">geometryToWkbHex</div>
							<div class="suggest-helper-elem suggest-helper-elem-custom-tooltip" title="geometryFromWkbHex(geometry, ESPG code) - 
							Создание объекта геометрии из шестнадцатиричной строки WKB и кода проекции.">geometryFromWkbHex</div>
							<div class="suggest-helper-elem suggest-helper-elem-custom-tooltip" title="geometryFromWKT(string, ESPG code) - 
							Возвращает геометрию по WKT.">geometryFromWKT</div>
							<div class="suggest-helper-elem suggest-helper-elem-custom-tooltip" title="geometryFromGeoJson(string, ESPG code) - 
							Возвращает геометрию по GeoJson">geometryFromGeoJson</div>
							<div class="suggest-helper-elem suggest-helper-elem-custom-tooltip" title="buffer(geometry, buffer_size_meters) - 
							Создает полигон по буферной зоне заданного размера в метрах">buffer</div>
							<div class="suggest-helper-elem suggest-helper-elem-custom-tooltip" title="makeValid(geometry) - 
							Возвращает валидную геометрию">makeValid</div>
							<div class="suggest-helper-elem suggest-helper-elem-custom-tooltip" title="STEnvelopeMinX(geometry) - 
							Возвращает соответствующую часть BBOX’a геометрии">STEnvelopeMinX</div>
							<div class="suggest-helper-elem suggest-helper-elem-custom-tooltip" title="STEnvelopeMaxX(geometry) - 
							Возвращает соответствующую часть BBOX’a геометрии">STEnvelopeMaxX</div>
							<div class="suggest-helper-elem suggest-helper-elem-custom-tooltip" title="STEnvelopeMaxY(geometry) - 
							Возвращает соответствующую часть BBOX’a геометрии">STEnvelopeMaxY</div>
							<div class="suggest-helper-elem suggest-helper-elem-custom-tooltip" title="STEnvelopeMinY(geometry) - 
							Возвращает соответствующую часть BBOX’a геометрии">STEnvelopeMinY</div>
							<div class="suggest-helper-elem suggest-helper-elem-custom-tooltip" title="STContains(geometry, geometry) - 
							Возвращает значение true, если первый экземпляр геометрии полностью содержит второй экземпляр. В противном случае возвращается значение false.">STContains</div>
							<div class="suggest-helper-elem suggest-helper-elem-custom-tooltip" title="STIntersects(geometry, geometry) - 
							Возвращает значение true, если экземпляр geometry пересекается с другим экземпляром geometry. В противном случае возвращается значение false.">STIntersects</div>
							<div class="suggest-helper-elem suggest-helper-elem-custom-tooltip" title="STIntersection(geometry, geometry) - 
							Возвращает геометрию, представляющую пересечение указанных в аргументах двух геометрий.">STIntersection</div>
							<div class="suggest-helper-elem suggest-helper-elem-custom-tooltip" title="STDifference(geometry, geometry) - 
							Возвращает геометрию, представляющую разницу первой геометрии относительно второй.">STDifference</div>
							<div class="suggest-helper-elem suggest-helper-elem-custom-tooltip" title="STUnion(geometry, geometry) - 
							Возвращает новую геометрию из объединения двух геометрий из аргументов">STUnion</div>
							<div class="suggest-helper-elem suggest-helper-elem-custom-tooltip" title="geomIsEmpty(geometry) - 
							Возвращает новую геометрию из объединения двух геометрий из аргументов">geomIsEmpty</div>
							<div class="suggest-helper-elem suggest-helper-elem-custom-tooltip" title="STCentroid(geometry) - 
							Вычисляет геометрический центр экземпляра geometry. Возвращает геометрию типа Point.">STCentroid</div>
							<div class="suggest-helper-elem suggest-helper-elem-custom-tooltip" title="STAsText(geometry) - 
							Геометрия в формате WKT">STAsText</div>
							<div class="suggest-helper-elem-group">special</div>
							<div class="suggest-helper-elem suggest-helper-elem-custom-tooltip" title="geometryFromVectorLayer(layerID, countID) - 
							Возвращает геометрию из объекта другого векторного слоя.">geometryFromVectorLayer</div>
							<div class="suggest-helper-elem suggest-helper-elem-custom-tooltip" title="geometryFromVectorLayerUnion(layerID, countID) - 
							Возвращает объединённую геометрию из всех геометрий векторного слоя.">geometryFromVectorLayerUnion</div>
							<div class="suggest-helper-elem suggest-helper-elem-custom-tooltip" title="geometryFromRasterLayer(layerID) - 
							Возвращает геометрию границу растрового слоя.">geometryFromRasterLayer</div>
						</div>
					</div>
				</td>
				</tr>
				</tbody>
				</table>

			</div>
		</div>
	</div>
	<div class="geometry-container">
		<span>
			<span class="attr-table-geomtitle">Искать по пересечению с объектом</span>
			<span class="gmx-icon-choose"></span>
			<span class="attr-table-geom-placeholder"></span>
		</span>
	</div>

	<div class="clean-search-buttons-container">
		<span class="buttonLink search-button">Найти</span>
	</div>
</div>

<style>

.find {
	display: none;
}
.find.active {
	display: block;
}
</style>
