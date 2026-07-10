export function formatLastUpdated(isoString: string | null): string {
    if (!isoString) return 'Никогда'

    const date = new Date(isoString)
    const now = new Date()

    // Форматируем время: всегда "ЧЧ:ММ:СС"
    const timeStr = date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    })

    // Проверяем, сегодня ли это (сравниваем год, месяц и день)
    const isToday =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()

    if (isToday) {
        return `сегодня в ${timeStr}`
    }

    // Если другой день, форматируем дату: "ДД.ММ.ГГ"
    const dateStr = date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
    })

    return `${dateStr} в ${timeStr}`
}
