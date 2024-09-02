const fileSizeUnits = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]

function makeFileSize(bytes: number, currentUnit: number = 0) {
    if (bytes < 1 && currentUnit === 0) {
        return "0 B"
    }
    if (bytes < 1024) {
        return `${Math.round(bytes)} ${fileSizeUnits[currentUnit]}`
    }
    return makeFileSize(bytes / 1024, currentUnit + 1);
}

export function useFile() {
    return {
        makeFileSize
    }
}