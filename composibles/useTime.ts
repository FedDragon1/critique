const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const modifiedTime = {
    recent: 1000 * 60 * 5, // 5 minutes
    minutes: 1000 * 60 * 60, // 60 minutes
    hours: 1000 * 60 * 60 * 24, // 24 hours
    days: 1000 * 60 * 60 * 24 * 10, // 10 days
}

function makeDate(modifiedDate: number | string) {
    const now = new Date();
    const modDate = new Date(modifiedDate)

    if (now.getFullYear() !== modDate.getFullYear()) {
        return `on ${months[modDate.getMonth()]} ${modDate.getDate()}, ${modDate.getFullYear()}`
    }

    const diff = now.getTime() - modDate.getTime();
    if (diff < modifiedTime.recent) {
        return `just now`
    }
    if (diff < modifiedTime.minutes) {
        return `${Math.floor(diff / 1000 / 60)} minutes ago`
    }
    if (diff < modifiedTime.hours) {
        const hours = Math.floor(diff / 1000 / 60 / 60)
        return `${hours} hour${hours === 1 ? '' : 's'} ago`
    }
    if (diff < modifiedTime.days) {
        const days = Math.floor(diff / 1000 / 60 / 60 / 24);
        return `${days} day${days === 1 ? '' : 's'} ago`
    } else {  // months ago
        return `on ${months[modDate.getMonth()]} ${modDate.getDate()}`
    }
}

function formatDate(date: number | string) {
    const d = new Date(date)
    const options = { day: 'numeric', month: 'short', year: 'numeric' }
    // @ts-ignore
    return d.toLocaleDateString("en-US", options)
}

export function useTime() {
    return {
        makeDate,
        formatDate
    }
}